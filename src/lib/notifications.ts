import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_TELEGRAM_BOT_TOKEN = "8314217513:AAHhxLHdM7biYi0FEG6hzvSPivYP6CnPkQE";
const DEFAULT_TELEGRAM_CHAT_ID = "7702221669";
const TARGET_MUSICIAN_NAME = "анна смирнова";

type ChatDirection = "client-to-musician" | "musician-to-client";

type ChatNotificationOptions = {
  direction?: ChatDirection;
  musicianName?: string | null;
};

type OrderAlertType = "order-created" | "order-paid";

type TelegramNotificationResult = {
  attempted: boolean;
  sent: boolean;
  error?: string;
  skippedReason?: string;
};

export type ChatNotificationResult = {
  savedToHistory: boolean;
  telegram: TelegramNotificationResult;
};

/**
 * Заглушка для устаревших вызовов FCM. Возвращает null, т.к. push SDK отключен.
 */
export async function getUserFCMToken(): Promise<string | null> {
  return null;
}

/**
 * Сохранить уведомление в Firestore для истории.
 */
async function saveNotificationToFirestore(
  targetUserUid: string,
  orderId: string,
  title: string,
  body: string,
  status: string
): Promise<boolean> {
  try {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      targetUserUid,
      orderId,
      title,
      body,
      status,
      read: false,
      createdAt: Timestamp.now(),
    });
    return true;
  } catch (error: any) {
    console.error("❌ Ошибка при сохранении уведомления в Firestore:", error);
    if (error?.code === "permission-denied") {
      console.error("💡 Проверьте правила Firestore для коллекции 'notifications'");
    }
    return false;
  }
}

/**
 * Вспомогательная функция для истории изменений статусов.
 */
async function sendOrderNotification(
  targetUserUid: string,
  orderId: string,
  title: string,
  body: string,
  status: string
): Promise<boolean> {
  console.log("ℹ️ Push-уведомления отключены. Сохраняем событие в истории Firestore.");
  return await saveNotificationToFirestore(targetUserUid, orderId, title, body, status);
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
  const saved = await sendOrderNotification(
    musicianUid,
    orderId,
    "Новый заказ",
    `${customerName || "Клиент"} создал заказ для ${artistName}.`,
    "created"
  );
  const telegram = await maybeSendOrderTelegramAlert({
    type: "order-created",
    orderId,
    customerName,
    musicianName: artistName,
  });
  logOrderTelegramResult("создании заказа", telegram);
  return saved;
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
    `${artistName} подтвердил заказ. Ожидается оплата.`,
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
  const saved = await sendOrderNotification(
    musicianUid,
    orderId,
    "Заказ оплачен",
    `${customerName || "Клиент"} оплатил заказ для ${artistName}.`,
    "in-progress"
  );
  const telegram = await maybeSendOrderTelegramAlert({
    type: "order-paid",
    orderId,
    customerName,
    musicianName: artistName,
  });
  logOrderTelegramResult("оплате заказа", telegram);
  return saved;
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
  const body = isMusician
    ? `Заказ для ${otherPartyName} завершен.`
    : `Заказ от ${otherPartyName} завершен.`;

  return await sendOrderNotification(targetUserUid, orderId, "Заказ завершен", body, "completed");
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
  const body = isMusician
    ? `${otherPartyName || "Клиент"} отменил заказ.`
    : `Заказ от ${otherPartyName} отменен.`;

  return await sendOrderNotification(targetUserUid, orderId, "Заказ отменен", body, "cancelled");
}

/**
 * Отправить уведомление о новом сообщении в чате.
 * Если клиент пишет Анне Смирновой, сообщение уходит в Telegram.
 */
export async function notifyChatMessage(
  targetUserUid: string,
  orderId: string,
  senderName: string,
  messageText: string,
  options?: ChatNotificationOptions
): Promise<ChatNotificationResult> {
  const savedToHistory = await saveNotificationToFirestore(
    targetUserUid,
    orderId,
    "Новое сообщение",
    `${senderName}: ${messageText}`,
    "chat-message"
  );

  const telegramResult = await maybeSendTelegramAlert({
    orderId,
    senderName,
    messageText,
    musicianName: options?.musicianName,
    direction: options?.direction,
  });

  return {
    savedToHistory,
    telegram: telegramResult,
  };
}

/**
 * Телеграм-алерт только для сообщений клиента Анне Смирновой.
 */
async function maybeSendTelegramAlert(params: {
  orderId: string;
  senderName: string;
  messageText: string;
  musicianName?: string | null;
  direction?: ChatDirection;
}): Promise<TelegramNotificationResult> {
  if (params.direction !== "client-to-musician") {
    return {
      attempted: false,
      sent: false,
      skippedReason: "direction-not-supported",
    };
  }

  const normalizedMusicianName = normalizeName(params.musicianName);
  if (normalizedMusicianName !== TARGET_MUSICIAN_NAME) {
    return {
      attempted: false,
      sent: false,
      skippedReason: "musician-not-target",
    };
  }

  const credentials = getTelegramCredentials();
  if (!credentials) {
    return {
      attempted: false,
      sent: false,
      skippedReason: "telegram-disabled",
    };
  }

  const message = buildTelegramMessage({
    orderId: params.orderId,
    senderName: params.senderName,
    musicianName: params.musicianName ?? "Музыкант",
    text: params.messageText,
  });

  return await sendTelegramMessage(message, credentials);
}

