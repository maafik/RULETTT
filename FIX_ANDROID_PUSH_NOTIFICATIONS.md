# 🔧 Исправление push-уведомлений для Android

## ❌ Проблема

Push-уведомления работают только в веб-версии, но не работают в Android приложении.

## ✅ Решение

### 1. Установите OneSignal Capacitor плагин

```bash
npm install @onesignal/onesignal-capacitor
```

### 2. Синхронизируйте с Android

```bash
npm run build
npm run cap:sync
```

### 3. Обновите Android зависимости

Откройте Android Studio:
```bash
npm run cap:open:android
```

В Android Studio:
1. Дождитесь синхронизации Gradle
2. Убедитесь, что все зависимости установлены

### 4. Настройте OneSignal для Android в OneSignal Dashboard

1. Откройте **OneSignal Dashboard** → **Settings** → **Platforms** → **Google Android (FCM)**
2. Загрузите `google-services.json` из Firebase Console
3. Или используйте **FCM Server Key**

### 5. Убедитесь, что `google-services.json` на месте

Файл должен быть в: `android/app/google-services.json`

Если файла нет:
1. **Firebase Console** → **Project Settings** → **Your apps** → **Android app**
2. Скачайте `google-services.json`
3. Поместите в `android/app/`

### 6. Пересоберите приложение

```bash
npm run build
npm run cap:sync
```

Затем в Android Studio:
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

### 7. Установите на устройство и протестируйте

1. Установите APK на Android устройство
2. При первом запуске разрешите уведомления
3. Проверьте, что Player ID сохранился в Firestore

## 🔍 Проверка

### В консоли приложения (Android):

Должны быть логи:
```
📱 Инициализация OneSignal для нативной платформы: android
✅ OneSignal Capacitor плагин загружен для нативной платформы
✅ OneSignal Capacitor инициализирован для нативной платформы
✅ Player ID получен (нативная платформа): ...
```

### В Firestore:

1. Коллекция `userOneSignalIds`
2. Документ с вашим UID
3. Поле `playerId` должно содержать Player ID

### В OneSignal Dashboard:

1. **Audience** → **All Users**
2. Найдите ваше устройство
3. В колонке **"Platform"** должно быть: **"Google Android (FCM)"**

## ⚠️ Важно

1. **Разные Player ID для веб и Android:**
   - Веб-версия создает один Player ID
   - Android приложение создает другой Player ID
   - Оба сохраняются в Firestore под одним UID

2. **После установки плагина:**
   - Обязательно выполните `npm run cap:sync`
   - Пересоберите приложение в Android Studio

3. **Проверьте разрешения:**
   - Android 13+ требует разрешение `POST_NOTIFICATIONS`
   - Приложение должно запросить разрешение при первом запуске

## 📋 Что было исправлено

1. ✅ Добавлен OneSignal Capacitor плагин в `package.json`
2. ✅ Обновлена инициализация OneSignal для нативных платформ
3. ✅ Исправлено дублирование `OneSignal.init()`
4. ✅ Добавлена конфигурация OneSignal в `capacitor.config.json`
5. ✅ Обновлена обработка уведомлений для нативных платформ
6. ✅ Обновлено получение Player ID для нативных платформ

## 🚀 Следующие шаги

1. Установите пакет: `npm install @onesignal/onesignal-capacitor`
2. Синхронизируйте: `npm run cap:sync`
3. Пересоберите приложение
4. Протестируйте на устройстве

