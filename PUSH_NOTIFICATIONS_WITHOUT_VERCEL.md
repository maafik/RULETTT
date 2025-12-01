# 🔔 Push-уведомления без Vercel - возможно!

## ❓ Можно ли без Vercel?

**Да, можно!** Но нужен сервер для отправки уведомлений через OneSignal REST API.

---

## 🎯 Почему нужен сервер?

REST API Key - **секретный ключ**, который нельзя хранить в клиентском коде. Поэтому нужен сервер, который:
1. Хранит REST API Key безопасно
2. Отправляет запросы в OneSignal REST API
3. Не раскрывает ключ клиенту

---

## ✅ Альтернативы Vercel

### 1. **Netlify Functions** (бесплатно)

**Как настроить:**

1. Создайте папку `netlify/functions/send-notification.js`:

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { targetUserUid, playerId, title, body, orderId, status } = JSON.parse(event.body);

  const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
  const oneSignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY;

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${oneSignalRestApiKey}:`).toString('base64')}`,
    },
    body: JSON.stringify({
      app_id: oneSignalAppId,
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: body },
      data: { orderId, status },
    }),
  });

  return {
    statusCode: 200,
    body: JSON.stringify(await response.json()),
  };
};
```

2. В Netlify Dashboard → Environment Variables добавьте:
   - `ONESIGNAL_APP_ID`
   - `ONESIGNAL_REST_API_KEY`

3. Измените `VITE_API_URL` в `.env.local`:
```env
VITE_API_URL=https://your-app.netlify.app/.netlify/functions/send-notification
```

---

### 2. **Firebase Cloud Functions** (платно, но есть бесплатный тариф)

**Как настроить:**

1. Создайте файл `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotification = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const { targetUserUid, playerId, title, body, orderId, status } = req.body;

  const oneSignalAppId = functions.config().onesignal.app_id;
  const oneSignalRestApiKey = functions.config().onesignal.rest_api_key;

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${oneSignalRestApiKey}:`).toString('base64')}`,
    },
    body: JSON.stringify({
      app_id: oneSignalAppId,
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: body },
      data: { orderId, status },
    }),
  });

  res.json(await response.json());
});
```

2. Установите конфигурацию:
```bash
firebase functions:config:set onesignal.app_id="..." onesignal.rest_api_key="..."
```

3. Деплой:
```bash
firebase deploy --only functions
```

---

### 3. **Собственный сервер** (Node.js/Express)

**Как настроить:**

1. Создайте сервер `server.js`:

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/send-notification', async (req, res) => {
  const { targetUserUid, playerId, title, body, orderId, status } = req.body;

  const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
  const oneSignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY;

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${oneSignalRestApiKey}:`).toString('base64')}`,
    },
    body: JSON.stringify({
      app_id: oneSignalAppId,
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: body },
      data: { orderId, status },
    }),
  });

  res.json(await response.json());
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

2. Хостите на:
   - Heroku (бесплатно)
   - Railway (бесплатно)
   - Render (бесплатно)
   - DigitalOcean (платно)
   - AWS (платно)

---

## 🔍 Работают ли уведомления сейчас?

### Проверьте следующие моменты:

#### 1. ✅ OneSignal инициализирован на клиенте?

Откройте консоль браузера, должны увидеть:
```
✅ OneSignal инициализирован
✅ Player ID получен: ...
```

#### 2. ✅ Player ID сохранен в Firestore?

Проверьте коллекцию `userOneSignalIds` в Firestore - должен быть документ с вашим UID.

#### 3. ✅ REST API Key в Vercel?

Проверьте Vercel Dashboard → Settings → Environment Variables:
- `ONESIGNAL_APP_ID` - должен быть
- `ONESIGNAL_REST_API_KEY` - должен быть ⭐

#### 4. ✅ API endpoint работает?

Попробуйте изменить статус заказа и проверьте:
- Консоль браузера (должны увидеть "📤 Отправка уведомления...")
- Логи Vercel (Deployments → Functions → api/send-notification)

---

## 🐛 Если уведомления не работают

### Ошибка: "OneSignal credentials не настроены"

**Решение:**
1. Добавьте `ONESIGNAL_REST_API_KEY` в Vercel Environment Variables
2. Передеплойте проект

### Ошибка: "OneSignal Player ID не найден"

**Решение:**
1. Убедитесь, что OneSignal инициализирован
2. Проверьте, что разрешение на уведомления предоставлено
3. Проверьте коллекцию `userOneSignalIds` в Firestore

### Ошибка: "Failed to send notification via OneSignal"

**Решение:**
1. Проверьте правильность REST API Key
2. Проверьте правильность App ID
3. Проверьте логи Vercel для деталей

---

## 📋 Текущая настройка (с Vercel)

**Ваш проект использует Vercel**, потому что:
- ✅ Файл `api/send-notification.ts` использует `@vercel/node`
- ✅ Файл `vercel.json` настроен для serverless функций
- ✅ Это самый простой способ для начала

**Чтобы уведомления работали:**
1. ✅ Добавьте `ONESIGNAL_REST_API_KEY` в Vercel Environment Variables
2. ✅ Убедитесь, что проект задеплоен на Vercel
3. ✅ Проверьте, что OneSignal инициализирован на клиенте

---

## 🎯 Итог

### Можно ли без Vercel?
**Да!** Но нужен сервер (Netlify, Firebase Functions, собственный сервер).

### Работают ли сейчас?
**Проверьте:**
- ✅ REST API Key в Vercel Environment Variables
- ✅ OneSignal инициализирован на клиенте
- ✅ Player ID сохранен в Firestore

**Если все настроено правильно - уведомления должны работать!** 🚀

