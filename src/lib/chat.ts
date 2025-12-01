import type { Order } from "@/data/orders";
import type { ChatMessage } from "@/components/ChatDialog";
import { CHAT_THREADS_STORAGE_KEY } from "@/constants/storage";

type ChatThreadsMap = Record<string, ChatMessage[]>;

const isBrowser = () => typeof window !== "undefined";

const getStoredThreads = (): ChatThreadsMap => {
  if (!isBrowser()) return {};
  const stored = window.localStorage.getItem(CHAT_THREADS_STORAGE_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored) as ChatThreadsMap;
    return parsed;
  } catch (error) {
    console.error("Не удалось прочитать историю чатов", error);
    return {};
  }
};

const persistThreads = (threads: ChatThreadsMap) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(CHAT_THREADS_STORAGE_KEY, JSON.stringify(threads));
};

export const createInitialChatThread = (order: Order): ChatMessage[] => [
  {
    id: `${order.id}-welcome`,
    sender: "musician",
    text: `Здравствуйте! ${order.artistName} на связи. Готов обсудить детали выступления.`,
    time: "18:40",
  },
  {
    id: `${order.id}-question`,
    sender: "client",
    text: "Здравствуйте! Хотел уточнить сет-лист и время саундчека.",
    time: "18:42",
  },
];

export const loadChatThread = (order: Order): ChatMessage[] => {
  const threads = getStoredThreads();
  if (threads[order.id] && Array.isArray(threads[order.id])) {
    return threads[order.id];
  }
  const initial = createInitialChatThread(order);
  if (isBrowser()) {
    threads[order.id] = initial;
    persistThreads(threads);
  }
  return initial;
};

export const appendMessageToThread = (orderId: string, message: ChatMessage): ChatMessage[] => {
  if (!isBrowser()) return [];
  const threads = getStoredThreads();
  const existing = threads[orderId] ?? [];
  const updated = [...existing, message];
  threads[orderId] = updated;
  persistThreads(threads);
  return updated;
};

