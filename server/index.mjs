import express from "express";
import cors from "cors";
import admin from "firebase-admin";

// YooKassa config: желательно вынести в переменные окружения
const YOOKASSA_SHOP_ID = "1222923";
const YOOKASSA_SECRET_KEY = "test_twl-65kK1FZoIvSdt1B_wthG_EfXaJGqpbAoqqNB5-4";

// Инициализация Firebase Admin SDK для работы с Firestore и FCM (HTTP v1)
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT не задан. Endpoints, зависящие от Admin SDK, будут недоступны.");
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin SDK инициализирован");
    } catch (e) {
      console.error("❌ Не удалось распарсить FIREBASE_SERVICE_ACCOUNT:", e);
    }
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Простой ответ на GET /, чтобы не было 404 в DevTools
app.get("/", (_req, res) => {
  res.send("YooKassa payment server is running");
});

// Эндпоинт для отправки push-уведомления клиенту по его UID через Admin SDK
// Ожидает в теле: { customerUid, title, body, data }
app.post("/send-order-push", async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(500).json({
        success: false,
        error: "Firebase Admin SDK не инициализирован (нет FIREBASE_SERVICE_ACCOUNT)",
      });
    }

    const { customerUid, title, body, data } = req.body || {};

    if (!customerUid || !title || !body) {
      return res.status(400).json({
        success: false,
        error: "customerUid, title и body обязательны",
      });
    }

    const db = admin.firestore();
    const tokenRef = db.doc(`userFCMTokens/${customerUid}`);
    const tokenSnap = await tokenRef.get();

    if (!tokenSnap.exists) {
      console.warn("⚠️ FCM токен не найден для пользователя:", customerUid);
      return res.status(404).json({ success: false, error: "FCM токен не найден" });
    }

    const tokenData = tokenSnap.data() || {};
    const token = tokenData.token;

    if (!token) {
      console.warn("⚠️ Пустой FCM токен для пользователя:", customerUid);
      return res.status(404).json({ success: false, error: "FCM токен пустой" });
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    console.log("📲 Отправка push-уведомления через Admin SDK", {
      customerUid,
      hasToken: !!token,
      title,
      body,
      data,
    });

    const response = await admin.messaging().send(message);
    console.log("✅ Push-уведомление отправлено через Admin SDK:", response);

    return res.json({ success: true, messageId: response });
  } catch (error) {
    console.error("❌ Ошибка при отправке push-уведомления через Admin SDK:", error);
    return res.status(500).json({
      success: false,
      error: error && error.message ? error.message : "Внутренняя ошибка сервера",
    });
  }
});

// Эндпоинт для создания платежа в YooKassa
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, description, orderId } = req.body || {};

    if (!amount || !orderId) {
      return res.status(400).json({ success: false, error: "amount и orderId обязательны" });
    }

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res.status(400).json({ success: false, error: "Некорректная сумма платежа" });
    }

    const formattedAmount = amountValue.toFixed(2);

    const origin = req.headers.origin || process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const returnUrl = `${origin}/payment/return?orderId=${encodeURIComponent(orderId)}`;

    const idempotenceKey = `order-${orderId}-${Date.now()}`;
    const authHeader = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString("base64");

    const payload = {
      amount: {
        value: formattedAmount,
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      capture: true,
      description: description || `Оплата заказа ${orderId}`,
      metadata: {
        orderId: String(orderId),
      },
    };

    console.log("💳 Создание платежа в YooKassa", { amount: formattedAmount, orderId, returnUrl });

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Idempotence-Key": idempotenceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Ошибка ответа YooKassa:", response.status, text);
      return res.status(500).json({
        success: false,
        error: "Ошибка при создании платежа YooKassa",
        providerStatus: response.status,
        providerResponse: text,
      });
    }

    const data = await response.json();
    console.log("✅ Платеж создан в YooKassa", { id: data.id, status: data.status });

    const confirmationUrl = data.confirmation && data.confirmation.confirmation_url;

    return res.json({
      success: true,
      paymentId: data.id,
      confirmationUrl,
    });
  } catch (error) {
    console.error("❌ Ошибка при создании платежа YooKassa (server):", error);
    return res.status(500).json({
      success: false,
      error: error && error.message ? error.message : "Внутренняя ошибка сервера",
    });
  }
});

// Эндпоинт для отправки push-уведомлений через FCM
app.post("/send-push", async (req, res) => {
  try {
    const { token, title, body, data } = req.body || {};

    if (!token || !title || !body) {
      return res.status(400).json({ success: false, error: "token, title и body обязательны" });
    }

    const serverKey = process.env.FCM_SERVER_KEY;
    if (!serverKey) {
      console.error("❌ FCM_SERVER_KEY не задан в переменных окружения");
      return res.status(500).json({ success: false, error: "FCM_SERVER_KEY не настроен" });
    }

    const payload = {
      to: token,
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    console.log("📲 Отправка push-уведомления через FCM", {
      hasToken: !!token,
      title,
      body,
      data,
    });

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${serverKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ Ошибка ответа FCM:", response.status, text);
      return res.status(500).json({
        success: false,
        error: "Ошибка при отправке push-уведомления через FCM",
        providerStatus: response.status,
        providerResponse: text,
      });
    }

    console.log("✅ FCM ответ:", text);
    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Ошибка при отправке push-уведомления (server):", error);
    return res.status(500).json({
      success: false,
      error: error && error.message ? error.message : "Внутренняя ошибка сервера",
    });
  }
});

// Эндпоинт для проверки статуса платежа в YooKassa
app.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ success: false, error: "paymentId обязателен" });
    }

    const authHeader = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString("base64");

    console.log("🔍 Проверка статуса платежа в YooKassa", { paymentId });

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Ошибка ответа YooKassa при проверке статуса:", response.status, text);
      return res.status(500).json({
        success: false,
        error: "Ошибка при проверке статуса платежа YooKassa",
        providerStatus: response.status,
        providerResponse: text,
      });
    }

    const data = await response.json();
    console.log("✅ Статус платежа получен", { id: data.id, status: data.status });

    return res.json({
      success: true,
      status: data.status,
      paymentId: data.id,
    });
  } catch (error) {
    console.error("❌ Ошибка при проверке статуса платежа YooKassa (server):", error);
    return res.status(500).json({
      success: false,
      error: error && error.message ? error.message : "Внутренняя ошибка сервера",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Payment server listening on http://localhost:${PORT}`);
});
