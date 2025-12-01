import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

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

