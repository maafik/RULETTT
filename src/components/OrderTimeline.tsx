import { Check, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import type { Order } from "@/data/orders";

interface TimelineStep {
  label: string;
  completed: boolean;
  active?: boolean;
}

interface OrderTimelineProps {
  order?: Order;
}

const OrderTimeline = ({ order }: OrderTimelineProps) => {
  const [steps, setSteps] = useState<TimelineStep[]>([
    { label: "Заказ создан", completed: false },
    { label: "Музыкант получил уведомление", completed: false },
    { label: "Музыкант подтвердил участие", completed: false },
    { label: "Оплата подтверждена", completed: false },
    { label: "Выступление в процессе", completed: false, active: false },
    { label: "Завершено", completed: false },
  ]);

  useEffect(() => {
    if (!order) return;

    const updateSteps = () => {
      const status = order.status;
      let newSteps: TimelineStep[];

      switch (status) {
        case "created":
          // Для статуса "created" проверяем, прошло ли 1 минута с момента создания
          if (order.createdAt) {
            const now = Date.now();
            const elapsed = now - order.createdAt;
            const oneMinute = 60 * 1000; // 1 минута в миллисекундах

            newSteps = [
              { label: "Заказ создан", completed: true },
              { label: "Музыкант получил уведомление", completed: elapsed >= oneMinute },
              { label: "Музыкант подтвердил участие", completed: false },
              { label: "Оплата подтверждена", completed: false },
              { label: "Выступление в процессе", completed: false, active: false },
              { label: "Завершено", completed: false },
            ];

            // Если прошло меньше 1 минуты, второй шаг активен
            if (elapsed < oneMinute) {
              newSteps[1].active = true;
            }
          } else {
            // Если нет времени создания, показываем только первый шаг
            newSteps = [
              { label: "Заказ создан", completed: true },
              { label: "Музыкант получил уведомление", completed: false },
              { label: "Музыкант подтвердил участие", completed: false },
              { label: "Оплата подтверждена", completed: false },
              { label: "Выступление в процессе", completed: false, active: false },
              { label: "Завершено", completed: false },
            ];
          }
          break;

        case "pending":
          // Для статуса "pending" показываем первые два шага как завершенные
          newSteps = [
            { label: "Заказ создан", completed: true },
            { label: "Музыкант получил уведомление", completed: true },
            { label: "Музыкант подтвердил участие", completed: false, active: true },
            { label: "Оплата подтверждена", completed: false },
            { label: "Выступление в процессе", completed: false, active: false },
            { label: "Завершено", completed: false },
          ];
          break;

        case "payment-pending":
          // Для статуса "payment-pending" показываем первые три шага как завершенные, четвертый активен
          newSteps = [
            { label: "Заказ создан", completed: true },
            { label: "Музыкант получил уведомление", completed: true },
            { label: "Музыкант подтвердил участие", completed: true },
            { label: "Оплата подтверждена", completed: false, active: true },
            { label: "Выступление в процессе", completed: false, active: false },
            { label: "Завершено", completed: false },
          ];
          break;

        case "confirmed":
          // Для статуса "confirmed" показываем первые четыре шага как завершенные
          newSteps = [
            { label: "Заказ создан", completed: true },
            { label: "Музыкант получил уведомление", completed: true },
            { label: "Музыкант подтвердил участие", completed: true },
            { label: "Оплата подтверждена", completed: true },
            { label: "Выступление в процессе", completed: false, active: true },
            { label: "Завершено", completed: false },
          ];
          break;

        case "in-progress":
          // Для статуса "in-progress" показываем первые четыре шага как завершенные, пятый активен
          newSteps = [
            { label: "Заказ создан", completed: true },
            { label: "Музыкант получил уведомление", completed: true },
            { label: "Музыкант подтвердил участие", completed: true },
            { label: "Оплата подтверждена", completed: true },
            { label: "Выступление в процессе", completed: false, active: true },
            { label: "Завершено", completed: false },
          ];
          break;

        case "completed":
          // Для статуса "completed" все шаги завершены
          newSteps = [
            { label: "Заказ создан", completed: true },
            { label: "Музыкант получил уведомление", completed: true },
            { label: "Музыкант подтвердил участие", completed: true },
            { label: "Оплата подтверждена", completed: true },
            { label: "Выступление в процессе", completed: true },
            { label: "Завершено", completed: true },
          ];
          break;

        case "cancelled":
          // Для отмененных заказов показываем только первый шаг
          newSteps = [
            { label: "Заказ создан", completed: true },
            { label: "Музыкант получил уведомление", completed: false },
            { label: "Музыкант подтвердил участие", completed: false },
            { label: "Оплата подтверждена", completed: false },
            { label: "Выступление в процессе", completed: false, active: false },
            { label: "Завершено", completed: false },
          ];
          break;

        default:
          // По умолчанию показываем только первый шаг
          newSteps = [
            { label: "Заказ создан", completed: true },
            { label: "Музыкант получил уведомление", completed: false },
            { label: "Музыкант подтвердил участие", completed: false },
            { label: "Оплата подтверждена", completed: false },
            { label: "Выступление в процессе", completed: false, active: false },
            { label: "Завершено", completed: false },
          ];
      }

      setSteps(newSteps);
    };

    // Обновляем сразу
    updateSteps();

    // Для статуса "created" с createdAt обновляем каждую секунду, пока не пройдет 1 минута
    if (order.status === "created" && order.createdAt) {
      const interval = setInterval(() => {
        updateSteps();
      }, 1000);

      // Очищаем интервал через 1 минуту + 1 секунда
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 60 * 1000 + 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [order]);

  return (
    <div className="rounded-[16px] bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-foreground">Статус заказа</h3>
      
      <div className="space-y-1">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-3">
            {/* Icon */}
            <div className="relative flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step.completed
                    ? "bg-secondary"
                    : step.active
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              >
                {step.completed ? (
                  <Check size={14} className="text-secondary-foreground" />
                ) : (
                  <Circle
                    size={10}
                    className={step.active ? "text-primary-foreground fill-primary-foreground" : "text-muted-foreground"}
                  />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-8 w-[2px] ${step.completed ? "bg-secondary" : "bg-muted"}`} />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pb-6">
              <p
                className={`text-sm ${
                  step.completed || step.active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTimeline;
