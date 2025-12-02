# 🚀 Быстрое исправление push-уведомлений для Android

## ✅ Что было исправлено

1. ✅ Добавлена поддержка OneSignal Capacitor для Android
2. ✅ Исправлено дублирование инициализации OneSignal
3. ✅ Обновлена логика получения Player ID для нативных платформ
4. ✅ Добавлена конфигурация OneSignal в `capacitor.config.json`

## 📋 Что нужно сделать СЕЙЧАС

### Шаг 1: Установите пакет

```bash
npm install @onesignal/onesignal-capacitor
```

### Шаг 2: Синхронизируйте с Android

```bash
npm run build
npm run cap:sync
```

### Шаг 3: Откройте Android Studio

```bash
npm run cap:open:android
```

В Android Studio:
- Дождитесь синхронизации Gradle
- Убедитесь, что нет ошибок

### Шаг 4: Пересоберите приложение

В Android Studio:
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

### Шаг 5: Установите на устройство и протестируйте

1. Установите APK на Android устройство
2. При первом запуске разрешите уведомления
3. Откройте консоль (через Chrome DevTools или logcat)
4. Проверьте логи - должны быть:
   ```
   📱 Инициализация OneSignal для нативной платформы: android
   ✅ OneSignal Capacitor инициализирован
   ✅ Player ID получен (нативная платформа): ...
   ```

### Шаг 6: Проверьте в Firestore

1. Откройте Firebase Console
2. Коллекция `userOneSignalIds`
3. Документ с вашим UID
4. Должен быть сохранен Player ID

### Шаг 7: Отправьте тестовое уведомление

Используйте скрипт:
```bash
npm run send-test-message
```

Или отправьте через API - уведомление должно прийти на Android устройство.

## ⚠️ Важно

- После установки пакета **обязательно** выполните `npm run cap:sync`
- Пересоберите приложение в Android Studio
- Убедитесь, что `google-services.json` есть в `android/app/`

## 🔍 Если не работает

1. Проверьте логи в консоли приложения
2. Проверьте, что Player ID сохранился в Firestore
3. Проверьте OneSignal Dashboard → Audience → All Users
4. Убедитесь, что разрешения на уведомления предоставлены

## 📝 Подробная инструкция

См. файл: `FIX_ANDROID_PUSH_NOTIFICATIONS.md`

