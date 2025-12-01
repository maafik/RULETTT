# 🔧 Исправление несоответствия версий AGP

## Проблема
Проект собран с AGP 8.13.1, но синхронизирован с 8.7.2.

## ✅ Решение

### Способ 1: Очистка и пересоздание (Рекомендуется)

1. **Закройте Android Studio**

2. **Удалите кэш Gradle:**
   - Удалите папку: `android\.gradle`
   - Удалите папку: `android\app\build` (если есть)

3. **Откройте Android Studio снова**

4. **Синхронизируйте проект:**
   - File → Sync Project with Gradle Files
   - Дождитесь завершения

5. **Соберите APK:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

### Способ 2: Через Android Studio

1. **File → Invalidate Caches:**
   - Выберите "Invalidate and Restart"
   - Дождитесь перезапуска

2. **File → Sync Project with Gradle Files**

3. **Build → Clean Project**

4. **Build → Rebuild Project**

5. **Build → Build Bundle(s) / APK(s) → Build APK(s)**

### Способ 3: Через командную строку

1. **Закройте Android Studio**

2. **Удалите кэш:**
   ```powershell
   Remove-Item -Recurse -Force android\.gradle
   Remove-Item -Recurse -Force android\app\build
   ```

3. **Откройте Android Studio**

4. **Синхронизируйте проект**

## 🔍 Проверка версии

После синхронизации проверьте:
- File → Project Structure → Project
- Должна быть версия AGP 8.13.1

## ⚠️ Если не помогло

Попробуйте обновить Gradle wrapper:
- File → Settings → Build, Execution, Deployment → Build Tools → Gradle
- Используйте Gradle из wrapper (рекомендуется)

