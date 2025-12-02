const admin = require("firebase-admin");
const path = require("path");

// Инициализация Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, "..", "frebaze-94560-firebase-adminsdk-fbsvc-58dc784745.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Данные для отправки сообщения
const ORDER_ID = "1764641583265";
const CLIENT_UID = "0sublL1t9mX27OAVaUouaf2QbDG3"; // Отправитель (клиент)
const MUSICIAN_UID = "DypkhitMEzLyPzSBTLoPMGYQxHM2"; // Получатель (Анна Смирнова)
const MESSAGE_TEXT = "Привет! Это тестовое сообщение с push-уведомлением!";

async function sendTestMessage() {
  try {
    console.log(`\n💬 Отправка тестового сообщения в чат заказа ${ORDER_ID}...\n`);
    console.log(`Отправитель (клиент): ${CLIENT_UID}`);
    console.log(`Получатель (музыкант): Анна Смирнова (${MUSICIAN_UID})`);
    console.log(`Текст: ${MESSAGE_TEXT}\n`);

    // Проверяем, существует ли заказ
    const orderRef = db.collection("orders").doc(ORDER_ID);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error(`❌ Заказ ${ORDER_ID} не найден в Firestore`);
      process.exit(1);
    }

    const orderData = orderDoc.data();
    console.log(`✅ Заказ найден:`);
    console.log(`   Заказчик: ${orderData.customerUid || 'N/A'}`);
    console.log(`   Музыкант: ${orderData.artistName || 'N/A'}\n`);

    // Получаем имя клиента для уведомления
    let senderName = "Клиент";
    try {
      const clientProfile = await db.collection("userProfiles").doc(CLIENT_UID).get();
      if (clientProfile.exists) {
        const profileData = clientProfile.data();
        senderName = profileData.customerName || profileData.name || orderData.customerName || orderData.customerEmail || "Клиент";
      } else {
        // Пробуем получить из заказа
        senderName = orderData.customerName || orderData.customerEmail || "Клиент";
      }
    } catch (e) {
      console.warn("⚠️ Не удалось получить имя клиента, используем значение по умолчанию");
    }

    console.log(`📝 Имя отправителя для уведомления: ${senderName}\n`);

    // Отправляем сообщение в подколлекцию messages
    const messagesRef = orderRef.collection("messages");
    
    const messageData = {
      text: MESSAGE_TEXT,
      sender: "client", // Клиент отправляет сообщение
      senderUid: CLIENT_UID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const messageDoc = await messagesRef.add(messageData);
    
    console.log(`✅ Сообщение успешно отправлено в Firestore!`);
    console.log(`   Message ID: ${messageDoc.id}`);
    console.log(`   Заказ: ${ORDER_ID}`);
    console.log(`   Отправитель: ${CLIENT_UID} (${senderName})`);
    console.log(`   Текст: ${MESSAGE_TEXT}\n`);

    // Отправляем push-уведомление получателю (Анне Смирновой)
    console.log(`📤 Отправка push-уведомления получателю...\n`);
    
    try {
      // Получаем Player ID получателя
      const playerIdDoc = await db.collection("userOneSignalIds").doc(MUSICIAN_UID).get();
      let playerId = null;
      
      if (playerIdDoc.exists) {
        playerId = playerIdDoc.data()?.playerId;
        console.log(`✅ Player ID найден для получателя: ${playerId?.substring(0, 20)}...`);
      } else {
        console.warn(`⚠️ Player ID не найден для получателя ${MUSICIAN_UID}`);
        console.warn(`💡 Получатель должен разрешить уведомления в приложении`);
      }

      // Вызываем API endpoint для отправки уведомления
      const apiUrl = process.env.VITE_API_URL || "https://rulettt.vercel.app/api/send-notification";
      
      const notificationPayload = {
        targetUserUid: MUSICIAN_UID,
        playerId: playerId || undefined,
        orderId: ORDER_ID,
        title: "Новое сообщение",
        body: `${senderName}: ${MESSAGE_TEXT.length > 50 ? MESSAGE_TEXT.substring(0, 47) + "..." : MESSAGE_TEXT}`,
        status: "chat-message",
      };

      console.log(`📡 Вызов API: ${apiUrl}`);
      console.log(`📦 Payload:`, {
        targetUserUid: notificationPayload.targetUserUid,
        hasPlayerId: !!notificationPayload.playerId,
        orderId: notificationPayload.orderId,
        title: notificationPayload.title,
        body: notificationPayload.body.substring(0, 50) + "...",
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Ошибка API (${response.status}):`, errorData);
        
        if (response.status === 404) {
          console.warn(`⚠️ API endpoint не найден. Это нормально для локальной разработки.`);
        } else if (response.status === 403) {
          console.error(`💡 403 Forbidden - проверьте ONESIGNAL_REST_API_KEY в Vercel Environment Variables`);
        }
      } else {
        const result = await response.json();
        console.log(`✅ Push-уведомление успешно отправлено!`);
        console.log(`   Notification ID: ${result.notificationId || 'N/A'}`);
        console.log(`   Recipients: ${result.recipients || 'N/A'}\n`);
      }
    } catch (notificationError) {
      console.error(`❌ Ошибка при отправке push-уведомления:`, notificationError.message);
      console.warn(`💡 Сообщение отправлено в Firestore, но уведомление не отправлено`);
    }

    console.log(`\n✅ Готово! Сообщение отправлено и уведомление обработано.\n`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка при отправке сообщения:", error);
    console.error("Детали:", {
      message: error.message,
      code: error.code,
    });
    process.exit(1);
  }
}

sendTestMessage();

