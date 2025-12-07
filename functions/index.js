const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// YooKassa config (test)
const YOOKASSA_SHOP_ID = '1222923';
const YOOKASSA_SECRET_KEY = 'test_MTIyMjkyMz8tBA5_zr2TiXGJDffc0cG9u6TNq-TbJYw';

/**
 * HTTP Cloud Function для создания платежа в YooKassa
 * Ожидает в body: { amount: number, description: string, orderId: string }
 * Возвращает: { success, paymentId?, confirmationUrl?, error? }
 */
exports.createYooKassaPayment = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { amount, description, orderId } = req.body || {};

    if (!amount || !orderId) {
      return res.status(400).json({ success: false, error: 'amount и orderId обязательны' });
    }

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res.status(400).json({ success: false, error: 'Некорректная сумма платежа' });
    }

    const formattedAmount = amountValue.toFixed(2);

    // URL возврата после оплаты (страница фронтенда)
    const host = req.headers.origin || `https://${process.env.GCLOUD_PROJECT}.web.app`;
    const returnUrl = `${host}/payment/return?orderId=${encodeURIComponent(orderId)}`;

    const idempotenceKey = `order-${orderId}-${Date.now()}`;

    const authHeader = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    const payload = {
      amount: {
        value: formattedAmount,
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      capture: true,
      description: description || `Оплата заказа ${orderId}`,
      metadata: {
        orderId: String(orderId),
      },
    };

    console.log('💳 Создание платежа в YooKassa', { amount: formattedAmount, orderId, returnUrl });

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Ошибка ответа YooKassa:', response.status, text);
      return res.status(500).json({ success: false, error: 'Ошибка при создании платежа YooKassa' });
    }

    const data = await response.json();
    console.log('✅ Платеж создан в YooKassa', { id: data.id, status: data.status });

    const confirmationUrl = data.confirmation && data.confirmation.confirmation_url;

    return res.json({
      success: true,
      paymentId: data.id,
      confirmationUrl,
    });
  } catch (error) {
    console.error('❌ Ошибка при создании платежа YooKassa:', error);
    return res.status(500).json({
      success: false,
      error: error && error.message ? error.message : 'Внутренняя ошибка сервера',
    });
  }
});

/**
 * Cloud Function для отправки push-уведомлений
 * Срабатывает при создании нового уведомления в Firestore
 */
exports.sendNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const notificationId = context.params.notificationId;

    console.log('📬 Новое уведомление создано:', notificationId);
    console.log('Получатель:', notification.targetUserUid);
    console.log('Заказ:', notification.orderId);

    // Получаем FCM токен пользователя
    let token = null;
    try {
      const tokenDoc = await admin.firestore()
        .collection('userFCMTokens')
        .doc(notification.targetUserUid)
        .get();

      if (!tokenDoc.exists) {
        console.log('⚠️ Токен не найден для пользователя:', notification.targetUserUid);
        return null;
      }

      token = tokenDoc.data().token;
      console.log('✅ Токен найден для пользователя:', notification.targetUserUid);
    } catch (error) {
      console.error('❌ Ошибка при получении токена:', error);
      return null;
    }

    if (!token) {
      console.log('⚠️ Токен пустой для пользователя:', notification.targetUserUid);
      return null;
    }

    // Формируем сообщение для отправки
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        orderId: notification.orderId || '',
        status: notification.status || '',
        notificationId: notificationId,
      },
      token: token,
      webpush: {
        fcmOptions: {
          link: `/order/${notification.orderId}`,
        },
      },
    };

    try {
      // Отправляем уведомление
      const response = await admin.messaging().send(message);
      console.log('✅ Уведомление успешно отправлено:', response);
      
      // Помечаем уведомление как отправленное (опционально)
      await snap.ref.update({
        sent: true,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return response;
    } catch (error) {
      console.error('❌ Ошибка при отправке уведомления:', error);
      
      // Помечаем уведомление как неотправленное
      await snap.ref.update({
        sent: false,
        error: error.message,
      });

      return null;
    }
  });

/**
 * Функция для тестирования отправки уведомлений
 * Можно вызвать вручную через Firebase Console
 */
exports.testNotification = functions.https.onCall(async (data, context) => {
  // Проверяем авторизацию
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Пользователь не авторизован');
  }

  const { targetUserUid, title, body } = data;

  if (!targetUserUid || !title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'Недостаточно параметров');
  }

  // Получаем токен
  const tokenDoc = await admin.firestore()
    .collection('userFCMTokens')
    .doc(targetUserUid)
    .get();

  if (!tokenDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Токен не найден');
  }

  const token = tokenDoc.data().token;

  // Отправляем уведомление
  const message = {
    notification: {
      title,
      body,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Отправка приветственного письма при регистрации
 * Вызывается из клиента после успешной регистрации
 */
exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  // Проверяем авторизацию
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Пользователь не авторизован');
  }

  const { email, userName } = data;

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email обязателен');
  }

  try {
    // Получаем информацию о пользователе
    const user = await admin.auth().getUser(context.auth.uid);
    const userEmail = email || user.email;
    const displayName = userName || user.displayName || 'Пользователь';

    // Формируем приветственное письмо
    const welcomeEmail = {
      to: userEmail,
      message: {
        subject: 'Добро пожаловать в Stage Spotlight!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎵 Stage Spotlight</h1>
              </div>
              <div class="content">
                <h2>Добро пожаловать, ${displayName}!</h2>
                <p>Спасибо за регистрацию в Stage Spotlight!</p>
                <p>Теперь вы можете:</p>
                <ul>
                  <li>Бронировать выступления любимых музыкантов</li>
                  <li>Отслеживать свои заказы</li>
                  <li>Общаться с музыкантами в чате</li>
                  <li>Сохранять избранных исполнителей</li>
                </ul>
                <p>Мы рады видеть вас в нашем сообществе!</p>
                <p>С уважением,<br>Команда Stage Spotlight</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Добро пожаловать, ${displayName}!\n\nСпасибо за регистрацию в Stage Spotlight!\n\nТеперь вы можете бронировать выступления, отслеживать заказы и общаться с музыкантами.\n\nС уважением,\nКоманда Stage Spotlight`,
      },
    };

    // Сохраняем задачу отправки email в Firestore для обработки
    // (В реальном проекте здесь будет вызов email сервиса)
    await admin.firestore().collection('emailQueue').add({
      type: 'welcome',
      to: userEmail,
      subject: welcomeEmail.message.subject,
      html: welcomeEmail.message.html,
      text: welcomeEmail.message.text,
      userId: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
    });

    console.log('✅ Задача отправки приветственного письма добавлена в очередь:', userEmail);
    
    return { success: true, message: 'Приветственное письмо будет отправлено' };
  } catch (error) {
    console.error('❌ Ошибка при отправке приветственного письма:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

