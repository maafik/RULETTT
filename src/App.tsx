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
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import MusicianProfilePage from "./pages/MusicianProfilePage";
import LoginPage from "./pages/LoginPage";
import ScrollRestoration from "./components/ScrollRestoration";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setIsAuthReady(true);
      
    });

    return () => unsubscribe();
  }, [navigate]);

  // Добавляем текущую страницу в историю при изменении маршрута
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const currentUrl = window.location.href;
    // Используем replaceState, чтобы не создавать лишние записи в истории
    window.history.replaceState({ preventBack: true }, "", currentUrl);
    // Добавляем новую запись для предотвращения перехода назад
    window.history.pushState({ preventBack: true }, "", currentUrl);
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
        >
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
