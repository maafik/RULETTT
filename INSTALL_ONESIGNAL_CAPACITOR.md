# 📦 Установка OneSignal Capacitor (решение проблем с сетью)

## ❌ Проблема

Ошибка при установке:
```
npm error network request to https://registry.npmjs.org/@onesignal%2fonesignal-capacitor failed
```

## ✅ Решения

### Вариант 1: Повторить попытку

Иногда это временная проблема сети. Попробуйте еще раз:

```bash
npm install @onesignal/onesignal-capacitor
```

### Вариант 2: Использовать другой реестр

```bash
npm install @onesignal/onesignal-capacitor --registry https://registry.npmjs.org/
```

### Вариант 3: Очистить кеш и повторить

```bash
npm cache clean --force
npm install @onesignal/onesignal-capacitor
```

### Вариант 4: Установить вручную через package.json

Пакет уже добавлен в `package.json`. Просто выполните:

```bash
npm install
```

Это установит все зависимости, включая `@onesignal/onesignal-capacitor`.

### Вариант 5: Использовать yarn (если установлен)

```bash
yarn add @onesignal/onesignal-capacitor
```

### Вариант 6: Проверить настройки прокси

Если вы за прокси:

```bash
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

Или отключить прокси:

```bash
npm config delete proxy
npm config delete https-proxy
```

### Вариант 7: Установить позже

Если сейчас нет интернета или проблемы с сетью:

1. **Пакет уже добавлен в `package.json`** ✅
2. Когда сеть будет работать, просто выполните:
   ```bash
   npm install
   ```
3. Затем выполните:
   ```bash
   npm run cap:sync
   ```

## 📋 Текущий статус

✅ Пакет `@onesignal/onesignal-capacitor` уже добавлен в `package.json`  
✅ Код обновлен для поддержки нативных платформ  
⏳ Осталось только установить зависимости

## 🚀 После успешной установки

1. Синхронизируйте с Android:
   ```bash
   npm run build
   npm run cap:sync
   ```

2. Откройте Android Studio:
   ```bash
   npm run cap:open:android
   ```

3. Пересоберите приложение

## 💡 Альтернатива: Установка без интернета

Если у вас есть доступ к другому компьютеру с интернетом:

1. На другом компьютере:
   ```bash
   npm install @onesignal/onesignal-capacitor
   ```

2. Скопируйте папку `node_modules/@onesignal` в ваш проект

3. Или скопируйте весь `node_modules` (если нужно)

## ⚠️ Важно

Код уже готов к работе с OneSignal Capacitor. Как только пакет будет установлен, все заработает автоматически.

