import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import OrderPage from "./pages/OrderPage";
import OrdersListPage from "./pages/OrdersListPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import MusicianProfilePage from "./pages/MusicianProfilePage";
import LoginPage from "./pages/LoginPage";
import ScrollRestoration from "./components/ScrollRestoration";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { initializeNotifications } from "@/lib/notifications";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setIsAuthReady(true);
      
      // Инициализируем уведомления после авторизации (только один раз)
      if (user && !notificationsInitialized) {
        setNotificationsInitialized(true);
        initializeNotifications((path: string) => navigate(path)).catch((error) => {
          console.error("Ошибка при инициализации уведомлений:", error);
          // Сбрасываем флаг при ошибке, чтобы можно было попробовать снова
          setNotificationsInitialized(false);
        });
      }
    });

    return () => unsubscribe();
  }, [navigate, notificationsInitialized]);

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
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
