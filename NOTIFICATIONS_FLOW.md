# 📬 Как работают уведомления в приложении

## 🔄 Общий поток работы уведомлений

### 1️⃣ **ИНИЦИАЛИЗАЦИЯ (при загрузке приложения)**

**Файл:** `src/App.tsx` → `src/lib/notifications.ts`

```
App.tsx (строка 30-39)
  ↓
onAuthStateChanged (когда пользователь авторизован)
  ↓
initializeNotifications()
  ↓
  1. Проверка поддержки FCM (isSupported)
  2. Получение messaging из firebase.ts
  3. requestNotificationPermission()
     ├─ Проверка окружения (браузер)
     ├─ Проверка поддержки FCM
     ├─ Проверка VAPID ключа
     ├─ Notification.requestPermission() ← Запрос у пользователя
     ├─ Регистрация Service Worker (/firebase-messaging-sw.js)
     ├─ getToken() ← Получение FCM токена
     └─ saveUserFCMToken() ← Сохранение в Firestore (userFCMTokens/{uid})
  4. setupNotificationListener()
     ├─ onMessage() ← Слушатель для уведомлений когда приложение открыто
     └─ serviceWorker.addEventListener() ← Слушатель для кликов по уведомлениям
```

**Результат:** 
- Токен сохранен в `userFCMTokens/{uid}` в Firestore
- Слушатели настроены и готовы принимать уведомления

---

### 2️⃣ **ОТПРАВКА УВЕДОМЛЕНИЙ (при событиях заказа)**

#### 📦 **Создание заказа** (Клиент → Музыкант)

**Файл:** `src/pages/Index.tsx` → `src/lib/notifications.ts`

```
Index.tsx (строка 313-333)
  ↓
saveOrderToFirebase() ← Сохранение заказа
  ↓
notifyOrderCreated(musicianUid, orderId, customerName, artistName)
  ↓
sendOrderNotification()
  ↓
addDoc(notifications, {...}) ← Создание документа в Firestore
  ↓
Cloud Function срабатывает автоматически!
```

**Данные уведомления:**
- `targetUserUid`: UID музыканта
- `orderId`: ID заказа
- `title`: "Новый заказ"
- `body`: "{customerName} создал заказ для {artistName}..."
- `status`: "created"

---

#### ✅ **Подтверждение заказа** (Музыкант → Клиент)

**Файл:** `src/pages/OrderPage.tsx` → `src/lib/firebase-db.ts` → `src/lib/notifications.ts`

```
OrderPage.tsx (строка 469)
  ↓
updateOrderStatus(orderId, "payment-pending")
  ↓
sendStatusChangeNotification() (строка 587)
  ↓
switch (newStatus) → case "payment-pending"
  ↓
notifyOrderConfirmed(customerUid, orderId, artistName)
  ↓
sendOrderNotification()
  ↓
addDoc(notifications, {...})
  ↓
Cloud Function срабатывает!
```

**Данные уведомления:**
- `targetUserUid`: UID клиента
- `title`: "Заказ подтвержден"
- `body`: "{artistName} подтвердил ваш заказ. Ожидается оплата."
- `status`: "payment-pending"

---

#### 💰 **Оплата заказа** (Клиент → Музыкант)

**Файл:** `src/pages/OrderPage.tsx` → `src/lib/firebase-db.ts` → `src/lib/notifications.ts`

```
OrderPage.tsx (строка 528)
  ↓
updateOrderStatus(orderId, "in-progress")
  ↓
sendStatusChangeNotification()
  ↓
switch (newStatus) → case "in-progress"
  ↓
notifyOrderPaid(musicianUid, orderId, customerName, artistName)
  ↓
sendOrderNotification()
  ↓
addDoc(notifications, {...})
  ↓
Cloud Function срабатывает!
```

**Данные уведомления:**
- `targetUserUid`: UID музыканта
- `title`: "Заказ оплачен"
- `body`: "{customerName} оплатил заказ для {artistName}..."
- `status`: "in-progress"

---

#### ✅ **Завершение заказа** (Обе стороны)

**Файл:** `src/pages/OrderPage.tsx` → `src/lib/firebase-db.ts` → `src/lib/notifications.ts`

```
OrderPage.tsx (строка 266 или 293)
  ↓
updateOrderStatus(orderId, "completed")
  ↓
sendStatusChangeNotification()
  ↓
switch (newStatus) → case "completed"
  ↓
notifyOrderCompleted() ← Вызывается ДВА РАЗА:
  ├─ для клиента (customerUid)
  └─ для музыканта (musicianUid)
  ↓
sendOrderNotification() × 2
  ↓
addDoc(notifications, {...}) × 2
  ↓
Cloud Function срабатывает 2 раза!
```

**Данные уведомлений:**
- Клиенту: "Заказ завершен", "{artistName} успешно завершен. Спасибо!"
- Музыканту: "Заказ завершен", "Заказ для {customerName} успешно завершен."
- `status`: "completed"

---

#### ❌ **Отмена заказа** (Обе стороны)

**Файл:** `src/pages/OrderPage.tsx` → `src/lib/firebase-db.ts` → `src/lib/notifications.ts`

```
OrderPage.tsx (строка 334)
  ↓
updateOrderStatus(orderId, "cancelled")
  ↓
sendStatusChangeNotification()
  ↓
switch (newStatus) → case "cancelled"
  ↓
Определение, кто отменил (по oldStatus)
  ↓
notifyOrderCancelled() ← Вызывается для противоположной стороны
  ↓
sendOrderNotification()
  ↓
addDoc(notifications, {...})
  ↓
Cloud Function срабатывает!
```

