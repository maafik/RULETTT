# 🔍 Диагностика уведомлений

## Как проверить, почему уведомления не работают

### 1. Откройте консоль браузера (F12)

После загрузки приложения вы должны увидеть логи инициализации уведомлений.

### 2. Проверьте диагностику

В консоли выполните:

```javascript
import { logNotificationDiagnostics } from '@/lib/notifications';
await logNotificationDiagnostics();
```

Или откройте консоль и найдите логи, которые начинаются с:
- `🚀 Инициализация системы уведомлений...`
- `🔍 Диагностика системы уведомлений...`

### 3. Проверьте основные проблемы

#### ❌ **Разрешение отклонено (denied)**
**Решение:**
1. Откройте настройки браузера
2. Найдите настройки уведомлений для этого сайта
3. Разрешите уведомления

#### ❌ **VAPID ключ не найден**
**Решение:**
1. Откройте `.env.local`
2. Добавьте: `VITE_FIREBASE_VAPID_KEY=ваш_ключ`
3. Перезапустите приложение

**Как получить VAPID ключ:**
1. Откройте Firebase Console
2. Project Settings → Cloud Messaging
3. Скопируйте "Web Push certificates" → "Key pair"

#### ❌ **Service Worker не зарегистрирован**
**Решение:**
1. Проверьте, что файл `public/firebase-messaging-sw.js` существует
2. Проверьте, что он доступен по адресу `/firebase-messaging-sw.js`
3. Откройте DevTools → Application → Service Workers
4. Проверьте, зарегистрирован ли Service Worker

#### ❌ **Messaging не инициализирован**
**Решение:**
1. Проверьте консоль на наличие ошибок
2. Убедитесь, что все переменные окружения настроены
3. Проверьте файл `src/lib/firebase.ts`

#### ❌ **Токен не получен**
**Решение:**
1. Убедитесь, что разрешение на уведомления предоставлено
2. Проверьте VAPID ключ
3. Проверьте Service Worker
4. Посмотрите логи в консоли

### 4. Проверьте Firestore

#### Проверка токена пользователя

1. Откройте Firebase Console
2. Firestore Database
3. Коллекция `userFCMTokens`
4. Найдите документ с вашим UID
5. Проверьте, что поле `token` заполнено

#### Проверка уведомлений

1. Коллекция `notifications`
2. Проверьте, создаются ли документы при событиях заказа
3. Проверьте поле `sent` - должно быть `true` после отправки

### 5. Проверьте Cloud Functions

#### Проверка развертывания

```bash
cd functions
npm install
firebase deploy --only functions
```

#### Проверка логов

```bash
firebase functions:log
```

Или в Firebase Console:
1. Functions → Logs
2. Найдите функцию `sendNotification`
3. Проверьте логи на наличие ошибок

### 6. Тестирование уведомлений

#### Тест через консоль браузера

```javascript
// Проверка токена
import { getUserFCMToken } from '@/lib/notifications';
const { auth } = await import('@/lib/firebase');
const token = await getUserFCMToken(auth.currentUser.uid);
console.log('Токен:', token);

// Проверка разрешения
console.log('Разрешение:', Notification.permission);

// Проверка Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
});
```

#### Тест отправки уведомления

1. Создайте тестовое уведомление в Firestore:
   - Коллекция: `notifications`
   - Документ: новый
   - Поля:
     - `targetUserUid`: ваш UID
     - `orderId`: "test"
     - `title`: "Тест"
     - `body`: "Тестовое уведомление"
     - `status`: "test"
     - `read`: false
     - `createdAt`: текущее время

2. Cloud Function должна автоматически отправить уведомление

### 7. Частые проблемы и решения

#### Проблема: Уведомления не приходят
**Возможные причины:**
- Cloud Functions не развернуты
- Токен не сохранен в Firestore
- Разрешение отклонено
- Service Worker не работает

#### Проблема: Уведомления приходят, но не отображаются
**Возможные причины:**
- Браузер блокирует уведомления
- Разрешение было отозвано
- Service Worker не обрабатывает уведомления

#### Проблема: Токен не сохраняется
**Возможные причины:**
- Пользователь не авторизован
- Ошибка прав доступа в Firestore
- Ошибка сети

### 8. Проверка правил Firestore

Убедитесь, что правила Firestore разрешают запись:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Токены пользователей
    match /userFCMTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Уведомления
    match /notifications/{notificationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if false; // Только Cloud Function может обновлять
    }
  }
}
```

### 9. Полная диагностика

Выполните в консоли браузера:

```javascript
// Импортируйте функции
const { logNotificationDiagnostics, diagnoseNotifications } = await import('@/lib/notifications');

// Выведите диагностику
await logNotificationDiagnostics();

// Получите детальную информацию
const diagnostics = await diagnoseNotifications();
console.log('Детальная диагностика:', diagnostics);
```

### 10. Контрольный список

- [ ] Разрешение на уведомления предоставлено
- [ ] VAPID ключ настроен в `.env.local`
- [ ] Service Worker зарегистрирован
- [ ] Messaging инициализирован
- [ ] Токен получен и сохранен в Firestore
- [ ] Cloud Functions развернуты
- [ ] Правила Firestore настроены правильно
- [ ] Уведомления создаются в Firestore
- [ ] Cloud Function отправляет уведомления (проверьте логи)

Если все пункты выполнены, но уведомления все равно не работают, проверьте логи Cloud Functions и консоль браузера на наличие ошибок.

