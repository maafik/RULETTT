import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Zap, DollarSign, Music, Mic, Users, Guitar, Music2, Drum, Headphones, Piano, Waves, Disc3, Music3 } from "lucide-react";
import { format } from "date-fns";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import StyleChip from "@/components/StyleChip";
import MusicianCard from "@/components/MusicianCard";
import PromoBanner from "@/components/PromoBanner";
import BottomNav from "@/components/BottomNav";
import CategoryGridCard from "@/components/CategoryGridCard";
import MusicianListCard from "@/components/MusicianListCard";
import FilterBottomSheet, { FilterData } from "@/components/FilterBottomSheet";
import MusicianDetailDialog from "@/components/MusicianDetailDialog";
import BookingDialog, { BookingData } from "@/components/BookingDialog";
import { useToast } from "@/hooks/use-toast";
import { createOrder, saveOrder } from "@/lib/orders";
import type { Musician, FavoriteMusician } from "@/types/musician";
import { FAVORITES_STORAGE_KEY } from "@/constants/storage";
import { musiciansData } from "@/data/musicians";
import { auth } from "@/lib/firebase";
import { saveOrderToFirebase, getUserProfile, getMusicianUidByName } from "@/lib/firebase-db";
import MusicianHomePage from "@/pages/MusicianHomePage";

