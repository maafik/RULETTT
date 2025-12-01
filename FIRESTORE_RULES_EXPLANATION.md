# 🔐 Правила Firestore для уведомлений

## ✅ Используется: **Firestore Database** (НЕ Realtime Database)

Приложение использует **Firestore Database** для хранения:
- FCM токенов пользователей (`userFCMTokens`)
- Уведомлений (`notifications`)
- Заказов (`orders`)
- Профилей пользователей (`userProfiles`)

## 📋 Правила для уведомлений

### 1. Коллекция `userFCMTokens/{userId}`

```javascript
match /userFCMTokens/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Что это значит:**
- Пользователь может читать и писать только свой токен
- Токен сохраняется при инициализации уведомлений
- Cloud Function читает токены для отправки уведомлений (использует Admin SDK)

### 2. Коллекция `notifications/{notificationId}`

```javascript
match /notifications/{notificationId} {
  // Любой авторизованный пользователь может создавать уведомления
  allow create: if request.auth != null;
  
  // Читать могут только получатель уведомления
  allow read: if request.auth != null && request.auth.uid == resource.data.targetUserUid;
  
  // Обновлять может только получатель
  allow update: if request.auth != null && request.auth.uid == resource.data.targetUserUid;
  
  // Удалять может только получатель
  allow delete: if request.auth != null && request.auth.uid == resource.data.targetUserUid;
}
```

**Что это значит:**
- Любой авторизованный пользователь может создавать уведомления (при изменении статуса заказа)
- Читать уведомления может только получатель (`targetUserUid`)
- Обновлять (например, пометить как прочитанное) может только получатель
- Cloud Function обновляет уведомления через Admin SDK (обходит правила)

## 🔄 Как это работает

### Создание уведомления (клиент)
1. Пользователь создает/изменяет заказ
2. Приложение вызывает `sendOrderNotification()`
3. Создается документ в `notifications` с полем `targetUserUid`
4. Правило `allow create: if request.auth != null` разрешает создание

### Отправка уведомления (Cloud Function)
1. Cloud Function срабатывает при создании документа (`onCreate`)
2. Cloud Function использует **Admin SDK** (обходит правила безопасности)
3. Читает токен из `userFCMTokens/{targetUserUid}`
4. Отправляет push-уведомление через FCM
5. Обновляет документ уведомления (помечает как отправленное)

### Чтение уведомлений (клиент)
1. Пользователь открывает список уведомлений
2. Приложение запрашивает уведомления где `targetUserUid == currentUser.uid`
3. Правило `allow read: if request.auth != null && request.auth.uid == resource.data.targetUserUid` разрешает чтение

## ⚠️ Важно

### Cloud Functions обходят правила
Cloud Functions используют **Admin SDK**, который имеет полный доступ к Firestore и **обходит все правила безопасности**. Это нормально и безопасно, так как:
- Cloud Functions выполняются на сервере Firebase
- Они имеют доступ только к данным вашего проекта
- Они не могут быть вызваны напрямую из браузера

### Почему НЕ Realtime Database?
- Приложение использует Firestore (коллекции и документы)
- Cloud Functions работают с Firestore
- FCM токены хранятся в Firestore
- Realtime Database - это другая база данных (JSON-структура), которая не используется в этом проекте

## 📝 Где настроить правила

1. **Firebase Console:**
   - Откройте Firebase Console
   - Firestore Database → Rules
   - Скопируйте правила из `firestore.rules`
   - Нажмите "Publish"

2. **Через Firebase CLI:**
   ```bash
   firebase deploy --only firestore:rules
   ```

## ✅ Проверка правил

После настройки правил проверьте:

1. **Токен сохраняется:**
   - Откройте консоль браузера
   - Проверьте, нет ли ошибок `permission-denied`
   - Проверьте Firestore → `userFCMTokens` → ваш UID

2. **Уведомления создаются:**
   - Создайте/измените заказ
   - Проверьте Firestore → `notifications`
   - Должен появиться новый документ

3. **Cloud Function работает:**
   - Проверьте логи Cloud Functions
   - Уведомление должно быть отправлено
   - Документ должен быть обновлен (поле `sent: true`)

## 🐛 Если правила не работают

1. **Ошибка `permission-denied`:**
   - Проверьте, что пользователь авторизован (`request.auth != null`)
   - Проверьте, что UID совпадает (`request.auth.uid == userId`)
   - Проверьте, что правила опубликованы

2. **Токен не сохраняется:**
   - Проверьте правила для `userFCMTokens`
   - Проверьте, что пользователь авторизован
   - Проверьте консоль на ошибки

3. **Уведомления не создаются:**
   - Проверьте правила для `notifications`
   - Проверьте, что `targetUserUid` указан правильно
   - Проверьте консоль на ошибки

