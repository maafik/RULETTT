import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import MusicianListCard from "@/components/MusicianListCard";
import MusicianDetailDialog from "@/components/MusicianDetailDialog";
import type { FavoriteMusician, Musician } from "@/types/musician";
import { FAVORITES_STORAGE_KEY } from "@/constants/storage";
import { musiciansData } from "@/data/musicians";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<FavoriteMusician[]>([]);
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadFavorites = () => {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!stored) {
        setFavorites([]);
        return;
      }

      try {
        const parsed: FavoriteMusician[] = JSON.parse(stored);
        setFavorites(parsed);
      } catch (error) {
        console.error("Не удалось загрузить избранное", error);
        setFavorites([]);
      }
    };

    loadFavorites();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_STORAGE_KEY) {
        loadFavorites();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isEmpty = favorites.length === 0;

  const handleOpenDetail = (fav: FavoriteMusician) => {
    const fullMusician = musiciansData.find((musician) => musician.name === fav.name);
    if (fullMusician) {
      setSelectedMusician(fullMusician);
    } else {
      // Fallback если в справочнике нет полного описания
      setSelectedMusician({
        name: fav.name,
        style: fav.style,
        price: fav.price,
        priceValue: 0,
        rating: fav.rating,
        status: fav.status,
        types: [],
        nearby: false,
        description: "",
        videoUrl: "",
        gallery: [],
        city: "",
        experience: "",
        image: fav.image,
        tags: [],
      });
    }
    setIsDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      setSelectedMusician(null);
    }
  };

  const isFavorite = (musicianName: string) =>
    favorites.some((fav) => fav.name === musicianName);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Heart size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Избранное</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Heart size={42} className="text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Здесь пока пусто</h2>
            <p className="text-sm text-muted-foreground">
              Вы ещё не добавили артистов в избранное. Сохраняйте понравившихся, чтобы быстро находить их позже.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((musician) => (
              <MusicianListCard
                key={musician.name}
                name={musician.name}
                style={musician.style}
                price={musician.price}
                rating={musician.rating}
                status={musician.status}
                image={musician.image}
                onClick={() => handleOpenDetail(musician)}
              />
            ))}
          </div>
        )}
      </main>

      <MusicianDetailDialog
        open={isDetailOpen}
        onOpenChange={handleDetailOpenChange}
        musician={selectedMusician}
        isFavorite={selectedMusician ? isFavorite(selectedMusician.name) : false}
        onToggleFavorite={() => {
          if (!selectedMusician) return;
          setFavorites((prev) => {
            const exists = prev.some((fav) => fav.name === selectedMusician.name);
            let updated: FavoriteMusician[];

            if (exists) {
              updated = prev.filter((fav) => fav.name !== selectedMusician.name);
            } else {
              updated = [
                {
                  name: selectedMusician.name,
                  style: selectedMusician.style,
                  price: selectedMusician.price,
                  rating: selectedMusician.rating,
                  status: selectedMusician.status,
                  image: selectedMusician.image,
                },
                ...prev,
              ];
            }

            if (typeof window !== "undefined") {
              localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
            }

            return updated;
          });
        }}
      />

      <BottomNav />
    </div>
  );
};

export default FavoritesPage;
