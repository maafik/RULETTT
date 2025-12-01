import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Capacitor } from "@capacitor/core";

// Инициализация Capacitor
if (Capacitor.isNativePlatform()) {
  console.log("📱 Запущено в нативном приложении:", Capacitor.getPlatform());
  
  // Импортируем и инициализируем плагины для нативных платформ
  import("@capacitor/splash-screen").then(({ SplashScreen }) => {
    SplashScreen.hide();
  }).catch(() => {
    // Плагин может быть недоступен
  });
}

createRoot(document.getElementById("root")!).render(<App />);
