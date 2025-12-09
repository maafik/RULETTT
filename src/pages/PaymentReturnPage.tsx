import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { handlePaymentReturn, type PaymentResult } from "@/lib/payment";
import { useToast } from "@/hooks/use-toast";
import { updateOrder } from "@/lib/orders";
import { updateOrderStatus } from "@/lib/firebase-db";
import { closeInAppBrowserIfNative } from "@/lib/payment-browser";
import { Button } from "@/components/ui/button";

function useQuery() {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

const PaymentReturnPage = () => {
  const location = useLocation();
  const { toast } = useToast();
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
        toast({
          title: "Не удалось определить заказ",
          description: msg,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (!paymentId) {
        const msg = "Не удалось определить платеж. Попробуйте ещё раз или свяжитесь с поддержкой.";
        setStatus("error");
        setMessage(msg);
        toast({
          title: "Ошибка оплаты",
          description: msg,
          variant: "destructive",
          duration: 3000,
        });
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
        toast({
          title: "Оплата не подтверждена",
          description: msg,
          variant: "destructive",
          duration: 4000,
        });
        return;
      }

      if (finalResult.success) {
        try {
          await updateOrderStatus(orderId, "in-progress");
        } catch (err) {
          console.error("Ошибка при обновлении статуса заказа в Firestore после оплаты:", err);
        }

        updateOrder(orderId, { status: "in-progress" as const });

        const msg = `Оплата для заказа №${orderId} подтверждена. Статус: выступление в процессе.`;
        setStatus("success");
        setMessage(msg);
        toast({
          title: "Оплата обработана",
          description: msg,
          duration: 3000,
        });
      } else {
        const msg =
          finalResult.error ||
          "Оплата не подтверждена. Если вы уверены, что платёж прошёл, обратитесь в поддержку.";
        setStatus("error");
        setMessage(msg);
        toast({
          title: "Ошибка оплаты",
          description: msg,
          variant: "destructive",
          duration: 4000,
        });
      }
    };

    run();

    return () => {
      isCancelled = true;
    };
  }, [location.search, query, toast]);

  const handleReturnClick = async () => {
    await closeInAppBrowserIfNative();

    if (typeof window !== "undefined") {
      try {
        window.location.href = "myapp://payment-result";
      } catch (e) {
        try {
          window.close();
        } catch {}
      }
    }
  };

  const isChecking = status === "checking";
  const title =
    status === "success"
      ? "Оплата прошла успешно"
      : status === "error"
      ? "Платёж не подтверждён"
      : "Обработка результата оплаты";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {isChecking
            ? "Пожалуйста, подождите, мы проверяем статус вашего платежа..."
            : message ||
              (status === "success"
                ? "Оплата успешно подтверждена."
                : "Оплата не подтверждена.")}
        </p>
        <Button type="button" onClick={handleReturnClick} className="mt-4 w-full">
          Вернуться в приложение
        </Button>
      </div>
    </div>
  );
};

export default PaymentReturnPage;
