import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendSupportMessage } from "@/lib/notifications";

const SupportPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail || !trimmedMessage) {
      alert("Пожалуйста, заполните обязательные поля");
      return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert("Пожалуйста, введите корректный email адрес");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendSupportMessage(trimmedEmail, trimmedMessage, trimmedPhone || undefined);
      
      if (result.sent || result.attempted) {
        setIsSuccess(true);
        setEmail("");
        setMessage("");
        setPhone("");
      } else {
        alert("Не удалось отправить сообщение. Попробуйте позже.");
      }
    } catch (error: any) {
      console.error("❌ Ошибка при отправке сообщения поддержки:", error);
      alert(`Не удалось отправить сообщение: ${error.message || "Неизвестная ошибка"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/help");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header 
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm"
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
          <h1 className="text-xl font-semibold text-foreground">
            Поддержка
          </h1>
        </div>
      </header>

      <main 
        className="mx-auto max-w-md px-4 py-6"
        style={{ 
          paddingTop: `calc(5.5rem + env(safe-area-inset-top, 0px))`
        }}
      >
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-border bg-card p-8 text-center">
            <CheckCircle2 size={48} className="mb-4 text-green-500" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Сообщение отправлено
            </h2>
            <p className="text-sm text-muted-foreground">
              Ваше сообщение успешно отправлено. Ответ поступит в течение 3 часов.
            </p>
            <Button
              onClick={() => setIsSuccess(false)}
              className="mt-6 h-[48px] w-full rounded-[16px] text-base font-semibold"
            >
              Отправить еще одно сообщение
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
                className="rounded-[16px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Телефон (необязательно)
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 999 123-45-67"
                disabled={isSubmitting}
                className="rounded-[16px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-foreground">
                Сообщение
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите ваш вопрос или проблему..."
                required
                disabled={isSubmitting}
                className="min-h-[200px] rounded-[16px]"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[48px] w-full rounded-[16px] text-base font-semibold"
            >
              {isSubmitting ? "Отправка..." : "Отправить"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Ответ поступит в течение 3 часов
            </p>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default SupportPage;

