# 🔧 Исправление ошибки компиляции Capacitor Android 15

## ❌ Ошибка
```
error: cannot find symbol
  symbol:   variable VANILLA_ICE_CREAM
  location: class VERSION_CODES
```

## 🔍 Причина

Capacitor Android 7.4.4 использует API Android 15 (VANILLA_ICE_CREAM), но в проекте установлен `compileSdkVersion = 34`.

## ✅ Решение

### Вариант 1: Установить Android SDK 35 (рекомендуется)

1. **Откройте Android Studio**
2. **Tools → SDK Manager** (или File → Settings → Appearance & Behavior → System Settings → Android SDK)
3. **SDK Platforms** → установите галочку на **Android 15.0 (API 35)**
4. **Нажмите Apply** и дождитесь установки
5. **SDK Tools** → убедитесь, что установлены:
   - Android SDK Build-Tools 35
   - Android SDK Platform-Tools
6. **Нажмите OK**

7. **Обновите `android/variables.gradle`:**
   ```gradle
   compileSdkVersion = 35
   ```

8. **Синхронизируйте проект:**
   - File → Sync Project with Gradle Files

### Вариант 2: Временно понизить версию Capacitor (если не можете установить SDK 35)

Если у вас нет возможности установить Android SDK 35, можно временно использовать более старую версию Capacitor:

1. **Обновите `package.json`:**
   ```json
   "@capacitor/android": "^7.3.0",
   "@capacitor/cli": "^7.3.0",
   "@capacitor/core": "^7.3.0",
   ```

2. **Установите зависимости:**
   ```powershell
   npm install
   ```

3. **Синхронизируйте:**
   ```powershell
   npx cap sync android
   ```

⚠️ **Не рекомендуется:** Лучше установить SDK 35, так как это официальная версия.

## 📋 Что уже исправлено

✅ Обновлен `compileSdkVersion` до 35 в `android/variables.gradle`

## 🚀 После установки SDK 35

1. **Откройте Android Studio**
2. **File → Sync Project with Gradle Files**
3. **Build → Clean Project**
4. **Build → Rebuild Project**

Ошибка должна исчезнуть.

## ⚠️ Важно

- `compileSdkVersion = 35` означает, что вы компилируете с API 35
- `targetSdkVersion = 34` означает, что приложение нацелено на Android 14
- Это нормально и безопасно - приложение будет работать на Android 14 и выше

## 🔍 Проверка установки SDK

Проверьте, установлен ли SDK 35:
```powershell
Test-Path "$env:LOCALAPPDATA\Android\Sdk\platforms\android-35"
```

Если вернет `True` - SDK установлен, если `False` - нужно установить через SDK Manager.

## 📚 Дополнительная информация

- **Android 15 (API 35)** - последняя версия Android
- **VANILLA_ICE_CREAM** - кодовое имя Android 15
- Capacitor 7.4.4 требует минимум Android SDK 35 для компиляции


