import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse, startOfToday } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { cn } from "@/lib/utils";
import ImageWithFallback from "./ImageWithFallback";
import { LAST_BOOKING_DATA_KEY } from "@/constants/storage";

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
  endTime: string;
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
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [comment, setComment] = useState("");
  const scrollPositionRef = useRef<number>(0);

  // Сохраняем и восстанавливаем позицию скролла
  useEffect(() => {
    if (open) {
      // Сохраняем текущую позицию скролла
      scrollPositionRef.current = window.scrollY || document.documentElement.scrollTop;
    } else {
      // Восстанавливаем позицию скролла при закрытии
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
      }, 100);
    }
  }, [open]);

  // Заполняем форму при редактировании или загружаем сохраненные данные
  useEffect(() => {
    if (open && initialData) {
      // Редактирование существующего заказа
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
      // Парсим время из формата "19:00–21:00" -> "19:00" и "21:00"
      if (initialData.time) {
        const timeMatch = initialData.time.match(/^(\d{2}:\d{2})–(\d{2}:\d{2})/);
        if (timeMatch) {
          setTime(timeMatch[1]);
          setEndTime(timeMatch[2]);
        } else {
          // Если формат не содержит дефис, пробуем только начало
          const startMatch = initialData.time.match(/^(\d{2}:\d{2})/);
          if (startMatch) {
            setTime(startMatch[1]);
          }
        }
      }
      setLocation(initialData.location || "");
      setComment(initialData.comment || "");
    } else if (open && !initialData) {
      // Новый заказ - загружаем сохраненные данные
      try {
        const savedData = localStorage.getItem(LAST_BOOKING_DATA_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.date) {
            const savedDate = new Date(parsed.date);
            if (!isNaN(savedDate.getTime())) {
              setDate(savedDate);
            }
          }
          if (parsed.eventType) {
            setEventType(parsed.eventType);
          }
          if (parsed.location) {
            setLocation(parsed.location);
          }
          // Время и комментарий не сохраняем - они могут отличаться
          setTime("");
          setEndTime("");
          setComment("");
        } else {
          // Если нет сохраненных данных, сбрасываем форму
          setDate(undefined);
          setEventType("");
          setTime("");
          setEndTime("");
          setLocation("");
          setComment("");
        }
      } catch (error) {
        console.error("Ошибка при загрузке сохраненных данных бронирования:", error);
        // В случае ошибки сбрасываем форму
        setDate(undefined);
        setEventType("");
        setTime("");
        setLocation("");
        setComment("");
      }
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!date || !eventType || !time || !endTime || !location) {
      return;
    }

    const bookingData: BookingData = {
      date,
      eventType,
      time,
      endTime,
      location,
      comment,
    };

    // Сохраняем данные бронирования в localStorage (только для новых заказов, не при редактировании)
    if (!isEdit) {
      try {
        const dataToSave = {
          date: date.toISOString(), // Сохраняем как ISO строку для удобства парсинга
          eventType,
          location,
          // Не сохраняем time и comment - они могут отличаться для разных заказов
        };
        localStorage.setItem(LAST_BOOKING_DATA_KEY, JSON.stringify(dataToSave));
        console.log("✅ Данные бронирования сохранены:", dataToSave);
      } catch (error) {
        console.error("Ошибка при сохранении данных бронирования:", error);
      }
    }

    onConfirm(bookingData);
    
    // Сброс формы только если это не редактирование
    if (!isEdit) {
      // Не сбрасываем форму полностью - оставляем сохраненные данные для следующего заказа
      setTime("");
      setEndTime("");
      setComment("");
    } else {
      // При редактировании сбрасываем все
      setDate(undefined);
      setEventType("");
      setTime("");
      setEndTime("");
      setLocation("");
      setComment("");
    }
    onOpenChange(false);
  };

  const isValid = date && eventType && time && endTime && location;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-full !w-screen !rounded-none !border-0 !p-0 !m-0 !translate-x-0 !translate-y-0 !left-0 !top-0 !right-0 !bottom-0 overflow-y-auto [&>button]:hidden"
        style={{ maxWidth: "100vw", width: "100vw", margin: 0, borderRadius: 0 }}
      >
        <div className="min-h-full flex flex-col" style={{ padding: "30px 2rem" }}>
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
                    <ImageWithFallback 
                      src={musician.image} 
                      alt={musician.name} 
                      fallbackText={musician.name.charAt(0)}
                      className="h-full w-full object-cover"
                    />
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
              <Input
                id="date"
                type="date"
                min={format(startOfToday(), "yyyy-MM-dd")}
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setDate(undefined);
                    return;
                  }
                  const parsed = new Date(value + "T00:00:00");
                  if (!isNaN(parsed.getTime())) {
                    setDate(parsed);
                  }
                }}
              />
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

            {/* Время начала и окончания в одну строку */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Время начала *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="Выберите время начала"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Время окончания *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Выберите время окончания"
                  min={time || undefined}
                />
              </div>
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

