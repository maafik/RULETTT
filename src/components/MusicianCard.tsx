import { Star } from "lucide-react";

interface MusicianCardProps {
  name: string;
  style: string;
  rating: number;
  image?: string;
}

const MusicianCard = ({ name, style, rating, image }: MusicianCardProps) => {
  return (
    <div className="flex-shrink-0 w-[140px]">
      <div className="relative mb-2 h-[100px] w-full overflow-hidden rounded-[12px] bg-muted">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <span className="text-2xl font-bold text-muted-foreground">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <h4 className="mb-1 truncate text-sm font-medium text-foreground">{name}</h4>
      <p className="mb-1 truncate text-xs text-muted-foreground">{style}</p>
      <div className="flex items-center gap-1">
        <Star size={12} className="fill-primary text-primary" />
        <span className="text-xs font-medium text-foreground">{rating}</span>
      </div>
    </div>
  );
};

export default MusicianCard;
