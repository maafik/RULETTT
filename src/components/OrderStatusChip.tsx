interface OrderStatusChipProps {
  status: "created" | "pending" | "payment-pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  short?: boolean;
}

const OrderStatusChip = ({ status, short = false }: OrderStatusChipProps) => {
  const statusConfig = {
    created: {
      label: short ? "Создан" : "Заказ создан",
      className: "bg-muted text-muted-foreground border border-border",
    },
    pending: {
      label: short ? "Ожидает" : "Ожидает подтверждения",
      className: "bg-primary text-primary-foreground",
    },
    "payment-pending": {
      label: short ? "Оплата" : "Оплата подтверждена",
      className: "bg-blue-500 text-white",
    },
    confirmed: {
      label: short ? "Подтверждён" : "Подтверждён",
      className: "bg-secondary text-secondary-foreground",
    },
    "in-progress": {
      label: short ? "В процессе" : "В процессе",
      className: "bg-accent text-accent-foreground border border-border",
    },
    completed: {
      label: short ? "Выполнен" : "Выполнен",
      className: "bg-success text-success-foreground",
    },
    cancelled: {
      label: short ? "Отменён" : "Отменён",
      className: "bg-destructive text-destructive-foreground",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex h-9 items-center rounded-[16px] px-4 text-sm font-medium ${config.className}`}>
      {config.label}
    </div>
  );
};

export default OrderStatusChip;
