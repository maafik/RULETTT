import { LucideIcon } from "lucide-react";

interface CategoryGridCardProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}

const CategoryGridCard = ({ icon: Icon, title, onClick }: CategoryGridCardProps) => {
  return (
    <button 
      onClick={onClick}
      className="flex h-[90px] w-full flex-col items-center justify-center gap-2 rounded-[16px] bg-card transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon size={20} className="text-primary" />
      </div>
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </button>
  );
};

export default CategoryGridCard;
