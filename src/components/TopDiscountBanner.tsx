import { X, Percent } from "lucide-react";

interface TopDiscountBannerProps {
  onClose?: () => void;
}

const TopDiscountBanner = ({ onClose }: TopDiscountBannerProps) => {
  return (
    <div className="rounded-[16px] bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-md flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Percent size={16} className="opacity-90" />
        <span>10% скидка на первый заказ</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть"
        className="ml-3 -mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 hover:bg-primary/30 active:scale-95 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default TopDiscountBanner;
