# 📋 VITE_ONESIGNAL_APP_ID vs ONESIGNAL_APP_ID

## ✅ Да, оба должны иметь ОДИНАКОВОЕ значение!

Оба должны быть: `0ae1d329-0160-4eac-aacc-df8f50479606`

---

## 🔍 Разница

### `VITE_ONESIGNAL_APP_ID` (клиентская часть)
- **Где используется:** В браузере (клиентский код)
- **Файлы:** `src/lib/onesignal.ts`, `index.html`
- **Префикс `VITE_`:** Нужен для Vite, чтобы переменная была доступна в браузере
- **Использование:** `import.meta.env.VITE_ONESIGNAL_APP_ID`

### `ONESIGNAL_APP_ID` (серверная часть)
- **Где используется:** В serverless функции (API)
- **Файлы:** `api/send-notification.ts`
- **Без префикса:** Serverless функции используют `process.env`
- **Использование:** `process.env.ONESIGNAL_APP_ID`

---

## 📝 В Vercel Environment Variables

Оба должны быть добавлены:

```
Key: VITE_ONESIGNAL_APP_ID
Value: 0ae1d329-0160-4eac-aacc-df8f50479606
Environment: ✅ Production, ✅ Preview, ✅ Development

Key: ONESIGNAL_APP_ID
Value: 0ae1d329-0160-4eac-aacc-df8f50479606
Environment: ✅ Production, ✅ Preview, ✅ Development
```

---

## ⚠️ Важно

- ✅ **Одинаковое значение** для обоих
- ✅ **Разные имена** (один с `VITE_`, другой без)
- ✅ **Оба нужны** - один для клиента, другой для сервера

---

## 🔍 Почему два разных имени?

1. **Vite требует префикс `VITE_`** для переменных, доступных в браузере
2. **Serverless функции** (Vercel) используют обычные переменные без префикса
3. Это стандартная практика для разделения клиентских и серверных переменных

---

## ✅ Проверка

После добавления обоих переменных в Vercel:

1. **Клиентская часть:**
   - В консоли браузера должно быть: `✅ OneSignal инициализирован`
   - Не должно быть: `❌ VITE_ONESIGNAL_APP_ID не найден`

2. **Серверная часть:**
   - В логах Vercel функции должно быть: `✅ Firebase Admin инициализирован`
   - В логах должно быть: `appId: 0ae1d329-0160-4eac-aacc-df8f50479606`

---

## 📋 Итого

**Оба должны быть:**
```
VITE_ONESIGNAL_APP_ID = 0ae1d329-0160-4eac-aacc-df8f50479606
ONESIGNAL_APP_ID = 0ae1d329-0160-4eac-aacc-df8f50479606
```

**Одинаковое значение, разные имена!** ✅

