# 📱 OneSignal: Как получить Android подписчика

## ⚠️ Предупреждение OneSignal

> "У вас всего 4 подписчика на это приложение, но ни один не подписан специально на платформу Google Android (FCM). Для продолжения вам нужен хотя бы один подписчик специально на Google Android (FCM)."

## ✅ Решение

### Вариант 1: Игнорировать (если только веб)

Если вы используете **только веб-приложение**, это предупреждение можно **игнорировать**:
- ✅ Веб-подписчики работают через **Web Push**
- ✅ Android (FCM) подписчики нужны только для **нативных Android приложений**
- ✅ Предупреждение не влияет на работу веб-уведомлений

### Вариант 2: Получить Android подписчика (если нужен Android)

Если вы планируете **Android приложение**, нужно получить хотя бы одного Android подписчика:

## 🚀 Пошаговая инструкция

### Шаг 1: Соберите Android приложение

```bash
# 1. Соберите веб-приложение
npm run build

# 2. Синхронизируйте с Android
npm run cap:sync

# 3. Откройте Android Studio
npm run cap:open:android
```

### Шаг 2: Настройте OneSignal для Android

1. Откройте **OneSignal Dashboard** → **Settings** → **Platforms** → **Google Android (FCM)**
2. Настройте Firebase Cloud Messaging (FCM):
   - Загрузите `google-services.json` из Firebase Console
   - Или используйте FCM Server Key

### Шаг 3: Установите приложение на устройство

1. В Android Studio: **Run** → **Run 'app'**
2. Выберите физическое устройство или эмулятор
3. Дождитесь установки и запуска приложения

### Шаг 4: Разрешите уведомления

1. При первом запуске приложение запросит разрешение на уведомления
2. Нажмите **"Разрешить"**
3. OneSignal автоматически зарегистрирует устройство как Android подписчика

### Шаг 5: Проверка

1. Откройте **OneSignal Dashboard** → **Audience** → **All Users**
2. Найдите ваше устройство в списке
3. В колонке **"Platform"** должно быть: **"Google Android (FCM)"**

## 📋 Требования для Android

### 1. Firebase Cloud Messaging (FCM)

OneSignal для Android использует FCM. Нужно:

1. **Firebase Console** → **Project Settings** → **Cloud Messaging**
2. Скопируйте **Server Key** (Legacy) или настройте **FCM v1**
3. Вставьте в **OneSignal Dashboard** → **Settings** → **Platforms** → **Google Android (FCM)**

### 2. Google Services JSON

1. **Firebase Console** → **Project Settings** → **Your apps** → **Android app**
2. Скачайте `google-services.json`
3. Поместите в `android/app/` (если еще не добавлен)

### 3. Разрешения в AndroidManifest.xml

Убедитесь, что в `android/app/src/main/AndroidManifest.xml` есть:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

## 🔍 Проверка подписчиков

### В OneSignal Dashboard:

1. **Audience** → **All Users**
2. Фильтр по **Platform**: `Google Android (FCM)`
3. Должен быть хотя бы один подписчик

### В Firestore:

1. Коллекция `userOneSignalIds`
2. Документ с вашим UID
3. Поле `playerId` должно содержать OneSignal Player ID

## ⚠️ Важно

- **Веб-подписчики** и **Android подписчики** - это разные типы
- Для веб-приложения Android подписчики **не обязательны**
- Предупреждение можно игнорировать, если используете только веб

## 📝 Итого

**Если только веб:**
- ✅ Игнорируйте предупреждение
- ✅ Веб-уведомления работают без Android подписчиков

**Если нужен Android:**
- ✅ Настройте FCM в OneSignal Dashboard
- ✅ Соберите и установите Android приложение
- ✅ Разрешите уведомления на устройстве
- ✅ Получите хотя бы одного Android подписчика