const Index = () => {
  const musiciansRef = useRef<HTMLDivElement>(null);
  const djSectionRef = useRef<HTMLDivElement>(null);
  const hostsSectionRef = useRef<HTMLDivElement>(null);
  const filteredSectionRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterData | null>(null);
  const [isMusiciansSectionVisible, setIsMusiciansSectionVisible] = useState(false);
  const [shouldShowRecent, setShouldShowRecent] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Musician[]>([]);
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [isCategorySwitcherOpen, setIsCategorySwitcherOpen] = useState(false);
  const [favoriteMusicians, setFavoriteMusicians] = useState<FavoriteMusician[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const allMusicians = useMemo<Musician[]>(() => musiciansData, []);
  
  // Функции для работы с кэшем роли
  const getCachedRole = (uid: string | null): boolean | null => {
    if (typeof window === "undefined" || !uid) return null;
    try {
      const cachedUid = localStorage.getItem("user_role_cache_uid");
      const cachedRole = localStorage.getItem("user_role_cache");
      if (cachedUid === uid && cachedRole !== null) {
        return cachedRole === "musician";
      }
    } catch (error) {
      console.error("Ошибка при чтении кэша роли:", error);
    }
    return null;
  };

  const setCachedRole = (uid: string, isMusician: boolean) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("user_role_cache_uid", uid);
      localStorage.setItem("user_role_cache", isMusician ? "musician" : "client");
    } catch (error) {
      console.error("Ошибка при сохранении кэша роли:", error);
    }
  };

  const user = auth.currentUser;
  const cachedRole = getCachedRole(user?.uid || null);
  const [isMusician, setIsMusician] = useState<boolean>(cachedRole !== null ? cachedRole : false);

  // Проверяем роль пользователя при загрузке
  useEffect(() => {
    const checkRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Проверяем, изменился ли пользователь
        const cachedUid = typeof window !== "undefined" ? localStorage.getItem("user_role_cache_uid") : null;
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
          localStorage.removeItem("user_role_cache");
          localStorage.removeItem("user_role_cache_uid");
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
          localStorage.removeItem("user_role_cache");
          localStorage.removeItem("user_role_cache_uid");
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleQuickBooking = () => {
    setIsFilterOpen(true);
  };

  const handlePriceFilter = () => {
    const priceFilter: FilterData = {
      date: undefined,
      priceRange: [0, 10000],
      selectedTypes: [],
      searchQuery: "",
      nearby: false,
    };
    setFilters(priceFilter);
    scrollToFilteredSection();
  };

  const handleLiveInstruments = () => {
    const liveFilter: FilterData = {
      date: undefined,
      priceRange: [0, 100000],
      selectedTypes: ["Группа", "Инструменталист"],
      searchQuery: "",
      nearby: false,
    };
    setFilters(liveFilter);
    scrollToFilteredSection();
  };

  const handleBudgetBanner = () => {
    setIsFilterOpen(true);
  };

  const handleFreeThisWeek = () => {
    // Устанавливаем фильтр на текущую неделю и скроллим к результатам
    const weekFilter: FilterData = {
      date: new Date(), // Можно улучшить, установив дату начала недели
      priceRange: [0, 100000],
      selectedTypes: [],
      searchQuery: "",
      nearby: false,
    };
    setFilters(weekFilter);
    scrollToFilteredSection();
  };

  const categories = [
    { icon: MapPin, title: "Музыканты рядом", action: () => handleNearbyClick() },
    { icon: Zap, title: "Быстрая бронь", action: () => handleQuickBooking() },
    { icon: DollarSign, title: "До 10 000 ₽", action: () => handlePriceFilter() },
    { icon: Music, title: "Группы с живыми инструментами", action: () => handleLiveInstruments() },
  ];

  const styles = ["Рок", "Джаз", "Поп", "Каверы", "R&B"];

  const handleStyleClick = (style: string) => {
    // Фильтруем музыкантов по стилю
    const styleFilter: FilterData = {
      date: undefined,
      priceRange: [0, 100000],
      selectedTypes: [],
      searchQuery: style, // Используем поиск по стилю
      nearby: false,
    };
    setFilters(styleFilter);
    scrollToFilteredSection();
  };

  const handleCategoryClick = (categoryTitle: string) => {
    let selectedTypes: string[] = [];
    
    // Маппинг категорий к типам музыкантов
    switch (categoryTitle) {
      case "DJ":
        selectedTypes = ["DJ"];
        break;
      case "Ведущие":
        selectedTypes = ["Ведущий"];
        break;
      case "Cover band":
        selectedTypes = ["Cover band"];
        break;
      case "Инструменталисты":
        selectedTypes = ["Инструменталист"];
        break;
      case "Дуэты":
        selectedTypes = ["Дуэт"];
        break;
      case "Рок-группы":
        selectedTypes = ["Группа"];
        break;
      case "Электронщики":
        selectedTypes = ["DJ"];
        break;
      case "Пианисты":
        selectedTypes = ["Инструменталист"];
        break;
      default:
        selectedTypes = [];
    }

    const categoryFilter: FilterData = {
      date: undefined,
      priceRange: [0, 100000],
      selectedTypes,
      searchQuery: "",
      nearby: false,
    };
    
    setFilters(categoryFilter);
    scrollToFilteredSection();
  };

  const gridCategories = [
    { icon: Disc3, title: "DJ", onClick: () => handleCategoryClick("DJ") },
    { icon: Mic, title: "Ведущие", onClick: () => handleCategoryClick("Ведущие") },
    { icon: Users, title: "Cover band", onClick: () => handleCategoryClick("Cover band") },
    { icon: Guitar, title: "Инструменталисты", onClick: () => handleCategoryClick("Инструменталисты") },
    { icon: Music2, title: "Дуэты", onClick: () => handleCategoryClick("Дуэты") },
    { icon: Music, title: "Акустика", onClick: () => handleCategoryClick("Акустика") },
    { icon: Drum, title: "Рок-группы", onClick: () => handleCategoryClick("Рок-группы") },
    { icon: Headphones, title: "Электронщики", onClick: () => handleCategoryClick("Электронщики") },
    { icon: Piano, title: "Пианисты", onClick: () => handleCategoryClick("Пианисты") },
    { icon: Waves, title: "Джазовые музыканты", onClick: () => handleCategoryClick("Джазовые музыканты") },
  ];

  const djs = allMusicians.filter((musician) => musician.types.includes("DJ"));
  const hosts = allMusicians.filter((musician) => musician.types.includes("Ведущий"));

  const scrollToFilteredSection = () => {
    setTimeout(() => {
      if (filteredSectionRef.current) {
        const element = filteredSectionRef.current;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px offset для хедера с поиском
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  const handleNearbyClick = () => {
    const nearbyFilter: FilterData = {
      date: undefined,
      priceRange: [0, 100000],
      selectedTypes: [],
      searchQuery: "",
      nearby: true,
    };
    setFilters(nearbyFilter);
    scrollToFilteredSection();
  };

  const handleApplyFilters = (newFilters: FilterData) => {
    setFilters(newFilters);
    scrollToFilteredSection();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Применяем поиск как фильтр
    if (value.trim()) {
      const searchFilter: FilterData = {
        date: filters?.date,
        priceRange: filters?.priceRange || [0, 100000],
        selectedTypes: filters?.selectedTypes || [],
        searchQuery: value.trim(),
        nearby: filters?.nearby || false,
      };
      setFilters(searchFilter);
      scrollToFilteredSection();
    } else if (!filters?.date && !filters?.priceRange && filters?.selectedTypes?.length === 0 && !filters?.nearby) {
      // Если поиск пустой и нет других фильтров, сбрасываем фильтры
      setFilters(null);
    } else if (filters) {
      // Если есть другие фильтры, просто убираем поисковый запрос
      const updatedFilters: FilterData = {
        ...filters,
        searchQuery: "",
      };
      setFilters(updatedFilters);
    }
  };

  const handleMusicianClick = (musician: Musician) => {
    setSelectedMusician(musician);
    setIsDetailOpen(true);

    if (typeof window !== "undefined") {
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((item) => item.name !== musician.name);
        const updated = [musician, ...filtered].slice(0, 4);
        const names = updated.map((item) => item.name);
        localStorage.setItem("recentMusicians", JSON.stringify(names));
        return updated;
      });
    }
  };

  const mapToFavorite = (musician: Musician): FavoriteMusician => ({
    name: musician.name,
    style: musician.style,
    price: musician.price,
    rating: musician.rating,
    status: musician.status,
    image: musician.image,
  });

  const persistFavorites = (items: FavoriteMusician[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
  };

  const handleToggleFavorite = (musician: Musician) => {
    setFavoriteMusicians((prev) => {
      const exists = prev.some((fav) => fav.name === musician.name);
      const updated = exists ? prev.filter((fav) => fav.name !== musician.name) : [mapToFavorite(musician), ...prev];
      persistFavorites(updated);
      return updated;
    });
  };

  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      setSelectedMusician(null);
    }
  };

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
    const customerPhone = user?.phoneNumber || undefined; // Основной идентификатор при телефонной аутентификации

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
      {
        date: bookingData.date,
        eventType: bookingData.eventType,
        time: bookingData.time,
        endTime: bookingData.endTime,
        location: bookingData.location,
        comment: bookingData.comment,
      },
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

    setSelectedMusician(null);
  };

  const handleCategoryShortcut = (section: "musicians" | "dj" | "hosts") => {
    setIsCategorySwitcherOpen(false);
    const sectionMap = {
      musicians: musiciansRef,
      dj: djSectionRef,
      hosts: hostsSectionRef,
    };

    const targetRef = sectionMap[section];
    targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredMusicians = allMusicians.filter((musician) => {
    if (!filters) return true;

    // Фильтр по поисковому запросу (поиск в имени, стиле и тегах)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const nameMatch = musician.name.toLowerCase().includes(query);
      const styleMatch = musician.style.toLowerCase().includes(query);
      const tagsMatch = musician.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
      
      if (!nameMatch && !styleMatch && !tagsMatch) {
        return false;
      }
    }

    // Фильтр по цене
    if (musician.priceValue < filters.priceRange[0] || musician.priceValue > filters.priceRange[1]) {
      return false;
    }

    // Фильтр по типам
    if (filters.selectedTypes.length > 0) {
      const hasMatchingType = filters.selectedTypes.some((type) => musician.types.includes(type));
      if (!hasMatchingType) return false;
    }

    // Фильтр "рядом"
    if (filters.nearby && !musician.nearby) {
      return false;
    }

    return true;
  });

  const hasActiveFilters = Boolean(filters);
  const baseMusicians = allMusicians;
  const musiciansToShow = baseMusicians.slice(0, visibleCount);
  const hasMoreMusicians = visibleCount < baseMusicians.length;
  const featuredMusicians = hasActiveFilters ? filteredMusicians : allMusicians.slice(0, 4);
  const selectedIsFavorite = selectedMusician ? favoriteMusicians.some((fav) => fav.name === selectedMusician.name) : false;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, baseMusicians.length));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const visited = localStorage.getItem("hasVisitedHome");
    const storedRecent = localStorage.getItem("recentMusicians");

    if (!visited) {
      localStorage.setItem("hasVisitedHome", "true");
      return;
    }

    if (storedRecent) {
      try {
        const parsed: string[] = JSON.parse(storedRecent);
        const matched = parsed
          .map((name) => allMusicians.find((musician) => musician.name === name))
          .filter((musician): musician is Musician => Boolean(musician));

        if (matched.length > 0) {
          setRecentlyViewed(matched);
          setShouldShowRecent(true);
        }
      } catch (error) {
        console.error("Не удалось прочитать последние просмотренные", error);
      }
    }
  }, [allMusicians]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadFavorites = () => {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!stored) {
        setFavoriteMusicians([]);
        return;
      }

      try {
        const parsed: FavoriteMusician[] = JSON.parse(stored);
        setFavoriteMusicians(parsed);
      } catch (error) {
        console.error("Не удалось прочитать избранное", error);
        setFavoriteMusicians([]);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsMusiciansSectionVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Срабатывает когда видно хотя бы 10% секции
        rootMargin: "-100px 0px", // Учитываем отступ сверху
      }
    );

    if (musiciansRef.current) {
      observer.observe(musiciansRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Если пользователь музыкант, показываем специальную страницу
  if (isMusician) {
    return <MusicianHomePage />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header - Fixed */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm px-4 pt-4 pb-3"
        style={{ 
          paddingTop: `calc(1rem + env(safe-area-inset-top, 0px))`
        }}
      >
        <div className="mx-auto max-w-md">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="mx-auto max-w-md px-4 space-y-6 mt-2 pb-4"
        style={{ 
          paddingTop: `calc(4.4rem + env(safe-area-inset-top, 0px) - 10px)`
        }}
      >
        {/* Categories */}
        <section className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <div key={index} onClick={category.action}>
              <CategoryCard icon={category.icon} title={category.title} />
            </div>
          ))}
        </section>

        {/* Find by Style */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Найти по стилю</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {styles.map((style) => (
              <StyleChip key={style} label={style} onClick={() => handleStyleClick(style)} />
            ))}
          </div>
        </section>

        {/* Recent Musicians */}
        {shouldShowRecent && recentlyViewed.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Последние просмотренные</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentlyViewed.map((musician) => (
                <div key={musician.name} onClick={() => handleMusicianClick(musician)}>
                  <MusicianCard name={musician.name} style={musician.style} rating={musician.rating} image={musician.image} />
                </div>
            ))}
          </div>
        </section>
        )}

        {/* Banners */}
        <section className="space-y-3">
          <div onClick={handleBudgetBanner} className="cursor-pointer">
            <PromoBanner
              variant="yellow"
              text="Новый: подбор артистов по вашему бюджету"
            />
          </div>
          <div onClick={handleFreeThisWeek} className="cursor-pointer">
            <PromoBanner
              variant="purple"
              text="Музыканты, свободные на этой неделе"
            />
          </div>
        </section>

        {/* Categories Grid */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Категории</h2>
          <div className="grid grid-cols-2 gap-3">
            {gridCategories.map((category, index) => (
              <CategoryGridCard
                key={index}
                icon={category.icon}
                title={category.title}
                onClick={category.onClick}
              />
            ))}
          </div>
        </section>

        {/* Featured Artists */}
        <section ref={filteredSectionRef} className="rounded-[20px] border border-border bg-card/30 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">АРТИСТЫ</p>
              <h2 className="text-xl font-bold text-foreground">
                {hasActiveFilters ? "Подбор по фильтрам" : "Рекомендуем прямо сейчас"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? `Найдено ${filteredMusicians.length} ${filteredMusicians.length === 1 ? "музыкант" : "музыкантов"}`
                  : "Несколько вариантов, которые понравятся гостям"}
              </p>
            </div>
            {hasActiveFilters && (
              <div className="flex gap-3">
                <FilterBottomSheet 
                  onApplyFilters={handleApplyFilters} 
                  initialFilters={filters || undefined}
                >
                  <button
                    type="button"
                    className="text-sm font-medium text-primary transition hover:text-primary/80"
                  >
                    Изменить фильтр
                  </button>
                </FilterBottomSheet>
                <button
                  type="button"
                  onClick={() => setFilters(null)}
                  className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filters?.date && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Дата: {format(filters.date, "dd MMM")}
                </span>
              )}
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Бюджет: {filters?.priceRange[0].toLocaleString()}–{filters?.priceRange[1].toLocaleString()} ₽
              </span>
              {filters?.selectedTypes.map((type) => (
                <span key={type} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {type}
                </span>
              ))}
              {filters?.searchQuery && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Поиск: {filters.searchQuery}
                </span>
              )}
              {filters?.nearby && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">Рядом</span>
              )}
            </div>
          )}
          {featuredMusicians.length > 0 ? (
            <div className="space-y-3">
              {featuredMusicians.map((musician) => (
                <MusicianListCard
                  key={`${musician.name}-featured`}
                  name={musician.name}
                  style={musician.style}
                  price={musician.price}
                  rating={musician.rating}
                  status={musician.status}
                  image={musician.image}
                  onClick={() => handleMusicianClick(musician)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[16px] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              По выбранным фильтрам ничего не найдено
            </div>
          )}
        </section>

        {/* Musicians List */}
        <section ref={musiciansRef}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Музыканты</h2>
          </div>
          {musiciansToShow.length > 0 ? (
          <div className="space-y-3">
              {musiciansToShow.map((musician, index) => (
              <MusicianListCard
                key={index}
                name={musician.name}
                style={musician.style}
                price={musician.price}
                rating={musician.rating}
                status={musician.status}
                  image={musician.image}
                  onClick={() => handleMusicianClick(musician)}
              />
            ))}
          </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">По вашим фильтрам ничего не найдено</p>
            </div>
          )}
          {hasMoreMusicians && (
            <div className="pt-4 pb-16">
              <button
                onClick={handleLoadMore}
                className="w-full rounded-[16px] border border-border py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Показать дальше
              </button>
            </div>
          )}
        </section>

        {/* DJ Section */}
        {djs.length > 0 && (
          <section ref={djSectionRef}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">DJ</h2>
              <span className="text-sm text-muted-foreground">{djs.length}</span>
            </div>
            <div className="space-y-3">
              {djs.map((musician) => (
                <MusicianListCard
                  key={`${musician.name}-dj`}
                  name={musician.name}
                  style={musician.style}
                  price={musician.price}
                  rating={musician.rating}
                  status={musician.status}
                  image={musician.image}
                  onClick={() => handleMusicianClick(musician)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Hosts Section */}
        {hosts.length > 0 && (
          <section ref={hostsSectionRef}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Ведущие</h2>
              <span className="text-sm text-muted-foreground">{hosts.length}</span>
            </div>
            <div className="space-y-3">
              {hosts.map((musician) => (
                <MusicianListCard
                  key={`${musician.name}-host`}
                  name={musician.name}
                  style={musician.style}
                  price={musician.price}
                  rating={musician.rating}
                  status={musician.status}
                  image={musician.image}
                  onClick={() => handleMusicianClick(musician)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Fixed Bottom Button - появляется только в зоне музыканты */}
      {isMusiciansSectionVisible && (
        <div 
          className="fixed left-0 right-0 z-40 px-4 animate-in slide-in-from-bottom-4 duration-300"
          style={{ 
            bottom: `calc(7rem + env(safe-area-inset-bottom, 0px))`
          }}
        >
          <div className="mx-auto max-w-md">
            <FilterBottomSheet onApplyFilters={handleApplyFilters} initialFilters={filters || undefined}>
              <button className="w-full rounded-[20px] bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98]">
                Выбрать исполнителя
              </button>
            </FilterBottomSheet>
          </div>
        </div>
      )}

      {/* Filter Bottom Sheet для быстрой брони и подбора по бюджету */}
      <FilterBottomSheet 
        onApplyFilters={handleApplyFilters} 
        initialFilters={filters || undefined}
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      />

      {/* Floating category switcher */}
      {/* Floating category switcher removed per request */}

      <MusicianDetailDialog
        open={isDetailOpen}
        onOpenChange={handleDetailOpenChange}
        musician={selectedMusician}
        isFavorite={selectedIsFavorite}
        onToggleFavorite={() => {
          if (selectedMusician) {
            handleToggleFavorite(selectedMusician);
          }
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

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
