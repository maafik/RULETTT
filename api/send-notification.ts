import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Проверяем обязательные поля
  const { targetUserUid, playerId, title, body, orderId, status } = req.body;

  if (!targetUserUid || !title || !body) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['targetUserUid', 'title', 'body']
    });
  }

  // Player ID может быть передан напрямую или нужно получить из Firestore
  let oneSignalPlayerId = playerId;

  // Если Player ID не передан, получаем из Firestore
  if (!oneSignalPlayerId) {
    try {
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      const { getFirestore } = await import('firebase-admin/firestore');

      // Инициализация Firebase Admin (только один раз)
      if (!getApps().length) {
        try {
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
          });
          console.log('✅ Firebase Admin инициализирован');
        } catch (error) {
          console.error('❌ Ошибка инициализации Firebase Admin:', error);
        }
      }

      const db = getFirestore();
      const playerIdDoc = await db
        .collection('userOneSignalIds')
        .doc(targetUserUid)
        .get();

      if (playerIdDoc.exists) {
        oneSignalPlayerId = playerIdDoc.data()?.playerId;
      }
    } catch (error) {
      console.error('❌ Ошибка при получении Player ID из Firestore:', error);
    }
  }

  if (!oneSignalPlayerId) {
    console.warn('⚠️ OneSignal Player ID не найден для пользователя:', targetUserUid);
    return res.status(404).json({ error: 'OneSignal Player ID not found for user' });
  }

  try {
    console.log('📤 Отправка уведомления через OneSignal:', { targetUserUid, title, orderId });

    const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
    const oneSignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!oneSignalAppId || !oneSignalRestApiKey) {
      console.error('❌ OneSignal credentials не настроены');
      return res.status(500).json({ 
        error: 'OneSignal credentials not configured',
        required: ['ONESIGNAL_APP_ID', 'ONESIGNAL_REST_API_KEY']
      });
    }

    // Отправляем уведомление через OneSignal REST API
    const oneSignalUrl = 'https://onesignal.com/api/v1/notifications';
    
    const notificationPayload = {
      app_id: oneSignalAppId,
      include_player_ids: [oneSignalPlayerId],
      headings: { en: title },
      contents: { en: body },
      data: {
        orderId: orderId || '',
        status: status || '',
      },
      url: orderId ? `${process.env.VITE_APP_URL || ''}/order/${orderId}` : undefined,
    };

    // OneSignal REST API использует Basic Auth: Authorization: Basic <base64(REST_API_KEY:)>
    // Формат: REST_API_KEY: (пустая строка после двоеточия)
    const authHeader = Buffer.from(`${oneSignalRestApiKey}:`).toString('base64');
    
    const response = await fetch(oneSignalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Ошибка OneSignal API:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to send notification via OneSignal',
        details: errorData 
      });
    }

    const result = await response.json();
    console.log('✅ Уведомление успешно отправлено через OneSignal:', result.id);

    return res.status(200).json({ 
      success: true, 
      notificationId: result.id,
      recipients: result.recipients 
    });
  } catch (error: any) {
    console.error('❌ Ошибка при отправке уведомления:', error);
    
    return res.status(500).json({ 
      error: error.message || 'Failed to send notification',
      details: error.toString()
    });
  }
}

