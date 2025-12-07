# 🔧 Настройка Firebase для работы на localhost

## ✅ Да, SMS должна приходить на localhost!

Firebase Auth с телефонной аутентификацией **работает на localhost**, но нужно правильно настроить.

## 📋 Шаги настройки:

### 1. Добавьте localhost в авторизованные домены Firebase

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите ваш проект
3. Перейдите в **Authentication** → **Settings** → **Authorized domains**
4. Убедитесь, что добавлены:
   - `localhost` (должен быть по умолчанию)
   - `127.0.0.1` (если используете IP)
   - Ваш порт будет автоматически поддерживаться (например, `localhost:8080`)

### 2. Проверьте переменные окружения

Создайте файл `.env` в корне проекта (если его нет):

```env
VITE_FIREBASE_API_KEY=ваш_api_key
VITE_FIREBASE_AUTH_DOMAIN=ваш-проект.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ваш-проект-id
VITE_FIREBASE_STORAGE_BUCKET=ваш-проект.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=ваш_sender_id
VITE_FIREBASE_APP_ID=ваш_app_id
```

**Важно:** `authDomain` должен быть в формате `ваш-проект.firebaseapp.com` (без порта!)

### 3. Включите Phone Authentication

1. Firebase Console → **Authentication** → **Sign-in method**
2. Найдите **Phone** в списке
3. Нажмите **Enable**
4. Сохраните настройки

### 4. Проверьте настройки reCAPTCHA

1. Firebase Console → **Authentication** → **Settings** → **reCAPTCHA Enterprise**
2. Убедитесь, что reCAPTCHA настроен (или используйте v2 fallback)

## 🧪 Тестирование на localhost:8080

### Проверка конфигурации:

1. Откройте `http://localhost:8080/login`
2. Откройте консоль браузера (F12)
3. Проверьте логи:
   - ✅ `Firebase Auth инициализирован`
   - ✅ `RecaptchaVerifier создан успешно`
   - ✅ `Нормализованный номер: +7XXXXXXXXXX`

### Если SMS не приходит:

1. **Проверьте консоль браузера на ошибки:**
   - Ошибки Firebase Auth
   - Ошибки reCAPTCHA
   - Ошибки сети (400, 403, etc.)

2. **Проверьте Network tab:**
   - Запросы к `identitytoolkit.googleapis.com`
   - Статус ответов (должны быть 200)

3. **Проверьте номер телефона:**
   - Формат: `+7XXXXXXXXXX` (12 символов)
   - Должен быть реальный номер для тестирования

4. **Проверьте Firebase Console:**
   - Authentication → Users (должен появиться запрос на аутентификацию)
   - Authentication → Sign-in method → Phone (должен быть включен)

## ⚠️ Важные моменты:

### Тестовые номера Firebase (для разработки без реальных SMS):

Firebase позволяет использовать тестовые номера, которые не требуют реальной SMS:

1. Firebase Console → **Authentication** → **Sign-in method** → **Phone**
2. Прокрутите вниз до **Phone numbers for testing**
3. Добавьте тестовые номера в формате `+7XXXXXXXXXX`
4. Укажите тестовые коды (например, `123456`)

**Преимущества:**
- ✅ Не тратятся SMS квоты
- ✅ Мгновенная проверка (не нужно ждать SMS)
- ✅ Работает на localhost
- ✅ Бесплатно

**Пример:**
```
Номер: +79991234567
Код: 123456
```

### Реальные номера:

- **Квоты:** На бесплатном плане есть лимиты на количество SMS
- **Стоимость:** После превышения лимита может взиматься плата
- **reCAPTCHA:** Должен работать на localhost автоматически

## 🔍 Отладка:

Если SMS не приходит, проверьте в консоли браузера:

```javascript
// Проверка конфигурации Firebase
console.log('Auth domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Проверка verifier
// (должно быть в логах приложения)
```

## 📱 Для продакшена:

После деплоя на реальный домен:
1. Добавьте ваш домен в Authorized domains
2. Обновите `authDomain` в переменных окружения (если нужно)
3. Все остальное работает так же!

