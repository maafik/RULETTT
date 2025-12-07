import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ConfirmOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    amount: string;
    time: string;
    location: string;
    prepayment?: string;
  }) => Promise<void>;
  initialAmount?: string;
  initialTime?: string;
  initialLocation?: string;
}

const ConfirmOrderDialog = ({
  open,
  onOpenChange,
  onConfirm,
  initialAmount = "",
  initialTime = "",
  initialLocation = "",
}: ConfirmOrderDialogProps) => {
  const [amount, setAmount] = useState(initialAmount);
  const [time, setTime] = useState(initialTime);
  const [location, setLocation] = useState(initialLocation);
  const [prepayment, setPrepayment] = useState("");
  const [showPrepaymentInput, setShowPrepaymentInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prepaymentInputRef = useRef<HTMLInputElement>(null);

  // Сбрасываем поля при открытии диалога
  useEffect(() => {
    if (open) {
      setAmount(initialAmount);
      setTime(initialTime);
      setLocation(initialLocation);
      setPrepayment("");
      setShowPrepaymentInput(false);
    }
  }, [open, initialAmount, initialTime, initialLocation]);

  // Предотвращаем автоматический фокус на полях ввода
  useEffect(() => {
    if (open) {
      // Небольшая задержка для предотвращения автоматического фокуса
      const timer = setTimeout(() => {
        if (prepaymentInputRef.current && showPrepaymentInput) {
          prepaymentInputRef.current.blur();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, showPrepaymentInput]);

  const handlePrepaymentClick = () => {
    setShowPrepaymentInput(true);
    // Не фокусируемся автоматически
  };

  const handleSubmit = async () => {
    if (!amount || !time || !location) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm({ 
        amount,
        time, 
        location, 
        prepayment: showPrepaymentInput && prepayment ? prepayment : undefined 
      });
      // После успешного подтверждения диалог закроется в родительском компоненте
    } catch (error) {
      console.error("Ошибка при подтверждении заказа:", error);
      // В случае ошибки не закрываем диалог, чтобы пользователь мог попробовать снова
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px] max-h-[90vh] overflow-y-auto p-6 [&>button]:hidden">
        <DialogHeader className="pt-2 sm:pt-0">
          <DialogTitle className="text-xl font-bold">Подтвердить заказ</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Укажите сумму, подтвердите время и место проведения
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма (₽)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="Например: 15 000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-[12px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Время</Label>
            <Input
              id="time"
              type="text"
              placeholder="Например: 20:00–22:00"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-[12px]"
              readOnly
              onFocus={(e) => e.target.blur()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Место</Label>
            <Textarea
              id="location"
              placeholder="Адрес проведения мероприятия"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-[12px] min-h-[80px]"
              readOnly
              onFocus={(e) => e.target.blur()}
            />
          </div>
          {!showPrepaymentInput && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrepaymentClick}
              className="w-full rounded-[12px]"
            >
              Ввести предоплату
            </Button>
          )}
          {showPrepaymentInput && (
            <div className="space-y-2">
              <Label htmlFor="prepayment">Предоплата (₽)</Label>
              <Input
                ref={prepaymentInputRef}
                id="prepayment"
                type="text"
                placeholder="Например: 5 000"
                value={prepayment}
                onChange={(e) => setPrepayment(e.target.value)}
                className="rounded-[12px]"
                onBlur={() => {
                  // Предотвращаем автоматический фокус
                  if (prepaymentInputRef.current) {
                    prepaymentInputRef.current.blur();
                  }
                }}
              />
            </div>
          )}
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
            onClick={handleSubmit}
            disabled={!amount || !time || !location || isSubmitting}
            className="rounded-[12px]"
          >
            {isSubmitting ? "Подтверждаю..." : "Подтвердить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmOrderDialog;

