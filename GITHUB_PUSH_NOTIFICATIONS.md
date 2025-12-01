# 🚀 Отправка уведомлений через GitHub

## ✅ Да, можно использовать GitHub!

Есть несколько способов использовать GitHub для отправки push-уведомлений:

## 🎯 Вариант 1: Vercel (рекомендуется) - бесплатно

Vercel интегрируется с GitHub и предоставляет бесплатные serverless функции.

### Шаги настройки:

#### 1. Создайте API endpoint в проекте

Создайте файл `api/send-notification.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Инициализация Firebase Admin (только один раз)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { targetUserUid, title, body, orderId, status } = req.body;

  if (!targetUserUid || !title || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Получаем токен из Firestore
    const db = getFirestore();
    const tokenDoc = await db
      .collection('userFCMTokens')
      .doc(targetUserUid)
      .get();

    if (!tokenDoc.exists) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const token = tokenDoc.data()?.token;

    if (!token) {
      return res.status(404).json({ error: 'Token is empty' });
    }

    // Отправляем уведомление
    const messaging = getMessaging();
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        orderId: orderId || '',
        status: status || '',
      },
      token,
      webpush: {
        fcmOptions: {
          link: `/order/${orderId}`,
        },
      },
    };

    const response = await messaging.send(message);

    return res.status(200).json({ 
      success: true, 
      messageId: response 
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to send notification' 
    });
  }
}
```

#### 2. Установите зависимости

```bash
npm install firebase-admin @vercel/node
```

#### 3. Настройте переменные окружения в Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите ваш GitHub репозиторий
3. В настройках проекта добавьте переменные окружения:
   - `FIREBASE_PROJECT_ID` - ваш Project ID
   - `FIREBASE_CLIENT_EMAIL` - email из service account
   - `FIREBASE_PRIVATE_KEY` - приватный ключ из service account

#### 4. Получите Firebase Service Account

1. Firebase Console → Project Settings → Service Accounts
2. Нажмите "Generate new private key"
3. Скачайте JSON файл
4. Используйте значения из файла для переменных окружения

#### 5. Обновите код отправки уведомлений

В `src/lib/notifications.ts`:

```typescript
export async function sendOrderNotification(
  targetUserUid: string,
  orderId: string,
  title: string,
  body: string,
  status: string
): Promise<boolean> {
  try {
    // Сохраняем в Firestore (для истории)
    const notificationsRef = collection(db, "notifications");
    const notificationData = {
      targetUserUid,
      orderId,
      title,
      body,
      status,
      read: false,
      createdAt: Timestamp.now(),
    };
    await addDoc(notificationsRef, notificationData);

    // Отправляем через Vercel API
    const vercelUrl = import.meta.env.VITE_VERCEL_API_URL || 'https://your-app.vercel.app';
    const response = await fetch(`${vercelUrl}/api/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUserUid,
        orderId,
        title,
        body,
        status,
      }),
    });

    if (response.ok) {
      console.log('✅ Уведомление отправлено через Vercel');
      return true;
    } else {
      console.error('❌ Ошибка отправки уведомления:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при отправке уведомления:', error);
    return false;
  }
}
```

#### 6. Добавьте переменную окружения в проект

В `.env.local`:
```
VITE_VERCEL_API_URL=https://your-app.vercel.app
```

## 🎯 Вариант 2: Netlify Functions - бесплатно

Аналогично Vercel, но используя Netlify.

### Шаги:

1. Создайте папку `netlify/functions/send-notification.js`
2. Подключите GitHub репозиторий к Netlify
3. Настройте переменные окружения
4. Деплой автоматический при push в GitHub

## 🎯 Вариант 3: GitHub Actions + Webhook

Можно использовать GitHub Actions для создания webhook, который будет вызываться при создании уведомления.

### Недостатки:
- ❌ Сложнее настроить
- ❌ Медленнее (Actions запускаются не мгновенно)
- ❌ Не подходит для real-time уведомлений

## 🎯 Вариант 4: Railway/Render - бесплатно

Аналогично Vercel/Netlify, но с другими лимитами.

## 📋 Рекомендация

**Используйте Vercel:**
- ✅ Бесплатно (до 100GB bandwidth/месяц)
- ✅ Простая интеграция с GitHub
- ✅ Автоматический деплой при push
- ✅ Быстро работает
- ✅ Serverless функции

## 🚀 Быстрый старт с Vercel

1. **Установите Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Войдите в Vercel:**
   ```bash
   vercel login
   ```

3. **Создайте API endpoint** (см. выше)

4. **Деплой:**
   ```bash
   vercel
   ```

5. **Подключите GitHub:**
   - Зайдите на vercel.com
   - Import Project → выберите GitHub репозиторий
   - Настройте переменные окружения
   - Деплой автоматический при каждом push

## 🔐 Безопасность

**Важно:**
- ✅ Никогда не коммитьте Firebase Service Account ключи в Git
- ✅ Используйте переменные окружения
- ✅ Добавьте `.env` в `.gitignore`
- ✅ Ограничьте доступ к API endpoint (добавьте проверку авторизации)

## 📝 Структура проекта

```
your-project/
├── api/
│   └── send-notification.ts  # Vercel serverless function
├── src/
│   └── lib/
│       └── notifications.ts  # Обновленный код
├── .env.local               # Локальные переменные (не в Git)
└── .gitignore              # Игнорирует .env файлы
```

## ✅ Итог

**Да, можно использовать GitHub!**

Лучший способ:
1. ✅ Создайте API endpoint в проекте
2. ✅ Подключите к Vercel/Netlify
3. ✅ Настройте переменные окружения
4. ✅ Автоматический деплой при push в GitHub
5. ✅ Уведомления работают в фоне!

**Преимущества:**
- ✅ Бесплатно
- ✅ Автоматический деплой
- ✅ Работает в фоне
- ✅ Простая настройка

