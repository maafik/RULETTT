# 🔧 Отладка в консоли браузера

## ⚠️ Важно

В консоли браузера **нельзя использовать алиасы** типа `@/lib/...`, так как они работают только в контексте сборки (Vite/Webpack).

## ✅ Правильные способы проверки

### 1. Проверка через Firebase Console (рекомендуется)

**Проверка токена:**
1. Firebase Console → Firestore Database
2. Коллекция `userFCMTokens`
3. Найдите документ с вашим UID
4. Проверьте поле `token`

**Проверка уведомлений:**
1. Firebase Console → Firestore Database
2. Коллекция `notifications`
3. Проверьте, создаются ли документы

**Проверка логов Cloud Functions:**
1. Firebase Console → Functions → Logs
2. Найдите функцию `sendNotification`
3. Проверьте логи на ошибки

### 2. Проверка через DevTools

**Service Worker:**
1. DevTools → Application → Service Workers
2. Проверьте, зарегистрирован ли Service Worker

**Разрешения:**
1. DevTools → Application → Notifications
2. Проверьте статус разрешений

**Токен (если доступен):**
1. DevTools → Application → Storage → IndexedDB
2. Ищите данные Firebase

### 3. Проверка через логи приложения

**При загрузке приложения должны быть логи:**
```
🚀 Инициализация системы уведомлений...
✅ Токен уведомлений получен: ...
✅ FCM токен обновлен для пользователя: ...
```

**При создании уведомления:**
```
📤 Создаем уведомление в Firestore...
✅ Уведомление создано в Firestore...
✅ Токен получателя найден: ...
```

### 4. Временный код в приложении

Если нужно протестировать в коде, добавьте временную функцию:

```typescript
// В компоненте или отдельном файле
export const testNotification = async () => {
  const { sendOrderNotification } = await import('@/lib/notifications');
  const recipientUid = 'UID_ПОЛУЧАТЕЛЯ';
  
  await sendOrderNotification(
    recipientUid,
    'test-order',
    'Тест',
    'Тестовое уведомление',
    'test'
  );
};

// Вызовите в компоненте или через кнопку
```

## ❌ Что НЕ работает в консоли

```javascript
// ❌ НЕ РАБОТАЕТ - алиасы не поддерживаются
const { getUserFCMToken } = await import('@/lib/notifications');
const { auth } = await import('@/lib/firebase');
```

## ✅ Альтернативы

### Проверка через Firebase SDK напрямую

Если нужно проверить в консоли, используйте Firebase SDK напрямую:

```javascript
// В консоли браузера (если Firebase доступен глобально)
// Проверка токена через Firestore
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const tokenDoc = await getDoc(doc(db, 'userFCMTokens', user.uid));
  if (tokenDoc.exists()) {
    console.log('Токен:', tokenDoc.data().token);
  } else {
    console.log('Токен не найден');
  }
}
```

Но это тоже может не работать, если Firebase не экспортирован глобально.

## 🎯 Рекомендуемый подход

**Используйте Firebase Console для всех проверок:**
- ✅ Проще и надежнее
- ✅ Не требует знания путей импорта
- ✅ Работает всегда
- ✅ Показывает актуальные данные

**Используйте логи приложения для отладки:**
- ✅ Все нужные данные уже логируются
- ✅ Не нужно писать дополнительный код
- ✅ Работает автоматически

## 📋 Чеклист проверки

- [ ] Проверьте токен в Firebase Console → Firestore → `userFCMTokens`
- [ ] Проверьте уведомления в Firebase Console → Firestore → `notifications`
- [ ] Проверьте логи Cloud Functions в Firebase Console → Functions → Logs
- [ ] Проверьте Service Worker в DevTools → Application → Service Workers
- [ ] Проверьте разрешения в DevTools → Application → Notifications
- [ ] Проверьте логи приложения в консоли браузера

