import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

type Status = "checking" | "ready" | "success" | "error";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = useMemo(() => searchParams.get("oobCode"), [searchParams]);

  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const checkCode = async () => {
      if (!auth) {
        setError("Сервис аутентификации недоступен. Попробуйте позже.");
        setStatus("error");
        return;
      }

      if (!oobCode) {
        setError("Некорректная ссылка для восстановления пароля.");
        setStatus("error");
        return;
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setStatus("ready");
      } catch (err: any) {
        console.error("Ошибка проверки кода сброса:", err);
        setError("Ссылка недействительна или устарела. Запросите новое письмо.");
        setStatus("error");
      }
    };

    void checkCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!auth) {
      setError("Сервис аутентификации недоступен. Попробуйте позже.");
      return;
    }

    if (!oobCode) {
      setError("Некорректная ссылка для восстановления пароля.");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus("success");
    } catch (err: any) {
      console.error("Ошибка смены пароля:", err);
      setError("Не удалось сменить пароль. Попробуйте снова.");
    }
  };

  const goToLogin = () => navigate("/login");

  const heading =
    status === "success"
      ? "Пароль обновлён"
      : status === "error"
      ? "Ошибка ссылки"
      : "Смена пароля";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4 sm:px-6">
      <Card className="border text-card-foreground w-full max-w-md rounded-[24px] border-none bg-card/90 p-4 sm:p-8 shadow-xl backdrop-blur overflow-y-auto">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">{heading}</h1>
          {status === "ready" && email && (
            <p className="text-sm text-muted-foreground break-all">
              Для аккаунта: {email}
            </p>
          )}
        </div>

        {status === "checking" && (
          <p className="text-center text-muted-foreground">Проверяем ссылку...</p>
        )}

        {status === "error" && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button className="w-full rounded-[16px]" onClick={goToLogin}>
              На страницу входа
            </Button>
          </div>
        )}

        {status === "ready" && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Повторите пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-3">
              <Button type="submit" className="h-12 w-full rounded-[16px] text-base font-semibold">
                Обновить пароль
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm font-medium text-primary"
                onClick={goToLogin}
              >
                Вернуться ко входу
              </Button>
            </div>
          </form>
        )}

        {status === "success" && (
          <div className="space-y-5 text-center">
            <p className="text-sm text-foreground">
              Пароль успешно изменён. Теперь вы можете войти с новым паролем.
            </p>
            <Button className="w-full rounded-[16px]" onClick={goToLogin}>
              Перейти ко входу
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
