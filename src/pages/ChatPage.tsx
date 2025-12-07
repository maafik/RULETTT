import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "@/data/orders";
import BottomNav from "@/components/BottomNav";
import { findOrderWithDefaults } from "@/lib/orders";
import { getOrderById } from "@/lib/firebase-db";
import { sendChatMessage, subscribeToChatMessages } from "@/lib/firebase-db";
import { getUserProfile, isAdminProfile } from "@/lib/firebase-db";
import { auth } from "@/lib/firebase";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatMessage = {
  id: string;
  text: string;
  sender: "client" | "musician";
  senderUid?: string;
  time: string;
  createdAt?: number;
};

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isMusician, setIsMusician] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setOrder(undefined);
        setMessages([]);
        setIsLoading(false);
        return;
      }

      // Сначала ищем в локальных заказах
      let foundOrder = findOrderWithDefaults(id);

      // Если не нашли локально, ищем в Firestore
      if (!foundOrder) {
        try {
          const firebaseOrder = await getOrderById(id);
          if (firebaseOrder) {
            foundOrder = firebaseOrder as Order;
            console.log("✅ Заказ найден в Firestore для чата:", foundOrder);
          }
        } catch (error) {
          console.error("Ошибка при поиске заказа в Firestore:", error);
        }
      }

      setOrder(foundOrder);
      setIsLoading(false);

      // Проверяем роль пользователя
      const user = auth.currentUser;
      if (user && foundOrder) {
        try {
          const profile = await getUserProfile(user.uid);
          const userIsAdmin = isAdminProfile(user.uid, profile);
          const userIsMusician = userIsAdmin || profile?.role === "musician" || !!profile?.musicianName;
          setIsAdmin(userIsAdmin);
          setIsMusician(userIsMusician);
        } catch (error) {
          console.error("Ошибка при проверке роли пользователя:", error);
        }
      }
    };

    loadOrder();
  }, [id]);

  // Подписываемся на сообщения в реальном времени
  useEffect(() => {
    if (!order || !id) {
      console.log("⏸️ Подписка на сообщения не запущена: order или id отсутствует");
      return;
    }

    console.log("🔔 Запуск подписки на сообщения для заказа:", id);
    const unsubscribe = subscribeToChatMessages(id, (newMessages) => {
      console.log("📬 Получены новые сообщения:", newMessages.length);
      setMessages(newMessages);
    });

    return () => {
      console.log("🔕 Отписка от сообщений для заказа:", id);
      unsubscribe();
    };
  }, [order, id]);

  // Предотвращаем скролл страницы в чате
  useEffect(() => {
    const preventPageScroll = (e: WheelEvent | TouchEvent) => {
      // Находим контейнер чата
      const chatContainer = document.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
      if (chatContainer) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        
        // Если скроллим вверх и контейнер уже вверху, или вниз и контейнер уже внизу
        // предотвращаем скролл страницы
        if (e instanceof WheelEvent) {
          if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener('wheel', preventPageScroll, { passive: false });
    window.addEventListener('touchmove', preventPageScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventPageScroll);
      window.removeEventListener('touchmove', preventPageScroll);
    };
  }, []);

  // Автоматический скролл в области чата при новых сообщениях
  useEffect(() => {
    if (bottomRef.current) {
      // Находим родительский контейнер с overflow-y-auto (область чата)
      const scrollContainer = bottomRef.current.closest('[class*="overflow-y-auto"]') as HTMLElement;
      if (scrollContainer) {
        const timeout = setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth"
          });
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        // Fallback на старый метод
        const timeout = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!order) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const user = auth.currentUser;
    if (!user) {
      console.error("Пользователь не авторизован");
      return;
    }

    // Определяем отправителя
    // Админ может отправлять сообщения как музыкант в любой чат
    let sender: "client" | "musician";
    if (isAdmin) {
      // Админ всегда отправляет как музыкант
      sender = "musician";
    } else {
      sender = isMusician ? "musician" : "client";
    }

    // Отправляем сообщение в Firestore
    try {
      console.log("📤 Попытка отправить сообщение:", {
        orderId: order.id,
        text: trimmed,
        sender,
        senderUid: user.uid,
      });

      const success = await sendChatMessage(order.id, {
        text: trimmed,
        sender,
        senderUid: user.uid,
      });

      if (success) {
        console.log("✅ Сообщение успешно отправлено");
        setText("");
        // Предотвращаем скролл страницы вниз после отправки
        window.scrollTo({ top: 0, behavior: "instant" });
      } else {
        console.error("❌ Не удалось отправить сообщение (success = false)");
      }
    } catch (error: any) {
      console.error("❌ Ошибка при отправке сообщения:", error);
      console.error("Детали:", {
        code: error.code,
        message: error.message,
      });
      
      // Показываем пользователю ошибку
      alert(`Не удалось отправить сообщение: ${error.message || "Неизвестная ошибка"}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    if (id) {
      navigate(`/order/${id}`);
    } else {
      navigate("/orders");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Фиксированный заголовок */}
      <header 
        className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm z-50"
        style={{ 
          paddingTop: `calc(1rem + env(safe-area-inset-top, 0px))`
        }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {order 
                ? (isMusician 
                    ? `Чат с ${order.customerName || order.customerEmail || "Заказчиком"}` 
                    : `Чат с ${order.artistName}`)
                : "Чат недоступен"}
            </h1>
            {order && (
              <p className="text-sm text-muted-foreground">
                {isMusician ? order.location : order.style}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Основная область - скроллируется только область сообщений */}
      <main className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-md px-4 py-2 overflow-hidden pb-20">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-[20px] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Загрузка чата...
          </div>
        ) : order ? (
          <>
            {/* Область сообщений - единственная скроллируемая часть */}
            <div className="flex-1 min-h-0 max-h-[calc(100vh-430px)] rounded-[20px] border border-border bg-card p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => {
                  // Определяем, является ли сообщение от текущего пользователя
                  // Админ видит все сообщения от музыканта как свои
                  const isMyMessage = (isAdmin && message.sender === "musician") ||
                                     (isMusician && message.sender === "musician") || 
                                     (!isMusician && !isAdmin && message.sender === "client");
                  
                  return (
                    <div key={message.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-[16px] px-4 py-2 text-sm ${
                          isMyMessage
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-muted text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.text}</p>
                        <span
                          className={`mt-1 block text-[10px] uppercase tracking-wide ${
                            isMyMessage ? "text-white/70" : "text-muted-foreground/70"
                          }`}
                        >
                          {message.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Фиксированная область ввода */}
            <div className="flex-shrink-0 mt-2 space-y-2">
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                className="min-h-[70px] max-h-[100px] rounded-[16px] resize-none"
              />
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  handleSend();
                }} 
                className="h-[44px] w-full rounded-[16px] text-base font-semibold"
              >
                Отправить
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-[20px] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Чат недоступен. Вернитесь к заказам и попробуйте снова.
          </div>
        )}
      </main>

      {/* Фиксированная нижняя навигация */}
      <div className="flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
};

export default ChatPage;

