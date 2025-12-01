// auto-send-fcm.js - Автоматическая отправка push через FCM v1
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');
const path = require('path');
const admin = require('firebase-admin');

// Инициализация Firebase Admin
const serviceAccountPath = path.join(__dirname, 'frebaze-94560-7912c6031120.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const PROJECT_ID = 'frebaze-94560';

// Кеш для access token
let cachedAccessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  // Проверяем, не истек ли токен (обновляем за 5 минут до истечения)
  if (cachedAccessToken && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedAccessToken;
  }

  try {
    const auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
    });
    
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    if (!tokenResponse.token) {
      throw new Error('Не удалось получить access token');
    }
    
    cachedAccessToken = tokenResponse.token;
    // Токены обычно живут 1 час, обновляем через 55 минут
    tokenExpiry = Date.now() + 55 * 60 * 1000;
    
    console.log('✅ Access token получен');
    return cachedAccessToken;
  } catch (error) {
    console.error('❌ Ошибка получения access token:', error);
    throw error;
  }
}

async function sendFCMNotification(token, title, body, orderId, status) {
  try {
    const accessToken = await getAccessToken();
    
    const message = {
      message: {
        token,
        notification: { 
          title, 
          body 
        },
        data: { 
          orderId: orderId || '',
          status: status || ''
        },
        webpush: {
          fcmOptions: {
            link: orderId ? `/order/${orderId}` : '/'
          }
        }
      }
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ FCM error:', data);
      
      // Если токен невалидный, помечаем уведомление
      if (data.error?.code === 'NOT_FOUND' || 
          data.error?.message?.includes('registration-token-not-registered')) {
        console.warn('⚠️ Токен невалидный или истек:', token.substring(0, 20) + '...');
      }
      
      return false;
    }
    
    console.log('✅ Push отправлен успешно!', data.name);
    return true;
  } catch (error) {
    console.error('❌ Ошибка при отправке FCM:', error);
    return false;
  }
}

// Слушаем новые уведомления в Firestore
console.log('🚀 Запуск автоматической отправки push-уведомлений через FCM v1...');
console.log('👂 Слушаем новые уведомления в Firestore...');

const unsubscribe = db.collection('notifications')
  .onSnapshot(async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      // Обрабатываем только новые уведомления
      if (change.type === 'added') {
        const notification = change.doc.data();
        const notificationId = change.doc.id;

        // Пропускаем уже отправленные
        if (notification.sent === true) {
          continue;
        }

        console.log('\n📬 Новое уведомление:', notificationId);
        console.log('   Получатель:', notification.targetUserUid);
        console.log('   Заголовок:', notification.title);
        console.log('   Заказ:', notification.orderId);

        try {
          // Получаем токен получателя из Firestore
          const tokenDoc = await db
            .collection('userFCMTokens')
            .doc(notification.targetUserUid)
            .get();

          if (!tokenDoc.exists) {
            console.warn('⚠️ Токен не найден для пользователя:', notification.targetUserUid);
            // Помечаем как неотправленное с ошибкой
            await change.doc.ref.update({
              sent: false,
              error: 'Token not found',
              sentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            continue;
          }

          const token = tokenDoc.data().token;
          if (!token) {
            console.warn('⚠️ Токен пустой для пользователя:', notification.targetUserUid);
            await change.doc.ref.update({
              sent: false,
              error: 'Token is empty',
              sentAt: admin.firestore.FieldValue.serverTimestamp()
            });
            continue;
          }

          console.log('✅ Токен найден:', token.substring(0, 30) + '...');

          // Отправляем уведомление через FCM v1
          const success = await sendFCMNotification(
            token,
            notification.title,
            notification.body,
            notification.orderId,
            notification.status
          );

          // Помечаем как отправленное
          if (success) {
            await change.doc.ref.update({
              sent: true,
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              sentVia: 'FCM v1'
            });
            console.log('✅ Уведомление помечено как отправленное');
          } else {
            await change.doc.ref.update({
              sent: false,
              error: 'Failed to send',
              sentAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        } catch (error) {
          console.error('❌ Ошибка при обработке уведомления:', error);
          try {
            await change.doc.ref.update({
              sent: false,
              error: error.message,
              sentAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } catch (updateError) {
            console.error('❌ Не удалось обновить статус:', updateError);
          }
        }
      }
    }
  }, (error) => {
    console.error('❌ Ошибка слушателя Firestore:', error);
  });

console.log('✅ Автоматическая отправка запущена и работает!');
console.log('💡 Скрипт будет работать пока не остановите (Ctrl+C)');
console.log('💡 При создании нового уведомления в Firestore автоматически отправится push\n');

// Обработка завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка слушателя...');
  unsubscribe();
  process.exit(0);
});

