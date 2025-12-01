import { useState } from "react";
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

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (comment?: string) => void;
  amount: string;
  date?: string;
  time?: string;
  location?: string;
  format?: string;
}

const PaymentDialog = ({
  open,
  onOpenChange,
  onConfirm,
  amount,
  date,
  time,
  location,
  format,
}: PaymentDialogProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <Card className="rounded-[16px] border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Сумма к оплате</span>
                <span className="text-2xl font-bold text-primary">{amount}</span>
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
            disabled={isSubmitting}
            className="rounded-[12px] bg-primary"
          >
            {isSubmitting ? "Оплачиваю..." : "Оплатить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

