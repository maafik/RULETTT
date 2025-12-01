import { Calendar, Clock, MapPin, Music, FileText, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderDetailsBlockProps {
  date: string;
  time: string;
  location: string;
  format: string;
  comment: string;
  customerPhone?: string;
  orderStatus?: string;
  isMusician?: boolean;
}

const OrderDetailsBlock = ({ date, time, location, format, comment, customerPhone, orderStatus, isMusician = false }: OrderDetailsBlockProps) => {
  const { toast } = useToast();
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);

  // Номер телефона доступен только после оплаты (in-progress, completed)
  const isPhoneVisible = customerPhone && (orderStatus === "in-progress" || orderStatus === "completed");
  const isPhoneHidden = customerPhone && !isPhoneVisible && isMusician;

  const handlePhoneClick = () => {
    if (isPhoneHidden) {
      // Показываем попап с сообщением
      setIsPhoneDialogOpen(true);
    } else if (customerPhone && isPhoneVisible) {
      // Переход на звонок
      window.location.href = `tel:${customerPhone}`;
    }
  };
  const details = [
    { icon: Calendar, label: "Дата выступления", value: date },
    { icon: Clock, label: "Время", value: time },
    { icon: MapPin, label: "Локация", value: location },
    { icon: Music, label: "Формат", value: format },
  ];

  return (
    <div className="rounded-[16px] bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-foreground">Детали заказа</h3>
      
      <div className="space-y-3">
        {details.map((detail, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent">
              <detail.icon size={18} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{detail.label}</p>
              <p className="text-sm font-medium text-foreground">{detail.value}</p>
            </div>
          </div>
        ))}

        {/* Comment */}
        {comment && (
          <div className="flex gap-3 pt-2">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent">
              <FileText size={18} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Комментарий заказчика</p>
              <p className="text-sm text-foreground leading-relaxed">{comment}</p>
            </div>
          </div>
        )}

        {/* Phone number for musicians */}
        {isMusician && customerPhone && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePhoneClick}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent hover:bg-accent/80 transition-colors cursor-pointer"
            >
              <Phone size={18} className="text-foreground" />
            </button>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Телефон заказчика</p>
              {isPhoneVisible && (
                <button
                  onClick={handlePhoneClick}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {customerPhone}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialog для скрытого номера */}
      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent className="max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Номер телефона недоступен</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Номер телефона заказчика будет доступен только после оплаты заказа.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailsBlock;
