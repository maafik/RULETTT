import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import OrderPage from "./pages/OrderPage";
import OrdersListPage from "./pages/OrdersListPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import SupportPage from "./pages/SupportPage";
import PaymentReturnPage from "./pages/PaymentReturnPage";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import MusicianProfilePage from "./pages/MusicianProfilePage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ScrollRestoration from "./components/ScrollRestoration";
import { onAuthStateChanged } from "firebase/auth";
import { auth, initializeNotificationsForUser } from "@/lib/firebase";
import { initializeCapacitorPushForCurrentUser } from "@/lib/capacitor-push";
import { initializeNotifications, initializeInAppNotificationsForUser } from "@/lib/notifications";
import { handlePaymentReturn } from "@/lib/payment";
import { updateOrder } from "@/lib/orders";
import { updateOrderStatus } from "@/lib/firebase-db";
import { useNavigate } from "react-router-dom";
import { clearOrdersCache } from "@/lib/orders";
import { ORDERS_STORAGE_KEY } from "@/constants/storage";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let previousUid: string | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentUid = user?.uid || null;
      
      // Если пользователь изменился, очищаем заказы из localStorage
      if (previousUid !== null && previousUid !== currentUid) {
        console.log("🔄 Пользователь изменился, очищаем локальные заказы");
        // Очищаем только заказы, которые не принадлежат новому пользователю
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
            if (stored) {
              const orders = JSON.parse(stored);
              // Оставляем только заказы текущего пользователя
              const userOrders = orders.filter((order: any) => order.customerUid === currentUid);
              if (userOrders.length === 0) {
                localStorage.removeItem(ORDERS_STORAGE_KEY);
              } else {
                localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(userOrders));
              }
            }
          } catch (error) {
            console.error("Ошибка при очистке заказов:", error);
            // В случае ошибки просто очищаем все
            clearOrdersCache();
          }
        }
      }
      
      previousUid = currentUid;
      setIsAuthenticated(Boolean(user));
      setIsAuthReady(true);

      // Инициализируем push-уведомления для авторизованного пользователя
      if (user && currentUid) {
        initializeNotificationsForUser(currentUid);
        initializeCapacitorPushForCurrentUser();
        void initializeNotifications();
        void initializeInAppNotificationsForUser(currentUid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // После того как авторизация готова и пользователь залогинен,
  // проверяем, нужно ли вернуть его на конкретный заказ после оплаты
  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) return;
    if (typeof window === "undefined") return;

    (async () => {
      try {
        const returnOrderId = window.localStorage.getItem("return_to_order_after_payment");
        if (!returnOrderId) return;

        // Сбрасываем флаг, чтобы избежать повторной обработки
        window.localStorage.removeItem("return_to_order_after_payment");

        // Пытаемся получить сохранённый paymentId для этого заказа
        const paymentKey = `yookassa_payment_${returnOrderId}`;
        const paymentId = window.localStorage.getItem(paymentKey) || "";

        if (paymentId) {
          try {
            const result = await handlePaymentReturn(paymentId, returnOrderId);
            if (result.success) {
              try {
                await updateOrderStatus(returnOrderId, "in-progress");
              } catch (err) {
                console.error("Ошибка при обновлении статуса заказа в Firestore после оплаты (App):", err);
              }

              updateOrder(returnOrderId, { status: "in-progress" as const });
            }
          } catch (err) {
            console.error("Ошибка при проверке статуса платежа после возврата (App):", err);
          }
        }

        navigate("/orders", { replace: true });
      } catch (e) {
        console.warn("⚠️ Не удалось обработать возврат после оплаты в App:", e);
      }


    })();
  }, [isAuthReady, isAuthenticated, navigate]);

  // Добавляем текущую страницу в историю при изменении маршрута и скроллим вверх
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Не скроллим вверх для страницы чата - там свой скролл
    if (!location.pathname.startsWith('/chat/')) {
      // Всегда скроллим в самый верх при переходе между страницами
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    
    const currentUrl = window.location.href;
    // Не блокируем кнопку "назад" для чата
    if (!location.pathname.startsWith('/chat/')) {
      // Используем replaceState, чтобы не создавать лишние записи в истории
      window.history.replaceState({ preventBack: true }, "", currentUrl);
      // Добавляем новую запись для предотвращения перехода назад
      window.history.pushState({ preventBack: true }, "", currentUrl);
    }
  }, [location.pathname]);

  // Обработка кнопки "назад": закрываем диалоги или предотвращаем переход
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Функция для добавления текущей страницы в историю
    const pushCurrentState = () => {
      const currentUrl = window.location.href;
      window.history.pushState({ preventBack: true }, "", currentUrl);
    };

    const handlePopState = (event: PopStateEvent) => {
      // Разрешаем кнопку "назад" для страницы чата
      if (location.pathname.startsWith('/chat/')) {
        return; // Разрешаем навигацию назад для чата
      }
      
      // Проверяем, есть ли открытые диалоги через Radix UI атрибуты
      const openDialogs = document.querySelectorAll('[data-state="open"][role="dialog"]');
      
      if (openDialogs.length > 0) {
        // Если есть открытые диалоги, отправляем Escape для их закрытия
        // Radix UI автоматически обработает это и закроет диалог
        const escapeEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(escapeEvent);
        
        // Предотвращаем переход назад, возвращаем текущую страницу в историю
        pushCurrentState();
        event.preventDefault();
        return;
      }
      
      // Если диалогов нет, предотвращаем переход назад
      // Возвращаем текущую страницу в историю
      pushCurrentState();
      event.preventDefault();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Загрузка...
      </div>
    );
  }

  return (
    <>
      <ScrollRestoration />
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/"
          element={isAuthenticated ? <Index /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/orders"
          element={isAuthenticated ? <OrdersListPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/order/:id"
          element={isAuthenticated ? <OrderPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/favorites"
          element={isAuthenticated ? <FavoritesPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/notifications"
          element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/help"
          element={isAuthenticated ? <HelpPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/support"
          element={isAuthenticated ? <SupportPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/payment/return"
          element={<PaymentReturnPage />}
        />
        <Route
          path="/order/:id/profile"
          element={isAuthenticated ? <MusicianProfilePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chat/:id"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" replace />}
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter 
          future={{ 
            v7_relativeSplatPath: true,
            v7_startTransition: true 
          }}
          basename="/"
        >
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
