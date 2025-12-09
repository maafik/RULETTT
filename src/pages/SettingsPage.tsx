import { Settings } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SettingsPage = () => {
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
            <Settings size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
        </div>
      </header>

      <main 
        className="mx-auto max-w-md px-4 py-8 space-y-4"
        style={{ 
          paddingTop: `calc(5.5rem + env(safe-area-inset-top, 0px) - 10px)`
        }}
      >
        <Card className="rounded-[20px] border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-base font-medium">
                  Push-уведомления
                </Label>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления о новых заказах и сообщениях
                </p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base font-medium">
                  Email-уведомления
                </Label>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления на почту
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound" className="text-base font-medium">
                  Звук уведомлений
                </Label>
                <p className="text-sm text-muted-foreground">
                  Воспроизводить звук при получении уведомлений
                </p>
              </div>
              <Switch id="sound" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;



