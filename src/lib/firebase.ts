import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// Проверяем наличие всех необходимых переменных окружения
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Маппинг ключей на имена переменных окружения
const envVarNames: Record<string, string> = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
};

// Проверяем, что все переменные присутствуют
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => envVarNames[key]);

if (missingVars.length > 0 && typeof window !== "undefined") {
  console.error("❌ Отсутствуют переменные окружения Firebase:", missingVars.join(", "));
  console.error("💡 Добавьте их в Vercel Environment Variables:");
  console.error("   Vercel Dashboard → Settings → Environment Variables");
  console.error("   См. файл VERCEL_ENV_SETUP.md для инструкций");
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || "",
  authDomain: requiredEnvVars.authDomain || "",
  projectId: requiredEnvVars.projectId || "",
  storageBucket: requiredEnvVars.storageBucket || "",
  messagingSenderId: requiredEnvVars.messagingSenderId || "",
  appId: requiredEnvVars.appId || "",
};

let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error("❌ Ошибка при инициализации Firebase:", error);
  if (typeof window !== "undefined") {
    console.error("💡 Проверьте переменные окружения в Vercel");
    console.error("   См. файл VERCEL_ENV_SETUP.md для инструкций");
  }
  throw error;
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Инициализация Firebase Cloud Messaging (только в браузере)
let messaging: ReturnType<typeof getMessaging> | null = null;
let messagingInitialized = false;
let messagingInitPromise: Promise<ReturnType<typeof getMessaging> | null> | null = null;

// Функция для инициализации messaging
async function initializeMessaging(): Promise<ReturnType<typeof getMessaging> | null> {
  if (messagingInitialized) {
    return messaging;
  }

  if (messagingInitPromise) {
    return messagingInitPromise;
  }

  messagingInitPromise = (async () => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const supported = await isSupported();
      if (!supported) {
        console.warn("⚠️ Firebase Cloud Messaging не поддерживается в этом браузере");
        messagingInitialized = true;
        return null;
      }

      messaging = getMessaging(app);
      messagingInitialized = true;
      console.log("✅ Firebase Cloud Messaging инициализирован");
      return messaging;
    } catch (error) {
      console.error("❌ Ошибка при инициализации FCM:", error);
      messagingInitialized = true;
      return null;
    }
  })();

  return messagingInitPromise;
}

// Инициализируем сразу, если в браузере
if (typeof window !== "undefined") {
  initializeMessaging();
}

// Экспортируем функцию для получения messaging
export async function getMessagingInstance(): Promise<ReturnType<typeof getMessaging> | null> {
  if (messagingInitialized) {
    return messaging;
  }
  return await initializeMessaging();
}

export { app, messaging };

