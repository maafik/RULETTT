import { MessageCircle, ChevronRight, Star } from "lucide-react";

interface MusicianOrderCardProps {
  name: string;
  style: string;
  rating: number;
  price: string;
  image?: string;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const MusicianOrderCard = ({ name, style, rating, price, image, onMessage, onViewProfile }: MusicianOrderCardProps) => {
  return (
    <div className="rounded-[16px] bg-card p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Photo */}
        <div className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-[12px] bg-muted">
          {image ? (
            <img src={image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <span className="text-xl font-bold text-muted-foreground">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="mb-1 text-base font-semibold text-foreground">{name}</h3>
          <p className="mb-1 text-sm text-muted-foreground">{style}</p>
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-primary text-primary" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{price}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onMessage}
          className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-secondary py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90 active:scale-[0.98]"
        >
          <MessageCircle size={18} />
          Написать
        </button>
        <button
          onClick={onViewProfile}
          className="flex items-center justify-center rounded-[14px] border border-border bg-card px-4 py-3 transition-all hover:bg-accent active:scale-[0.98]"
        >
          <ChevronRight size={18} className="text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default MusicianOrderCard;
