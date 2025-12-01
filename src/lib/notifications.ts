import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { getUserOneSignalId } from "./onesignal";

/**
 * Получить OneSignal Player ID пользователя из Firestore
 * (Обратная совместимость - использует OneSignal вместо FCM)
 */
export async function getUserFCMToken(userUid: string): Promise<string | null> {
  // Используем OneSignal Player ID вместо FCM токена
  return await getUserOneSignalId(userUid);
}

/**
 * Отправить уведомление пользователю через OneSignal API
 * Вызывает API endpoint, который отправляет уведомление через OneSignal REST API
 */
export async function sendOrderNotification(
  targetUserUid: string,
  orderId: string,
  title: string,
  body: string,
  status: string
): Promise<boolean> {
  try {
    console.log("📤 Отправка уведомления через OneSignal...");
    console.log("   Получатель:", targetUserUid);
    console.log("   Заказ:", orderId);
    console.log("   Заголовок:", title);

    // Получаем OneSignal Player ID получателя (если есть)
    const playerId = await getUserOneSignalId(targetUserUid);
    if (!playerId) {
      console.warn(`⚠️ OneSignal Player ID не найден для пользователя ${targetUserUid}. Попробуем отправить через API без него.`);
    }

    // Вызываем API endpoint для отправки уведомления
    const apiUrl = import.meta.env.VITE_API_URL || "/api/send-notification";
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserUid,
          playerId: playerId || undefined,
          orderId,
          title,
          body,
          status,
        }),
      });

      if (!response.ok) {
        // Если API endpoint не найден (404), это нормально для разработки на localhost
        if (response.status === 404) {
          console.warn(`⚠️ API endpoint не найден (${apiUrl}). Это нормально для разработки на localhost.`);
          console.warn(`💡 Для продакшена настройте VITE_API_URL в переменных окружения.`);
          // Сохраняем уведомление в Firestore для истории
          await saveNotificationToFirestore(targetUserUid, orderId, title, body, status);
          return false;
        }
        
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Ошибка при отправке уведомления:", errorData);
        // Сохраняем уведомление в Firestore для истории
        await saveNotificationToFirestore(targetUserUid, orderId, title, body, status);
        return false;
      }

      const result = await response.json();
      console.log(`✅ Уведомление отправлено через OneSignal для пользователя ${targetUserUid}:`, title);
      
      // Также сохраняем уведомление в Firestore для истории
      await saveNotificationToFirestore(targetUserUid, orderId, title, body, status);
      
      return true;
    } catch (fetchError: any) {
      // Ошибка сети или CORS
      if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
        console.warn(`⚠️ Не удалось подключиться к API endpoint (${apiUrl}). Это нормально для разработки на localhost.`);
        console.warn(`💡 Для продакшена настройте VITE_API_URL в переменных окружения.`);
      } else {
        console.error("❌ Ошибка сети при отправке уведомления:", fetchError);
      }
      // Сохраняем уведомление в Firestore для истории
      await saveNotificationToFirestore(targetUserUid, orderId, title, body, status);
      return false;
    }
  } catch (error: any) {
    console.error("❌ Ошибка при отправке уведомления:", error);
    // Сохраняем уведомление в Firestore для истории
    await saveNotificationToFirestore(targetUserUid, orderId, title, body, status);
    return false;
  }
}

/**
 * Сохранить уведомление в Firestore для истории
 */
async function saveNotificationToFirestore(
  targetUserUid: string,
  orderId: string,
  title: string,
  body: string,
  status: string
): Promise<void> {
  try {
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
    console.log("✅ Уведомление сохранено в Firestore для истории");
  } catch (error: any) {
    console.error("❌ Ошибка при сохранении уведомления в Firestore:", error);
    if (error.code === "permission-denied") {
      console.error("💡 Проверьте правила Firestore для коллекции 'notifications'");
    }
  }
}

/**
 * Отправить уведомление при создании заказа (клиент -> музыкант)
 */
export async function notifyOrderCreated(
  musicianUid: string,
  orderId: string,
  customerName: string,
  artistName: string
): Promise<boolean> {
  return await sendOrderNotification(
    musicianUid,
    orderId,
    "Новый заказ",
    `${customerName || "Клиент"} создал заказ для ${artistName}. Нажмите, чтобы просмотреть.`,
    "created"
  );
}

/**
 * Отправить уведомление при подтверждении заказа (музыкант -> клиент)
 */
export async function notifyOrderConfirmed(
  customerUid: string,
  orderId: string,
  artistName: string
): Promise<boolean> {
  return await sendOrderNotification(
    customerUid,
    orderId,
    "Заказ подтвержден",
    `${artistName} подтвердил ваш заказ. Ожидается оплата.`,
    "payment-pending"
  );
}

/**
 * Отправить уведомление при оплате заказа (клиент -> музыкант)
 */
export async function notifyOrderPaid(
  musicianUid: string,
  orderId: string,
  customerName: string,
  artistName: string
): Promise<boolean> {
  return await sendOrderNotification(
    musicianUid,
    orderId,
    "Заказ оплачен",
    `${customerName || "Клиент"} оплатил заказ для ${artistName}. Заказ в процессе выполнения.`,
    "in-progress"
  );
}

/**
 * Отправить уведомление при завершении заказа
 */
export async function notifyOrderCompleted(
  targetUserUid: string,
  orderId: string,
  isMusician: boolean,
  otherPartyName: string
): Promise<boolean> {
  const title = isMusician 
    ? "Заказ завершен" 
    : "Заказ завершен";
  const body = isMusician
    ? `Заказ для ${otherPartyName} успешно завершен.`
    : `Заказ от ${otherPartyName} успешно завершен. Спасибо!`;

  return await sendOrderNotification(
    targetUserUid,
    orderId,
    title,
    body,
    "completed"
  );
}

/**
 * Отправить уведомление при отмене заказа
 */
export async function notifyOrderCancelled(
  targetUserUid: string,
  orderId: string,
  isMusician: boolean,
  otherPartyName: string
): Promise<boolean> {
  const title = "Заказ отменен";
  const body = isMusician
    ? `${otherPartyName || "Клиент"} отменил заказ.`
    : `Заказ от ${otherPartyName} был отменен.`;

  return await sendOrderNotification(
    targetUserUid,
    orderId,
    title,
    body,
    "cancelled"
  );
}

/**
 * Отправить уведомление о новом сообщении в чате
 */
export async function notifyChatMessage(
  targetUserUid: string,
  orderId: string,
  senderName: string,
  messageText: string
): Promise<boolean> {
  // Обрезаем текст сообщения для уведомления
  const shortText = messageText.length > 50 
    ? messageText.substring(0, 50) + "..." 
    : messageText;
  
  return await sendOrderNotification(
    targetUserUid,
    orderId,
    "Новое сообщение",
    `${senderName}: ${shortText}`,
    "chat-message"
  );
}

/**
 * Настроить обработку входящих уведомлений
 * (Использует OneSignal вместо FCM)
 */
export async function setupNotificationListener(navigate: (path: string) => void) {
  const { setupOneSignalNotificationListener } = await import("./onesignal");
  setupOneSignalNotificationListener(navigate);
}

/**
 * Инициализировать уведомления при загрузке приложения
 * (Использует OneSignal вместо FCM)
 */
export async function initializeNotifications(navigate: (path: string) => void) {
  const { initializeOneSignalNotifications } = await import("./onesignal");
  await initializeOneSignalNotifications(navigate);
}

