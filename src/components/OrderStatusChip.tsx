interface OrderStatusChipProps {
  status: "created" | "pending" | "payment-pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
}

const OrderStatusChip = ({ status }: OrderStatusChipProps) => {
  const statusConfig = {
    created: {
      label: "Заказ создан",
      className: "bg-muted text-muted-foreground border border-border",
    },
    pending: {
      label: "Ожидает подтверждения",
      className: "bg-primary text-primary-foreground",
    },
    "payment-pending": {
      label: "Оплата подтверждена",
      className: "bg-blue-500 text-white",
    },
    confirmed: {
      label: "Подтверждён",
      className: "bg-secondary text-secondary-foreground",
    },
    "in-progress": {
      label: "В процессе",
      className: "bg-accent text-accent-foreground border border-border",
    },
    completed: {
      label: "Выполнен",
      className: "bg-success text-success-foreground",
    },
    cancelled: {
      label: "Отменён",
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
