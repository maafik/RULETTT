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

      // Проверяем наличие переменных окружения
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        console.error('❌ Firebase Admin переменные окружения не настроены:', {
          hasProjectId: !!projectId,
          hasClientEmail: !!clientEmail,
          hasPrivateKey: !!privateKey,
        });
        console.error('💡 Добавьте в Vercel Environment Variables:');
        console.error('   - FIREBASE_PROJECT_ID');
        console.error('   - FIREBASE_CLIENT_EMAIL');
        console.error('   - FIREBASE_PRIVATE_KEY');
      } else {
        // Инициализация Firebase Admin (только один раз)
        if (!getApps().length) {
          try {
            initializeApp({
              credential: cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
              }),
            });
            console.log('✅ Firebase Admin инициализирован');
          } catch (initError: any) {
            console.error('❌ Ошибка инициализации Firebase Admin:', initError);
            console.error('Детали:', {
              message: initError.message,
              code: initError.code,
            });
          }
        }

        try {
          const db = getFirestore();
          const playerIdDoc = await db
            .collection('userOneSignalIds')
            .doc(targetUserUid)
            .get();

          if (playerIdDoc.exists) {
            oneSignalPlayerId = playerIdDoc.data()?.playerId;
            console.log(`✅ Player ID найден для пользователя ${targetUserUid}`);
          } else {
            console.warn(`⚠️ Player ID не найден в Firestore для пользователя ${targetUserUid}`);
          }
        } catch (dbError: any) {
          console.error('❌ Ошибка при получении Player ID из Firestore:', dbError);
          console.error('Детали:', {
            message: dbError.message,
            code: dbError.code,
            stack: dbError.stack,
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Общая ошибка при получении Player ID:', error);
      console.error('Детали:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
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
    
    // Определяем URL для уведомления
    // Для сообщений в чате ведем на страницу чата, для остальных - на страницу заказа
    let notificationUrl: string | undefined;
    if (orderId) {
      if (status === 'chat-message') {
        notificationUrl = `${process.env.VITE_APP_URL || ''}/chat/${orderId}`;
      } else {
        notificationUrl = `${process.env.VITE_APP_URL || ''}/order/${orderId}`;
      }
    }
    
    const notificationPayload = {
      app_id: oneSignalAppId,
      include_player_ids: [oneSignalPlayerId],
      headings: { en: title },
      contents: { en: body },
      data: {
        orderId: orderId || '',
        status: status || '',
      },
      url: notificationUrl,
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
      const errorText = await response.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      console.error('❌ Ошибка OneSignal API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        appId: oneSignalAppId,
        hasApiKey: !!oneSignalRestApiKey,
        apiKeyLength: oneSignalRestApiKey?.length || 0,
      });
      
      // Если 403, это проблема с авторизацией
      if (response.status === 403) {
        console.error('💡 403 Forbidden - проверьте ONESIGNAL_REST_API_KEY в Vercel Environment Variables');
        console.error('💡 Убедитесь, что REST API Key правильный и имеет права на отправку уведомлений');
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to send notification via OneSignal',
        details: errorData,
        status: response.status,
        statusText: response.statusText,
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

