import * as React from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, getMessagingInstance } from "./firebase";
import { onMessage, type MessagePayload } from "firebase/messaging";
import { toast as showToast } from "@/hooks/use-toast";
import { ToastAction, type ToastActionElement } from "@/components/ui/toast";

const DEFAULT_TELEGRAM_BOT_TOKEN = "8314217513:AAHhxLHdM7biYi0FEG6hzvSPivYP6CnPkQE";
const DEFAULT_TELEGRAM_CHAT_ID = "7702221669";
type ChatDirection = "client-to-musician" | "musician-to-client";

type ChatNotificationOptions = {
  direction?: ChatDirection;
  musicianName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  skipTelegram?: boolean; // Пропустить отправку в Telegram (если уже отправлено)
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
  artistName: string,
  customerPhone?: string | null,
  customerEmail?: string | null
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
    customerPhone: customerPhone ?? null,
    customerEmail: customerEmail ?? null,
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
  artistName: string,
  customerPhone?: string | null,
  customerEmail?: string | null
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
    customerPhone: customerPhone ?? null,
    customerEmail: customerEmail ?? null,
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

  const telegramResult = options?.skipTelegram
    ? {
        attempted: false,
        sent: false,
        skippedReason: "already-sent",
      }
    : await maybeSendTelegramAlert({
        orderId,
        senderName,
        messageText,
        musicianName: options?.musicianName,
        customerPhone: options?.customerPhone ?? null,
        customerEmail: options?.customerEmail ?? null,
        direction: options?.direction,
      });

  return {
    savedToHistory,
    telegram: telegramResult,
  };
}

export async function maybeSendTelegramAlert(params: {
  orderId: string;
  senderName: string;
  messageText: string;
  musicianName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  direction?: ChatDirection;
  allowWhatsAppTelegramNotifications?: boolean;
}): Promise<TelegramNotificationResult> {
  if (params.direction !== "client-to-musician") {
    return {
      attempted: false,
      sent: false,
      skippedReason: "direction-not-supported",
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

  console.log("📱 Параметры для Telegram сообщения:", {
    orderId: params.orderId,
    senderName: params.senderName,
    musicianName: params.musicianName,
    customerPhone: params.customerPhone,
    customerEmail: params.customerEmail,
    messageText: params.messageText.substring(0, 50) + "...",
  });

  const message = buildTelegramMessage({
    orderId: params.orderId,
    senderName: params.senderName,
    musicianName: params.musicianName ?? "Музыкант",
    customerPhone: params.customerPhone ?? null,
    customerEmail: params.customerEmail ?? null,
    text: params.messageText,
    allowWhatsAppTelegramNotifications: params.allowWhatsAppTelegramNotifications ?? false,
  });

  return await sendTelegramMessage(message, credentials);
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
  customerPhone: string | null;
  customerEmail: string | null;
  text: string;
  allowWhatsAppTelegramNotifications: boolean;
}): string {
  const escapedText = escapeHtml(params.text);
  const escapedSender = escapeHtml(params.senderName || "Клиент");
  const escapedMusician = escapeHtml(params.musicianName);
  const escapedPhone = params.customerPhone ? escapeHtml(params.customerPhone) : null;
  const escapedEmail = params.customerEmail ? escapeHtml(params.customerEmail) : null;

  console.log("📱 Формирование Telegram сообщения:");
  console.log("   Номер телефона:", params.customerPhone || "не указан");
  console.log("   Email:", params.customerEmail || "не указан");

  const lines: string[] = [
    "🎵 <b>Новое сообщение для музыканта</b>",
    "",
    `<b>Музыкант:</b> ${escapedMusician}`,
    `<b>Клиент:</b> ${escapedSender}`,
  ];

  if (escapedEmail) {
    lines.push(`<b>Email:</b> ${escapedEmail}`);
  }

  // Всегда показываем номер телефона, если он есть
  const phoneToShow = escapedPhone || (params.customerPhone ? escapeHtml(params.customerPhone) : null);
  if (phoneToShow) {
    lines.push(`<b>Телефон:</b> ${phoneToShow}`);
  } else {
    console.warn("⚠️ Номер телефона не найден для отображения в Telegram сообщении");
  }

  // Показываем информацию о согласии на уведомления
  const notificationsStatus = params.allowWhatsAppTelegramNotifications ? "Да" : "Нет";
  lines.push(`<b>Уведомления WhatsApp/Telegram:</b> ${notificationsStatus}`);

  lines.push(
    `<b>Заказ:</b> ${escapeHtml(params.orderId)}`,
    "",
    escapedText
  );

  return lines.join("\n");
}

async function maybeSendOrderTelegramAlert(params: {
  type: OrderAlertType;
  orderId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  musicianName?: string | null;
}): Promise<TelegramNotificationResult> {
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
    customerPhone: params.customerPhone ?? null,
    customerEmail: params.customerEmail ?? null,
    musicianName: params.musicianName ?? "Музыкант",
  });

  return await sendTelegramMessage(message, credentials);
}

