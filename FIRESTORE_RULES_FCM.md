# Правила Firestore для FCM токенов

## Проблема

Ошибка: `Missing or insufficient permissions` при сохранении FCM токена.

## Решение

Обновите правила Firestore в Firebase Console:

1. Откройте Firebase Console → Firestore Database → Rules
2. Добавьте правило для коллекции `userFCMTokens`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешаем пользователям читать и писать свои FCM токены
    match /userFCMTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Разрешаем пользователям читать и писать свои уведомления
    match /notifications/{notificationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.targetUserUid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.targetUserUid;
    }
    
    // Остальные правила для вашего приложения
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /musicians/{musicianId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
    }
    
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Как применить правила

1. Скопируйте правила выше
2. Вставьте в Firebase Console → Firestore Database → Rules
3. Нажмите "Publish" (Опубликовать)

## Проверка

После обновления правил:
1. Перезагрузите страницу приложения
2. Войдите в систему
3. Проверьте консоль - должно появиться: `✅ FCM токен сохранен для пользователя: ...`

## Временное решение (для тестирования)

Если нужно быстро протестировать, можно временно использовать более открытые правила (НЕ для production!):

```javascript
match /userFCMTokens/{userId} {
  allow read, write: if request.auth != null;
}
```

⚠️ **Внимание:** Эти правила менее безопасны, используйте только для разработки!

