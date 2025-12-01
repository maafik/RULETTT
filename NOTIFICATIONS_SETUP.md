# Настройка системы уведомлений

## Текущая реализация

Система уведомлений настроена и работает частично:

1. ✅ **Сохранение уведомлений в Firestore** - при изменении статуса заказа создается запись в коллекции `notifications`
2. ✅ **Получение FCM токенов** - токены пользователей сохраняются в `userFCMTokens`
3. ✅ **Обработка уведомлений в браузере** - когда приложение открыто, уведомления показываются через `onMessage`

## Что нужно для полной работы push-уведомлений

### 1. Cloud Functions (обязательно)

Для отправки реальных push-уведомлений нужны Firebase Cloud Functions, которые будут:
- Слушать изменения в коллекции `notifications`
- Отправлять push-уведомления через FCM API

**Пример Cloud Function:**

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    // Получаем токен пользователя
    const tokenDoc = await admin.firestore()
      .collection('userFCMTokens')
      .doc(notification.targetUserUid)
      .get();
    
    if (!tokenDoc.exists) {
      console.log('Токен не найден для пользователя:', notification.targetUserUid);
      return null;
    }
    
    const token = tokenDoc.data().token;
    
    // Отправляем уведомление
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        orderId: notification.orderId,
        status: notification.status,
      },
      token: token,
    };
    
    try {
      await admin.messaging().send(message);
      console.log('Уведомление отправлено:', notification.targetUserUid);
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
    }
    
    return null;
  });
```

### 2. Service Worker (опционально, для фоновых уведомлений)

Для работы уведомлений, когда приложение закрыто, нужен service worker:

1. Создайте файл `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const orderId = event.notification.data.orderId;
  event.waitUntil(
    clients.openWindow(`/order/${orderId}`)
  );
});
```

2. Зарегистрируйте service worker в `src/main.tsx`:

```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker зарегистрирован:', registration);
    })
    .catch((error) => {
      console.error('Ошибка регистрации Service Worker:', error);
    });
}
```

## Диагностика проблем

### Проверьте консоль браузера

Откройте DevTools (F12) и проверьте консоль. Вы должны увидеть:

1. ✅ `✅ Firebase Cloud Messaging инициализирован`
2. ✅ `🔔 Запрос разрешения на уведомления...`
3. ✅ `✅ Токен уведомлений получен: ...`
4. ✅ `✅ FCM токен сохранен для пользователя: ...`
5. ✅ `✅ Система уведомлений инициализирована`

### Проверьте Firestore

1. Откройте Firebase Console → Firestore
2. Проверьте коллекцию `notifications` - там должны появляться записи при изменении статуса заказа
3. Проверьте коллекцию `userFCMTokens` - там должны быть токены пользователей

### Проверьте переменные окружения

Убедитесь, что в `.env.local` есть:
```
VITE_FIREBASE_VAPID_KEY=BH1E8AM0keO0URsils8vl_OV1uVa_5p1_ETGJExadynygCpBofOmXal1vndQtW5267Zwu4AxhxC4ONmweJX3EGk
```

### Проверьте разрешения браузера

1. В Chrome: Настройки → Конфиденциальность и безопасность → Уведомления
2. Убедитесь, что для вашего сайта разрешены уведомления

## Текущие ограничения

⚠️ **Без Cloud Functions:**
- Уведомления сохраняются в Firestore, но не отправляются как push
- Уведомления показываются только когда приложение открыто (через `onMessage`)
- Когда приложение закрыто, уведомления не приходят

✅ **С Cloud Functions:**
- Push-уведомления отправляются автоматически
- Работают даже когда приложение закрыто
- Полная функциональность системы уведомлений

## Следующие шаги

1. Создайте Cloud Function для отправки уведомлений (см. пример выше)
2. Разверните функцию: `firebase deploy --only functions`
3. Протестируйте создание заказа и проверьте, приходят ли уведомления

