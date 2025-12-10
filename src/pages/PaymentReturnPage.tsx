import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { handlePaymentReturn, type PaymentResult } from "@/lib/payment";
import { updateOrder } from "@/lib/orders";
import { updateOrderStatus } from "@/lib/firebase-db";
import { closeInAppBrowserIfNative } from "@/lib/payment-browser";
import { Button } from "@/components/ui/button";

function useQuery() {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

const PaymentReturnPage = () => {
  const location = useLocation();
  const query = useQuery();
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    const run = async () => {
      const orderId = query.get("orderId") || "";

      let paymentId =
        query.get("paymentId") ||
        query.get("payment_id") ||
        (typeof window !== "undefined"
          ? window.localStorage.getItem(`yookassa_payment_${orderId}`) || ""
          : "");

      if (!orderId) {
        const msg = "Параметр orderId отсутствует в ссылке возврата.";
        setStatus("error");
        setMessage(msg);
        return;
      }

      if (!paymentId) {
        const msg = "Не удалось определить платеж. Попробуйте ещё раз или свяжитесь с поддержкой.";
        setStatus("error");
        setMessage(msg);
        return;
      }

      setStatus("checking");
      setMessage("");

      const start = Date.now();
      let finalResult: PaymentResult | null = null;

      while (!isCancelled && Date.now() - start < 30000) {
        const result = await handlePaymentReturn(paymentId || "", orderId);

        if (result.success) {
          finalResult = result;
          break;
        }

        if (result.error && /отменен|отменена|canceled/i.test(result.error)) {
          finalResult = result;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      if (isCancelled) return;

      if (!finalResult) {
        const msg =
          "Не удалось подтвердить оплату за отведённое время. Если деньги были списаны, свяжитесь с поддержкой.";
        setStatus("error");
        setMessage(msg);
        return;
      }

      if (finalResult.success) {
        try {
          await updateOrderStatus(orderId, "in-progress");
        } catch (err) {
          console.error("Ошибка при обновлении статуса заказа в Firestore после оплаты:", err);
        }

        updateOrder(orderId, { status: "in-progress" as const });

        const msg = "Статус вашего заказа доступен во вкладке „Заказы“ в приложении.";
        setStatus("success");
        setMessage(msg);
      } else {
        const msg =
          finalResult.error ||
          "Оплата не подтверждена. Если вы уверены, что платёж прошёл, обратитесь в поддержку.";
        setStatus("error");
        setMessage(msg);
      }
    };

    run();

    return () => {
      isCancelled = true;
    };
  }, [location.search, query]);

  const handleReturnClick = async () => {
    await closeInAppBrowserIfNative();

    if (typeof window !== "undefined") {
      window.location.href = "musicbooking://orders";
    }
  };

  const isChecking = status === "checking";
  const title = "Информация о заказе";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground px-4 text-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        {isChecking
          ? "Пожалуйста, подождите, мы проверяем статус вашего платежа..."
          : "Статус вашего платежа и заказа можно проверить во вкладке „Заказы“ в приложении."}
      </p>
      <Button type="button" onClick={handleReturnClick}>
        Вернуться в приложение
      </Button>
    </div>
  );
};

export default PaymentReturnPage;