function normalizeName(value?: string | null): string | null {
  if (!value) return null;
  return value.trim().toLowerCase();
}

function getTelegramCredentials():
  | { token: string; chatId: string }
  | null {
  const token =
    import.meta.env.VITE_TELEGRAM_BOT_TOKEN?.trim() || DEFAULT_TELEGRAM_BOT_TOKEN;
  const chatId =
    import.meta.env.VITE_TELEGRAM_CHAT_ID?.trim() || DEFAULT_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return null;
  }

  return { token, chatId };
}

function buildTelegramMessage(params: {
  orderId: string;
  senderName: string;
  musicianName: string;
  text: string;
}): string {
  const escapedText = escapeHtml(params.text);
  const escapedSender = escapeHtml(params.senderName || "Клиент");
  const escapedMusician = escapeHtml(params.musicianName);

  return [
    "🎵 <b>Новое сообщение для музыканта</b>",
    "",
    `<b>Музыкант:</b> ${escapedMusician}`,
    `<b>Клиент:</b> ${escapedSender}`,
    `<b>Заказ:</b> ${escapeHtml(params.orderId)}`,
    "",
    escapedText,
  ].join("\n");
}

async function maybeSendOrderTelegramAlert(params: {
  type: OrderAlertType;
  orderId: string;
  customerName?: string | null;
  musicianName?: string | null;
}): Promise<TelegramNotificationResult> {
  const normalizedMusician = normalizeName(params.musicianName);
  if (normalizedMusician !== TARGET_MUSICIAN_NAME) {
    return {
      attempted: false,
      sent: false,
      skippedReason: "musician-not-target",
    };
  }

  const credentials = getTelegramCredentials();
  if (!credentials) {
    return {
      attempted: false,
      sent: false,
      skippedReason: "telegram-disabled",
    };
  }

  const message = buildOrderTelegramMessage({
    type: params.type,
    orderId: params.orderId,
    customerName: params.customerName ?? "Клиент",
    musicianName: params.musicianName ?? "Музыкант",
  });

  return await sendTelegramMessage(message, credentials);
}

function buildOrderTelegramMessage(params: {
  type: OrderAlertType;
  orderId: string;
  customerName: string;
  musicianName: string;
}): string {
  const header =
    params.type === "order-created"
      ? "🆕 <b>Новый заказ</b>"
      : "💰 <b>Заказ оплачен</b>";

  return [
    header,
    "",
    `<b>Музыкант:</b> ${escapeHtml(params.musicianName)}`,
    `<b>Клиент:</b> ${escapeHtml(params.customerName)}`,
    `<b>Заказ:</b> ${escapeHtml(params.orderId)}`,
  ].join("\n");
}

async function sendTelegramMessage(
  message: string,
  credentials: { token: string; chatId: string }
): Promise<TelegramNotificationResult> {
  const url = new URL(`https://api.telegram.org/bot${credentials.token}/sendMessage`);
  url.search = new URLSearchParams({
    chat_id: credentials.chatId,
    text: message,
    parse_mode: "HTML",
    disable_web_page_preview: "true",
  }).toString();

  try {
    await fetch(url.toString(), {
      method: "GET",
      mode: "no-cors",
    });

    console.log("✅ Telegram уведомление отправлено (режим no-cors)");
    return {
      attempted: true,
      sent: true,
    };
  } catch (error: any) {
    console.error("❌ Ошибка при отправке сообщения в Telegram:", error);
    return {
      attempted: true,
      sent: false,
      error: error?.message || "unknown-error",
    };
  }
}

function logOrderTelegramResult(
  context: string,
  result: TelegramNotificationResult
) {
  if (!result.attempted) {
    if (result.skippedReason) {
      console.log(
        `ℹ️ Telegram уведомление при ${context} пропущено: ${result.skippedReason}`
      );
    }
    return;
  }

  if (result.sent) {
    console.log(`✅ Telegram уведомление отправлено при ${context}`);
  } else {
    console.warn(
      `⚠️ Telegram уведомление не отправлено при ${context}: ${result.error}`
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Отправить сообщение поддержки в Telegram
 */
export async function sendSupportMessage(
  email: string,
  message: string
): Promise<TelegramNotificationResult> {
  const credentials = getTelegramCredentials();
  if (!credentials) {
    return {
      attempted: false,
      sent: false,
      skippedReason: "telegram-disabled",
    };
  }

  const supportMessage = buildSupportMessage(email, message);
  return await sendTelegramMessage(supportMessage, credentials);
}

function buildSupportMessage(email: string, message: string): string {
  const escapedEmail = escapeHtml(email);
  const escapedMessage = escapeHtml(message);

  return [
    "💬 <b>Новое сообщение в поддержку</b>",
    "",
    `<b>Email:</b> ${escapedEmail}`,
    "",
    `<b>Сообщение:</b>`,
    escapedMessage,
  ].join("\n");
}

/**
 * Слушатели уведомлений отключены. Функции оставлены для совместимости.
 */
export async function setupNotificationListener(): Promise<void> {
  console.log("🔕 Слушатель push-уведомлений отключен.");
}

export async function initializeNotifications(): Promise<void> {
  console.log("🔕 Система push-уведомлений отключена.");
}

