// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
// Эти значения должны совпадать с вашими в .env.local
firebase.initializeApp({
  apiKey: "AIzaSyAREWdxq5Bq9cqpc5wvhFjb4yBM_BnTRBA",
  authDomain: "frebaze-94560.firebaseapp.com",
  projectId: "frebaze-94560",
  storageBucket: "frebaze-94560.firebasestorage.app",
  messagingSenderId: "773725722932",
  appId: "1:773725722932:web:d2995775dfac15b23b6d61"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Получено фоновое уведомление:', payload);
  
  const notificationTitle = payload.notification?.title || 'Новое уведомление';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.orderId,
    data: payload.data || {},
    requireInteraction: false,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Клик по уведомлению:', event);
  
  event.notification.close();

  const orderId = event.notification.data?.orderId;
  
  if (orderId) {
    // Открываем страницу заказа
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Проверяем, есть ли уже открытое окно с этим URL
        for (const client of clientList) {
          if (client.url.includes('/order/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Если нет, открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow(`/order/${orderId}`);
        }
      })
    );
  } else {
    // Если нет orderId, просто открываем главную страницу
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

