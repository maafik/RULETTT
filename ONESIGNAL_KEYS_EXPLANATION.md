# 🔑 Объяснение ключей OneSignal и настройки URL

## 🔐 Какие ключи нужны и где?

### 1. **OneSignal App ID** (`0ae1d329-0160-4eac-aacc-df8f50479606`)
**Где используется:**
- ✅ В клиентской части (браузер/приложение) - для инициализации OneSignal SDK
- ✅ В серверной части (Vercel function) - для отправки уведомлений

**Где хранить:**
- `.env.local` (локально): `VITE_ONESIGNAL_APP_ID=...`
- Vercel Environment Variables: `ONESIGNAL_APP_ID=...`

**Безопасность:** ⚠️ Можно показывать в клиентском коде (видно в браузере)

---

### 2. **REST API Key** (`os_v2_app_...`)
**Где используется:**
- ✅ **ТОЛЬКО** в серверной части (Vercel function `api/send-notification.ts`)
- ❌ **НИКОГДА** не в клиентском коде!

**Где хранить:**
- ❌ **НЕ** в `.env.local` (это для клиента)
- ✅ **ТОЛЬКО** в Vercel Environment Variables: `ONESIGNAL_REST_API_KEY=...`

**Безопасность:** 🔒 **КРИТИЧЕСКИ ВАЖНО!** Как пароль - не показывать никому!

**Зачем нужен:**
- Для авторизации при отправке уведомлений через OneSignal REST API
- Без него сервер не сможет отправлять уведомления

**Как используется:**
```typescript
// api/send-notification.ts
const oneSignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY;
const authHeader = Buffer.from(`${oneSignalRestApiKey}:`).toString('base64');
// Отправка запроса с авторизацией
```

---

## 🌐 Что такое `VITE_APP_URL` и зачем localhost?

### Зачем нужен `VITE_APP_URL`?

`VITE_APP_URL` используется для создания **ссылки в уведомлении** - куда перейти при клике на уведомление.

**Пример:**
Когда приходит уведомление "Заказ подтвержден", при клике на него открывается:
```
http://localhost:5173/order/12345  (локально)
или
https://your-domain.com/order/12345  (продакшен)
```

### Почему localhost в документации?

**Для локальной разработки:**
```env
VITE_APP_URL=http://localhost:5173
```
- ✅ Работает на вашем компьютере
- ✅ Можно тестировать уведомления локально
- ✅ Ссылки в уведомлениях будут вести на localhost

**Для продакшена (Vercel):**
```env
VITE_APP_URL=https://your-actual-domain.com
```
- ✅ Реальный домен вашего приложения
- ✅ Ссылки в уведомлениях будут вести на реальный сайт

---

## 📋 Где что настраивать?

### Для локальной разработки (`.env.local`):

```env
# Клиентская часть
VITE_ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
VITE_API_URL=/api/send-notification
VITE_APP_URL=http://localhost:5173

# REST API Key НЕ нужен здесь! (используется только на сервере)
```

### Для продакшена (Vercel Environment Variables):

```env
# Для серверной части (Vercel function)
ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
ONESIGNAL_REST_API_KEY=os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
VITE_APP_URL=https://your-actual-domain.vercel.app

# Для клиентской части (если нужно)
VITE_ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
```

---

## 🔍 Как это работает?

### Процесс отправки уведомления:

```
1. Пользователь меняет статус заказа
   ↓
2. Клиент вызывает /api/send-notification
   ↓
3. Vercel function (api/send-notification.ts):
   - Использует ONESIGNAL_APP_ID
   - Использует ONESIGNAL_REST_API_KEY (для авторизации)
   - Использует VITE_APP_URL (для ссылки в уведомлении)
   ↓
4. Отправка через OneSignal REST API
   ↓
5. Уведомление приходит на устройство
   ↓
6. При клике открывается: VITE_APP_URL/order/{orderId}
```

---

## ⚠️ Важные моменты

### 1. REST API Key - секретный ключ!

- ❌ **НЕ** добавляйте в `.env.local`
- ❌ **НЕ** коммитьте в Git
- ❌ **НЕ** показывайте в клиентском коде
- ✅ **ТОЛЬКО** в Vercel Environment Variables

### 2. VITE_APP_URL для разных окружений

**Локально:**
```env
VITE_APP_URL=http://localhost:5173
```

**Продакшен:**
```env
VITE_APP_URL=https://your-domain.vercel.app
```

### 3. OneSignal App ID - можно показывать

- ✅ Можно в клиентском коде
- ✅ Можно в `.env.local`
- ✅ Можно в Vercel (для сервера)

---

## ✅ Чек-лист настройки

### Локальная разработка:
- [ ] `.env.local` с `VITE_ONESIGNAL_APP_ID`
- [ ] `.env.local` с `VITE_APP_URL=http://localhost:5173`
- [ ] REST API Key **НЕ** нужен локально (только на сервере)

### Продакшен (Vercel):
- [ ] `ONESIGNAL_APP_ID` в Vercel Environment Variables
- [ ] `ONESIGNAL_REST_API_KEY` в Vercel Environment Variables
- [ ] `VITE_APP_URL` с реальным доменом в Vercel Environment Variables
- [ ] `VITE_ONESIGNAL_APP_ID` в Vercel Environment Variables (если нужно)

---

## 🎯 Итог

1. **REST API Key** - нужен, но **ТОЛЬКО** на сервере (Vercel), не в клиенте
2. **VITE_APP_URL** - нужен для ссылок в уведомлениях
3. **localhost** - для локальной разработки, для продакшена нужен реальный URL

