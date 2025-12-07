import type { Order } from "@/data/orders";
import { orders as defaultOrders } from "@/data/orders";
import { ORDERS_STORAGE_KEY } from "@/constants/storage";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";

type CreateOrderMusician = {
  name: string;
  style: string;
  price: string;
  rating: number;
  image?: string;
  videoUrl?: string;
  gallery?: string[];
  description?: string;
  city?: string;
  experience?: string;
  tags?: string[];
};

export const createOrder = (
  musician: CreateOrderMusician,
  bookingData: { date: Date; eventType: string; time: string; endTime: string; location: string; comment: string },
  customerUid?: string,
  customerEmail?: string,
  customerName?: string,
  customerPhone?: string
): Order => {
  // Используем полный timestamp для уникальности (13 цифр)
  const orderId = Date.now().toString();
  const formattedDate = format(bookingData.date, "d MMMM yyyy", { locale: ru });
  
  // Форматируем время (например, "19:00" и "21:00" -> "19:00–21:00")
  const startTime = bookingData.time;
  const endTime = bookingData.endTime;
  const timeRange = `${startTime}–${endTime}`;

  return {
    id: orderId,
    status: "created",
    artistName: musician.name,
    style: musician.style,
    rating: musician.rating,
    price: musician.price,
    date: formattedDate,
    time: timeRange,
    location: bookingData.location,
    format: bookingData.eventType,
    comment: bookingData.comment,
    image: musician.image,
    videoUrl: musician.videoUrl,
    gallery: musician.gallery,
    description: musician.description,
    city: musician.city,
    experience: musician.experience,
    tags: musician.tags,
    createdAt: Date.now(), // Сохраняем время создания
    customerUid, // UID заказчика
    customerEmail, // Email заказчика
    customerName, // Имя заказчика
    customerPhone, // Телефон заказчика
  };
};

export const saveOrder = (order: Order): void => {
  if (typeof window === "undefined") return;
  
  const existingOrders = getOrders();
  const updatedOrders = [order, ...existingOrders];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
};

/**
 * Очистить локальный кэш заказов (localStorage)
 */
export const clearOrdersCache = (): void => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(ORDERS_STORAGE_KEY);
  console.log("✅ Локальный кэш заказов очищен");
};

export const getOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!stored) {
    // Если нет сохраненных заказов, возвращаем пустой массив
    // Можно также вернуть дефолтные заказы из orders.ts
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Не удалось загрузить заказы", error);
    return [];
  }
};

export const getAllOrders = (): Order[] => {
  const savedOrders = getOrders();
  // Можно также объединить с дефолтными заказами из orders.ts
  return savedOrders;
};

const mergeWithDefaultOrders = (): Order[] => {
  const savedOrders = getAllOrders();
  const merged = [
    ...savedOrders,
    ...defaultOrders.filter((defaultOrder) => !savedOrders.some((savedOrder) => savedOrder.id === defaultOrder.id)),
  ];
  // Применяем автоматическое обновление статусов
  return applyAutoStatusUpdates(merged);
};

export const getOrdersWithDefaults = (): Order[] => mergeWithDefaultOrders();

export const findOrderWithDefaults = (orderId: string): Order | undefined => {
  const order = mergeWithDefaultOrders().find((order) => order.id === orderId);
  return order ? autoUpdateOrderStatus(order) : undefined;
};

export const updateOrder = (orderId: string, updatedData: Partial<Order>): boolean => {
  if (typeof window === "undefined") return false;
  
  const existingOrders = getOrders();
  const orderIndex = existingOrders.findIndex((order) => order.id === orderId);
  
  if (orderIndex === -1) return false;
  
  const updatedOrder = { ...existingOrders[orderIndex], ...updatedData };
  existingOrders[orderIndex] = updatedOrder;
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existingOrders));
  
  return true;
};

export const cancelOrder = (orderId: string): boolean => {
  if (typeof window === "undefined") return false;
  
  const existingOrders = getOrders();
  const orderIndex = existingOrders.findIndex((order) => order.id === orderId);
  
  if (orderIndex === -1) return false;
  
  existingOrders[orderIndex].status = "cancelled";
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existingOrders));
  
  return true;
};

// Автоматически обновляет статус заказа с "created" на "pending" через 1 минуту после создания
export const autoUpdateOrderStatus = (order: Order): Order => {
  if (order.status === "created" && order.createdAt) {
    const now = Date.now();
    const elapsed = now - order.createdAt;
    const oneMinute = 60 * 1000; // 1 минута в миллисекундах
    
    if (elapsed >= oneMinute) {
      // Обновляем статус в localStorage
      const existingOrders = getOrders();
      const orderIndex = existingOrders.findIndex((o) => o.id === order.id);
      
      if (orderIndex !== -1) {
        existingOrders[orderIndex].status = "pending";
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existingOrders));
        return { ...order, status: "pending" };
      }
    }
  }
  return order;
};

// Применяет автоматическое обновление статусов ко всем заказам
export const applyAutoStatusUpdates = (orders: Order[]): Order[] => {
  return orders.map((order) => autoUpdateOrderStatus(order));
};

