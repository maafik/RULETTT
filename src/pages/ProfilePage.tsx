import { User, Settings, ShoppingBag, Heart, Bell, HelpCircle, LogOut, Phone, Mail, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { getUserProfile, getMusicianName, createOrUpdateUserProfile } from "@/lib/firebase-db";
import { musiciansData } from "@/data/musicians";
import type { Musician } from "@/types/musician";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [musicianData, setMusicianData] = useState<Musician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMusician, setIsMusician] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const [userCity, setUserCity] = useState<string>("Москва");

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email || "");
        setUserDisplayName(user.displayName || "");
        
        try {
          // Проверяем, является ли пользователь музыкантом
          const profile = await getUserProfile(user.uid);
          const userIsMusician = profile?.role === "musician" || !!profile?.musicianName;
          setIsMusician(userIsMusician);
          
          // Устанавливаем город из профиля или по умолчанию
          setUserCity(profile?.city || "Москва");
          
          // Если профиля нет, создаем его с городом по умолчанию
          if (!profile || !profile.city) {
            await createOrUpdateUserProfile(user.uid, {
              role: userIsMusician ? "musician" : "customer",
              city: "Москва",
            });
          }
          
          if (profile?.musicianName) {
            // Находим данные музыканта
            const musician = musiciansData.find((m) => m.name === profile.musicianName);
            if (musician) {
              setMusicianData(musician);
            }
          }
        } catch (error) {
          console.error("Ошибка при загрузке профиля:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const allMenuItems = [
    { icon: ShoppingBag, label: "Мои заказы", path: "/orders", color: "text-blue-500" },
    { icon: Heart, label: "Избранное", path: "/favorites", color: "text-red-500" },
    { icon: Bell, label: "Уведомления", path: "/notifications", color: "text-orange-500" },
    { icon: Settings, label: "Настройки", path: "/settings", color: "text-gray-500" },
    { icon: HelpCircle, label: "Помощь и поддержка", path: "/help", color: "text-purple-500" },
  ];

  // Для музыкантов убираем "Избранное"
  const menuItems = isMusician
    ? allMenuItems.filter((item) => item.label !== "Избранное")
    : allMenuItems;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-md px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Профиль</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md px-4 py-4 space-y-6">
        {/* Profile Card */}
        {isLoading ? (
          <Card className="rounded-[20px] border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">Загрузка...</div>
            </CardContent>
          </Card>
        ) : musicianData ? (
          <>
            <Card className="rounded-[20px] border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={musicianData.image} alt={musicianData.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold">
                      {musicianData.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="mb-1 text-xl font-bold text-foreground">{musicianData.name}</h2>
                    <p className="mb-2 text-sm text-muted-foreground">{musicianData.style}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {userEmail && (
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{userEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Phone size={12} />
                        <span>{musicianData.experience} опыта</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="rounded-[20px] border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Город</p>
                    <p className="text-sm text-muted-foreground">{musicianData.city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price */}
            <Card className="rounded-[20px] border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <DollarSign size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Стоимость</p>
                    <p className="text-sm text-muted-foreground">{musicianData.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="rounded-[20px] border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" alt={userDisplayName || "Пользователь"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold">
                      {userDisplayName ? userDisplayName.split(" ").map((n) => n[0]).join("").slice(0, 2) : "П"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="mb-1 text-xl font-bold text-foreground">{userDisplayName || "Пользователь"}</h2>
                    <p className="mb-2 text-sm text-muted-foreground">Клиент</p>
                    {userEmail && (
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{userEmail}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="rounded-[20px] border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Город</p>
                    <p className="text-sm text-muted-foreground">{userCity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="cursor-pointer rounded-[16px] border-0 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
              onClick={() => item.path !== "#" && navigate(item.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="flex-1 text-base font-medium text-foreground">{item.label}</span>
                  <div className="text-muted-foreground">›</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Logout */}
        <Card
          className="cursor-pointer rounded-[16px] border-0 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
          onClick={async () => {
            if (isSigningOut) return;
            setIsSigningOut(true);
            try {
              await signOut(auth);
              navigate("/login", { replace: true });
            } catch (error) {
              console.error("Не удалось выйти из аккаунта", error);
              setIsSigningOut(false);
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-red-500">
                <LogOut size={18} />
              </div>
              <span className="flex-1 text-base font-medium text-red-500">
                {isSigningOut ? "Выходим..." : "Выйти"}
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ProfilePage;

