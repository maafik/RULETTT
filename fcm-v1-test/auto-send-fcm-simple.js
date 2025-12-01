// auto-send-fcm-simple.js - Упрощенная версия БЕЗ firebase-admin
// Использует только REST API Firestore
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'frebaze-94560-7912c6031120.json');
const PROJECT_ID = 'frebaze-94560';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Кеш для access token
let cachedAccessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedAccessToken;
  }

  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: [
      'https://www.googleapis.com/auth/firebase.messaging',
      'https://www.googleapis.com/auth/datastore'
    ]
  });
  
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  
  cachedAccessToken = tokenResponse.token;
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  
  return cachedAccessToken;
}

async function getFirestoreDocument(collection, docId) {
  const token = await getAccessToken();
  const url = `${FIRESTORE_URL}/${collection}/${docId}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Firestore error: ${response.status} ${await response.text()}`);
  }
  
  return await response.json();
}

async function listenToFirestore() {
  // Получаем список всех уведомлений и проверяем новые
  const token = await getAccessToken();
  const url = `${FIRESTORE_URL}/notifications?pageSize=100&orderBy=createdAt desc`;
  
  let lastCheckTime = Date.now();
  
  setInterval(async () => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('❌ Ошибка получения уведомлений:', response.status);
        return;
      }
      
      const data = await response.json();
      const documents = data.documents || [];
      
      for (const doc of documents) {
        const notification = parseFirestoreDocument(doc);
        const createdAt = notification.createdAt ? new Date(notification.createdAt).getTime() : 0;
        
        // Проверяем только новые уведомления (созданные после последней проверки)
        if (createdAt > lastCheckTime && !notification.sent) {
          await processNotification(notification, doc.name.split('/').pop());
        }
      }
      
      lastCheckTime = Date.now();
    } catch (error) {
      console.error('❌ Ошибка при проверке уведомлений:', error);
    }
  }, 5000); // Проверяем каждые 5 секунд
}

function parseFirestoreDocument(doc) {
  const fields = doc.fields || {};
  const result = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue !== undefined) {
      result[key] = value.stringValue;
    } else if (value.integerValue !== undefined) {
      result[key] = parseInt(value.integerValue);
    } else if (value.booleanValue !== undefined) {
      result[key] = value.booleanValue;
    } else if (value.timestampValue !== undefined) {
      result[key] = value.timestampValue;
    }
  }
  
  return result;
}

async function updateFirestoreDocument(collection, docId, updates) {
  const token = await getAccessToken();
  const url = `${FIRESTORE_URL}/${collection}/${docId}`;
  
  // Получаем текущий документ
  const currentDoc = await getFirestoreDocument(collection, docId);
  if (!currentDoc) {
    throw new Error('Document not found');
  }
  
  // Формируем обновления
  const updateMask = { fieldPaths: Object.keys(updates) };
  const fields = { ...currentDoc.fields };
  
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value === null) {
      fields[key] = { nullValue: null };
    }
  }
  
  const response = await fetch(`${url}?updateMask.fieldPaths=${updateMask.fieldPaths.join('&updateMask.fieldPaths=')}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
  
  return response.ok;
}

async function sendFCMNotification(token, title, body, orderId, status) {
  try {
    const accessToken = await getAccessToken();
    
    const message = {
      message: {
        token,
        notification: { title, body },
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
      return false;
    }
    
    console.log('✅ Push отправлен успешно!', data.name);
    return true;
  } catch (error) {
    console.error('❌ Ошибка при отправке FCM:', error);
    return false;
  }
}

async function processNotification(notification, notificationId) {
  console.log('\n📬 Новое уведомление:', notificationId);
  console.log('   Получатель:', notification.targetUserUid);
  console.log('   Заголовок:', notification.title);
  console.log('   Заказ:', notification.orderId);

  try {
    // Получаем токен получателя
    const tokenDoc = await getFirestoreDocument('userFCMTokens', notification.targetUserUid);
    
    if (!tokenDoc) {
      console.warn('⚠️ Токен не найден для пользователя:', notification.targetUserUid);
      await updateFirestoreDocument('notifications', notificationId, {
        sent: false,
        error: 'Token not found'
      });
      return;
    }

    const token = parseFirestoreDocument(tokenDoc).token;
    if (!token) {
      console.warn('⚠️ Токен пустой для пользователя:', notification.targetUserUid);
      await updateFirestoreDocument('notifications', notificationId, {
        sent: false,
        error: 'Token is empty'
      });
      return;
    }

    console.log('✅ Токен найден:', token.substring(0, 30) + '...');

    // Отправляем уведомление
    const success = await sendFCMNotification(
      token,
      notification.title,
      notification.body,
      notification.orderId,
      notification.status
    );

    // Помечаем как отправленное
    if (success) {
      await updateFirestoreDocument('notifications', notificationId, {
        sent: true,
        sentVia: 'FCM v1'
      });
      console.log('✅ Уведомление помечено как отправленное');
    } else {
      await updateFirestoreDocument('notifications', notificationId, {
        sent: false,
        error: 'Failed to send'
      });
    }
  } catch (error) {
    console.error('❌ Ошибка при обработке уведомления:', error);
  }
}

// Запуск
console.log('🚀 Запуск автоматической отправки push-уведомлений через FCM v1...');
console.log('👂 Слушаем новые уведомления в Firestore (проверка каждые 5 секунд)...');
console.log('💡 Скрипт будет работать пока не остановите (Ctrl+C)\n');

listenToFirestore().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});

// Обработка завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка...');
  process.exit(0);
});

