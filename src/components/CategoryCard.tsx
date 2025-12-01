import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
}

const CategoryCard = ({ icon: Icon, title }: CategoryCardProps) => {
  return (
    <button className="flex h-16 items-center gap-3 rounded-[14px] bg-card px-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon size={20} className="text-primary" />
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </button>
  );
};

export default CategoryCard;
