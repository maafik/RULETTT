# 🔧 Настройка переменных окружения в Vercel

## ❗ Проблема: Белый экран на продакшене

Если на `rulettt.vercel.app` белый экран, но локально все работает - **не хватает переменных окружения в Vercel**.

## 📋 Что нужно добавить в Vercel

### Шаг 1: Откройте Vercel Dashboard

1. Перейдите на https://vercel.com/
2. Войдите в аккаунт
3. Выберите проект `rulettt` (или ваш проект)

### Шаг 2: Перейдите в Environment Variables

1. Нажмите на проект
2. Перейдите: **Settings** → **Environment Variables**

### Шаг 3: Добавьте ВСЕ переменные

Добавьте следующие переменные (для каждой выберите **Production, Preview, Development**):

#### 🔥 Firebase переменные (ОБЯЗАТЕЛЬНО!)

```
VITE_FIREBASE_API_KEY=AIzaSyAREWdxq5Bq9cqpc5wvhFjb4yBM_BnTRBA
VITE_FIREBASE_AUTH_DOMAIN=frebaze-94560.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=frebaze-94560
VITE_FIREBASE_STORAGE_BUCKET=frebaze-94560.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=773725722932
VITE_FIREBASE_APP_ID=1:773725722932:web:d2995775dfac15b23b6d61
```

#### 🔔 OneSignal переменные (для уведомлений)

```
VITE_ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
```

#### 🌐 URL переменные

```
VITE_APP_URL=https://rulettt.vercel.app
VITE_API_URL=/api/send-notification
```

#### 🔐 Серверные переменные (для API функций)

```
ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
ONESIGNAL_REST_API_KEY=os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
```

#### 🔥 Firebase Admin (для серверных функций, если используете)

```
FIREBASE_PROJECT_ID=frebaze-94560
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@frebaze-94560.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

**Важно:** Для `FIREBASE_PRIVATE_KEY` нужно взять значение из файла `frebaze-94560-firebase-adminsdk-*.json` (поле `private_key`), и заменить `\n` на реальные переносы строк или оставить как есть.

## ✅ После добавления переменных

1. **Передеплойте проект:**
   - Перейдите в **Deployments**
   - Нажмите на последний deployment
   - Нажмите **Redeploy** (или просто сделайте новый коммит в Git)

2. **Проверьте логи:**
   - Откройте deployment
   - Перейдите в **Functions** → **View Function Logs**
   - Проверьте, нет ли ошибок

3. **Проверьте консоль браузера:**
   - Откройте `https://rulettt.vercel.app`
   - Откройте DevTools (F12)
   - Перейдите в **Console**
   - Проверьте, нет ли ошибок

## 🐛 Частые проблемы

### Белый экран все еще есть?

1. **Проверьте, что все переменные добавлены:**
   - Особенно `VITE_FIREBASE_*` переменные
   - Они должны быть для **Production, Preview, Development**

2. **Проверьте консоль браузера:**
   - Может быть ошибка `Firebase: Error (auth/invalid-api-key)`
   - Это значит, что `VITE_FIREBASE_API_KEY` не настроен

3. **Проверьте логи Vercel:**
   - Могут быть ошибки сборки
   - Проверьте **Deployments** → **Build Logs**

### OneSignal не работает?

- Это **не критично** для мобильного приложения
- OneSignal нужен только для веб-уведомлений
- В мобильном приложении (Capacitor) уведомления работают через нативные API

## 📝 Итоговый список переменных

Скопируйте и добавьте все эти переменные в Vercel:

```
VITE_FIREBASE_API_KEY=AIzaSyAREWdxq5Bq9cqpc5wvhFjb4yBM_BnTRBA
VITE_FIREBASE_AUTH_DOMAIN=frebaze-94560.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=frebaze-94560
VITE_FIREBASE_STORAGE_BUCKET=frebaze-94560.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=773725722932
VITE_FIREBASE_APP_ID=1:773725722932:web:d2995775dfac15b23b6d61
VITE_ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
VITE_APP_URL=https://rulettt.vercel.app
VITE_API_URL=/api/send-notification
ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
ONESIGNAL_REST_API_KEY=os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
```

## ✅ Готово!

После добавления всех переменных и передеплоя, сайт должен работать на `https://rulettt.vercel.app`

