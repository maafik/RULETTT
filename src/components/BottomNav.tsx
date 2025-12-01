import { Home, Heart, ShoppingBag, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firebase-db";

const ROLE_CACHE_KEY = "user_role_cache";
const ROLE_CACHE_UID_KEY = "user_role_cache_uid";

// Получить кэшированную роль
const getCachedRole = (uid: string | null): boolean | null => {
  if (typeof window === "undefined" || !uid) return null;
  try {
    const cachedUid = localStorage.getItem(ROLE_CACHE_UID_KEY);
    const cachedRole = localStorage.getItem(ROLE_CACHE_KEY);
    if (cachedUid === uid && cachedRole !== null) {
      return cachedRole === "musician";
    }
  } catch (error) {
    console.error("Ошибка при чтении кэша роли:", error);
  }
  return null;
};

// Сохранить роль в кэш
const setCachedRole = (uid: string, isMusician: boolean) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROLE_CACHE_UID_KEY, uid);
    localStorage.setItem(ROLE_CACHE_KEY, isMusician ? "musician" : "client");
  } catch (error) {
    console.error("Ошибка при сохранении кэша роли:", error);
  }
};

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;
  // Используем кэш для немедленного отображения правильного меню
  const [isMusician, setIsMusician] = useState<boolean>(() => {
    const cached = getCachedRole(user?.uid || null);
    return cached !== null ? cached : false; // По умолчанию клиент, если кэша нет
  });

  useEffect(() => {
    const checkRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Проверяем, изменился ли пользователь
        const cachedUid = typeof window !== "undefined" ? localStorage.getItem(ROLE_CACHE_UID_KEY) : null;
        if (cachedUid !== currentUser.uid) {
          // Пользователь изменился, сбрасываем кэш
          setIsMusician(false);
        }
        
        try {
          const profile = await getUserProfile(currentUser.uid);
          const userIsMusician = profile?.role === "musician" || !!profile?.musicianName;
          setIsMusician(userIsMusician);
          setCachedRole(currentUser.uid, userIsMusician); // Сохраняем в кэш
        } catch (error) {
          console.error("Ошибка при проверке роли:", error);
          setIsMusician(false);
          if (currentUser.uid) {
            setCachedRole(currentUser.uid, false);
          }
        }
      } else {
        setIsMusician(false);
        // Очищаем кэш при выходе
        if (typeof window !== "undefined") {
          localStorage.removeItem(ROLE_CACHE_KEY);
          localStorage.removeItem(ROLE_CACHE_UID_KEY);
        }
      }
    };
    
    checkRole();
    
    // Слушаем изменения аутентификации
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkRole();
      } else {
        setIsMusician(false);
        if (typeof window !== "undefined") {
          localStorage.removeItem(ROLE_CACHE_KEY);
          localStorage.removeItem(ROLE_CACHE_UID_KEY);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Для музыкантов: Главная, Заказы, Профиль
  // Для клиентов: Главная, Избранное, Заказы, Профиль
  const navItems = isMusician
    ? [
        { icon: Home, label: "Главная", path: "/", active: location.pathname === "/" },
        {
          icon: ShoppingBag,
          label: "Заказы",
          path: "/orders",
          active: location.pathname === "/orders" || location.pathname.startsWith("/order/"),
        },
        { icon: User, label: "Профиль", path: "/profile", active: location.pathname === "/profile" },
      ]
    : [
        { icon: Home, label: "Главная", path: "/", active: location.pathname === "/" },
        { icon: Heart, label: "Избранное", path: "/favorites", active: location.pathname === "/favorites" },
        {
          icon: ShoppingBag,
          label: "Заказы",
          path: "/orders",
          active: location.pathname === "/orders" || location.pathname.startsWith("/order/"),
        },
        { icon: User, label: "Профиль", path: "/profile", active: location.pathname === "/profile" },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background px-4 pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 py-2 transition-colors"
          >
            <item.icon
              size={24}
              className={item.active ? "text-primary" : "text-muted-foreground"}
            />
            <span
              className={`text-xs ${
                item.active ? "font-medium text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
