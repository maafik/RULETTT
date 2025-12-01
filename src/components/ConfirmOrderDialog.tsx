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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Сбрасываем поля при открытии диалога
  useEffect(() => {
    if (open) {
      setAmount(initialAmount);
      setTime(initialTime);
      setLocation(initialLocation);
    }
  }, [open, initialAmount, initialTime, initialLocation]);

  const handleSubmit = async () => {
    if (!amount || !time || !location) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm({ amount, time, location });
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
      <DialogContent className="max-w-md rounded-[24px]">
        <DialogHeader>
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

