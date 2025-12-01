# 🚀 Быстрый старт: Автоматическая отправка push через FCM v1

## ✅ Что уже настроено

- ✅ Service Account файл: `frebaze-94560-7912c6031120.json`
- ✅ Автоматический скрипт: `auto-send-fcm.js`
- ✅ Ручной скрипт для тестов: `send-fcm.js`
- ✅ Токен получателя: `JFiWds7FPDZEh5n0h5H235re0vu1`

## 🎯 Запуск автоматической отправки

### Шаг 1: Установите зависимости

**Если не хватает места на диске:**
- Очистите `node_modules` в других проектах
- Или используйте только `google-auth-library` и `node-fetch@2` (без firebase-admin)

**Минимальная установка:**
```bash
npm install google-auth-library node-fetch@2
```

**Полная установка (для автоматического скрипта):**
```bash
npm install google-auth-library node-fetch@2 firebase-admin
```

### Шаг 2: Запустите автоматический скрипт

```bash
node auto-send-fcm.js
```

**Что происходит:**
1. Скрипт подключается к Firestore
2. Слушает коллекцию `notifications`
3. При создании нового уведомления:
   - Получает FCM токен получателя
   - Отправляет push через FCM v1 API
   - Помечает как отправленное

### Шаг 3: Проверьте работу

1. **Создайте/измените заказ** в приложении
2. **В консоли скрипта** должны появиться логи:
   ```
   📬 Новое уведомление: abc123
   ✅ Токен найден: JFiWds7FPDZEh5n0h5H235re0vu1
   ✅ Push отправлен успешно!
   ```
3. **У получателя** должно появиться push-уведомление

## 🧪 Тестовая отправка (ручная)

Для проверки отправки на конкретный токен:

```bash
node send-fcm.js
```

Отправит тестовое уведомление на токен `JFiWds7FPDZEh5n0h5H235re0vu1`.

## 📋 Как это работает

```
Ваше приложение
  ↓
Создает уведомление в Firestore (notifications)
  ↓
auto-send-fcm.js слушает изменения
  ↓
Получает FCM токен из userFCMTokens/{targetUserUid}
  ↓
Отправляет через FCM v1 API
  ↓
Push приходит на устройство получателя! ✅
```

## ⚙️ Настройка

### Изменить токен получателя

В `send-fcm.js` измените:
```javascript
const fcmDeviceToken = 'НОВЫЙ_ТОКЕН';
```

### Запуск в фоне (Windows)

```bash
# Запуск в фоне через PowerShell
Start-Process node -ArgumentList "auto-send-fcm.js" -WindowStyle Hidden
```

### Запуск при старте системы

Создайте `.bat` файл:
```batch
@echo off
cd /d "C:\Users\Maafi\OneDrive\Рабочий стол\stage-spotlight-72-main\fcm-v1-test"
node auto-send-fcm.js
```

## 🔍 Проверка токена получателя

Токен `JFiWds7FPDZEh5n0h5H235re0vu1` должен быть сохранен в Firestore:

**Firebase Console:**
- Firestore Database → `userFCMTokens`
- Найдите документ с этим токеном
- Или найдите по UID пользователя

## ✅ Готово!

Теперь при каждом создании уведомления в Firestore автоматически отправится push через FCM v1!

**Остановка скрипта:** `Ctrl+C`

