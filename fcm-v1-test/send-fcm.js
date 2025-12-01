// send-fcm.js
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'frebaze-94560-7912c6031120.json');
const PROJECT_ID = 'frebaze-94560';

async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging']
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function sendNotification({ token, title, body }) {
  const accessToken = await getAccessToken();
  const message = {
    message: {
      token,
      notification: { title, body }
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
    console.error('FCM error:', data || await response.text());
    process.exit(1);
  }
  console.log('✅ Push sent! FCM response:', data);
}

// FCM токен получателя (ваш токен)
const fcmDeviceToken = 'JFiWds7FPDZEh5n0h5H235re0vu1';

if (!fcmDeviceToken || fcmDeviceToken === 'ВАШ_FCM_ТОКЕН_ПОЛУЧАТЕЛЯ') {
  console.error('❌ Укажите реальный FCM токен в коде!');
  process.exit(1);
}

console.log('📤 Отправка тестового уведомления на токен:', fcmDeviceToken.substring(0, 20) + '...');

// Тестовая отправка
sendNotification({
  token: fcmDeviceToken,
  title: 'Тестовое FCM v1 уведомление',
  body: 'Отправлено напрямую через FCM API (Node.js)' 
}).catch(error => {
  console.error('❌ Ошибка:', error);
  process.exit(1);
});
