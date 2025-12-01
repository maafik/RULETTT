# 🔧 Исправление ошибки блокировки Gradle

## ❌ Ошибка
```
Timeout waiting to lock file hash cache (C:\Users\Maafi\.gradle\caches\8.13\fileHashes). 
It is currently in use by another Gradle instance.
Owner PID: 2812
```

## ✅ Решение

Эта ошибка возникает, когда несколько процессов Gradle пытаются одновременно использовать кэш.

### Способ 1: Остановить все Gradle процессы (рекомендуется)

1. **Остановите Gradle daemon:**
   ```powershell
   cd android
   .\gradlew.bat --stop
   ```

2. **Закройте Android Studio** (если открыт)

3. **Проверьте процессы Java:**
   ```powershell
   tasklist | findstr java
   ```
   
   Если видите процессы Gradle - завершите их:
   ```powershell
   taskkill /F /IM java.exe
   ```
   ⚠️ **Внимание:** Это закроет все Java процессы, включая другие приложения!

### Способ 2: Удалить lock файл вручную

1. **Удалите lock файл:**
   ```powershell
   Remove-Item "$env:USERPROFILE\.gradle\caches\8.13\fileHashes\fileHashes.lock" -Force
   ```

2. **Или удалите весь кэш fileHashes:**
   ```powershell
   Remove-Item "$env:USERPROFILE\.gradle\caches\8.13\fileHashes" -Recurse -Force
   ```

### Способ 3: Полная очистка кэша Gradle

Если проблема повторяется:

```powershell
# Остановить daemon
cd android
.\gradlew.bat --stop

# Удалить кэш
Remove-Item "$env:USERPROFILE\.gradle\caches" -Recurse -Force

# Перезапустить Android Studio
```

⚠️ **Внимание:** Удаление кэша заставит Gradle заново скачать зависимости, что может занять время.

## 🚀 После исправления

1. **Откройте Android Studio**
2. **File → Open** → выберите папку `android`
3. **Дождитесь синхронизации Gradle**

## 🔍 Профилактика

Чтобы избежать этой проблемы в будущем:

1. **Всегда закрывайте Android Studio** перед запуском Gradle из командной строки
2. **Не запускайте несколько сборок одновременно**
3. **Используйте `--stop`** перед закрытием Android Studio, если были проблемы

## 📋 Быстрая команда для исправления

Создайте файл `fix-gradle.ps1` в корне проекта:

```powershell
# Остановить Gradle daemon
cd android
.\gradlew.bat --stop
cd ..

# Удалить lock файлы
$lockFile = "$env:USERPROFILE\.gradle\caches\8.13\fileHashes\fileHashes.lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host "Lock файл удален"
}

Write-Host "Готово! Теперь можно открыть Android Studio"
```

Запустите:
```powershell
.\fix-gradle.ps1
```

## ⚡ Альтернативное решение

Если проблема возникает часто, можно увеличить таймаут в `android/gradle.properties`:

```properties
org.gradle.daemon.idletimeout=10800000
org.gradle.caching=true
```

Но лучше просто правильно закрывать процессы перед повторным запуском.


