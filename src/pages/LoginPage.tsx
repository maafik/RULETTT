import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Music2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

interface LoginPageProps {
  onLogin?: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Введите почту и пароль");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin?.();
      navigate("/");
    } catch (authError: any) {
      let message = "Не удалось выполнить вход. Попробуйте снова.";
      if (authError?.code === "auth/invalid-credential") {
        message = "Неверная почта или пароль.";
      } else if (authError?.code === "auth/email-already-in-use") {
        message = "Пользователь с такой почтой уже существует.";
      } else if (authError?.code === "auth/weak-password") {
        message = "Пароль должен содержать минимум 6 символов.";
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-6">
      <div className="mb-8 flex items-center gap-3 text-primary">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Music2 size={28} className="text-primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Stage</p>
          <h1 className="text-2xl font-bold text-foreground">Spotlight</h1>
        </div>
      </div>

      <Card className="w-full max-w-md rounded-[24px] border-none bg-card/90 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "Войти в аккаунт" : "Создать аккаунт"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Используйте почту и пароль, чтобы продолжить"
              : "Зарегистрируйтесь, чтобы забронировать выступление"}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Почта</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-3">
            <Button
              type="submit"
              className="h-12 w-full rounded-[16px] text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === "login"
                  ? "Входим..."
                  : "Создаем..."
                : mode === "login"
                ? "Войти"
                : "Зарегистрироваться"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === "login" ? "register" : "login"));
                setError("");
              }}
              className="w-full text-sm font-medium text-primary transition hover:text-primary/80"
            >
              {mode === "login" ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;

