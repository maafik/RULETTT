import { HelpCircle, MessageCircle, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Помощь и поддержка</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8 space-y-4">
        <Card 
          className="cursor-pointer rounded-[16px] border-0 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
          onClick={() => navigate("/support")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-blue-500">
                <MessageCircle size={18} />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-foreground">Чат поддержки</p>
                <p className="text-sm text-muted-foreground">Напишите нам в чате</p>
              </div>
              <div className="text-muted-foreground">›</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer rounded-[16px] border-0 shadow-sm transition-all hover:shadow-md active:scale-[0.99]">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-green-500">
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-foreground">Email поддержка</p>
                <p className="text-sm text-muted-foreground">support@rulettt.ru</p>
              </div>
              <div className="text-muted-foreground">›</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer rounded-[16px] border-0 shadow-sm transition-all hover:shadow-md active:scale-[0.99]">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-purple-500">
                <Phone size={18} />
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-foreground">Телефон поддержки</p>
                <p className="text-sm text-muted-foreground">+7 (800) 123-45-67</p>
              </div>
              <div className="text-muted-foreground">›</div>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Часто задаваемые вопросы</h2>
          <div className="space-y-3">
            <Card className="rounded-[16px] border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-2 text-base font-medium text-foreground">Как забронировать музыканта?</h3>
                <p className="text-sm text-muted-foreground">
                  Выберите понравившегося музыканта, нажмите "Забронировать выступление" и заполните форму заказа.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[16px] border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-2 text-base font-medium text-foreground">Как отменить заказ?</h3>
                <p className="text-sm text-muted-foreground">
                  Перейдите в раздел "Мои заказы", выберите нужный заказ и нажмите "Отменить заказ".
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[16px] border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-2 text-base font-medium text-foreground">Как связаться с музыкантом?</h3>
                <p className="text-sm text-muted-foreground">
                  После подтверждения заказа вы сможете общаться с музыкантом через встроенный чат.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default HelpPage;