**Данные уведомления:**
- `title`: "Заказ отменен"
- `body`: Зависит от того, кто отменил
- `status`: "cancelled"

---

### 3️⃣ **ОБРАБОТКА В CLOUD FUNCTION**

**Файл:** `functions/index.js`

```
Firestore: onCreate('notifications/{notificationId}')
  ↓
Cloud Function: sendNotification()
  ↓
1. Получение данных уведомления из Firestore
2. Получение FCM токена из userFCMTokens/{targetUserUid}
3. Формирование сообщения:
   {
     notification: { title, body },
     data: { orderId, status, notificationId },
     token: fcmToken,
     webpush: { fcmOptions: { link: /order/{orderId} } }
   }
4. admin.messaging().send(message)
  ↓
FCM отправляет push-уведомление на устройство пользователя
```

---

### 4️⃣ **ПОЛУЧЕНИЕ УВЕДОМЛЕНИЯ НА КЛИЕНТЕ**

#### 📱 **Когда приложение ОТКРЫТО:**

**Файл:** `src/lib/notifications.ts` → `setupNotificationListener()`

```
onMessage(fcmMessaging, (payload) => { ... })
  ↓
1. Извлечение данных: payload.notification, payload.data
2. Проверка разрешения: Notification.permission === "granted"
3. Создание браузерного уведомления:
   new Notification(title, {
     body,
     icon: "/favicon.ico",
     tag: orderId,
     data: { orderId, status },
     requireInteraction: false
   })
4. Обработчик клика:
   browserNotification.onclick = () => {
     window.focus()
     navigate(`/order/${orderId}`)
     browserNotification.close()
   }
5. Автозакрытие через 5 секунд:
   setTimeout(() => browserNotification.close(), 5000)
```

#### 📱 **Когда приложение ЗАКРЫТО:**

**Файл:** `public/firebase-messaging-sw.js` (Service Worker)

```
Service Worker получает уведомление от FCM
  ↓
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(`/order/${orderId}`)
  )
})
```

**Когда приложение открывается:**
```
Service Worker отправляет сообщение в основное приложение
  ↓
navigator.serviceWorker.addEventListener("message", (event) => {
  if (event.data.type === "NOTIFICATION_CLICK") {
    navigate(`/order/${event.data.orderId}`)
  }
})
```

---

## 📊 Схема полного потока

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ИНИЦИАЛИЗАЦИЯ (при загрузке)                             │
│    App.tsx → initializeNotifications()                      │
│    ├─ requestNotificationPermission()                       │
│    │  └─ getToken() → saveUserFCMToken()                    │
│    └─ setupNotificationListener()                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. СОБЫТИЕ ЗАКАЗА (создание/изменение статуса)             │
│    Index.tsx / OrderPage.tsx                                │
│    ├─ notifyOrderCreated()                                  │
│    ├─ updateOrderStatus() → sendStatusChangeNotification()  │
│    │  ├─ notifyOrderConfirmed()                            │
│    │  ├─ notifyOrderPaid()                                 │
│    │  ├─ notifyOrderCompleted()                            │
│    │  └─ notifyOrderCancelled()                             │
│    └─ Все вызывают → sendOrderNotification()                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. СОХРАНЕНИЕ В FIRESTORE                                    │
│    sendOrderNotification()                                   │
│    └─ addDoc(notifications, {                               │
│         targetUserUid, orderId, title, body, status         │
│       })                                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CLOUD FUNCTION (автоматически)                           │
│    functions/index.js: sendNotification()                   │
│    ├─ Получение FCM токена из userFCMTokens                 │
│    ├─ Формирование сообщения                                │
│    └─ admin.messaging().send() → FCM                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ПОЛУЧЕНИЕ НА КЛИЕНТЕ                                      │
│    Приложение открыто:                                       │
│    └─ onMessage() → new Notification() → автозакрытие 5 сек │
│                                                              │
│    Приложение закрыто:                                       │
│    └─ Service Worker → notificationclick → openWindow()     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Ключевые моменты

1. **Токен сохраняется один раз** при инициализации в `userFCMTokens/{uid}`
2. **Уведомления создаются в Firestore** в коллекции `notifications`
3. **Cloud Function автоматически отправляет** push-уведомления через FCM
4. **Слушатели настроены один раз** и работают постоянно
5. **Уведомления закрываются автоматически** через 5 секунд (только в браузере)
6. **Клик по уведомлению** открывает страницу заказа

---

## 📝 Функции уведомлений

| Функция | Когда вызывается | Кому отправляется |
|---------|------------------|-------------------|
| `notifyOrderCreated()` | При создании заказа | Музыканту |
| `notifyOrderConfirmed()` | При подтверждении (payment-pending) | Клиенту |
| `notifyOrderPaid()` | При оплате (in-progress) | Музыканту |
| `notifyOrderCompleted()` | При завершении | Обеим сторонам |
| `notifyOrderCancelled()` | При отмене | Противоположной стороне |

---

## 🗂️ Структура данных

### Firestore: `userFCMTokens/{uid}`
```json
{
  "token": "FCM_TOKEN_STRING",
  "uid": "USER_UID",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Firestore: `notifications/{notificationId}`
```json
{
  "targetUserUid": "USER_UID",
  "orderId": "ORDER_ID",
  "title": "Новый заказ",
  "body": "Текст уведомления",
  "status": "created",
  "read": false,
  "createdAt": "Timestamp"
}
```

