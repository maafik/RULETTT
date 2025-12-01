# 📱 Команды меню Android Studio

## 🔧 Основные команды сборки

### Синхронизация проекта
- **File → Sync Project with Gradle Files**
- Или нажмите кнопку "Sync Now" в уведомлении

### Очистка проекта
- **Build → Clean Project**
- Удаляет все скомпилированные файлы

### Сборка проекта
В зависимости от версии Android Studio, пункт может называться по-разному:

#### Вариант 1: Make Project
- **Build → Make Project**
- Или нажмите **Ctrl+F9** (Windows/Linux) / **Cmd+F9** (Mac)
- Компилирует измененные файлы

#### Вариант 2: Rebuild Project
- **Build → Rebuild Project**
- Полная пересборка проекта (Clean + Make)

#### Вариант 3: Build Bundle(s) / APK(s)
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Собирает APK файл

## 🎯 Что использовать

### После изменения `gradle.properties`:
1. **File → Sync Project with Gradle Files** ✅
2. **Build → Clean Project** ✅
3. **Build → Make Project** (или **Ctrl+F9**) ✅

### Если "Rebuild Project" нет в меню:
- Используйте **Build → Make Project**
- Или комбинацию: **Clean Project** → **Make Project**

## ⌨️ Горячие клавиши

- **Ctrl+F9** (Windows/Linux) / **Cmd+F9** (Mac) - Make Project
- **Ctrl+Shift+F9** - Rebuild Project (если доступно)
- **Ctrl+Alt+S** - Settings
- **Ctrl+Alt+Shift+S** - Project Structure

## 🔍 Где найти команды

### В меню Build:
- **Make Project** - всегда есть
- **Clean Project** - всегда есть
- **Rebuild Project** - может отсутствовать в некоторых версиях
- **Build Bundle(s) / APK(s)** - для сборки APK/AAB

### Через контекстное меню:
- Правый клик на папке `app` → **Build Module 'app'**

## ✅ Минимальные действия для применения изменений

После изменения `gradle.properties` достаточно:
1. **File → Sync Project with Gradle Files**
2. **Build → Make Project** (Ctrl+F9)

Это применит все изменения и пересоберет проект.


