import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Music, ShoppingBag, MessageCircle, CheckCircle, CreditCard, AlertTriangle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firebase-db";

interface FAQItem {
  question: string;
  answer: string;
}

const MusicianHomePage = () => {
  const [musicianName, setMusicianName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setMusicianName(profile?.musicianName || null);
        } catch (error) {
          console.error("Ошибка при загрузке профиля:", error);
        }
      }
      setIsLoading(false);
    };
    loadProfile();
  }, []);

  const faqItems: FAQItem[] = [
    {
      question: "Как я получаю заказы?",
      answer: "Заказы автоматически появляются в разделе 'Заказы', когда клиент выбирает вас как исполнителя. Вы будете получать уведомления о новых заказах в реальном времени.",
    },
    {
      question: "Как общаться с заказчиком?",
      answer: "В каждом заказе есть кнопка 'Чат', где вы можете обсудить детали выступления, задать вопросы и согласовать все нюансы с заказчиком.",
    },
    {
      question: "Как изменить статус заказа?",
      answer: "В карточке заказа вы можете изменить статус: принять заказ, отклонить или отметить как выполненный. Все изменения видны заказчику.",
    },
    {
      question: "Что делать, если заказ отменен?",
      answer: "Если заказчик отменил заказ, вы получите уведомление. Отмененные заказы остаются в истории, но больше не требуют действий с вашей стороны.",
    },
    {
      question: "Как работает оплата?",
      answer: "Оплата осуществляется только в приложении. Сначала вы согласовываете все детали с заказчиком в чате. После согласования можно будет оплатить через СБП картой Сбербанк или Тинькофф приложениями. Не принимайте оплату вне приложения.",
    },
    {
      question: "Где происходит общение с заказчиком?",
      answer: "Общение с заказчиком происходит только в приложении через встроенный чат в каждом заказе. Используйте чат для обсуждения деталей, задавания вопросов и согласования всех нюансов выступления.",
    },
    {
      question: "Что будет, если я не выполню заказ?",
      answer: "За невыполнение заказа предусмотрен бан. Обязательно выполняйте принятые заказы в срок и с высоким качеством. Если возникли непредвиденные обстоятельства, свяжитесь с заказчиком через чат как можно раньше.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-md px-4 py-6">
        {/* Приветствие */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Здравствуйте{musicianName ? `, ${musicianName}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Добро пожаловать в приложение для музыкантов
          </p>
        </div>

        {/* Информация о работе приложения */}
        <div className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Как работает приложение
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Получение заказов</h3>
                  <p className="text-sm text-muted-foreground">
                    Клиенты выбирают вас как исполнителя, и заказы автоматически появляются в разделе "Заказы". 
                    Вы будете видеть всю информацию о мероприятии: дату, время, место и контакты заказчика.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Общение с заказчиком</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Важно:</strong> Общение с заказчиком происходит только в приложении через встроенный чат. 
                    В каждом заказе есть чат для обсуждения деталей, вопросов и согласования всех нюансов выступления.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Оплата</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Важно:</strong> Оплата осуществляется только в приложении. 
                    После согласования всех деталей с заказчиком в чате, оплата производится через СБП картой Сбербанк или Тинькофф приложениями.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Управление заказами</h3>
                  <p className="text-sm text-muted-foreground">
                    Вы можете принимать или отклонять заказы, изменять их статус и отслеживать историю всех ваших выступлений. 
                    Все изменения видны заказчику в реальном времени.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Ваш профиль</h3>
                  <p className="text-sm text-muted-foreground">
                    В разделе "Профиль" вы можете просмотреть информацию о себе, которую видят клиенты. 
                    Это помогает заказчикам выбрать подходящего исполнителя.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Важные правила */}
        <div className="mb-8">
          <div className="rounded-lg border-2 border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Важные правила</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span><strong>Оплата осуществляется только в приложении.</strong> Не принимайте оплату вне приложения.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span><strong>Общение происходит только в приложении.</strong> Используйте встроенный чат для связи с заказчиком.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span><strong>За невыполнение заказа предусмотрен бан.</strong> Обязательно выполняйте принятые заказы в срок и с высоким качеством.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Вопрос-ответ */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Часто задаваемые вопросы
          </h2>
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground pr-4">{item.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default MusicianHomePage;

