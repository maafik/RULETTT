# 🔧 Решение проблемы с Java 24

## Проблема
Gradle не поддерживает Java 24. Нужна Java 17 или 21.

## ✅ Решение 1: Сборка через Android Studio (САМЫЙ ПРОСТОЙ)

Android Studio использует свою встроенную JDK (обычно Java 17), которая совместима с Gradle.

1. **Откройте Android Studio:**
   ```bash
   npm run cap:open:android
   ```

2. **Дождитесь синхронизации Gradle**

3. **Соберите APK:**
   - Меню: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Или: **Build → Make Project** (Ctrl+F9)

4. **APK будет здесь:**
   `android/app/build/outputs/apk/debug/app-debug.apk`

## 🔧 Решение 2: Настроить Gradle использовать JDK Android Studio

Если хотите собирать через командную строку:

1. **Найдите путь к JDK Android Studio:**
   - Обычно: `C:\Program Files\Android\Android Studio\jbr`
   - Или: `C:\Users\ВашеИмя\AppData\Local\Android\Android Studio\jbr`

2. **Добавьте в `android/local.properties`:**
   ```properties
   org.gradle.java.home=C\:\\Program Files\\Android\\Android Studio\\jbr
   ```
   (Замените путь на ваш реальный путь)

3. **Соберите APK:**
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```

## 📥 Решение 3: Установить Java 17 отдельно

1. **Скачайте Java 17:**
   - [Adoptium OpenJDK 17](https://adoptium.net/temurin/releases/?version=17)
   - Или [Oracle JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)

2. **Установите Java 17**

3. **Настройте JAVA_HOME:**
   ```powershell
   # Временно для текущей сессии
   $env:JAVA_HOME="C:\Program Files\Java\jdk-17"
   
   # Или навсегда через:
   # Панель управления → Система → Дополнительные параметры системы → 
   # Переменные среды → Добавить JAVA_HOME
   ```

4. **Проверьте версию:**
   ```bash
   java -version
   ```
   Должно показать Java 17

5. **Соберите APK:**
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```

## 🎯 Рекомендация

**Используйте Решение 1 (Android Studio)** - это самый простой и надежный способ. Android Studio уже настроена правильно и использует совместимую версию Java.

## 📍 Где найти APK после сборки

После успешной сборки APK будет здесь:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Этот файл можно установить на телефон!

