import { MessageCircle, Phone, Edit, X, CheckCircle, CreditCard } from "lucide-react";
import type { OrderStatus } from "@/data/orders";

interface OrderActionsProps {
  onEdit?: () => void;
  onCancel?: () => void;
  onCall?: () => void;
  onMessage?: () => void;
  onConfirm?: () => void;
  onPay?: () => void;
  status?: OrderStatus;
  isMusician?: boolean;
  order?: any; // Для проверки createdAt
}

const OrderActions = ({ onEdit, onCancel, onCall, onMessage, onConfirm, onPay, status, isMusician = false, order }: OrderActionsProps & { order?: any }) => {
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";
  const isInProgress = status === "in-progress";
  const canEdit = !isMusician && !isCompleted && !isCancelled && !isInProgress && !!onEdit;
  const canCancel = !isCompleted && !isCancelled && !isInProgress && !!onCancel; // Запрещаем отмену при выступлении в процессе
  const canCall = !isCompleted && !isCancelled;
  
  // Кнопка подтверждения показывается для музыкантов при статусе "pending" или "created"
  // Для "created" проверяем, прошла ли минута с момента создания (или если createdAt не определен - показываем всегда)
  let isCreatedAndReady = false;
  if (status === "created") {
    if (!order?.createdAt) {
      // Если createdAt не определен, показываем кнопку (для старых заказов)
      isCreatedAndReady = true;
    } else {
      // Обрабатываем разные форматы createdAt (число или Timestamp из Firestore)
      const createdAt = order.createdAt?.toMillis ? order.createdAt.toMillis() : order.createdAt;
      if (typeof createdAt === 'number') {
        isCreatedAndReady = Date.now() - createdAt >= 60 * 1000;
      }
    }
  }
  const canConfirm = isMusician && !!onConfirm && (status === "pending" || isCreatedAndReady);
  
  const canPay = !isMusician && status === "payment-pending" && !!onPay;
  
  return (
    <div className="space-y-3">
      {/* Кнопка подтверждения для музыкантов */}
      {canConfirm && (
        <button 
          onClick={onConfirm}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-primary py-4 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <CheckCircle size={20} />
          Подтвердить заказ
        </button>
      )}

      {/* Кнопка оплаты для клиентов */}
      {canPay && (
        <button 
          onClick={onPay}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-primary py-4 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <CreditCard size={20} />
          Оплатить
        </button>
      )}

      {/* Primary Action */}
      <button 
        onClick={onMessage}
        className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-secondary py-4 text-base font-semibold text-secondary-foreground shadow-md transition-all hover:bg-secondary/90 active:scale-[0.98]"
      >
        <MessageCircle size={20} />
        {isMusician ? "Написать заказчику" : "Написать музыканту"}
      </button>

      {/* Secondary Actions */}
      {!isMusician && (
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={onCall}
            disabled={!canCall}
            className={`flex flex-col items-center gap-1 rounded-[14px] border border-border bg-card py-3 transition-all ${
              canCall 
                ? "hover:bg-accent active:scale-[0.98] cursor-pointer" 
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <Phone size={20} className={canCall ? "text-foreground" : "text-muted-foreground"} />
            <span className={`text-xs ${canCall ? "text-muted-foreground" : "text-muted-foreground/50"}`}>Позвонить</span>
          </button>
          <button 
            onClick={onEdit}
            disabled={!canEdit}
            className={`flex flex-col items-center gap-1 rounded-[14px] border border-border bg-card py-3 transition-all ${
              canEdit 
                ? "hover:bg-accent active:scale-[0.98] cursor-pointer" 
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <Edit size={20} className={canEdit ? "text-foreground" : "text-muted-foreground"} />
            <span className={`text-xs ${canEdit ? "text-muted-foreground" : "text-muted-foreground/50"}`}>Изменить</span>
          </button>
          <button 
            onClick={onCancel}
            disabled={!canCancel}
            className={`flex flex-col items-center gap-1 rounded-[14px] border border-border bg-card py-3 transition-all ${
              canCancel 
                ? "hover:bg-accent active:scale-[0.98] cursor-pointer" 
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <X size={20} className={canCancel ? "text-destructive" : "text-muted-foreground"} />
            <span className={`text-xs ${canCancel ? "text-muted-foreground" : "text-muted-foreground/50"}`}>Отменить</span>
          </button>
        </div>
      )}

      {/* Кнопка отмены для музыкантов */}
      {isMusician && (
        <button 
          onClick={onCancel}
          disabled={!canCancel}
          className={`flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-destructive py-4 text-base font-semibold transition-all ${
            canCancel 
              ? "text-destructive hover:bg-destructive/10 active:scale-[0.98] cursor-pointer" 
              : "opacity-50 cursor-not-allowed text-muted-foreground"
          }`}
        >
          <X size={20} />
          Отменить заказ
        </button>
      )}
    </div>
  );
};

export default OrderActions;
