import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import ImageWithFallback from "@/components/ImageWithFallback";

interface PhotoGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  startIndex?: number;
  title?: string;
  fallbackText?: string;
}

const PhotoGalleryDialog = ({
  open,
  onOpenChange,
  images,
  startIndex = 0,
  title = "Галерея",
  fallbackText = "",
}: PhotoGalleryDialogProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeStartIndex = useMemo(() => {
    if (!images || images.length === 0) return 0;
    const idx = Math.floor(startIndex);
    if (idx < 0) return 0;
    if (idx >= images.length) return images.length - 1;
    return idx;
  }, [images, startIndex]);

  useEffect(() => {
    if (!open) return;
    setCurrentIndex(safeStartIndex);
  }, [open, safeStartIndex]);

  useEffect(() => {
    if (!carouselApi) return;

    const update = () => {
      try {
        setCurrentIndex(carouselApi.selectedScrollSnap());
      } catch {
        // ignore
      }
    };

    update();
    carouselApi.on("select", update);
    carouselApi.on("reInit", update);

    return () => {
      carouselApi.off("select", update);
      carouselApi.off("reInit", update);
    };
  }, [carouselApi]);

  const carouselKey = useMemo(() => {
    return `${open ? "open" : "closed"}-${safeStartIndex}-${images.length}`;
  }, [open, safeStartIndex, images.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[85vh] rounded-[24px] border p-0 overflow-hidden flex flex-col bg-black">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-4 pb-4">
          <Carousel
            key={carouselKey}
            setApi={setCarouselApi}
            opts={{
              startIndex: safeStartIndex,
              loop: images.length > 1,
            }}
            className="h-full"
          >
            <CarouselContent className="h-full -ml-0">
              {images.map((src, index) => (
                <CarouselItem key={`${src}-${index}`} className="h-full pl-0">
                  <div className="flex h-full items-center justify-center">
                    <ImageWithFallback
                      src={src}
                      alt={`${title} ${index + 1}`}
                      fallbackText={fallbackText}
                      className="max-h-full w-full object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {images.length > 1 && (
              <>
                <CarouselPrevious
                  variant="secondary"
                  className="left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                />
                <CarouselNext
                  variant="secondary"
                  className="right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                />
              </>
            )}
          </Carousel>

          {images.length > 1 && (
            <div className="mt-3 text-center text-xs text-white/70">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoGalleryDialog;
