# 🚀 Быстрая настройка Vercel для уведомлений

## Шаг 1: Получите Firebase Service Account

1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Выберите ваш проект
3. Project Settings → Service Accounts
4. Нажмите "Generate new private key"
5. Скачайте JSON файл
6. **НЕ коммитьте этот файл в Git!**

## Шаг 2: Установите зависимости

```bash
npm install firebase-admin @vercel/node
```

## Шаг 3: Настройте Vercel

### Вариант A: Через веб-интерфейс (рекомендуется)

1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "Add New Project"
4. Импортируйте ваш GitHub репозиторий
5. В настройках проекта → Environment Variables добавьте:

```
FIREBASE_PROJECT_ID=ваш-project-id
FIREBASE_CLIENT_EMAIL=ваш-client-email
FIREBASE_PRIVATE_KEY=ваш-private-key
```

**Где взять значения:**
- Откройте скачанный JSON файл Service Account
- `FIREBASE_PROJECT_ID` = значение из `project_id`
- `FIREBASE_CLIENT_EMAIL` = значение из `client_email`
- `FIREBASE_PRIVATE_KEY` = значение из `private_key` (весь ключ, включая `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`)

6. Нажмите "Deploy"

### Вариант B: Через CLI

1. Установите Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Войдите:
   ```bash
   vercel login
   ```

3. Создайте файл `.env.local` (НЕ коммитьте в Git!):
   ```
   FIREBASE_PROJECT_ID=ваш-project-id
   FIREBASE_CLIENT_EMAIL=ваш-client-email
   FIREBASE_PRIVATE_KEY=ваш-private-key
   ```

4. Деплой:
   ```bash
   vercel
   ```

5. Добавьте переменные окружения в Vercel Dashboard

## Шаг 4: Получите URL вашего API

После деплоя Vercel даст вам URL, например:
```
https://your-app.vercel.app
```

## Шаг 5: Настройте переменную окружения в проекте

В `.env.local` добавьте:
```
VITE_VERCEL_API_URL=https://your-app.vercel.app
```

**Важно:** Замените на ваш реальный URL от Vercel!

## Шаг 6: Проверьте работу

1. Создайте тестовое уведомление в приложении
2. Проверьте логи Vercel:
   - Vercel Dashboard → ваш проект → Functions → Logs
3. Должно появиться уведомление у получателя

## ✅ Готово!

Теперь уведомления будут отправляться через Vercel API:
- ✅ Работает в фоне
- ✅ Бесплатно (до лимитов)
- ✅ Автоматический деплой при push в GitHub

## 🔍 Проверка

### Проверьте API endpoint

```bash
curl -X POST https://your-app.vercel.app/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserUid": "UID_ПОЛУЧАТЕЛЯ",
    "title": "Тест",
    "body": "Тестовое уведомление",
    "orderId": "test",
    "status": "test"
  }'
```

### Проверьте логи

Vercel Dashboard → Functions → Logs → должны быть логи отправки

## 🐛 Проблемы

### Ошибка: "Token not found"
- Проверьте, что токен получателя сохранен в Firestore
- Проверьте, что `targetUserUid` правильный

### Ошибка: "Invalid credentials"
- Проверьте переменные окружения в Vercel
- Убедитесь, что `FIREBASE_PRIVATE_KEY` содержит весь ключ (с `-----BEGIN` и `-----END`)

### Ошибка: "Method not allowed"
- Убедитесь, что используете POST запрос
- Проверьте URL API endpoint

## 📝 Итог

После настройки:
1. ✅ Push в GitHub → автоматический деплой на Vercel
2. ✅ Уведомления отправляются через Vercel API
3. ✅ Работает в фоне
4. ✅ Бесплатно

