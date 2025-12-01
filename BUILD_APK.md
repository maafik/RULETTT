# 📦 Сборка APK файла

## ⚠️ Проблема с версией Java

Если у вас установлена Java 24, Gradle может не работать. Для Android разработки нужна Java 17 или 21.

## 🚀 Способ 1: Сборка через Android Studio (Рекомендуется)

Это самый простой и надежный способ:

1. **Откройте проект в Android Studio:**
   ```bash
   npm run cap:open:android
   ```

2. **Дождитесь синхронизации Gradle** (внизу Android Studio)

3. **Соберите APK:**
   - В меню: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Или через терминал в Android Studio: `Build → Build Bundle(s) / APK(s) → Build APK(s)`

4. **Найдите APK файл:**
   - После сборки появится уведомление "APK(s) generated successfully"
   - Нажмите "locate" в уведомлении
   - Или найдите вручную: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🔧 Способ 2: Установка Java 17/21

Если хотите собирать через командную строку:

1. **Скачайте Java 17 или 21:**
   - [Oracle JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
   - Или [OpenJDK 17](https://adoptium.net/temurin/releases/?version=17)

2. **Установите Java 17**

3. **Настройте JAVA_HOME:**
   ```powershell
   # Временно для текущей сессии
   $env:JAVA_HOME="C:\Program Files\Java\jdk-17"
   
   # Или навсегда через переменные окружения Windows
   ```

4. **Соберите APK:**
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```

5. **APK будет здесь:**
   `android/app/build/outputs/apk/debug/app-debug.apk`

## 📱 Способ 3: Сборка Release APK (для публикации)

Для продакшн версии нужна подпись:

1. **Создайте keystore:**
   ```bash
   keytool -genkey -v -keystore musicbooking-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias musicbooking
   ```

2. **Создайте файл `android/key.properties`:**
   ```properties
   storePassword=ваш_пароль
   keyPassword=ваш_пароль
   keyAlias=musicbooking
   storeFile=../musicbooking-release-key.jks
   ```

3. **Обновите `android/app/build.gradle`** для использования keystore

4. **Соберите Release APK:**
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   ```

## 📍 Где найти APK после сборки

- **Debug APK:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK:** `android/app/build/outputs/apk/release/app-release.apk`

## ✅ Быстрая сборка через Android Studio

1. Откройте Android Studio
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. Готово! APK будет в `android/app/build/outputs/apk/debug/`