function buildOrderTelegramMessage(params: {
  type: OrderAlertType;
  orderId: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  musicianName: string;
}): string {
  const header =
    params.type === "order-created"
      ? "🆕 <b>Новый заказ</b>"
      : "💰 <b>Заказ оплачен</b>";

  const lines: string[] = [
    header,
    "",
    `<b>Музыкант:</b> ${escapeHtml(params.musicianName)}`,
    `<b>Клиент:</b> ${escapeHtml(params.customerName)}`,
  ];

  if (params.customerEmail) {
    lines.push(`<b>Email клиента:</b> ${escapeHtml(params.customerEmail)}`);
  }

  if (params.customerPhone) {
    lines.push(`<b>Телефон клиента:</b> ${escapeHtml(params.customerPhone)}`);
  }

  lines.push(`<b>Заказ:</b> ${escapeHtml(params.orderId)}`);

  return lines.join("\n");
}

async function sendTelegramMessage(
  message: string,
  credentials: { token: string; chatId: string }
): Promise<TelegramNotificationResult> {
  // Валидация credentials
  if (!credentials.token || !credentials.chatId) {
    console.warn("⚠️ Telegram credentials отсутствуют");
    return {
      attempted: false,
      sent: false,
      error: "missing-credentials",
    };
  }

  // Проверка формата токена (должен начинаться с цифр и содержать двоеточие)
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(credentials.token)) {
    console.warn("⚠️ Неверный формат Telegram bot token");
    return {
      attempted: false,
      sent: false,
      error: "invalid-token-format",
    };
  }

  // Ограничение длины сообщения (Telegram лимит 4096 символов)
  const maxLength = 4096;
  const truncatedMessage = message.length > maxLength 
    ? message.substring(0, maxLength - 3) + "..." 
    : message;

  const url = new URL(`https://api.telegram.org/bot${credentials.token}/sendMessage`);
  url.search = new URLSearchParams({
    chat_id: credentials.chatId,
    text: truncatedMessage,
    parse_mode: "HTML",
    disable_web_page_preview: "true",
  }).toString();

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      // Убираем no-cors чтобы видеть реальные ошибки
      // Если возникнут CORS проблемы, можно использовать прокси или серверную функцию
    });

    // Проверяем статус ответа
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Telegram API вернул ошибку:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      return {
        attempted: true,
        sent: false,
        error: `telegram-api-error-${response.status}: ${errorData.description || response.statusText}`,
      };
    }

    const data = await response.json();
    if (data.ok) {
      console.log("✅ Telegram уведомление отправлено");
      return {
        attempted: true,
        sent: true,
      };
    } else {
      console.error("❌ Telegram API вернул ошибку:", data);
      return {
        attempted: true,
        sent: false,
        error: data.description || "unknown-telegram-error",
      };
    }
  } catch (error: any) {
    // Обработка сетевых ошибок и CORS
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      console.error("❌ Ошибка сети или CORS при отправке в Telegram:", error.message);
      // Если CORS блокирует, можно попробовать no-cors как fallback
      try {
        await fetch(url.toString(), {
          method: "GET",
          mode: "no-cors",
        });
        console.log("⚠️ Telegram запрос отправлен в no-cors режиме (ответ недоступен)");
        return {
          attempted: true,
          sent: true, // Предполагаем успех, т.к. не можем проверить
        };
      } catch (noCorsError) {
        return {
          attempted: true,
          sent: false,
          error: "network-or-cors-error",
        };
      }
    }
    
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
  message: string,
  phone?: string
): Promise<TelegramNotificationResult> {
  const credentials = getTelegramCredentials();
  if (!credentials) {
    return {
      attempted: false,
      sent: false,
      skippedReason: "telegram-disabled",
    };
  }

  const supportMessage = buildSupportMessage(email, message, phone);
  return await sendTelegramMessage(supportMessage, credentials);
}

