import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { handlePaymentReturn } from "@/lib/payment";
import { updateOrder } from "@/lib/orders";
import { updateOrderStatus } from "@/lib/firebase-db";

function useQuery() {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

const PaymentWidgetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const query = useQuery();

  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const orderId = query.get("orderId") || "";
    const paymentId = query.get("paymentId") || "";
    const confirmationToken = query.get("confirmationToken") || "";
    const returnUrl = query.get("returnUrl") || "";

    if (!orderId || !paymentId || !confirmationToken) {
      toast({
        title: "Ошибка инициализации оплаты",
        description: "Не хватает данных для отображения платежной формы.",
        variant: "destructive",
        duration: 3000,
      });
      navigate("/orders", { replace: true });
      return;
    }

    // Сохраняем связку orderId/paymentId для дальнейшей проверки статуса
    if (typeof window !== "undefined") {
      try {
        const key = `yookassa_payment_${orderId}`;
        window.localStorage.setItem(key, paymentId);
        window.localStorage.setItem("return_to_order_after_payment", orderId);
      } catch (e) {
        console.warn("⚠️ Не удалось сохранить данные оплаты в localStorage", e);
      }
    }

    // Инициализация виджета YooKassa
    const initWidget = () => {
      if (typeof window === "undefined") return;
      const checkoutLib = (window as any).YooMoneyCheckoutWidget;
      if (!checkoutLib) {
        console.error("❌ YooMoneyCheckoutWidget не найден в window после загрузки скрипта");
        toast({
          title: "Ошибка оплаты",
          description: "Не удалось загрузить платежную форму YooKassa.",
          variant: "destructive",
          duration: 3000,
        });
        navigate(`/order/${orderId}`, { replace: true });
        return;
      }

      try {
        const checkout = new checkoutLib({
          confirmation_token: confirmationToken,
          return_url: returnUrl || window.location.href,
          error_callback: (error: any) => {
            console.error("❌ Ошибка виджета YooKassa:", error);
            toast({
              title: "Ошибка оплаты",
              description: "Произошла ошибка в платежном виджете. Попробуйте позже.",
              variant: "destructive",
              duration: 3000,
            });
          },
        });

        checkout
          .render("payment-form")
          .then(() => {
            setIsWidgetReady(true);
          })
          .catch((err: any) => {
            console.error("❌ Ошибка при рендере виджета YooKassa:", err);
            toast({
              title: "Ошибка оплаты",
              description: "Не удалось отобразить платежную форму.",
              variant: "destructive",
              duration: 3000,
            });
          });
      } catch (e) {
        console.error("❌ Исключение при инициализации виджета YooKassa:", e);
        toast({
          title: "Ошибка оплаты",
          description: "Не удалось инициализировать платежную форму.",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    if (typeof window !== "undefined") {
      const checkoutLib = (window as any).YooMoneyCheckoutWidget;
      if (checkoutLib) {
        initWidget();
      } else {
        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"]'
        );

        if (existingScript) {
          existingScript.addEventListener("load", initWidget, { once: true } as any);
        } else {
          const script = document.createElement("script");
          script.src = "https://yookassa.ru/checkout-widget/v1/checkout-widget.js";
          script.async = true;
          script.onload = () => initWidget();
          script.onerror = () => {
            console.error("❌ Не удалось загрузить скрипт виджета YooKassa");
            toast({
              title: "Ошибка оплаты",
              description: "Не удалось загрузить компонент оплаты. Попробуйте позже.",
              variant: "destructive",
              duration: 3000,
            });
            navigate(`/order/${orderId}`, { replace: true });
          };
          document.head.appendChild(script);
        }
      }
    }
  }, [location.search, navigate, toast]);

  const handleClose = async () => {
    if (isClosing) return;
    setIsClosing(true);

    const orderId = query.get("orderId") || "";
    const paymentId = query.get("paymentId") || "";

    // Пытаемся аккуратно проверить статус платежа перед возвратом в заказ
    if (orderId && paymentId) {
      try {
        const result = await handlePaymentReturn(paymentId, orderId);
        if (result.success) {
          try {
            await updateOrderStatus(orderId, "in-progress");
          } catch (err) {
            console.error("Ошибка при обновлении статуса заказа в Firestore после оплаты (Widget):", err);
          }
          updateOrder(orderId, { status: "in-progress" as const });

          toast({
            title: "Оплата обработана",
            description: `Оплата для заказа №${orderId} подтверждена. Статус: выступление в процессе.`,
            duration: 3000,
          });
        } else if (result.error) {
          toast({
            title: "Оплата не завершена",
            description: result.error,
            variant: "destructive",
            duration: 3000,
          });
        }
      } catch (err) {
        console.error("Ошибка при проверке статуса платежа из виджета:", err);
      }
    }

    navigate(`/order/${orderId || ""}`, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          type="button"
          className="text-sm font-medium text-primary hover:text-primary/80"
          onClick={handleClose}
        >
          ← Назад к заказу
        </button>
        <div className="text-sm text-muted-foreground">Безопасная оплата через YooKassa</div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-sm p-4 mt-2">
          <div className="mb-3 text-center">
            <div className="text-base font-semibold">Оплата заказа</div>
            <div className="text-xs text-muted-foreground mt-1">
              Данные карты защищены. Оплата обрабатывается через YooKassa.
            </div>
          </div>

          <div
            id="payment-form"
            ref={widgetContainerRef}
            className="min-h-[260px] rounded-2xl bg-background flex items-center justify-center overflow-hidden"
          >
            {!isWidgetReady && (
              <div className="text-xs text-muted-foreground">
                Загрузка платежной формы...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentWidgetPage;
