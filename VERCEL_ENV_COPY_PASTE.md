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
**Value:** `frebaze-94560`

**Key:** `FIREBASE_CLIENT_EMAIL`  
**Value:** `firebase-adminsdk-fbsvc@frebaze-94560.iam.gserviceaccount.com`

**Key:** `FIREBASE_PRIVATE_KEY`  
**Value:** `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfkQJTBX2orOWu\ndO/iXnw/Wf1GapPB5if2P3O2YkWk1wuyTwKvXhf9yAoulj9FIe9/FzVGy2vjWRrR\nqccE5JD271QjqJZruRKUaDHut/xyDvmpzxlaPWlPDqAm/PqWHaFH/jzJH0NVnSlC\n39jtxeKnmTIbrFTzG7RqFRkIL6wAyLMndtZ8rdVOcU3Ye3G20NBMWcOO+uaF/0Hh\nTqjN4LkeHuSyhtfRtMj+CBCn3HTaX00Yhh0BVhOGaIR3wCXczalIUPUQV32mfufZ\nRMqNpWyQtVAXDDvbY+OPOYkH3fHY9oZ2O0sh/zXBa5ggpgX51OI0a/iAslc4UcL+\nuuSPQS4jAgMBAAECggEAGHx/N9BK5TyLDoeBXGKVfH9Jv6mRPRsdnMtF7YINH+uk\nLtuzFMhCtD4jWdzSnsBDaWRdV5zV1JCS7gO4t8Z/fHVjmwk+9A71i/KlXvW69qHX\nrDhMsq1j4K7k4rbFmY24dzzLhS2X/qZcc5e4SVypmICI0PhUHO5udC0Cp1/xbDkh\n9LixwFmqt9j19ZF6H3Fl5w8N6kooTP6mc4kGvNoBYpjPLNxGM6razR3XTdMkZbjr\n08qVmE9nokozQQo01iwv6lcjResLqPI8QIrOgavkx2n9u4s01OJdduaqXrhaqksB\n+tDvvKH/CRv5cnxaLA4hUsfIc8wVX7a3zzdY95wGgQKBgQDfe7Gz3wKC2bpcwz2C\nbWrlAfugof4RCuMTNSH2xHeUcVy9SU8fxQg7F1DNkGw0lVk+XpKH5cwv9+aiC3SW\nlodhQ1f7GEn6JesOZ99G374gGVWIvJZwXhSw8SY7Uo2AHhXgnMcbfeoYaZdmC3Y5\nnMoRzqC/ky/6UKHGBM4FjxfuYwKBgQC2yIsCdxgqYHXvUCiwDwrOpGCbMQBU53+S\nhwYSy0Ghl5m2PzSjJws8EH8ZDG48BaiFrzl4x2kAqM525Tg+FtNztkpDiD8pV1ff\nYS4mEcdD1EpXirLgidQDNrMgxUGLF5EyNldH3AoGVEPToiK5InZ6il6tPe7fcWVq\n3eU63lTtQQKBgBHpszuso2Hjm8l1qMd8h7Xla8rbUScCjWLrvlYuNzuBvqI5bwsn\n2toJq2NesR2h3u5d3DbiV3R81VKlwmmTlTRZloK81qkjQuz7rGzc4DtobG+yVgiZ\nseTg32Sf4FGll7FSP69Xb10XkZgPUSGbDKNSwZW5cX4J2n2pwu21I4DrAoGAECPX\nOol/pcZMw6wFW76ISsTzDuEd0WF7v1mS7Lfr/LPhS9l68WkyMcSXJIQXe89YGS3m\n2kZpfDhrus300G69jzsqhZoTUbg3ty7in1P0j4XAZsiFkRQ6l2oOGTex2PFkzdVE\nkcDZVcO9FYP8ovJrGdj8ETolzK87sFsVscQOJcECgYEAkNc1w2kdC/EQZhLav6xy\nuNK0e4vZF3dJMvH1xZtufmmOh6kkrc+/3DgQtlcTe8C6wli8uJu7cDPUJ4QDL/Yf\nw2zA8h9+HjelQb+zhxuaFbD7GXt1eU4TxUVXIau/raGResVasAFLZIv0N2e8OvwL\n38UF+AwJQ+Ano0dADArL0iI=\n-----END PRIVATE KEY-----\n`

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