function buildSupportMessage(email: string, message: string, phone?: string): string {
  const escapedEmail = escapeHtml(email);
  const escapedMessage = escapeHtml(message);
  const escapedPhone = phone ? escapeHtml(phone) : null;

  const lines: string[] = [
    "💬 <b>Новое сообщение в поддержку</b>",
    "",
    `<b>Email:</b> ${escapedEmail}`,
  ];

  if (escapedPhone) {
    lines.push(`<b>Телефон:</b> ${escapedPhone}`);
  }

  lines.push(
    "",
    `<b>Сообщение:</b>`,
    escapedMessage,
  );

  return lines.join("\n");
}

/**
 * Телеграм-уведомление о новой регистрации пользователя
 */
export async function sendRegistrationAlert(
  email: string,
  phone?: string | null
): Promise<TelegramNotificationResult> {
  const credentials = getTelegramCredentials();
  if (!credentials) {
    return {
      attempted: false,
      sent: false,
      skippedReason: "telegram-disabled",
    };
  }

  const escapedEmail = escapeHtml(email);
  const escapedPhone = phone ? escapeHtml(phone) : null;

  const lines: string[] = [
    "🆕 <b>Новая регистрация</b>",
    "",
    `<b>Email:</b> ${escapedEmail}`,
  ];

  if (escapedPhone) {
    lines.push(`<b>Телефон:</b> ${escapedPhone}`);
  }

  const message = lines.join("\n");
  return await sendTelegramMessage(message, credentials);
}

/**
 * Слушатель foreground push-уведомлений FCM для PWA.
 * Работает, когда вкладка/приложение активно и показывает toast-баннеры в UI.
 */
let foregroundListenerInitialized = false;

export async function setupNotificationListener(): Promise<void> {
  if (typeof window === "undefined") return;

  if (foregroundListenerInitialized) {
    return;
  }

  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn(
        "⚠️ Firebase Messaging недоступен, foreground-слушатель уведомлений не будет установлен"
      );
      foregroundListenerInitialized = true;
      return;
    }

    onMessage(messaging, (payload: MessagePayload) => {
      console.log("📩 Получено foreground push-уведомление (PWA):", payload);

      const notification = payload.notification;
      const data = payload.data || {};

      const title =
        notification?.title ||
        (typeof data.title === "string" ? data.title : "Новое уведомление");

      const body =
        notification?.body || (typeof data.body === "string" ? data.body : "");

      const orderId = typeof (data as any).orderId === "string" ? (data as any).orderId : undefined;

      const action: ToastActionElement | undefined =
        orderId && typeof window !== "undefined"
          ? (React.createElement(
              ToastAction,
              {
                altText: "Открыть заказ",
                onClick: () => {
                  try {
                    window.location.href = `/order/${orderId}`;
                  } catch (e) {
                    console.error(
                      "❌ Ошибка при переходе к заказу из toast (PWA):",
                      e
                    );
                  }
                },
              },
              "Открыть"
            ) as unknown as ToastActionElement)
          : undefined;

      showToast({
        title,
        description: body,
        action,
      });
    });

    foregroundListenerInitialized = true;
    console.log("✅ Foreground-слушатель push-уведомлений FCM для PWA включен");
  } catch (error) {
    console.error("❌ Ошибка при настройке foreground-слушателя FCM:", error);
  }
}

/**
 * Инициализация системы уведомлений на клиенте (PWA).
 * Сейчас просто включает foreground-слушатель.
 */
export async function initializeNotifications(): Promise<void> {
  await setupNotificationListener();
}

