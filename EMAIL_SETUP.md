# 📧 Настройка отправки приветственных писем

## ✅ Что уже сделано:

1. **Cloud Function создана** (`functions/index.js`):
   - Функция `sendWelcomeEmail` готова к использованию
   - Вызывается автоматически после регистрации
   - Сохраняет задачу отправки в Firestore коллекцию `emailQueue`

2. **Интеграция в LoginPage**:
   - После нажатия "Продолжить" в попапе регистрации
   - Автоматически вызывается функция отправки письма
   - Не блокирует регистрацию, если письмо не отправилось

## 🔧 Настройка реальной отправки email:

### Вариант 1: Использовать Firebase Extensions (Рекомендуется)

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Перейдите в **Extensions**
3. Найдите и установите **"Trigger Email"** extension
4. Настройте SMTP или используйте SendGrid/Mailgun

### Вариант 2: Настроить Nodemailer в Cloud Function

1. Установите nodemailer в functions:
   ```bash
   cd functions
   npm install nodemailer
   ```

2. Обновите `functions/index.js`:
   ```javascript
   const nodemailer = require('nodemailer');
   
   // Настройте транспортер (Gmail, SendGrid, Mailgun и т.д.)
   const transporter = nodemailer.createTransport({
     service: 'gmail', // или другой сервис
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD,
     },
   });
   
   // В функции sendWelcomeEmail добавьте реальную отправку:
   await transporter.sendMail({
     from: 'noreply@yourdomain.com',
     to: userEmail,
     subject: welcomeEmail.message.subject,
     html: welcomeEmail.message.html,
     text: welcomeEmail.message.text,
   });
   ```

3. Добавьте переменные окружения в Firebase:
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com" email.password="your-password"
   ```

### Вариант 3: Использовать SendGrid API

1. Зарегистрируйтесь на [SendGrid](https://sendgrid.com/)
2. Получите API ключ
3. Установите пакет:
   ```bash
   cd functions
   npm install @sendgrid/mail
   ```

4. Обновите функцию для использования SendGrid

### Вариант 4: Использовать Mailgun API

1. Зарегистрируйтесь на [Mailgun](https://www.mailgun.com/)
2. Получите API ключ
3. Установите пакет:
   ```bash
   cd functions
   npm install mailgun-js
   ```

## 📋 Текущая реализация:

Сейчас функция сохраняет задачу отправки в Firestore коллекцию `emailQueue`. Вы можете:

1. **Настроить обработчик очереди** - создать Cloud Function, которая будет обрабатывать задачи из `emailQueue`
2. **Использовать готовое решение** - установить Firebase Extension для отправки email
3. **Интегрировать внешний сервис** - добавить реальную отправку через SendGrid/Mailgun

## 🧪 Тестирование:

После деплоя функций, при регистрации нового пользователя:
1. Проверьте Firebase Console → Functions → Logs
2. Проверьте Firestore → `emailQueue` коллекцию
3. Должна появиться задача с типом `welcome`

## 📝 Содержание письма:

Приветственное письмо включает:
- Приветствие с именем пользователя
- Информацию о возможностях приложения
- Список функций (бронирование, заказы, чат, избранное)

Вы можете изменить содержимое письма в функции `sendWelcomeEmail` в `functions/index.js`.







