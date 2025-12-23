import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Music2 } from "lucide-react";
import { auth, app } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { createOrUpdateUserProfile } from "@/lib/firebase-db";
import { sendRegistrationAlert } from "@/lib/notifications";

interface LoginPageProps {
  onLogin?: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [showNotificationPermission, setShowNotificationPermission] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const navigate = useNavigate();

  // Отладочный лог для попапа
  useEffect(() => {
    console.log("🔔 showNotificationPermission изменился:", showNotificationPermission);
  }, [showNotificationPermission]);

  const formatPhoneNumber = (value: string): string => {
    // Удаляем все нецифровые символы
    const cleaned = value.replace(/\D/g, "");
    
    // Форматируем как +7 (XXX) XXX-XX-XX
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 1) return `+${cleaned}`;
    if (cleaned.length <= 4) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  const normalizePhoneNumber = (phone: string): string => {
    // Удаляем все нецифровые символы
    const cleaned = phone.replace(/\D/g, "");
    
    // Если номер начинается с 8, заменяем на 7
    if (cleaned.startsWith("8")) {
      return `+7${cleaned.slice(1)}`;
    }
    
    // Если номер начинается с 7, добавляем +
    if (cleaned.startsWith("7")) {
      return `+${cleaned}`;
    }
    
    // Если номер не начинается с 7 или 8, добавляем +7
    return `+7${cleaned}`;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }

    if (!validateEmail(email)) {
      setError("Введите корректный email адрес");
      return;
    }

    if (!auth) {
      setError("Сервис аутентификации недоступен. Проверьте подключение к интернету.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Вход выполнен успешно");
      
      onLogin?.();
      navigate("/");
    } catch (authError: any) {
      console.error("❌ Ошибка входа:", {
        code: authError?.code,
        message: authError?.message,
      });

      let message = "Не удалось войти. Проверьте email и пароль.";
      if (authError?.code === "auth/user-not-found") {
        message = "Пользователь с таким email не найден.";
      } else if (authError?.code === "auth/wrong-password") {
        message = "Неверный пароль.";
      } else if (authError?.code === "auth/invalid-email") {
        message = "Неверный формат email.";
      } else if (authError?.code === "auth/user-disabled") {
        message = "Аккаунт заблокирован.";
      } else if (authError?.code === "auth/too-many-requests") {
        message = "Слишком много попыток. Попробуйте позже.";
      }
      
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }

    if (!validateEmail(email)) {
      setError("Введите корректный email адрес");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    if (!agreementAccepted) {
      setError("Примите пользовательское соглашение");
      return;
    }

    // Просто показываем попап, регистрация будет после нажатия кнопки в попапе
    setShowNotificationPermission(true);
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Введите email для восстановления пароля");
      return;
    }

