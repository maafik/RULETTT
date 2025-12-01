import { Star } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";

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
        <ImageWithFallback 
          src={image} 
          alt={name} 
          fallbackText={name.charAt(0)}
          className="h-full w-full object-cover"
        />
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
