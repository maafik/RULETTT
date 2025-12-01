# 🔔 Настройка OneSignal для Push-уведомлений

Этот документ описывает, как настроить OneSignal для отправки push-уведомлений при изменении статуса заказа.

## 📋 Предварительные требования

1. Аккаунт в OneSignal (https://onesignal.com/)
2. Созданное приложение в OneSignal
3. Полученные App ID и REST API Key

## ❓ Можно ли использовать без настройки сайта?

**Да, для разработки можно!** 

- ✅ **Localhost работает без настройки домена** - OneSignal SDK поддерживает localhost из коробки
- ✅ **Для тестирования** можно сразу использовать ваши ключи
- ⚠️ **Для продакшена** потребуется настроить домен в OneSignal (но это можно сделать позже)

**Ваши ключи уже готовы к использованию:**
- App ID: `0ae1d329-0160-4eac-aacc-df8f50479606`
- REST API Key: `os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i`

## 🚀 Шаги настройки

### 1. Создание приложения в OneSignal

1. Зайдите на https://onesignal.com/ и войдите в свой аккаунт
2. Создайте новое приложение (или используйте существующее)
3. Выберите платформу "Web Push"

**Важно о настройке сайта:**
- **Для разработки (localhost):** Можно использовать БЕЗ настройки домена! OneSignal SDK поддерживает localhost из коробки.
- **Для продакшена:** Потребуется настроить домен в настройках Web Push, но это можно сделать позже.

**Ваши учетные данные уже получены:**
- App ID: `0ae1d329-0160-4eac-aacc-df8f50479606`
- REST API Key: `os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i`

### 2. Получение учетных данных

После создания приложения вам понадобятся:

- **App ID** - находится в настройках приложения (Settings → Keys & IDs)
- **REST API Key** - также находится в Settings → Keys & IDs

### 3. Настройка переменных окружения

#### Для клиентской части (`.env.local` или `.env`):

Создайте файл `.env.local` в корне проекта:

```env
VITE_ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
VITE_API_URL=/api/send-notification
VITE_APP_URL=http://localhost:5173
```

**Важно:** Файл `.env.local` не должен попадать в git (уже в `.gitignore`).

#### Для серверной части (Vercel Environment Variables):

В настройках Vercel проекта добавьте:

```env
ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
ONESIGNAL_REST_API_KEY=os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
VITE_APP_URL=https://your-domain.com
```

**⚠️ Важно о REST API Key:**
- 🔒 **Секретный ключ!** Не добавляйте в `.env.local` (это для клиента)
- ✅ **ТОЛЬКО** в Vercel Environment Variables (используется сервером)
- ❌ **НЕ** коммитьте в Git, не показывайте никому

**Примечание:** 
- Для локальной разработки можно использовать без настройки домена в OneSignal (работает на localhost)
- Для продакшена потребуется настроить домен в OneSignal
- `VITE_APP_URL` используется для ссылок в уведомлениях (куда перейти при клике)

### 4. Настройка Firestore правил

Добавьте правила для коллекции `userOneSignalIds`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешаем пользователям читать и писать свои OneSignal Player ID
    match /userOneSignalIds/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Остальные правила...
  }
}
```

### 5. Проверка работы

1. Запустите приложение
2. Войдите в систему
3. Разрешите уведомления в браузере
4. Проверьте консоль браузера - должен появиться Player ID
5. Проверьте Firestore - в коллекции `userOneSignalIds` должен появиться документ с вашим UID

## 📱 Как это работает

### Инициализация

1. При загрузке приложения вызывается `initializeNotifications()` из `App.tsx`
2. OneSignal SDK инициализируется с App ID
3. Запрашивается разрешение на уведомления
4. Получается Player ID и сохраняется в Firestore (`userOneSignalIds/{uid}`)

### Отправка уведомлений

1. При изменении статуса заказа вызывается `updateOrderStatus()` в `firebase-db.ts`
2. Функция `sendStatusChangeNotification()` определяет, кому отправить уведомление
3. Вызывается соответствующая функция из `notifications.ts` (например, `notifyOrderConfirmed()`)
4. Функция `sendOrderNotification()` получает Player ID получателя из Firestore
5. Отправляется POST запрос на `/api/send-notification`
6. API endpoint отправляет уведомление через OneSignal REST API

### Получение уведомлений

1. OneSignal SDK обрабатывает входящие уведомления
2. При клике на уведомление вызывается обработчик из `onesignal.ts`
3. Пользователь перенаправляется на страницу заказа

## 🔧 Структура файлов

- `src/lib/onesignal.ts` - инициализация и работа с OneSignal SDK
- `src/lib/notifications.ts` - функции для отправки уведомлений
- `src/lib/firebase-db.ts` - логика изменения статуса и отправки уведомлений
- `api/send-notification.ts` - API endpoint для отправки через OneSignal REST API

## 🐛 Отладка

### Проверка Player ID

1. Откройте консоль браузера
2. Проверьте, что Player ID получен и сохранен
3. Проверьте Firestore коллекцию `userOneSignalIds`

### Проверка отправки уведомлений

1. Откройте Network tab в DevTools
2. Проверьте запрос к `/api/send-notification`
3. Проверьте ответ от API
4. Проверьте логи в Vercel (если используется)

### Частые проблемы

1. **Player ID не получается**
   - Убедитесь, что разрешение на уведомления предоставлено
   - Проверьте, что OneSignal SDK инициализирован
   - Проверьте App ID в переменных окружения

2. **Уведомления не отправляются**
   - Проверьте REST API Key в переменных окружения Vercel
   - Проверьте, что Player ID существует в Firestore
   - Проверьте логи API endpoint

3. **Уведомления не приходят**
   - Проверьте, что браузер поддерживает push-уведомления
   - Проверьте настройки браузера для уведомлений
   - Проверьте, что приложение не заблокировано в настройках браузера

## 📚 Дополнительные ресурсы

- [OneSignal Web Push Documentation](https://documentation.onesignal.com/docs/web-push-quickstart)
- [OneSignal REST API Reference](https://documentation.onesignal.com/reference/create-notification)
- [react-onesignal Documentation](https://github.com/OneSignal/react-onesignal)


