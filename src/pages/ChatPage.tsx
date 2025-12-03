import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "@/data/orders";
import BottomNav from "@/components/BottomNav";
import { findOrderWithDefaults } from "@/lib/orders";
import { getOrderById } from "@/lib/firebase-db";
import { sendChatMessage, subscribeToChatMessages } from "@/lib/firebase-db";
import { getUserProfile } from "@/lib/firebase-db";
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
          const userIsMusician = profile?.role === "musician" || !!profile?.musicianName;
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

  useEffect(() => {
    const timeout = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    return () => clearTimeout(timeout);
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
    const sender: "client" | "musician" = isMusician ? "musician" : "client";

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
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
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

      <main className="mx-auto flex h-[calc(100vh-160px)] max-w-md flex-col px-4 py-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-[20px] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Загрузка чата...
          </div>
        ) : order ? (
          <>
            <ScrollArea className="flex-1 rounded-[20px] border border-border bg-card p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  // Определяем, является ли сообщение от текущего пользователя
                  const isMyMessage = (isMusician && message.sender === "musician") || 
                                     (!isMusician && message.sender === "client");
                  
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
            </ScrollArea>

            <div className="mt-4 space-y-3">
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                className="min-h-[90px] rounded-[16px]"
              />
              <Button onClick={handleSend} className="h-[48px] w-full rounded-[16px] text-base font-semibold">
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

      <BottomNav />
    </div>
  );
};

export default ChatPage;

