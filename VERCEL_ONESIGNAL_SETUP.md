# 🔗 Настройка OneSignal через Vercel

## ✅ Да, REST API Key нужен в Vercel!

Вы правильно понимаете - **REST API Key нужен в Vercel Environment Variables**, потому что:

1. ✅ Ваша серверная функция `api/send-notification.ts` работает на **Vercel**
2. ✅ Эта функция отправляет уведомления через **OneSignal REST API**
3. ✅ Для авторизации в OneSignal REST API нужен **REST API Key**
4. ✅ REST API Key хранится в **Vercel Environment Variables**

---

## 🔄 Как это работает

```
Клиент (браузер/приложение)
    ↓
Вызывает /api/send-notification
    ↓
Vercel Serverless Function (api/send-notification.ts)
    ↓
Использует REST API Key из Vercel Environment Variables
    ↓
Отправляет запрос в OneSignal REST API
    ↓
OneSignal отправляет push-уведомление на устройство
```

---

## 📋 Что нужно настроить в Vercel

### Шаг 1: Откройте Vercel Dashboard

1. Перейдите на https://vercel.com/
2. Войдите в аккаунт
3. Выберите ваш проект

### Шаг 2: Перейдите в Environment Variables

1. Нажмите на проект
2. Перейдите: **Settings** → **Environment Variables**

### Шаг 3: Добавьте переменные

Добавьте следующие переменные:

#### 1. `ONESIGNAL_APP_ID`
```
Name: ONESIGNAL_APP_ID
Value: 0ae1d329-0160-4eac-aacc-df8f50479606
Environment: Production, Preview, Development (все)
```

#### 2. `ONESIGNAL_REST_API_KEY` ⭐ **ВАЖНО!**
```
Name: ONESIGNAL_REST_API_KEY
Value: os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
Environment: Production, Preview, Development (все)
```

#### 3. `VITE_APP_URL`
```
Name: VITE_APP_URL
Value: https://your-project.vercel.app (ваш реальный домен)
Environment: Production, Preview, Development (все)
```

#### 4. `VITE_ONESIGNAL_APP_ID` (опционально, для клиента)
```
Name: VITE_ONESIGNAL_APP_ID
Value: 0ae1d329-0160-4eac-aacc-df8f50479606
Environment: Production, Preview, Development (все)
```

---

## 🔍 Где используется REST API Key?

### В коде (`api/send-notification.ts`):

```typescript
// Получаем REST API Key из Vercel Environment Variables
const oneSignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY;

// Используем для авторизации в OneSignal REST API
const authHeader = Buffer.from(`${oneSignalRestApiKey}:`).toString('base64');

// Отправляем запрос с авторизацией
const response = await fetch('https://onesignal.com/api/v1/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authHeader}`, // ← ВОТ ЗДЕСЬ!
  },
  body: JSON.stringify(notificationPayload),
});
```

---

## ⚠️ Важно!

### REST API Key - секретный ключ!

- 🔒 **НЕ** добавляйте в `.env.local` (это для клиента)
- 🔒 **НЕ** коммитьте в Git
- 🔒 **НЕ** показывайте в клиентском коде
- ✅ **ТОЛЬКО** в Vercel Environment Variables

### Почему в Vercel?

Потому что:
- ✅ Серверная функция работает на Vercel
- ✅ Vercel предоставляет переменные окружения для serverless функций
- ✅ Без REST API Key в Vercel - уведомления не будут отправляться

---

## ✅ Проверка настройки

### 1. Проверьте в Vercel Dashboard:

1. Откройте проект в Vercel
2. Settings → Environment Variables
3. Убедитесь, что есть:
   - ✅ `ONESIGNAL_APP_ID`
   - ✅ `ONESIGNAL_REST_API_KEY`
   - ✅ `VITE_APP_URL`

### 2. Проверьте работу:

1. Измените статус заказа в приложении
2. Проверьте логи Vercel (Deployments → выберите deployment → Functions → api/send-notification)
3. Должны увидеть:
   ```
   📤 Отправка уведомления через OneSignal...
   ✅ Уведомление успешно отправлено через OneSignal
   ```

### 3. Если ошибка:

Если видите ошибку:
```
❌ OneSignal credentials не настроены
```

Это значит, что `ONESIGNAL_REST_API_KEY` не найден в Vercel Environment Variables.

**Решение:**
1. Добавьте `ONESIGNAL_REST_API_KEY` в Vercel Environment Variables
2. Передеплойте проект (или подождите автоматического деплоя)

---

## 🎯 Итог

**Да, вы правильно понимаете!**

- ✅ OneSignal используется для уведомлений
- ✅ REST API Key нужен в **Vercel Environment Variables**
- ✅ Потому что серверная функция работает на Vercel
- ✅ Без REST API Key в Vercel - уведомления не будут работать

**Добавьте `ONESIGNAL_REST_API_KEY` в Vercel Environment Variables, и все заработает!** 🚀

