import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { handlePaymentReturn } from "@/lib/payment";
import { useToast } from "@/hooks/use-toast";
import { updateOrder } from "@/lib/orders";
import { updateOrderStatus } from "@/lib/firebase-db";
import { closeInAppBrowserIfNative } from "@/lib/payment-browser";

function useQuery() {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

const PaymentReturnPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const query = useQuery();

  useEffect(() => {
    const orderId = query.get("orderId") || "";

    // Пытаемся получить paymentId из query или из localStorage
    let paymentId =
      query.get("paymentId") ||
      query.get("payment_id") ||
      (typeof window !== "undefined"
        ? window.localStorage.getItem(`yookassa_payment_${orderId}`) || ""
        : "");

    if (!orderId) {
      toast({
        title: "Не удалось определить заказ",
        description: "Параметр orderId отсутствует в ссылке возврата.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    (async () => {
      try {
        const result = await handlePaymentReturn(paymentId || "", orderId);

        if (result.success) {
          // Обновляем статус заказа на "in-progress" в Firestore и локальном кэше
          try {
            await updateOrderStatus(orderId, "in-progress");
          } catch (err) {
            console.error("Ошибка при обновлении статуса заказа в Firestore после оплаты:", err);
          }

          updateOrder(orderId, { status: "in-progress" as const });

          toast({
            title: "Оплата обработана",
            description: `Оплата для заказа №${orderId} подтверждена. Статус: выступление в процессе.`,
            duration: 3000,
          });
          await closeInAppBrowserIfNative();
        } else {
          toast({
            title: "Ошибка оплаты",
            description: result.error || "Не удалось подтвердить оплату.",
            variant: "destructive",
            duration: 3000,
          });
          await closeInAppBrowserIfNative();
        }
      } catch (error) {
        console.error("Ошибка при обработке возврата оплаты:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при обработке оплаты.",
          variant: "destructive",
          duration: 3000,
        });
        await closeInAppBrowserIfNative();
      }
    })();
  }, [location.search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      Обработка результата оплаты...
    </div>
  );
};

export default PaymentReturnPage;
