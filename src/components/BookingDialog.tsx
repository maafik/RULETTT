import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  musician: {
    name: string;
    style: string;
    price: string;
    image?: string;
  } | null;
  onConfirm: (bookingData: BookingData) => void;
  initialData?: {
    date?: string;
    eventType?: string;
    time?: string;
    location?: string;
    comment?: string;
  };
  isEdit?: boolean;
}

export interface BookingData {
  date: Date;
  eventType: string;
  time: string;
  location: string;
  comment: string;
}

const eventTypes = [
  "Свадьба",
  "День рождения",
  "Корпоратив",
  "Юбилей",
  "Выпускной",
  "Праздник",
  "Концерт",
  "Другое",
];

const BookingDialog = ({ open, onOpenChange, musician, onConfirm, initialData, isEdit = false }: BookingDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [eventType, setEventType] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [comment, setComment] = useState("");

  // Заполняем форму при редактировании
  useEffect(() => {
    if (open && initialData) {
      if (initialData.date) {
        // Парсим дату из формата "d MMMM yyyy" (например, "28 мая 2025")
        try {
          // Пробуем распарсить с помощью date-fns
          const parsedDate = parse(initialData.date, "d MMMM yyyy", new Date(), { locale: ru });
          if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate);
          } else {
            // Если не получилось, пробуем стандартный парсинг
            const fallbackDate = new Date(initialData.date);
            if (!isNaN(fallbackDate.getTime())) {
              setDate(fallbackDate);
            }
          }
        } catch (e) {
          // Если не удалось распарсить, пробуем стандартный парсинг
          try {
            const fallbackDate = new Date(initialData.date);
            if (!isNaN(fallbackDate.getTime())) {
              setDate(fallbackDate);
            }
          } catch (e2) {
            // Если и это не сработало, оставляем undefined
          }
        }
      }
      setEventType(initialData.eventType || "");
      // Парсим время из формата "19:00–21:00" -> "19:00"
      if (initialData.time) {
        const timeMatch = initialData.time.match(/^(\d{2}:\d{2})/);
        if (timeMatch) {
          setTime(timeMatch[1]);
        }
      }
      setLocation(initialData.location || "");
      setComment(initialData.comment || "");
    } else if (open && !initialData) {
      // Сброс формы при открытии для нового заказа
      setDate(undefined);
      setEventType("");
      setTime("");
      setLocation("");
      setComment("");
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!date || !eventType || !time || !location) {
      return;
    }

    const bookingData: BookingData = {
      date,
      eventType,
      time,
      location,
      comment,
    };

    onConfirm(bookingData);
    
    // Сброс формы
    setDate(undefined);
    setEventType("");
    setTime("");
    setLocation("");
    setComment("");
    onOpenChange(false);
  };

  const isValid = date && eventType && time && location;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px] border-0 p-0 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {isEdit ? "Изменить заказ" : "Бронирование выступления"}
            </DialogTitle>
          </DialogHeader>

          {musician && (
            <div className="mt-4 rounded-[16px] bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                {musician.image && (
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[12px] bg-muted">
                    <img src={musician.image} alt={musician.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{musician.name}</p>
                  <p className="text-sm text-muted-foreground">{musician.style}</p>
                  <p className="mt-1 text-base font-bold text-foreground">{musician.price}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {/* Дата */}
            <div className="space-y-2">
              <Label htmlFor="date">Дата мероприятия *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Тип праздника */}
            <div className="space-y-2">
              <Label htmlFor="eventType">Тип мероприятия *</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип мероприятия" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Время */}
            <div className="space-y-2">
              <Label htmlFor="time">Время *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Выберите время"
              />
            </div>

            {/* Адрес */}
            <div className="space-y-2">
              <Label htmlFor="location">Адрес проведения *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Введите адрес"
              />
            </div>

            {/* Комментарий */}
            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий (необязательно)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Дополнительная информация о мероприятии"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid} className="flex-1">
              {isEdit ? "Сохранить изменения" : "Подтвердить бронирование"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;

