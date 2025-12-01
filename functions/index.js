const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

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

