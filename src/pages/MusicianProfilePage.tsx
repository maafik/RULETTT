import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Music2, Star, Clock3, Tag, Mail, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "@/data/orders";
import { findOrderWithDefaults } from "@/lib/orders";
import BottomNav from "@/components/BottomNav";
import { getOrderById } from "@/lib/firebase-db";
import { getUserProfile } from "@/lib/firebase-db";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ImageWithFallback from "@/components/ImageWithFallback";

const fallbackGallery = (image?: string) => {
  if (image) return [image];
  return ["https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=600"];
};

const MusicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isMusician, setIsMusician] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleChecked, setIsRoleChecked] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setOrder(undefined);
        setIsLoading(false);
        setIsRoleChecked(true);
        return;
      }
      
      // Загружаем заказ и проверяем роль параллельно
      const [foundOrder, userIsMusician] = await Promise.all([
        (async () => {
          // Сначала ищем в локальных заказах
          let order = findOrderWithDefaults(id);
          
          // Если не нашли локально, ищем в Firestore
          if (!order) {
            try {
              const firebaseOrder = await getOrderById(id);
              if (firebaseOrder) {
                order = firebaseOrder as Order;
                console.log("✅ Заказ найден в Firestore:", firebaseOrder);
              }
            } catch (error) {
              console.error("Ошибка при поиске заказа в Firestore:", error);
            }
          }
          
          return order;
        })(),
        (async () => {
          const user = auth.currentUser;
          if (user) {
            try {
              const profile = await getUserProfile(user.uid);
              return profile?.role === "musician" || !!profile?.musicianName;
            } catch (error) {
              console.error("Ошибка при проверке роли пользователя:", error);
              return false;
            }
          }
          return false;
        })()
      ]);
      
      setOrder(foundOrder);
      setIsMusician(userIsMusician);
      setIsRoleChecked(true);
      setIsLoading(false);
    };

    loadData();
  }, [id]);

  const gallery = order?.gallery && order.gallery.length > 0 ? order.gallery : fallbackGallery(order?.image);

  const handleBack = () => {
    if (order) {
      navigate(`/order/${order.id}`);
    } else {
      navigate("/orders");
    }
  };

  // Определяем, что показывать: профиль музыканта или заказчика
  // Показываем только после проверки роли, чтобы избежать мелькания
  const showCustomerProfile = isRoleChecked && isMusician && order;
  const profileName = isRoleChecked 
    ? (showCustomerProfile 
        ? (order.customerName || order.customerEmail || "Заказчик")
        : (order?.artistName || "Профиль недоступен"))
    : "";
  const profileSubtitle = isRoleChecked && order
    ? (showCustomerProfile 
        ? (order.customerEmail || "Клиент")
        : (order?.style || ""))
    : "";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header 
        className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm"
        style={{ 
          paddingTop: `calc(1rem + env(safe-area-inset-top, 0px))`
        }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div>
            {isRoleChecked ? (
              <>
                <h1 className="text-xl font-semibold text-foreground">
                  {profileName}
                </h1>
                {order && profileSubtitle && <p className="text-sm text-muted-foreground">{profileSubtitle}</p>}
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-foreground">
                  &nbsp;
                </h1>
                <p className="text-sm text-muted-foreground">&nbsp;</p>
              </>
            )}
          </div>
        </div>
      </header>

      <main 
        className="mx-auto max-w-md px-4 py-4 space-y-5"
        style={{ 
          paddingTop: `calc(5.5rem + env(safe-area-inset-top, 0px) - 10px)`
        }}
      >
        {isLoading ? (
          <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Загрузка профиля...
          </div>
        ) : order && isRoleChecked ? (
          showCustomerProfile ? (
            // Профиль заказчика для музыкантов
            <div className="overflow-hidden rounded-[24px] border border-border bg-card">
              <div className="space-y-5 px-5 py-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold">
                      <User size={24} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      {order.customerName || "Заказчик"}
                    </h2>
                    {order.customerEmail && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail size={16} />
                        <span>{order.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-start gap-2 rounded-[16px] border border-border p-3">
                    <MapPin size={18} className="text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Локация заказа</p>
                      <p className="font-medium text-foreground">{order.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-[16px] border border-border p-3">
                    <Clock3 size={18} className="text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Дата и время</p>
                      <p className="font-medium text-foreground">{order.date} · {order.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-[16px] border border-border p-3">
                    <Music2 size={18} className="text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Формат выступления</p>
                      <p className="font-medium text-foreground">{order.format}</p>
                    </div>
                  </div>
                </div>

                {order.comment && (
                  <div className="rounded-[18px] bg-muted/50 p-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">Комментарий заказчика</p>
                    <p className="text-sm text-muted-foreground">{order.comment}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Профиль музыканта для клиентов
            <>
              <div className="overflow-hidden rounded-[24px] border border-border bg-card">
                <div className="aspect-video w-full bg-black">
                  {order.videoUrl ? (
                    <video
                      src={order.videoUrl}
                      controls
                      className="h-full w-full object-cover"
                      poster={gallery[0]}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
                      Видео недоступно
                    </div>
                  )}
                </div>

                <div className="space-y-5 px-5 py-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{order.artistName}</h2>
                      <p className="text-sm text-muted-foreground">{order.style}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-base font-semibold text-foreground">
                        <Star size={16} className="fill-primary text-primary" />
                        {order.rating.toFixed(1)}
                      </div>
                      <p className="text-sm text-muted-foreground">рейтинг</p>
                    </div>
                  </div>

                  <div className="rounded-[18px] bg-muted/60 p-4">
                    <p className="text-sm text-muted-foreground">Гонорар</p>
                    <p className="text-2xl font-bold text-foreground">{order.price}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2 rounded-[16px] border border-border p-3">
                      <MapPin size={18} className="text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Локация</p>
                        <p className="font-medium text-foreground">{order.city ?? order.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-[16px] border border-border p-3">
                      <Clock3 size={18} className="text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Опыт</p>
                        <p className="font-medium text-foreground">{order.experience ?? "По договоренности"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-[16px] border border-border p-3">
                      <Music2 size={18} className="text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Формат выступления</p>
                        <p className="font-medium text-foreground">{order.format}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-[16px] border border-border p-3">
                      <Tag size={18} className="text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Жанры</p>
                        <p className="font-medium text-foreground">
                          {order.tags && order.tags.length > 0 ? order.tags.join(", ") : order.style}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.description && (
                    <div className="rounded-[18px] bg-muted/50 p-4">
                      <p className="mb-2 text-sm font-semibold text-foreground">Описание</p>
                      <p className="text-sm text-muted-foreground">{order.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Галерея</h3>
                  <span className="text-sm text-muted-foreground">{gallery.length} фото</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((image, index) => (
                    <div key={`${image}-${index}`} className="h-24 overflow-hidden rounded-[14px] bg-muted">
                      <ImageWithFallback 
                        src={image} 
                        alt={`${order.artistName} фото ${index + 1}`} 
                        fallbackText={order.artistName.charAt(0)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )
        ) : (
          <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Профиль недоступен. Вернитесь к заказам и попробуйте снова.
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MusicianProfilePage;
