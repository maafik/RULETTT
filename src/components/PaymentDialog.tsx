import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createYooKassaPayment } from "@/lib/payment";
import { openPaymentUrl } from "@/lib/payment-browser";
import { ShieldCheck } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (comment?: string) => void;
  amount: string;
  originalAmount?: string;
  discountLabel?: string;
  date?: string;
  time?: string;
  location?: string;
  format?: string;
  prepayment?: string;
  orderId?: string;
}

const PaymentDialog = ({
  open,
  onOpenChange,
  onConfirm,
  amount,
  originalAmount,
  discountLabel,
  date,
  time,
  location,
  format,
  prepayment,
  orderId,
}: PaymentDialogProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const commentTextareaRef = useState<HTMLTextAreaElement | null>(null);

  // Предотвращаем автоматический фокус на textarea при открытии
  useEffect(() => {
    if (open) {
      // Небольшая задержка для предотвращения автоматического фокуса
      const timer = setTimeout(() => {
        const textarea = document.getElementById("comment") as HTMLTextAreaElement;
        if (textarea) {
          textarea.blur();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comment || undefined);
      setComment("");
      onOpenChange(false);
    } catch (error) {
      console.error("Ошибка при оплате:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYooKassaPayment = async () => {
    if (!orderId) {
      console.error("Order ID не указан");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Извлекаем сумму из строки (например, "15 000 ₽" или "15 000 ₽" -> 15000)
      // Удаляем все пробельные символы (включая неразрывные), знаки валюты и текст,
      // оставляя только цифры, точку и запятую
      const normalizedAmount = amount
        .replace(/\u00A0/g, " ") // неразрывные пробелы -> обычные
        .replace(/[^0-9.,]/g, "") // удаляем всё, кроме цифр, точки и запятой
        .replace(",", ".");

      const amountValue = parseFloat(normalizedAmount);

      if (isNaN(amountValue)) {
        console.error("❌ Неверный формат суммы для YooKassa:", amount, normalizedAmount);
        throw new Error("Неверный формат суммы");
      }

      const description = `Оплата заказа ${orderId}`;
      const paymentResult = await createYooKassaPayment(amountValue, description, orderId);

      if (paymentResult.success && paymentResult.confirmationUrl) {
        // Сохраняем orderId, чтобы после оплаты вернуть пользователя на страницу заказа
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("return_to_order_after_payment", orderId);
          } catch (e) {
            console.warn("⚠️ Не удалось сохранить orderId для возврата после оплаты:", e);
          }
          await openPaymentUrl(paymentResult.confirmationUrl);
        }
      } else {
        console.error("Ошибка при создании платежа YooKassa:", paymentResult.error);
        // Не подтверждаем оплату автоматически, оставляем диалог открытым
      }
    } catch (error) {
      console.error("Ошибка при обработке платежа YooKassa:", error);
      // Не подтверждаем оплату автоматически, оставляем диалог открытым
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Оплата заказа</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Проверьте информацию и подтвердите оплату
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-2 rounded-[16px] border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            <ShieldCheck size={16} className="mt-0.5" />
            <span>
              Деньги удерживаются сервисом. Музыканту сейчас перечисляется только предоплата, остальная сумма — после завершения мероприятия.
            </span>
          </div>
          <Card className="rounded-[16px] border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Сумма к оплате</span>
                    {discountLabel && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {discountLabel}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{amount}</div>
                    {originalAmount && (
                      <div className="text-xs text-muted-foreground line-through">{originalAmount}</div>
                    )}
                  </div>
                </div>
                {prepayment && (
                  <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                    <span className="text-sm font-medium text-muted-foreground">Предоплата</span>
                    <span className="text-lg font-semibold text-primary">{prepayment} ₽</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 rounded-[16px] border border-border bg-card p-4">
            {date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Дата</span>
                <span className="text-sm font-medium">{date}</span>
              </div>
            )}
            {time && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Время</span>
                <span className="text-sm font-medium">{time}</span>
              </div>
            )}
            {location && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Место</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{location}</span>
              </div>
            )}
            {format && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Формат</span>
                <span className="text-sm font-medium">{format}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий (необязательно)</Label>
            <Textarea
              id="comment"
              placeholder="Добавьте комментарий к оплате..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="rounded-[12px] min-h-[80px]"
              onFocus={(e) => {
                // Разрешаем фокус только при явном клике пользователя
                // Не блокируем, но предотвращаем автоматический фокус при открытии
              }}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-[12px]"
          >
            Отмена
          </Button>
          <Button
            onClick={handleYooKassaPayment}
            disabled={isSubmitting || isProcessingPayment}
            className="rounded-[12px] bg-primary w-full"
          >
            {isProcessingPayment ? "Подключение к YooKassa..." : isSubmitting ? "Оплачиваю..." : "Оплатить через YooKassa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

