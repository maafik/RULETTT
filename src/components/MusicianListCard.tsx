import { Star } from "lucide-react";
import StatusBadge from "./StatusBadge";
import ImageWithFallback from "./ImageWithFallback";

interface MusicianListCardProps {
  name: string;
  style: string;
  price: string;
  rating: number;
  status: "available" | "busy" | "online" | "unavailable";
  image?: string;
  onClick?: () => void;
}

const MusicianListCard = ({ name, style, price, rating, status, image, onClick }: MusicianListCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 rounded-[16px] bg-card p-4 text-left shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
    >
      {/* Photo */}
      <div className="h-[100px] w-[100px] flex-shrink-0 overflow-hidden rounded-[12px] bg-muted">
        <ImageWithFallback 
          src={image} 
          alt={name} 
          fallbackText={name.charAt(0)}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="mb-1 flex items-start justify-between gap-2">
            <h4 className="text-base font-bold text-foreground">{name}</h4>
            <StatusBadge status={status} />
          </div>
          <p className="mb-1 text-sm text-muted-foreground">{style}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-primary text-primary" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
          </div>
          <span className="text-base font-bold text-foreground">{price}</span>
        </div>
      </div>
    </button>
  );
};

export default MusicianListCard;
