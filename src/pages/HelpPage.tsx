import { HelpCircle, MessageCircle, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";

const HelpPage = () => {
  const navigate = useNavigate();

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
            <HelpCircle size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Помощь и поддержка</h1>
        </div>
      </header>

      <main 
        className="mx-auto max-w-md px-4 py-8 space-y-4"
        style={{ 
          paddingTop: `calc(5.5rem + env(safe-area-inset-top, 0px) - 10px)`
        }}
      >
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
                <p className="text-sm text-muted-foreground">+7 951 762-34-67</p>
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

            <Card className="rounded-[16px] border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-2 text-base font-medium text-foreground">Как работает оплата?</h3>
                <p className="text-sm text-muted-foreground">
                  При оплате деньги удерживаются сервисом. Музыканту перечисляется только предоплата, остальная сумма — после завершения мероприятия.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[16px] border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-2 text-base font-medium text-foreground">Что делать, если музыкант не вышел на связь?</h3>
                <p className="text-sm text-muted-foreground">
                  Свяжитесь с поддержкой через чат, email или по телефону. Мы поможем решить вопрос и найдем замену при необходимости.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[16px] border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-2 text-base font-medium text-foreground">Как изменить детали заказа?</h3>
                <p className="text-sm text-muted-foreground">
                  В заказе со статусом "Ожидает подтверждения" можно изменить дату, время, место и комментарий через кнопку "Изменить" на странице заказа.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[16px] border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="mb-2 text-base font-medium text-foreground">Когда я получу номер телефона музыканта?</h3>
                <p className="text-sm text-muted-foreground">
                  Номер телефона станет доступен после полной оплаты заказа, когда статус изменится на "Выступление в процессе".
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


