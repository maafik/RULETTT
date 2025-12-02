# 📱 Как получить google-services.json для Android

## ⚠️ Важно: Это НЕ файл из Firebase Admin SDK!

- ❌ **НЕ** используйте Service Account JSON (`frebaze-94560-firebase-adminsdk-*.json`)
- ✅ **НУЖЕН** файл `google-services.json` для Android приложения

## 🔍 Где найти google-services.json

### Шаг 1: Откройте Firebase Console

1. Перейдите: https://console.firebase.google.com
2. Выберите проект: **frebaze-94560**

### Шаг 2: Откройте настройки проекта

1. Нажмите на **⚙️ Settings** (шестеренка) → **Project settings**
2. Прокрутите вниз до раздела **"Your apps"**

### Шаг 3: Найдите или создайте Android приложение

#### Если Android приложение уже есть:

1. Найдите Android приложение в списке (иконка 🤖)
2. Нажмите на него
3. Прокрутите вниз до **"Download google-services.json"**
4. Нажмите **"Download google-services.json"**

#### Если Android приложения нет:

1. Нажмите **"Add app"** (или иконку **+**)
2. Выберите **Android** (иконка 🤖)
3. Введите:
   - **Android package name**: `com.musicbooking.app` (из `capacitor.config.json`)
   - **App nickname** (опционально): `MusicBooking Android`
   - **Debug signing certificate SHA-1** (опционально, для тестирования)
4. Нажмите **"Register app"**
5. Скачайте `google-services.json`

## 📁 Куда поместить файл

Поместите `google-services.json` в папку:

```
android/app/google-services.json
```

**Важно:** Файл должен быть именно в `android/app/`, а не в `android/`!

## ✅ Проверка

После добавления файла:

1. Откройте `android/app/build.gradle`
2. Убедитесь, что есть проверка (строки 72-79):
   ```gradle
   try {
       def servicesJSON = file('google-services.json')
       if (servicesJSON.text) {
           apply plugin: 'com.google.gms.google-services'
       }
   } catch(Exception e) {
       logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
   }
   ```

3. Если файл на месте, плагин применится автоматически

## 🔄 Для OneSignal

После добавления `google-services.json`:

1. **OneSignal Dashboard** → **Settings** → **Platforms** → **Google Android (FCM)**
2. Загрузите `google-services.json` в OneSignal
3. Или используйте **FCM Server Key** из Firebase Console

## 📋 Где найти FCM Server Key (альтернатива)

Если хотите использовать FCM Server Key вместо файла:

1. **Firebase Console** → **Project Settings** → **Cloud Messaging**
2. Найдите **"Server key"** (Legacy) или настройте **FCM v1**
3. Скопируйте ключ
4. Вставьте в **OneSignal Dashboard** → **Settings** → **Platforms** → **Google Android (FCM)**

## ⚠️ Важно

- `google-services.json` - это **публичный** файл (можно коммитить в Git)
- Service Account JSON - это **секретный** файл (НЕ коммитить в Git!)
- Оба файла нужны для разных целей:
  - `google-services.json` → Android приложение (FCM)
  - Service Account JSON → Серверные скрипты (Firebase Admin SDK)

