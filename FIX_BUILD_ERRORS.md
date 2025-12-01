# 🔧 Исправление ошибок сборки APK

## 📋 Как найти ошибки

1. **В Android Studio откройте Build view:**
   - View → Tool Windows → Build
   - Или нажмите на вкладку "Build" внизу

2. **Скопируйте ошибки:**
   - Найдите красные строки с ошибками
   - Скопируйте полный текст ошибки

## 🔍 Частые ошибки и решения

### Ошибка 1: Java version mismatch

**Симптомы:**
```
Unsupported class file major version 68
```

**Решение:**
- Используйте Android Studio для сборки (там правильная Java)
- Или установите Java 17/21

### Ошибка 2: Missing dependencies

**Симптомы:**
```
Could not resolve: ...
Failed to resolve: ...
```

**Решение:**
1. File → Invalidate Caches → Invalidate and Restart
2. File → Sync Project with Gradle Files
3. Build → Clean Project
4. Build → Rebuild Project

### Ошибка 3: SDK not found

**Симптомы:**
```
SDK location not found
```

**Решение:**
1. File → Project Structure → SDK Location
2. Укажите путь к Android SDK: `C:\Users\Maafi\AppData\Local\Android\Sdk`

### Ошибка 4: Build tools version

**Симптомы:**
```
Build tools revision XX.X.X is required
```

**Решение:**
1. Tools → SDK Manager
2. SDK Tools → установите нужную версию Build Tools

### Ошибка 5: Manifest errors

**Симптомы:**
```
AndroidManifest.xml errors
```

**Решение:**
- Проверьте `android/app/src/main/AndroidManifest.xml`
- Убедитесь, что все теги закрыты правильно

### Ошибка 6: Resource errors

**Симптомы:**
```
Resource not found
AAPT: error
```

**Решение:**
1. Build → Clean Project
2. Build → Rebuild Project

## 🚀 Быстрое исправление (попробуйте по порядку)

### Шаг 1: Очистка проекта
```
Build → Clean Project
```

### Шаг 2: Синхронизация
```
File → Sync Project with Gradle Files
```

### Шаг 3: Инвалидация кэша
```
File → Invalidate Caches → Invalidate and Restart
```

### Шаг 4: Пересборка
```
Build → Rebuild Project
```

### Шаг 5: Сборка APK
```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

## 📝 Что нужно от вас

**Пожалуйста, скопируйте и отправьте:**
1. Полный текст ошибки из Build view
2. Или сделайте скриншот ошибки

Это поможет точно определить проблему и дать правильное решение.

## 🔄 Альтернатива: Сборка через терминал

Если Android Studio не показывает ошибки четко:

1. **Откройте терминал в Android Studio:**
   - View → Tool Windows → Terminal

2. **Выполните:**
   ```bash
   cd android
   .\gradlew.bat assembleDebug --stacktrace
   ```

3. **Скопируйте вывод ошибок**

## ✅ После исправления

Когда ошибки исправлены:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. APK будет в: `android/app/build/outputs/apk/debug/app-debug.apk`

