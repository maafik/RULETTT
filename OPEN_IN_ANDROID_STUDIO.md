# 📱 Открытие проекта в Android Studio

## ✅ Проект готов к открытию!

Проект уже настроен и синхронизирован. Вы можете открыть его в Android Studio.

## 🚀 Как открыть проект

### Способ 1: Через команду (рекомендуется)

1. **Откройте терминал** в корне проекта
2. **Выполните команду:**
   ```powershell
   npm run cap:open:android
   ```
   
   Или напрямую:
   ```powershell
   npx cap open android
   ```

3. **Android Studio откроется автоматически** с проектом

### Способ 2: Вручную в Android Studio

1. **Откройте Android Studio**
2. **File → Open**
3. **Выберите папку:** `android` (не корневую папку проекта!)
   ```
   C:\Users\Maafi\OneDrive\Рабочий стол\stage-spotlight-72-main\android
   ```
4. **Нажмите OK**

## ⚠️ Важно!

- **Открывайте папку `android`**, а не корневую папку проекта
- Android Studio автоматически определит проект по файлу `settings.gradle`

## 🔧 Первый запуск в Android Studio

После открытия проекта:

1. **Дождитесь синхронизации Gradle**
   - Android Studio автоматически начнет синхронизацию
   - Внизу будет индикатор "Gradle Sync"
   - Это может занять несколько минут при первом запуске

2. **Если появится запрос на обновление:**
   - Gradle может предложить обновить wrapper
   - Обычно можно согласиться

3. **Проверьте SDK:**
   - File → Project Structure → SDK Location
   - Должен быть указан путь: `C:\Users\Maafi\AppData\Local\Android\Sdk`
   - Если нет - укажите вручную

## 📋 Что уже настроено

✅ **Gradle конфигурация** - готова  
✅ **Версии SDK** - настроены (minSdk 23, targetSdk 34)  
✅ **Capacitor плагины** - подключены  
✅ **Веб-код** - синхронизирован в `android/app/src/main/assets`  
✅ **Манифест** - настроен  
✅ **Ресурсы** - иконки и splash screen готовы  
✅ **Путь к SDK** - указан в `local.properties`  

## 🏗️ Структура проекта в Android Studio

После открытия вы увидите:

```
android/
├── app/                    # Основной модуль приложения
│   ├── src/main/
│   │   ├── java/          # Java код (MainActivity)
│   │   ├── res/           # Ресурсы (иконки, строки, стили)
│   │   ├── assets/        # Веб-код (HTML, JS, CSS)
│   │   └── AndroidManifest.xml
│   └── build.gradle       # Конфигурация сборки
├── build.gradle           # Корневой build.gradle
├── settings.gradle        # Настройки проекта
└── gradle/                # Gradle wrapper
```

## 🎯 Что можно делать в Android Studio

1. **Собрать APK:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Или Build → Generate Signed Bundle / APK (для релизной версии)

2. **Запустить на эмуляторе:**
   - Создайте виртуальное устройство (AVD)
   - Нажмите Run (▶️) или Shift+F10

3. **Запустить на реальном устройстве:**
   - Подключите телефон через USB
   - Включите режим разработчика и USB отладку
   - Нажмите Run

4. **Отладка:**
   - Установите breakpoints в Java коде
   - Используйте Logcat для просмотра логов

## 🔄 Обновление веб-кода

Если вы изменили веб-код (React/TypeScript):

1. **Соберите проект:**
   ```powershell
   npm run build
   ```

2. **Синхронизируйте с Android:**
   ```powershell
   npx cap sync android
   ```

3. **В Android Studio:**
   - File → Sync Project with Gradle Files
   - Или просто пересоберите проект

## ⚡ Быстрые команды

```powershell
# Сборка веб-кода
npm run build

# Синхронизация с Android
npm run cap:sync

# Открыть в Android Studio
npm run cap:open:android

# Собрать Debug APK (из корня проекта)
cd android
.\gradlew.bat assembleDebug

# Собрать Release APK (требует keystore)
cd android
.\gradlew.bat assembleRelease
```

## 🐛 Если что-то не работает

### Ошибка блокировки Gradle (Timeout waiting to lock file hash cache)

Если видите ошибку о блокировке кэша Gradle:

1. **Остановите Gradle daemon:**
   ```powershell
   cd android
   .\gradlew.bat --stop
   ```

2. **Закройте Android Studio** (если открыт)

3. **Повторно откройте проект**

📖 **Подробная инструкция:** см. файл `FIX_GRADLE_LOCK.md`

### Android Studio не видит проект

1. Убедитесь, что открыли папку `android`, а не корневую
2. Проверьте наличие файла `settings.gradle` в папке `android`
3. File → Invalidate Caches → Invalidate and Restart

### Ошибки Gradle

1. File → Sync Project with Gradle Files
2. Build → Clean Project
3. Build → Rebuild Project

### SDK не найден

1. File → Project Structure → SDK Location
2. Укажите путь: `C:\Users\Maafi\AppData\Local\Android\Sdk`
3. Или создайте `local.properties` в папке `android`:
   ```
   sdk.dir=C\:\\Users\\Maafi\\AppData\\Local\\Android\\Sdk
   ```

## 📚 Дополнительная информация

- **Версия Gradle:** 8.13
- **Версия Android Gradle Plugin:** 8.13.1
- **Min SDK:** 23 (Android 6.0)
- **Target SDK:** 34 (Android 14)
- **Package Name:** com.musicbooking.app

## ✅ Готово!

Теперь вы можете работать с проектом в Android Studio. Проект полностью настроен и готов к сборке APK или AAB для публикации в Google Play.

