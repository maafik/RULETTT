interface StatusBadgeProps {
  status: "available" | "busy" | "online" | "unavailable";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    available: {
      label: "Свободен",
      className: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    busy: {
      label: "Занят",
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    },
    online: {
      label: "На связи",
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    unavailable: {
      label: "Недоступен",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