    if (!validateEmail(email)) {
      setError("Введите корректный email адрес");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!auth) {
        setError("Сервис аутентификации недоступен. Проверьте подключение к интернету.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      console.log("✅ Письмо для восстановления пароля отправлено");
      setError("");
      alert("Письмо для восстановления пароля отправлено на ваш email. Проверьте почту.");
      setMode("login");
      setEmail("");
    } catch (authError: any) {
      console.error("❌ Ошибка восстановления пароля:", {
        code: authError?.code,
        message: authError?.message,
      });

      let message = "Не удалось отправить письмо. Попробуйте снова.";
      if (authError?.code === "auth/user-not-found") {
        message = "Пользователь с таким email не найден.";
      } else if (authError?.code === "auth/invalid-email") {
        message = "Неверный формат email.";
      }
      
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAfterNotification = async () => {
    setError("");

    if (!agreementAccepted) {
      setError("Примите пользовательское соглашение");
      return;
    }

    // Обязательная валидация номера телефона
    if (!phone.trim()) {
      setError("Введите номер телефона");
      return;
    }

    let normalizedPhone: string | undefined = normalizePhoneNumber(phone);
    const digitsAfterPlus = normalizedPhone.slice(2).replace(/\D/g, "");
    if (digitsAfterPlus.length !== 10) {
      setError("Номер телефона должен содержать 10 цифр после +7");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Выполняем регистрацию
      console.log("🔄 Начинаем регистрацию...");
      if (!auth) {
        setError("Сервис аутентификации недоступен. Проверьте подключение к интернету.");
        setIsSubmitting(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Регистрация выполнена успешно");
      
      if (userCredential.user) {
        // Создаем профиль с настройками
        await createOrUpdateUserProfile(userCredential.user.uid, {
          role: "customer",
          city: "Москва",
          allowWhatsAppTelegramNotifications: allowNotifications,
          phone: normalizedPhone || undefined,
        });

        console.log("✅ Профиль создан");
        
        // Отправляем приветственное письмо
        try {
          const functions = getFunctions(app);
          const sendWelcomeEmail = httpsCallable(functions, 'sendWelcomeEmail');
          await sendWelcomeEmail({
            email: userCredential.user.email,
            userName: userCredential.user.displayName || email.split('@')[0],
          });
          console.log("✅ Приветственное письмо отправлено");
        } catch (emailError) {
          console.error("⚠️ Ошибка при отправке приветственного письма:", emailError);
          // Не блокируем регистрацию, если письмо не отправилось
        }

        // Отправляем уведомление о новой регистрации в Telegram (не блокирует регистрацию)
        try {
          await sendRegistrationAlert(userCredential.user.email || email, normalizedPhone || null);
        } catch (telegramError) {
          console.error("⚠️ Ошибка при отправке Telegram-уведомления о регистрации:", telegramError);
        }
        
        setIsSubmitting(false);
        setShowNotificationPermission(false);
        onLogin?.();
        navigate("/");
      }
    } catch (authError: any) {
      console.error("❌ Ошибка регистрации:", {
        code: authError?.code,
        message: authError?.message,
      });

      let message = "Не удалось зарегистрироваться. Попробуйте снова.";
      if (authError?.code === "auth/email-already-in-use") {
        message = "Пользователь с таким email уже существует. Войдите в аккаунт.";
      } else if (authError?.code === "auth/invalid-email") {
        message = "Неверный формат email.";
      } else if (authError?.code === "auth/weak-password") {
        message = "Пароль слишком слабый. Используйте минимум 6 символов.";
      }
      
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4 sm:px-6 overflow-hidden">
      <div className="mb-4 sm:mb-8 flex items-center gap-3 text-primary">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Music2 size={24} className="sm:size-[28px] text-primary" />
        </div>
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground">Stage</p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Spotlight</h1>
        </div>
      </div>

      <Card className="w-full max-w-md rounded-[24px] border-none bg-card/90 p-4 sm:p-8 shadow-xl backdrop-blur overflow-y-auto">
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "Войти в аккаунт" : mode === "register" ? "Создать аккаунт" : "Восстановить пароль"}
          </h2>
        </div>

        {mode === "reset" ? (
          <form className="space-y-5" onSubmit={handlePasswordReset}>
          <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
            <Input
                id="reset-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-3">
              <Button
                type="submit"
                className="h-12 w-full rounded-[16px] text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправляем..." : "Восстановить пароль"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setEmail("");
                }}
                className="w-full text-sm font-medium text-primary transition hover:text-primary/80"
              >
                Вспомнил пароль?
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={mode === "login" ? handleLogin : handleRegister}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              required
                autoComplete="email"
            />
          </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
              />
              {mode === "register" && (
                <p className="text-xs text-muted-foreground">
                  Минимум 6 символов
                </p>
              )}
            </div>

            {mode === "register" && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="user-agreement"
                  checked={agreementAccepted}
                  onCheckedChange={(checked) => setAgreementAccepted(checked === true)}
                />
                <div className="space-y-1">
                  <label
                    htmlFor="user-agreement"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Я принимаю
                    {" "}
                    <button
                      type="button"
                      onClick={() => setShowAgreementDialog(true)}
                      className="text-primary underline"
                    >
                      пользовательское соглашение
                    </button>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Без принятия соглашения регистрация недоступна
                  </p>
                </div>
              </div>
            )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-3">
            <Button
              type="submit"
              className="h-12 w-full rounded-[16px] text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting
                  ? (mode === "login" ? "Входим..." : "Регистрируем...")
                : mode === "login"
                  ? "Войти"
                : "Зарегистрироваться"}
            </Button>

              <div className="flex flex-col gap-2">
                {mode === "login" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setError("");
                        setEmail("");
                        setPassword("");
                        setAgreementAccepted(false);
                        setShowAgreementDialog(false);
                      }}
                      className="w-full text-sm font-medium text-primary transition hover:text-primary/80"
                    >
                      Нет аккаунта?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("reset");
                        setError("");
                        setPassword("");
                      }}
                      className="w-full text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      Забыл пароль?
                    </button>
                  </>
                )}
                {mode === "register" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setEmail("");
                      setPassword("");
                      setAgreementAccepted(false);
                    }}
                    className="w-full text-sm font-medium text-primary transition hover:text-primary/80"
                  >
                    Уже есть аккаунт?
                  </button>
                )}
              </div>
          </div>
        </form>
        )}
      </Card>

      <Dialog
        open={showAgreementDialog}
        onOpenChange={setShowAgreementDialog}
        modal={true}
      >
        <DialogContent className="max-w-md rounded-[24px] max-h-[90vh] overflow-y-auto mt-[env(safe-area-inset-top,0px)] sm:mt-0">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Пользовательское соглашение
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Перед регистрацией ознакомьтесь с условиями использования сервиса и оплат.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">1. О сервисе</p>
              <p>
                Приложение помогает подбирать и бронировать исполнителей (ведущих, DJ и других артистов) для мероприятий.
                Сервис предоставляет интерфейс для поиска, просмотра профилей и оформления заявки/заказа.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">2. Оператор сервиса и контакты</p>
              <p>
                Оператор сервиса: ИНН 310263929630.
                Контакты для связи: Maafik@66.ru, +7 951 762-34-67.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">3. Регистрация и аккаунт</p>
              <p>
                Регистрируясь, вы подтверждаете корректность введённых данных и обязуетесь не передавать доступ к аккаунту третьим лицам.
                Сервис может использовать ваши контактные данные для уведомлений о статусе заказа и связи по заявкам.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">4. Оплата через ЮKassa</p>
              <p>
                Оплата услуг может осуществляться с использованием платёжного решения ЮKassa.
                Проведение платежа выполняется на стороне платёжного сервиса, а обработка данных банковской карты осуществляется по правилам и стандартам платёжной системы и ЮKassa.
              </p>
              <p>
                При оплате могут применяться комиссии и ограничения вашего банка/платёжного инструмента.
                В случае технических ошибок платежа повторите попытку позже или используйте другой способ оплаты.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">5. Порядок расчётов (посредник и комиссия)</p>
              <p>
                Оператор сервиса выступает посредником: принимает оплату от пользователя, проверяет, что процесс бронирования прошёл корректно,
                и перечисляет средства исполнителю. Комиссия сервиса удерживается оператором.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">6. Возвраты и отмены</p>
              <p>
                Полный возврат возможен в течение 6 часов.
                Возврат выполняется тем способом, которым была произведена оплата, с учётом правил платёжных систем и ЮKassa.
                Для оформления возврата обратитесь в поддержку по указанным контактам.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">7. Персональные данные</p>
              <p>
                Используя сервис, вы соглашаетесь на обработку персональных данных для целей регистрации, оформления и сопровождения заказов, а также информирования о статусах.
                Данные могут использоваться для связи с вами и для выполнения обязательств по заказу.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">8. Ответственность</p>
              <p>
                Сервис предоставляет информацию об исполнителях и инструменты для оформления заявки.
                Исполнитель оказывает услуги по договорённости сторон, а качество и содержание услуги определяется условиями заказа.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setAgreementAccepted(true);
                setShowAgreementDialog(false);
              }}
              className="w-full rounded-[16px]"
            >
              Принять
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Попап разрешения на уведомления и номера телефона после регистрации */}
      <Dialog
        open={showNotificationPermission}
        onOpenChange={(open) => {
          console.log("🔔 Dialog onOpenChange вызван:", open);
          // Разрешаем закрытие попапа любым способом:
          // - крестик
          // - клик по фону
          // - кнопка «назад» / Escape
          setShowNotificationPermission(open);
        }}
        modal={true}
      >
        <DialogContent className="max-w-md rounded-[24px] max-h-[90vh] overflow-y-auto mt-[env(safe-area-inset-top,0px)] sm:mt-0 pt-4 sm:pt-6">
          <DialogHeader className="pt-2 sm:pt-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Дополнительная информация
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Укажите номер телефона для получения уведомлений о заказах в WhatsApp или Telegram
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone-input">Номер телефона (обязательно)</Label>
              <Input
                id="phone-input"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setPhone(formatted);
                }}
                maxLength={18}
                required
              />
              <p className="text-xs text-muted-foreground">
                Номер телефона будет использоваться для уведомлений о заказах в WhatsApp и Telegram
              </p>
            </div>

            <div className="flex items-center space-x-2">
            <Checkbox
              id="allow-notifications"
              checked={allowNotifications}
              onCheckedChange={(checked) => setAllowNotifications(checked === true)}
            />
            <label
              htmlFor="allow-notifications"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
                Разрешить отправку уведомлений в WhatsApp/Telegram
            </label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              onClick={handleContinueAfterNotification}
              className="w-full rounded-[16px]"
              disabled={isSubmitting}
            >
              Продолжить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
