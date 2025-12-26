import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Music, Clock3, Heart } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import PhotoGalleryDialog from "@/components/PhotoGalleryDialog";

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

const getEmbedUrl = (url: string): string => {
  const raw = url.trim();
  if (!raw) return "";

  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (host.endsWith("rutube.ru")) {
      const match = u.pathname.match(/\/video\/([a-f0-9]{16,})\/?/i);
      if (match?.[1]) return `https://rutube.ru/play/embed/${match[1]}`;
    }

    if (host === "vkvideo.ru" || host.endsWith("vk.com")) {
      const m1 = u.pathname.match(/\/(?:video|clip)(-?\d+)_([0-9]+)\/?/i);
      if (m1?.[1] && m1?.[2]) {
        const base = host === "vkvideo.ru" ? "https://vkvideo.ru" : "https://vk.com";
        return `${base}/video_ext.php?oid=${m1[1]}&id=${m1[2]}&hd=2`;
      }
    }

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return "";
  }

  return "";
};

const withAutoplay = (embedUrl: string): string => {
  try {
    const u = new URL(embedUrl);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    u.searchParams.set("autoplay", "1");

    if (host.endsWith("youtube.com")) {
      u.searchParams.set("mute", "1");
      u.searchParams.set("playsinline", "1");
    }

    return u.toString();
  } catch {
    return embedUrl;
  }
};

const MusicianDetailDialog = ({ open, onOpenChange, musician, isFavorite, onToggleFavorite, onBook }: MusicianDetailDialogProps) => {
  const scrollPositionRef = useRef<number>(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const baseEmbedUrl = musician?.videoUrl ? getEmbedUrl(musician.videoUrl) : "";
  const embedUrl = baseEmbedUrl ? withAutoplay(baseEmbedUrl) : "";

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
      <DialogContent className="max-w-md max-h-[85vh] rounded-[24px] border p-0 overflow-hidden flex flex-col">
        {musician ? (
          <div className="flex flex-col overflow-hidden">
            {/* Video - компактный */}
            <div className="aspect-video w-full flex-shrink-0 overflow-hidden rounded-t-[24px] bg-black">
              {musician.videoUrl && embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={`${musician.name} видео`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                musician.image ? (
                  <ImageWithFallback 
                    src={musician.image} 
                    alt={musician.name} 
                    fallbackText={musician.name.charAt(0)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    {musician.name.charAt(0)}
                  </div>
                )
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 px-5 pt-4 pb-4">
              <DialogHeader className="text-left pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl font-bold text-foreground truncate">{musician.name}</DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Music size={14} />
                      <span>{musician.style}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleFavorite}
                    aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                    aria-pressed={isFavorite}
                    className={`flex-shrink-0 rounded-full border p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isFavorite ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Heart size={18} className={isFavorite ? "fill-current text-primary" : "text-current"} />
                  </button>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
                  <Star size={12} className="fill-primary text-primary" />
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

              {/* Info blocks - компактные */}
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 rounded-[12px] bg-muted/50 p-2.5">
                  <MapPin size={14} className="text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">Город</p>
                    <p className="font-medium text-foreground text-sm truncate">{musician.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-[12px] bg-muted/50 p-2.5">
                  <Clock3 size={14} className="text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">Опыт</p>
                    <p className="font-medium text-foreground text-sm truncate">{musician.experience}</p>
                  </div>
                </div>
              </div>

              {/* Gallery - компактная */}
              {musician.gallery && musician.gallery.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-foreground">Галерея</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {musician.gallery.slice(0, 6).map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setGalleryStartIndex(index);
                          setIsGalleryOpen(true);
                        }}
                        className="h-16 overflow-hidden rounded-[10px] bg-muted"
                      >
                        <ImageWithFallback 
                          src={image} 
                          alt={`${musician.name} фото ${index + 1}`} 
                          fallbackText={musician.name.charAt(0)}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {musician.gallery && musician.gallery.length > 0 && (
                <PhotoGalleryDialog
                  open={isGalleryOpen}
                  onOpenChange={setIsGalleryOpen}
                  images={musician.gallery}
                  startIndex={galleryStartIndex}
                  title={musician.name}
                  fallbackText={musician.name.charAt(0)}
                />
              )}

              {/* Description - компактное */}
              <div className="space-y-2">
                <p className="mb-1.5 text-xs font-semibold text-foreground">Описание</p>
                {(() => {
                  const desc = musician.description || "";
                  const cutoff = Math.ceil(desc.length * 0.7);
                  const isLong = desc.length > cutoff && desc.length > 180; // избегаем обрезки коротких текстов
                  const displayText = isLong && !showFullDescription ? `${desc.slice(0, cutoff).trimEnd()}…` : desc;
                  return (
                    <>
                      <p className="text-xs text-muted-foreground whitespace-pre-line">{displayText}</p>
                      {isLong && (
                        <button
                          type="button"
                          className="text-xs text-primary underline"
                          onClick={() => setShowFullDescription((prev) => !prev)}
                        >
                          {showFullDescription ? "Скрыть" : "Читать весь текст"}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
              </div>
            </div>
            
            {/* Кнопка внизу - статичная */}
            <div className="border-t border-border bg-background p-4 pt-3">
              <Button 
                className="h-[44px] w-full rounded-[16px] text-base font-semibold"
                onClick={onBook}
              >
                Забронировать выступление
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">Выберите музыканта</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MusicianDetailDialog;

