import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { warmupPaymentServer } from "./lib/payment";

console.log("🚀 Начало инициализации приложения");
console.log("📱 Платформа:", Capacitor.isNativePlatform() ? Capacitor.getPlatform() : "Web");
console.log("🌐 User Agent:", typeof navigator !== "undefined" ? navigator.userAgent : "N/A");
warmupPaymentServer();

// Инициализация Capacitor
if (Capacitor.isNativePlatform()) {
  console.log("📱 Запущено в нативном приложении:", Capacitor.getPlatform());

  CapacitorApp.addListener("appUrlOpen", (event) => {
    try {
      const url = new URL(event.url);
      if (url.host === "orders" || url.pathname === "/orders") {
        window.location.href = "/orders";
      }
    } catch (error) {
      console.warn("⚠️ Ошибка обработки deeplink:", error);
    }
  });

  // Импортируем и инициализируем плагины для нативных платформ
  import("@capacitor/splash-screen").then(({ SplashScreen }) => {
    // Скрываем splash screen с небольшой задержкой, чтобы приложение успело загрузиться
    setTimeout(() => {
      SplashScreen.hide().catch((error) => {
        console.warn("⚠️ Не удалось скрыть splash screen:", error);
      });
    }, 500);
  }).catch((error) => {
    console.warn("⚠️ Плагин SplashScreen недоступен:", error);
  });
}

// Проверяем наличие root элемента перед рендерингом
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Root элемент не найден!");
  throw new Error("Root элемент не найден в DOM");
}

console.log("✅ Root элемент найден, начинаем рендеринг");

// Проверяем переменные окружения
if (typeof import.meta !== "undefined" && import.meta.env) {
  console.log("🔍 Проверка переменных окружения:");
  console.log("  VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY ? "✅" : "❌");
  console.log("  VITE_FIREBASE_AUTH_DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅" : "❌");
  console.log("  VITE_FIREBASE_PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅" : "❌");
}

try {
  const root = createRoot(rootElement);
  console.log("✅ createRoot выполнен успешно");
  root.render(<App />);
  console.log("✅ Приложение успешно отрендерено");
  
  // Проверяем через небольшую задержку, что приложение действительно отрендерилось
  setTimeout(() => {
    const appContent = rootElement.querySelector('[data-reactroot], #root > *');
    if (!appContent) {
      console.error("❌ Приложение не отрендерилось! Root пустой");
    } else {
      console.log("✅ Приложение успешно отрендерилось, контент найден");
    }
  }, 1000);
} catch (error) {
  console.error("❌ Критическая ошибка при рендеринге приложения:", error);
  // Показываем ошибку пользователю
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif; background: #ffffff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <h1 style="color: #dc2626; margin-bottom: 16px;">Ошибка загрузки приложения</h1>
      <p style="margin-bottom: 16px;">Пожалуйста, перезапустите приложение</p>
      <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; max-width: 90%; font-size: 12px;">
${error instanceof Error ? error.message : String(error)}
${error instanceof Error && error.stack ? "\n\n" + error.stack : ""}
      </pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #fbbf24; color: #000000; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
        Перезагрузить
      </button>
    </div>
  `;
  throw error;
}
