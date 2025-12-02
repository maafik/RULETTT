# 📋 Полный список Environment Variables для Vercel

## 🔥 Firebase (клиентская часть - VITE_)

Эти переменные используются в браузере (клиентский код):

| Переменная | Описание | Где найти |
|-----------|----------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | Firebase Console → Project Settings → General → Your apps → Web app → Config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Обычно: `{project-id}.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console → Project Settings → General → Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Обычно: `{project-id}.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Firebase Console → Project Settings → Cloud Messaging → Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Firebase Console → Project Settings → General → Your apps → Web app → App ID |

---

## 🔔 OneSignal (клиентская часть - VITE_)

| Переменная | Описание | Где найти |
|-----------|----------|----------|
| `VITE_ONESIGNAL_APP_ID` | OneSignal App ID | OneSignal Dashboard → Settings → Keys & IDs → App ID |
| | | Пример: `0ae1d329-0160-4eac-aacc-df8f50479606` |

---

## 🌐 URL приложения (клиентская часть - VITE_)

| Переменная | Описание | Значение |
|-----------|----------|----------|
| `VITE_APP_URL` | URL вашего приложения | `https://rulettt.vercel.app` |
| `VITE_API_URL` | URL API endpoint (опционально) | `https://rulettt.vercel.app/api/send-notification` или оставьте пустым |

---

## 🔥 Firebase Admin (серверная часть - для API)

Эти переменные используются в serverless функциях (`api/send-notification.ts`):

| Переменная | Описание | Где найти |
|-----------|----------|----------|
| `FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console → Project Settings → General → Project ID |
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | Firebase Console → Project Settings → Service Accounts → Generate new private key → `client_email` |
| `FIREBASE_PRIVATE_KEY` | Service Account Private Key | Firebase Console → Project Settings → Service Accounts → Generate new private key → `private_key` (скопируйте полностью, включая `\n`) |

**⚠️ Важно для `FIREBASE_PRIVATE_KEY`:**
- Скопируйте весь ключ, включая `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`
- Сохраните все символы `\n` как есть (не заменяйте на переносы строк)

---

## 🔔 OneSignal (серверная часть - для API)

| Переменная | Описание | Где найти |
|-----------|----------|----------|
| `ONESIGNAL_APP_ID` | OneSignal App ID | OneSignal Dashboard → Settings → Keys & IDs → App ID |
| | | Пример: `0ae1d329-0160-4eac-aacc-df8f50479606` |
| `ONESIGNAL_REST_API_KEY` | OneSignal REST API Key | OneSignal Dashboard → Settings → Keys & IDs → REST API Key |
| | | Пример: `os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i` |

---

## 📝 Итого: Все переменные для Vercel

### Клиентские переменные (VITE_):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ONESIGNAL_APP_ID
VITE_APP_URL
VITE_API_URL (опционально)
```

### Серверные переменные (для API):
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
ONESIGNAL_APP_ID
ONESIGNAL_REST_API_KEY
```

---

## 🚀 Как добавить в Vercel

1. Откройте [Vercel Dashboard](https://vercel.com)
2. Выберите проект `rulettt`
3. Перейдите: **Settings** → **Environment Variables**
4. Добавьте каждую переменную:
   - **Name**: имя переменной (например, `VITE_FIREBASE_API_KEY`)
   - **Value**: значение переменной
   - **Environment**: выберите все (Production, Preview, Development)
5. Нажмите **Save**
6. После добавления всех переменных → **Redeploy** проект

---

## ✅ Проверка

После добавления всех переменных и передеплоя:

1. ✅ Сайт должен открываться без ошибок
2. ✅ Firebase должен инициализироваться (проверьте консоль браузера)
3. ✅ OneSignal должен инициализироваться (проверьте консоль браузера)
4. ✅ API endpoint `/api/send-notification` должен работать

---

## 🔍 Где найти значения

### Firebase:
- [Firebase Console](https://console.firebase.google.com)
- Project Settings → General → Your apps → Web app → Config

### OneSignal:
- [OneSignal Dashboard](https://app.onesignal.com)
- Settings → Keys & IDs

### Firebase Service Account:
- [Firebase Console](https://console.firebase.google.com)
- Project Settings → Service Accounts → Generate new private key

