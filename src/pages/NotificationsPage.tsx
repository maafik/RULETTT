import { Bell } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";

const NotificationsPage = () => {
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
            <Bell size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Уведомления</h1>
        </div>
      </header>

      <main 
        className="mx-auto max-w-md px-4 py-8"
        style={{ 
          paddingTop: `calc(5.5rem + env(safe-area-inset-top, 0px) - 10px)`
        }}
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Bell size={42} className="text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Уведомлений пока нет</h2>
          <p className="text-sm text-muted-foreground">
            Здесь будут отображаться все важные уведомления о ваших заказах и сообщениях.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default NotificationsPage;



