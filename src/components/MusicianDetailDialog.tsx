import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Music, Clock3, Heart } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";

interface MusicianDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  musician: {
    name: string;
    style: string;
    rating: number;
    price: string;
    description: string;
    city: string;
    experience: string;
    videoUrl?: string;
    gallery?: string[];
    tags?: string[];
    image?: string;
  } | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBook?: () => void;
}

const MusicianDetailDialog = ({ open, onOpenChange, musician, isFavorite, onToggleFavorite, onBook }: MusicianDetailDialogProps) => {
  const scrollPositionRef = useRef<number>(0);

  // Сохраняем позицию скролла при открытии диалога
  useEffect(() => {
    if (open) {
      // Сохраняем текущую позицию скролла
      scrollPositionRef.current = window.scrollY || document.documentElement.scrollTop;
    } else {
      // Восстанавливаем позицию скролла при закрытии
      // Используем небольшую задержку, чтобы убедиться, что диалог закрыт
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
      }, 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-t-[24px] rounded-b-none border-0 p-0 fixed bottom-0 left-[50%] translate-x-[-50%] translate-y-0 top-auto h-[100vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom flex flex-col [&_button.absolute]:text-white [&_button.absolute]:hover:text-white [&_button.absolute]:opacity-90 [&_button.absolute:hover]:opacity-100">
        {musician ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Video */}
            <div className="aspect-video w-full flex-shrink-0 overflow-hidden rounded-t-[24px] bg-black">
              {musician.videoUrl ? (
                <video
                  src={musician.videoUrl}
                  controls
                  className="h-full w-full object-cover"
                  poster={musician.gallery?.[0]}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white">Видео недоступно</div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-5 px-5 pt-6 pb-6">
              <DialogHeader className="text-left">
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-2xl font-bold text-foreground">{musician.name}</DialogTitle>
                  <button
                    type="button"
                    onClick={onToggleFavorite}
                    aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                    aria-pressed={isFavorite}
                    className={`rounded-full border p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isFavorite ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Heart size={20} className={isFavorite ? "fill-current text-primary" : "text-current"} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Music size={16} />
                  <span>{musician.style}</span>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Star size={14} className="fill-primary text-primary" />
                  {musician.rating}
                </div>
                <div className="text-base font-semibold text-foreground">{musician.price}</div>
              </div>

              {/* Tags */}
              {musician.tags && musician.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {musician.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Info blocks */}
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 rounded-[14px] bg-muted/50 p-3">
                  <MapPin size={16} className="text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Город</p>
                    <p className="font-medium text-foreground">{musician.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-[14px] bg-muted/50 p-3">
                  <Clock3 size={16} className="text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Опыт</p>
                    <p className="font-medium text-foreground">{musician.experience}</p>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              {musician.gallery && musician.gallery.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-foreground">Галерея</p>
                  <div className="grid grid-cols-3 gap-2">
                    {musician.gallery.map((image, index) => (
                      <div key={index} className="h-20 overflow-hidden rounded-[12px] bg-muted">
                        <ImageWithFallback 
                          src={image} 
                          alt={`${musician.name} фото ${index + 1}`} 
                          fallbackText={musician.name.charAt(0)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Описание</p>
                <p className="text-sm text-muted-foreground">{musician.description}</p>
              </div>

              {/* Actions */}
              <div className="pt-4">
                <Button 
                  className="h-[50px] w-full rounded-[16px] text-base font-semibold"
                  onClick={onBook}
                >
                  Забронировать выступление
                </Button>
              </div>
              </div>
            </div>
            
            {/* Пустое пространство внизу */}
            <div className="h-20 flex-shrink-0"></div>
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">Выберите музыканта</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MusicianDetailDialog;

