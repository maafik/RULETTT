import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PaymentReturnPage from "./PaymentReturnPage";
import NotFound from "./NotFound";
import ChatPage from "./ChatPage";
import MusicianProfilePage from "./MusicianProfilePage";
import LoginPage from "./LoginPage";
import ResetPasswordPage from "./ResetPasswordPage";
import ScrollRestoration from "@/components/ScrollRestoration";
import OrderActions from "@/components/OrderActions";
import BookingDialog, { BookingData } from "@/components/BookingDialog";
import CancelOrderDialog from "@/components/CancelOrderDialog";
import ConfirmOrderDialog from "@/components/ConfirmOrderDialog";
import PaymentDialog from "@/components/PaymentDialog";
import { App } from "@capacitor/app";
import OrderStatusChip from "@/components/OrderStatusChip";
import MusicianOrderCard from "@/components/MusicianOrderCard";
import OrderDetailsBlock from "@/components/OrderDetailsBlock";
import OrderTimeline from "@/components/OrderTimeline";
import BottomNav from "@/components/BottomNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateOrder, cancelOrder, findOrderWithDefaults } from "@/lib/orders";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { ru } from "date-fns/locale/ru";
import type { Order } from "@/data/orders";
import { getOrderById, getUserProfile, updateOrderStatus, updateOrderInFirebase, setFirstOrderDiscountUsed } from "@/lib/firebase-db";
import { auth } from "@/lib/firebase";

const paidOrderContacts = [
  { display: "+7 910 879-72-01 - Надежда Михалева", phone: "+7 910 879-72-01" },
  { display: "+7 925 271-07-15 - Тимур Султанов", phone: "+7 925 271-07-15" },
  { display: "+7 (977) 100-20-90 Евгений Черняк", phone: "+7 (977) 100-20-90" },
  { display: "Георгий DJO Царьков +7 916 137-04-85", phone: "+7 916 137-04-85" },
  { display: "7 909 676-93-40 - Евгений Ходзицкий", phone: "7 909 676-93-40" },
  { display: "+7 (903) 544-36-94 Роман Акимов", phone: "+7 (903) 544-36-94" },
  { display: "+7 937 069-00-80 -  ВЛАДИМИР СОЛДАТКИН", phone: "+7 937 069-00-80" },
  { display: "+7 916 943-99-28 - Роман Красный", phone: "+7 916 943-99-28" },
  { display: "Максим Борисов - +7 962 424-64-03", phone: "+7 962 424-64-03" },
  { display: "+7 903 525-39-34 - Сергей Рябинин", phone: "+7 903 525-39-34" },
  { display: "+7 925 110-07-47 - Марк Смирнов", phone: "+7 925 110-07-47" },
  { display: "+7 927 011-88-35- Дмитрий Ткаченко", phone: "+7 927 011-88-35" },
  { display: "+7 926 835-93-07 - Владимир Яцкевич", phone: "+7 926 835-93-07" },
  { display: "+7 909 910-80-14 - Андрей Барабанов", phone: "+7 909 910-80-14" },
  { display: "+7 925 330-83-77 - Иван Марчукс", phone: "+7 925 330-83-77" },
  { display: "Дмитрий Веселов - +7 926 542-69-48", phone: "+7 926 542-69-48" },
  { display: "Misha Monaco", phone: null },
  { display: "+7 916 305-67-58 - Максим Морозков", phone: "+7 916 305-67-58" },
  { display: "+7 916 509-62-79- Бондаренко Максим", phone: "+7 916 509-62-79" },
  { display: "+7 (916) 222-57-55 - Аделина Райс", phone: "+7 (916) 222-57-55" },
  { display: "+7 919 373-56-53 - Аликхан Гарифуллин", phone: "+7 919 373-56-53" },
  { display: "Игорь Палецкий DJ ROKIT - +7 906 990-60-90", phone: "+7 906 990-60-90" },
] as const;

const toTelHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

const normalizeOrderStyleForDisplay = (style?: string) => {
  if (!style) return style;
  const lowered = style.toLowerCase();
  const hasHost = lowered.includes("ведущ");
  const hasDj = /(^|[^\w])(dj|диджей|ди-джей)([^\w]|$)/i.test(style);

  const parts: string[] = [];
  if (hasHost) parts.push("Ведущий");
  if (hasDj) parts.push("DJ");

  if (parts.length > 0) return parts.join(", ");
  return "Музыкант";
};

const OrderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMusician, setIsMusician] = useState(false);
  const [isFirstOrderDiscount, setIsFirstOrderDiscount] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    // Используем неразрывный пробел перед валютой, чтобы символ ₽ не переносился на новую строку
    return `${amount.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}\u00A0₽`;
  };

  const parsePrice = (price: string): number => {
    const normalized = price
      .replace(/\u00A0/g, " ")
      .replace(/[^0-9.,]/g, "")
      .replace(",", ".");
    const value = parseFloat(normalized);
    return isNaN(value) ? 0 : value;
  };

  const markFirstOrderDiscountUsed = async (uid?: string | null) => {
    if (!uid) return;
    if (typeof window !== "undefined") {
      const key = `first_order_discount_used_${uid}`;
      localStorage.setItem(key, "1");
    }
    setIsFirstOrderDiscount(false);
    try {
      await setFirstOrderDiscountUsed(uid);
    } catch (error) {
      console.error("Не удалось записать использование скидки в профиль:", error);
    }
  };

  const loadOrder = async () => {
    if (!id) {
      setOrder(undefined);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`🔍 Загрузка заказа с ID: ${id}`);
      
      // Устанавливаем таймаут для загрузки (10 секунд)
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn(`⏱️ Таймаут загрузки заказа ${id}`);
          resolve();
        }, 10000);
      });
      
      // Всегда сначала пытаемся загрузить из Firestore (самый актуальный источник)
      let foundOrder: Order | undefined = undefined;
      
      const loadPromise = (async () => {
        try {
          console.log(`📡 Поиск заказа ${id} в Firestore...`);
          const firebaseOrder = await getOrderById(id);
          if (firebaseOrder) {
            foundOrder = firebaseOrder as Order;
            console.log("✅ Заказ найден в Firestore:", {
              id: foundOrder.id,
              status: foundOrder.status,
              artistName: foundOrder.artistName,
            });
          } else {
            console.log(`⚠️ Заказ ${id} не найден в Firestore`);
          }
        } catch (error) {
          console.error("❌ Ошибка при поиске заказа в Firestore:", error);
        }
        
        // Если не нашли в Firestore, ищем в локальных заказах
        if (!foundOrder) {
          console.log(`📦 Поиск заказа ${id} в localStorage...`);
          foundOrder = findOrderWithDefaults(id);
          if (foundOrder) {
            console.log("✅ Заказ найден в localStorage:", {
              id: foundOrder.id,
              status: foundOrder.status,
            });
          } else {
            console.log(`⚠️ Заказ ${id} не найден ни в Firestore, ни в localStorage`);
          }
        }
      })();
      
      // Ждем либо загрузку, либо таймаут
      await Promise.race([loadPromise, timeoutPromise]);
      
      if (!foundOrder) {
        console.error(`❌ Заказ ${id} не найден`);
      }
      
      setOrder(foundOrder);
    } catch (error) {
      console.error("❌ Критическая ошибка при загрузке заказа:", error);
      setOrder(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    
    // Проверяем, является ли пользователь музыкантом
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          const userIsMusician = profile?.role === "musician" || !!profile?.musicianName;
          setIsMusician(userIsMusician);
          const localKey = `first_order_discount_used_${user.uid}`;
          const usedLocal = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
          const usedProfile = profile?.firstOrderDiscountUsed;
          setIsFirstOrderDiscount(!(usedProfile || usedLocal));
        } catch (error) {
          console.error("Ошибка при проверке роли пользователя:", error);
        }
      }
    };
    
    checkUserRole();
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const user = auth.currentUser;
    if (!user) {
      setIsFirstOrderDiscount(false);
      return;
    }
    const key = `first_order_discount_used_${user.uid}`;
    const usedLocal = localStorage.getItem(key);
    if (usedLocal) {
      setIsFirstOrderDiscount(false);
    }
  }, [order?.id]);

  // Обработка кнопки "назад" на Android
  useEffect(() => {
    let listener: { remove: () => void } | null = null;

    const setupBackButton = async () => {
      const handleBackButton = async () => {
        const handledAt = (window as unknown as { __radixBackHandledAt?: number }).__radixBackHandledAt;
        if (handledAt && Date.now() - handledAt < 800) {
          return;
        }

        try {
          const openDialogs = document.querySelectorAll(
            '[data-state="open"][role="dialog"], [data-state="open"][data-side]'
          );
          if (openDialogs.length > 0) {
            const escapeEvent = new KeyboardEvent("keydown", {
              key: "Escape",
              code: "Escape",
              keyCode: 27,
              bubbles: true,
              cancelable: true,
            });

            (window as unknown as { __radixBackHandledAt?: number }).__radixBackHandledAt = Date.now();
            document.dispatchEvent(escapeEvent);
            return;
          }
        } catch {
          void 0;
        }

        const canGoBack = window.history.length > 1;
        if (canGoBack) {
          navigate("/orders");
        } else {
          await App.exitApp();
        }
      };

      listener = await App.addListener('backButton', handleBackButton);
    };

    setupBackButton();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [navigate]);

  // Автоматически обновляем статус заказа, если прошла 1 минута после создания
  useEffect(() => {
    if (!order || order.status !== "created" || !order.createdAt) return;

    const now = Date.now();
    const elapsed = now - order.createdAt;
    const oneMinute = 60 * 1000;

    // Если уже прошла 1 минута, обновляем статус в Firestore и перезагружаем
    if (elapsed >= oneMinute) {
      const updateStatus = async () => {
        try {
          console.log(`🔄 Автоматическое обновление статуса заказа ${order.id} с "created" на "pending"`);
          const success = await updateOrderStatus(order.id, "pending");
          if (success) {
            // Обновляем также в localStorage
            updateOrder(order.id, { status: "pending" });
            // Небольшая задержка перед перезагрузкой, чтобы Firestore успел обновиться
            setTimeout(() => {
              loadOrder();
            }, 500);
          } else {
            console.warn("⚠️ Не удалось обновить статус в Firestore, перезагружаем заказ");
            loadOrder();
          }
        } catch (error) {
          console.error("❌ Ошибка при обновлении статуса заказа:", error);
          // Все равно перезагружаем заказ
          loadOrder();
        }
      };
      updateStatus();
      return;
    }

    // Иначе устанавливаем таймер на оставшееся время
    const remainingTime = oneMinute - elapsed;
    const timeout = setTimeout(async () => {
      try {
        console.log(`🔄 Автоматическое обновление статуса заказа ${order.id} с "created" на "pending"`);
        const success = await updateOrderStatus(order.id, "pending");
        if (success) {
          // Обновляем также в localStorage
          updateOrder(order.id, { status: "pending" });
          // Небольшая задержка перед перезагрузкой, чтобы Firestore успел обновиться
          setTimeout(() => {
            loadOrder();
          }, 500);
        } else {
          console.warn("⚠️ Не удалось обновить статус в Firestore, перезагружаем заказ");
          loadOrder();
        }
      } catch (error) {
        console.error("❌ Ошибка при обновлении статуса заказа:", error);
        // Все равно перезагружаем заказ
        loadOrder();
      }
    }, remainingTime);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status, order?.createdAt, id]);

  // Автоматически обновляем статус заказа с "in-progress" на "completed" после времени выступления
  useEffect(() => {
    if (!order || order.status !== "in-progress" || !order.date || !order.time) return;

    const parseEventEndTime = (): number | null => {
      try {
        // Парсим дату из формата "28 мая 2025"
        const eventDate = parse(order.date, "d MMMM yyyy", new Date(), { locale: ru });
        if (isNaN(eventDate.getTime())) {
          console.warn("Не удалось распарсить дату:", order.date);
          return null;
        }

        // Парсим время окончания из формата "20:00–22:00" -> берем "22:00"
        const timeMatch = order.time.match(/(\d{2}):(\d{2})–(\d{2}):(\d{2})/);
        if (!timeMatch) {
          console.warn("Не удалось распарсить время:", order.time);
          return null;
        }

        const [, , , endHour, endMinute] = timeMatch;
        const endTime = new Date(eventDate);
        endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        return endTime.getTime();
      } catch (error) {
        console.error("Ошибка при парсинге времени окончания выступления:", error);
        return null;
      }
    };

    const eventEndTime = parseEventEndTime();
    if (!eventEndTime) return;

    const now = Date.now();
    const timeUntilEnd = eventEndTime - now;

    // Если время уже прошло, обновляем сразу
    if (timeUntilEnd <= 0) {
      const updateToCompleted = async () => {
        const updatedData = { status: "completed" as const };
        
        // Обновляем в Firestore
        let firestoreSuccess = false;
        try {
          firestoreSuccess = await updateOrderInFirebase(order.id, updatedData);
          if (firestoreSuccess) {
            await updateOrderStatus(order.id, "completed");
          }
        } catch (error) {
          console.error("Ошибка при обновлении статуса заказа в Firestore:", error);
        }

        // Обновляем в localStorage
        updateOrder(order.id, updatedData);

        if (firestoreSuccess) {
          console.log("✅ Заказ автоматически переведен в статус 'completed'");
          loadOrder();
        }
      };
      updateToCompleted();
      return;
    }

    // Иначе устанавливаем таймер на время окончания
    const timeout = setTimeout(async () => {
      const updatedData = { status: "completed" as const };
      
      // Обновляем в Firestore
      let firestoreSuccess = false;
      try {
        firestoreSuccess = await updateOrderInFirebase(order.id, updatedData);
        if (firestoreSuccess) {
          await updateOrderStatus(order.id, "completed");
        }
      } catch (error) {
        console.error("Ошибка при обновлении статуса заказа в Firestore:", error);
      }

      // Обновляем в localStorage
      updateOrder(order.id, updatedData);

      if (firestoreSuccess) {
        console.log("✅ Заказ автоматически переведен в статус 'completed'");
        loadOrder();
      }
    }, timeUntilEnd);

    return () => clearTimeout(timeout);
  }, [order, id]);

  const handleEdit = () => {
    if (!order || order.status === "completed" || order.status === "cancelled") {
      return;
    }
    setIsEditDialogOpen(true);
  };

  const handleCancel = () => {
    if (!order || order.status === "completed" || order.status === "cancelled" || order.status === "in-progress") {
      return;
    }
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    
    // Обновляем в localStorage (если заказ есть локально)
    const localSuccess = cancelOrder(order.id);
    
    // Обновляем в Firestore
    let firestoreSuccess = false;
    try {
      firestoreSuccess = await updateOrderStatus(order.id, "cancelled");
    } catch (error) {
      console.error("Ошибка при обновлении статуса в Firestore:", error);
    }
    
    // Успех, если обновлено хотя бы в одном месте (Firestore или localStorage)
    if (localSuccess || firestoreSuccess) {
      toast({
        title: "Заказ отменен",
        description: firestoreSuccess 
          ? "Заказ был успешно отменен. Изменения синхронизированы с облаком."
          : localSuccess
          ? "Заказ отменен локально. Не удалось синхронизировать с облаком."
          : "Заказ отменен.",
        duration: 3000,
      });
      setIsCancelDialogOpen(false);
      loadOrder(); // Перезагружаем заказ для обновления статуса
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось отменить заказ. Попробуйте еще раз.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleEditConfirm = async (bookingData: BookingData) => {
    if (!order) return;

    const formattedDate = format(bookingData.date, "d MMMM yyyy", { locale: ru });
    const startTime = bookingData.time;
    const endTime = bookingData.endTime;
    const timeRange = `${startTime}–${endTime}`;

    const updatedData = {
      date: formattedDate,
      time: timeRange,
      location: bookingData.location,
      format: bookingData.eventType,
      comment: bookingData.comment,
    };

    // Обновляем в localStorage
    const localSuccess = updateOrder(order.id, updatedData);

    // Обновляем в Firestore
    let firestoreSuccess = false;
    if (localSuccess) {
      try {
        firestoreSuccess = await updateOrderInFirebase(order.id, updatedData);
      } catch (error) {
        console.error("Ошибка при обновлении заказа в Firestore:", error);
      }
    }

    if (localSuccess) {
      toast({
        title: "Заказ обновлен",
        description: firestoreSuccess 
          ? "Изменения в заказе были успешно сохранены. Синхронизировано с облаком."
          : localSuccess
          ? "Изменения сохранены локально. Не удалось синхронизировать с облаком."
          : "Заказ обновлен.",
        duration: 3000,
      });
      loadOrder(); // Перезагружаем заказ для отображения изменений
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить заказ. Попробуйте еще раз.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleOpenChat = () => {
    if (!order) return;
    navigate(`/chat/${order.id}`);
  };

  const handleOpenProfile = () => {
    if (!order) return;
    navigate(`/order/${order.id}/profile`);
  };

  const handleCall = () => {
    if (!order) return;
    
    // Только для клиентов (у музыкантов нет кнопки "Позвонить")
    if (!isMusician) {
      // Номер музыканта доступен только после оплаты (in-progress, completed)
      const isPhoneVisible = order.status === "in-progress" || order.status === "completed";
      
      if (isPhoneVisible) {
        setIsContactsDialogOpen(true);
      } else if (!isPhoneVisible) {
        // Показываем попап с сообщением до оплаты
        setIsPhoneDialogOpen(true);
      } else {
        // Статус позволяет, но номер не найден
        toast({
          title: "Номер телефона не найден",
          description: "Не удалось получить номер телефона музыканта.",
          duration: 3000,
        });
      }
    }
  };

  const handleConfirm = () => {
    if (!order) return;
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmOrder = async (data: { amount: string; time: string; location: string; prepayment?: string }) => {
    if (!order) return;

    const updatedData: Partial<Order> = {
      price: `${data.amount} ₽`,
      time: data.time,
      location: data.location,
      status: "payment-pending" as const,
    };

    if (data.prepayment) {
      updatedData.prepayment = data.prepayment;
    }

    // Обновляем в Firestore (приоритет - всегда обновляем в Firestore)
    let firestoreSuccess = false;
    try {
      console.log("🔄 Обновление заказа в Firestore:", order.id, updatedData);
      firestoreSuccess = await updateOrderInFirebase(order.id, updatedData);
      if (firestoreSuccess) {
        console.log("✅ Данные заказа обновлены, обновляем статус на payment-pending");
        await updateOrderStatus(order.id, "payment-pending");
        console.log("✅ Статус заказа обновлен на payment-pending");
      } else {
        console.error("❌ Не удалось обновить данные заказа в Firestore");
      }
    } catch (error) {
      console.error("❌ Ошибка при обновлении заказа в Firestore:", error);
    }

    // Обновляем в localStorage (если заказ там есть)
    const localSuccess = updateOrder(order.id, updatedData);

    // Успех, если обновлено хотя бы в одном месте (Firestore или localStorage)
    if (localSuccess || firestoreSuccess) {
      toast({
        title: "Заказ подтвержден",
        description: firestoreSuccess 
          ? "Заказ подтвержден. Ожидается оплата от заказчика."
          : localSuccess
          ? "Заказ подтвержден локально."
          : "Заказ подтвержден.",
        duration: 3000,
      });
      setIsConfirmDialogOpen(false);
      // Обновляем локальное состояние сразу для мгновенного отображения
      setOrder({ ...order, ...updatedData, status: "payment-pending" });
      // Небольшая задержка перед перезагрузкой из Firestore, чтобы он успел обновиться
      setTimeout(async () => {
        console.log("🔄 Перезагрузка заказа после подтверждения...");
        await loadOrder();
      }, 1000);
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось подтвердить заказ. Попробуйте еще раз.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handlePay = () => {
    if (!order) return;
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = async (comment?: string) => {
    if (!order) return;

    const updatedData = {
      status: "in-progress" as const,
      comment: comment ? `${order.comment || ""}\n\nКомментарий к оплате: ${comment}`.trim() : order.comment,
    };

    // Обновляем в Firestore (приоритет - всегда обновляем в Firestore)
    let firestoreSuccess = false;
    try {
      firestoreSuccess = await updateOrderInFirebase(order.id, updatedData);
      if (firestoreSuccess) {
        await updateOrderStatus(order.id, "in-progress");
      }
    } catch (error) {
      console.error("Ошибка при обновлении заказа в Firestore:", error);
    }

    // Обновляем в localStorage (если заказ там есть)
    const localSuccess = updateOrder(order.id, updatedData);

    // Успех, если обновлено хотя бы в одном месте (Firestore или localStorage)
    if (localSuccess || firestoreSuccess) {
      toast({
        title: "Оплата подтверждена",
        description: firestoreSuccess 
          ? "Оплата успешно подтверждена. Заказ переведен в статус 'Выступление в процессе'."
          : localSuccess
          ? "Оплата подтверждена локально."
          : "Оплата подтверждена.",
        duration: 3000,
      });
      setIsPaymentDialogOpen(false);
      // Обновляем локальное состояние сразу для мгновенного отображения
      setOrder({ ...order, ...updatedData, status: "in-progress" });
      markFirstOrderDiscountUsed(auth.currentUser?.uid);
      // Небольшая задержка перед перезагрузкой из Firestore, чтобы он успел обновиться
      setTimeout(async () => {
        await loadOrder();
      }, 1000);
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось подтвердить оплату. Попробуйте еще раз.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px))" }}
      >
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">{order ? `Заказ №${order.id}` : "Заказ не найден"}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="mx-auto max-w-md px-4 pb-4 space-y-4"
        style={{ paddingTop: "calc(80px + env(safe-area-inset-top, 0px))" }}
      >
        {isLoading ? (
          <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Загрузка заказа...
          </div>
        ) : order ? (
          <>
            <div>
              <OrderStatusChip status={order.status} />
            </div>
            <MusicianOrderCard
              name={order.artistName}
              style={normalizeOrderStyleForDisplay(order.style)}
              rating={order.rating}
              price={order.price}
              image={order.image}
              onMessage={handleOpenChat}
              onViewProfile={handleOpenProfile}
            />
            <OrderDetailsBlock
              date={order.date}
              time={order.time}
              location={order.location}
              format={order.format}
              comment={order.comment}
              customerPhone={order.customerPhone}
              orderStatus={order.status}
              isMusician={isMusician}
            />
            <OrderTimeline order={order} />
            <OrderActions 
              onEdit={!isMusician ? handleEdit : undefined}
              onCancel={handleCancel}
              onCall={!isMusician ? handleCall : undefined}
              onMessage={handleOpenChat}
              onConfirm={handleConfirm}
              onPay={handlePay}
              status={order.status}
              isMusician={isMusician}
              order={order}
            />
          </>
        ) : (
          <div className="rounded-[20px] border border-dashed border-border p-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Мы не нашли заказ с номером <strong>{id}</strong>
            </p>
            <div className="space-y-2">
              <button
                onClick={() => loadOrder()}
                className="w-full rounded-[16px] bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="w-full rounded-[16px] border border-border bg-card py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent active:scale-[0.98]"
              >
                Вернуться к списку заказов
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      {order && (
        <>
          {!isMusician && (
            <BookingDialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              musician={{
                name: order.artistName,
                style: order.style,
                price: order.price,
                image: order.image,
              }}
              onConfirm={handleEditConfirm}
              initialData={{
                date: order.date,
                eventType: order.format,
                time: order.time,
                location: order.location,
                comment: order.comment,
              }}
              isEdit={true}
            />
          )}

          <CancelOrderDialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
            onConfirm={handleConfirmCancel}
            orderId={order.id}
          />

          {isMusician && (
            <ConfirmOrderDialog
              open={isConfirmDialogOpen}
              onOpenChange={setIsConfirmDialogOpen}
              onConfirm={handleConfirmOrder}
              initialAmount={order.price.replace(" ₽", "").replace(/\s/g, "")}
              initialTime={order.time}
              initialLocation={order.location}
            />
          )}

          {!isMusician && (
            <PaymentDialog
              open={isPaymentDialogOpen}
              onOpenChange={setIsPaymentDialogOpen}
              onConfirm={handlePayment}
              amount={
                isFirstOrderDiscount
                  ? formatCurrency(Math.max(0, parsePrice(order.price) * 0.9))
                  : order.price
              }
              originalAmount={
                isFirstOrderDiscount ? formatCurrency(parsePrice(order.price)) : undefined
              }
              discountLabel={isFirstOrderDiscount ? "Скидка 10% на первый заказ" : undefined}
              date={order.date}
              time={order.time}
              location={order.location}
              format={order.format}
              prepayment={order.prepayment}
              orderId={order.id}
            />
          )}

          {/* Dialog для скрытого номера телефона (только для клиентов) */}
          {!isMusician && (
            <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
              <DialogContent className="max-w-md rounded-[24px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Номер телефона недоступен</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Номер телефона музыканта будет доступен только после оплаты заказа.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}

          {!isMusician && (
            <Dialog open={isContactsDialogOpen} onOpenChange={setIsContactsDialogOpen}>
              <DialogContent className="max-w-md rounded-[24px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Номера телефонов</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Нажмите на номер, чтобы позвонить.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                  {paidOrderContacts.map((contact) => (
                    <button
                      key={contact.display}
                      type="button"
                      disabled={!contact.phone}
                      onClick={() => {
                        if (!contact.phone) return;
                        window.location.href = toTelHref(contact.phone);
                      }}
                      className={`w-full rounded-[16px] border border-border bg-card px-4 py-3 text-left text-sm transition-all ${
                        contact.phone
                          ? "hover:bg-accent active:scale-[0.98] cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {contact.display}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default OrderPage;
