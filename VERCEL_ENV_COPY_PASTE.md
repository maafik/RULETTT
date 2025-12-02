# 📋 Environment Variables для Vercel (Key-Value)

## Скопируйте и вставьте в Vercel Dashboard → Settings → Environment Variables

---

### 🔥 Firebase (клиент)

**Key:** `VITE_FIREBASE_API_KEY`  
**Value:** `AIzaSy...` (из Firebase Console → Project Settings → General → Your apps → Web app → Config)

**Key:** `VITE_FIREBASE_AUTH_DOMAIN`  
**Value:** `frebaze-94560.firebaseapp.com` (или ваш project-id.firebaseapp.com)

**Key:** `VITE_FIREBASE_PROJECT_ID`  
**Value:** `frebaze-94560` (или ваш project ID)

**Key:** `VITE_FIREBASE_STORAGE_BUCKET`  
**Value:** `frebaze-94560.appspot.com` (или ваш project-id.appspot.com)

**Key:** `VITE_FIREBASE_MESSAGING_SENDER_ID`  
**Value:** `123456789012` (из Firebase Console → Project Settings → Cloud Messaging → Sender ID)

**Key:** `VITE_FIREBASE_APP_ID`  
**Value:** `1:123456789012:web:abcdef123456` (из Firebase Console → Project Settings → General → Your apps → Web app → App ID)

---

### 🔔 OneSignal (клиент)

**Key:** `VITE_ONESIGNAL_APP_ID`  
**Value:** `0ae1d329-0160-4eac-aacc-df8f50479606`

---

### 🌐 URL приложения

**Key:** `VITE_APP_URL`  
**Value:** `https://rulettt.vercel.app`

**Key:** `VITE_API_URL`  
**Value:** (оставьте пустым или `https://rulettt.vercel.app/api/send-notification`)

---

### 🔥 Firebase Admin (сервер - для API)

**Key:** `FIREBASE_PROJECT_ID`  
**Value:** `frebaze-94560` (или ваш project ID)

**Key:** `FIREBASE_CLIENT_EMAIL`  
**Value:** `firebase-adminsdk-xxxxx@frebaze-94560.iam.gserviceaccount.com` (из Service Account JSON → client_email)

**Key:** `FIREBASE_PRIVATE_KEY`  
**Value:** `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n` (из Service Account JSON → private_key, скопируйте полностью со всеми \n)

---

### 🔔 OneSignal (сервер - для API)

**Key:** `ONESIGNAL_APP_ID`  
**Value:** `0ae1d329-0160-4eac-aacc-df8f50479606`

**Key:** `ONESIGNAL_REST_API_KEY`  
**Value:** `os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i` (ваш REST API Key из OneSignal Dashboard)

---

## 📝 Итого: 15 переменных

### Клиентские (9):
1. VITE_FIREBASE_API_KEY
2. VITE_FIREBASE_AUTH_DOMAIN
3. VITE_FIREBASE_PROJECT_ID
4. VITE_FIREBASE_STORAGE_BUCKET
5. VITE_FIREBASE_MESSAGING_SENDER_ID
6. VITE_FIREBASE_APP_ID
7. VITE_ONESIGNAL_APP_ID
8. VITE_APP_URL
9. VITE_API_URL

### Серверные (6):
1. FIREBASE_PROJECT_ID
2. FIREBASE_CLIENT_EMAIL
3. FIREBASE_PRIVATE_KEY
4. ONESIGNAL_APP_ID
5. ONESIGNAL_REST_API_KEY

---

## ⚠️ Важно:

1. **FIREBASE_PRIVATE_KEY** - скопируйте весь ключ из Service Account JSON, включая `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`, со всеми символами `\n`

2. **Environment** - выберите все три: Production, Preview, Development

3. После добавления всех переменных → **Redeploy** проект

