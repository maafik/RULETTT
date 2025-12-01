# 🚀 Быстрый старт OneSignal (БЕЗ настройки сайта)

## ✅ Можно использовать на localhost БЕЗ настройки домена!

Ваши ключи уже готовы:
- **App ID:** `0ae1d329-0160-4eac-aacc-df8f50479606`
- **REST API Key:** `os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i`

## 📝 Шаги для запуска

### 1. Создайте файл `.env.local` в корне проекта:

```env
VITE_ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
VITE_API_URL=/api/send-notification
VITE_APP_URL=http://localhost:5173
```

### 2. Для Vercel (если используете):

Добавьте в Environment Variables:
- `ONESIGNAL_APP_ID` = `0ae1d329-0160-4eac-aacc-df8f50479606`
- `ONESIGNAL_REST_API_KEY` = `os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i`

### 3. Обновите правила Firestore:

Добавьте в `firestore.rules`:

```javascript
match /userOneSignalIds/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 4. Запустите приложение:

```bash
npm run dev
```

### 5. Проверьте работу:

1. Войдите в приложение
2. Разрешите уведомления в браузере
3. Откройте консоль - должен появиться Player ID
4. Проверьте Firestore - в коллекции `userOneSignalIds` должен появиться документ

## ✅ Готово!

Теперь при изменении статуса заказа будут отправляться push-уведомления через OneSignal.

## 📌 Важно

- **Для localhost:** Работает сразу, без настройки домена в OneSignal
- **Для продакшена:** Потребуется настроить домен в OneSignal (Settings → Web Push → Configure)

## 🐛 Проблемы?

Если Player ID не получается:
1. Проверьте, что разрешение на уведомления предоставлено
2. Проверьте консоль браузера на ошибки
3. Убедитесь, что `.env.local` создан и содержит правильный App ID

