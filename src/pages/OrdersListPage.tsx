import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import OrderStatusChip from "@/components/OrderStatusChip";
import { getOrdersWithDefaults } from "@/lib/orders";
import type { Order } from "@/data/orders";
import { auth } from "@/lib/firebase";
import { getUserProfile, getOrdersForMusician, getOrdersForCustomer, subscribeToMusicianOrders } from "@/lib/firebase-db";

const OrdersListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMusician, setIsMusician] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleChecked, setIsRoleChecked] = useState(false);

  const loadOrders = async () => {
    const user = auth.currentUser;
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      // Проверяем, является ли пользователь музыкантом
      const profile = await getUserProfile(user.uid);
      const userIsMusician = profile?.role === "musician" || !!profile?.musicianName;
      setIsMusician(userIsMusician);

      if (userIsMusician) {
        // Если пользователь - музыкант, загружаем заказы, где он исполнитель
        const musicianOrders = await getOrdersForMusician(user.uid);
        setOrders(musicianOrders as Order[]);
      } else {
        // Если пользователь - клиент, загружаем заказы, которые он создал
        const customerOrders = await getOrdersForCustomer(user.uid);
        // Также получаем локальные заказы
        const localOrders = getOrdersWithDefaults();
        // Объединяем и убираем дубликаты
        const allOrders = [...customerOrders];
        localOrders.forEach((localOrder) => {
          if (!allOrders.find((o) => o.id === localOrder.id)) {
            allOrders.push(localOrder);
          }
        });
        setOrders(allOrders as Order[]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
      // В случае ошибки используем локальные заказы
      const localOrders = getOrdersWithDefaults();
      setOrders(localOrders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let interval: NodeJS.Timeout | null = null;

    // Для музыкантов используем подписку в реальном времени
    getUserProfile(user.uid).then((profile) => {
      const userIsMusician = profile?.role === "musician" || !!profile?.musicianName;
      setIsMusician(userIsMusician);
      setIsRoleChecked(true); // Роль определена, можно показывать заголовок

      if (userIsMusician) {
        console.log("🎵 Пользователь является музыкантом, загружаем заказы на выступления");
        // Подписываемся на изменения заказов в реальном времени
        unsubscribe = subscribeToMusicianOrders(user.uid, (newOrders) => {
          console.log("Получены заказы для музыканта:", newOrders);
          setOrders(newOrders as Order[]);
          setIsLoading(false);
        });
      } else {
        console.log("👤 Пользователь является клиентом, загружаем его заказы");
        // Для клиентов загружаем один раз и периодически обновляем
        loadOrders();
        interval = setInterval(() => {
          loadOrders();
        }, 5000); // Обновляем каждые 5 секунд
      }
    }).catch((error) => {
      console.error("Ошибка при загрузке профиля:", error);
      // В случае ошибки считаем пользователя клиентом
      setIsMusician(false);
      setIsRoleChecked(true); // Роль определена, можно показывать заголовок
      loadOrders();
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, []);

  // Периодически обновляем заказы, если есть заказы со статусом "created"
  useEffect(() => {
    if (isMusician) return; // Для музыкантов используем подписку в реальном времени

    const hasCreatedOrders = orders.some((order) => order.status === "created" && order.createdAt);
    if (!hasCreatedOrders) return;

    // Проверяем каждую секунду, нужно ли обновить статусы
    const interval = setInterval(() => {
      loadOrders();
    }, 1000);

    // Очищаем интервал через 2 минуты (максимальное время ожидания)
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length, isMusician]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            {isRoleChecked ? (
              <>
                <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
                  {isMusician ? "ВХОДЯЩИЕ ЗАКАЗЫ" : "ВАШИ ЗАКАЗЫ"}
                </p>
                <h1 className="text-2xl font-bold text-foreground">
                  {isMusician ? "Заказы на выступления" : "Бронирования"}
                </h1>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
                  &nbsp;
                </p>
                <h1 className="text-2xl font-bold text-foreground">
                  &nbsp;
                </h1>
              </>
            )}
          </div>
          {isRoleChecked && <span className="text-sm text-muted-foreground">{orders.length}</span>}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Загрузка заказов...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {isMusician
              ? "Здесь будут отображаться заказы на ваши выступления."
              : "Здесь пока нет заказов. Забронируйте выступление, чтобы оно появилось в этом списке."}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/order/${order.id}`)}
                className="w-full rounded-[20px] border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Заказ №{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.date} · {order.time}
                    </p>
                  </div>
                  <OrderStatusChip status={order.status} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    {isMusician ? (
                      <>
                        <p className="text-base font-bold text-foreground">
                          {order.customerName || "Заказчик"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerEmail || "Клиент"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-bold text-foreground">{order.artistName}</p>
                        <p className="text-sm text-muted-foreground">{order.style}</p>
                      </>
                    )}
                  </div>
                  <span className="text-base font-semibold text-foreground">{order.price}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default OrdersListPage;



