import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import MusicianListCard from "@/components/MusicianListCard";
import MusicianDetailDialog from "@/components/MusicianDetailDialog";
import BookingDialog, { BookingData } from "@/components/BookingDialog";
import { useToast } from "@/hooks/use-toast";
import { createOrder, saveOrder } from "@/lib/orders";
import type { FavoriteMusician, Musician } from "@/types/musician";
import { FAVORITES_STORAGE_KEY } from "@/constants/storage";
import { musiciansData } from "@/data/musicians";
import { auth } from "@/lib/firebase";
import { saveOrderToFirebase, getMusicianUidByName } from "@/lib/firebase-db";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<FavoriteMusician[]>([]);
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { toast } = useToast();

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

  const handleBookClick = () => {
    setIsDetailOpen(false);
    setIsBookingOpen(true);
  };

  const handleBookingConfirm = async (bookingData: BookingData) => {
    if (!selectedMusician) return;

    const user = auth.currentUser;
    const customerUid = user?.uid;
    const customerEmail = user?.email || undefined;
    const customerName = user?.displayName || undefined;
    const customerPhone = user?.phoneNumber || undefined;

    const order = createOrder(
      {
        name: selectedMusician.name,
        style: selectedMusician.style,
        price: selectedMusician.price,
        rating: selectedMusician.rating,
        image: selectedMusician.image,
        videoUrl: selectedMusician.videoUrl,
        gallery: selectedMusician.gallery,
        description: selectedMusician.description,
        city: selectedMusician.city,
        experience: selectedMusician.experience,
        tags: selectedMusician.tags,
      },
      bookingData,
      customerUid,
      customerEmail,
      customerName,
      customerPhone
    );

    // Сохраняем в localStorage для локального доступа
    saveOrder(order);

    // Сохраняем в Firebase для доступа из других устройств
    let firebaseError = null;
    if (customerUid) {
      try {
        const firebaseOrderId = await saveOrderToFirebase(order, customerUid, customerEmail, customerName, customerPhone);
        if (!firebaseOrderId) {
          firebaseError = "Не удалось сохранить заказ в облако";
        } else {
          // Отправляем уведомление музыканту о новом заказе
          try {
            const { notifyOrderCreated } = await import("@/lib/notifications");
            const musicianUid = await getMusicianUidByName(selectedMusician.name);
            
            if (musicianUid) {
              await notifyOrderCreated(
                musicianUid,
                firebaseOrderId,
                customerName || customerEmail || "Клиент",
                selectedMusician.name,
                customerPhone || null,
                customerEmail || null
              );
            }
          } catch (notifError) {
            console.error("Ошибка при отправке уведомления:", notifError);
            // Не блокируем создание заказа из-за ошибки уведомления
          }
        }
      } catch (error: any) {
        console.error("Ошибка при сохранении заказа в Firebase:", error);
        firebaseError = error.message || "Ошибка при сохранении заказа";
      }
    } else {
      console.warn("Не удалось получить UID пользователя для сохранения заказа");
      firebaseError = "Пользователь не авторизован";
    }

    if (firebaseError) {
      toast({
        title: "Заказ создан локально",
        description: `Заказ сохранен локально, но не удалось сохранить в облако: ${firebaseError}. Проверьте консоль для деталей.`,
        variant: "destructive",
        duration: 7000,
      });
    } else {
      toast({
        title: "Заказ создан",
        description: "В течение 30 минут статус будет в оформлении. Просмотреть заказ можно в разделе 'Заказы'.",
        duration: 5000,
      });
    }

    setIsBookingOpen(false);
    setSelectedMusician(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header 
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm"
        style={{ 
          paddingTop: `calc(1rem + env(safe-area-inset-top, 0px))`
        }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Heart size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Избранное</h1>
        </div>
      </header>

      <main 
        className="mx-auto max-w-md px-4 py-8"
        style={{ 
          paddingTop: `calc(5.5rem + env(safe-area-inset-top, 0px) - 10px)`
        }}
      >
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
        onBook={handleBookClick}
      />

      <BookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        musician={selectedMusician ? {
          name: selectedMusician.name,
          style: selectedMusician.style,
          price: selectedMusician.price,
          image: selectedMusician.image,
        } : null}
        onConfirm={handleBookingConfirm}
      />

      <BottomNav />
    </div>
  );
};

export default FavoritesPage;
