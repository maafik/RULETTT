import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getMessaging, isSupported, getToken } from "firebase/messaging";

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
  console.error("💡 Добавьте их в ваш .env файл или системные переменные окружения.");
}

// Проверка для localhost
if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    console.log("🌐 Работа на localhost:", window.location.href);
    console.log("💡 Убедитесь, что localhost добавлен в Authorized domains в Firebase Console");
    console.log("💡 SMS должна приходить на localhost, если все настроено правильно");
  }
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || "",
  authDomain: requiredEnvVars.authDomain || "",
  projectId: requiredEnvVars.projectId || "",
  storageBucket: requiredEnvVars.storageBucket || "",
  messagingSenderId: requiredEnvVars.messagingSenderId || "",
  appId: requiredEnvVars.appId || "",
};

// Проверяем, есть ли хотя бы минимальная конфигурация
const hasValidConfig = firebaseConfig.apiKey && 
                      firebaseConfig.authDomain && 
                      firebaseConfig.projectId;

let app: any = null;
let auth: any = null;
let db: any = null;

if (hasValidConfig) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    console.log("✅ Firebase инициализирован успешно");
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("❌ Ошибка при инициализации Firebase:", error);
    if (typeof window !== "undefined") {
      console.error("💡 Проверьте локальные переменные окружения.");
      console.error("💡 Приложение продолжит работу, но некоторые функции могут быть недоступны.");
    }
    // Пытаемся получить существующее приложение
    try {
      if (getApps().length > 0) {
        app = getApp();
        console.log("✅ Используем существующее Firebase приложение");
        auth = getAuth(app);
        db = getFirestore(app);
      } else {
        console.warn("⚠️ Firebase конфигурация неполная, приложение будет работать в ограниченном режиме");
      }
    } catch (fallbackError) {
      console.error("❌ Критическая ошибка при инициализации Firebase:", fallbackError);
      console.warn("⚠️ Продолжаем работу без Firebase");
    }
  }
} else {
  console.warn("⚠️ Firebase конфигурация отсутствует или неполная");
  console.warn("⚠️ Переменные окружения не найдены. Приложение будет работать в ограниченном режиме.");
  console.warn("💡 Создайте .env файл с переменными VITE_FIREBASE_* для полной функциональности");
  
  // Создаем заглушки для предотвращения ошибок
  // Эти объекты будут проверяться перед использованием
}

// Экспортируем с проверками
export { auth, db };

// Примечание о reCAPTCHA:
// Firebase Auth пытается использовать reCAPTCHA Enterprise, но если он не настроен в консоли Firebase,
// автоматически переключается на reCAPTCHA v2. Предупреждение в консоли об этом - это нормально.
// Функциональность работает корректно с reCAPTCHA v2.
// Чтобы устранить предупреждение, настройте reCAPTCHA Enterprise в Firebase Console:
// https://console.firebase.google.com/project/_/settings/recaptcha

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

// Инициализируем сразу, если в браузере и Firebase доступен
if (typeof window !== "undefined" && app) {
  initializeMessaging();
}

// Экспортируем функцию для получения messaging
export async function getMessagingInstance(): Promise<ReturnType<typeof getMessaging> | null> {
  if (messagingInitialized) {
    return messaging;
  }
  return await initializeMessaging();
}

// Сохранение FCM токена пользователя в userFCMTokens/{uid}
async function saveUserFCMToken(userUid: string, token: string): Promise<void> {
  if (!db) {
    console.warn("⚠️ Firestore не инициализирован, FCM токен не будет сохранен");
    return;
  }

  try {
    const ref = doc(db, "userFCMTokens", userUid);
    await setDoc(
      ref,
      {
        token,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("✅ FCM токен сохранен в userFCMTokens/" + userUid);
  } catch (error) {
    console.error("❌ Ошибка при сохранении FCM токена:", error);
  }
}

// Инициализация push-уведомлений для текущего пользователя
export async function initializeNotificationsForUser(userUid: string): Promise<void> {
  try {
    if (!userUid) return;

    const vapidKey = (import.meta as any).env.VITE_FCM_VAPID_KEY as string | undefined;
    if (!vapidKey) {
      console.warn("⚠️ VITE_FCM_VAPID_KEY не задан, push-уведомления для Web не будут работать");
      return;
    }

    if (typeof window === "undefined") return;

    // Проверяем/запрашиваем разрешение на уведомления
    if (Notification.permission === "denied") {
      console.warn("⚠️ Пользователь запретил уведомления в браузере");
      return;
    }

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("⚠️ Пользователь не дал разрешение на уведомления");
        return;
      }
    }

    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      console.warn("⚠️ Firebase Messaging недоступен, токен не будет получен");
      return;
    }

    const token = await getToken(messagingInstance, { vapidKey });
    if (!token) {
      console.warn("⚠️ Не удалось получить FCM токен");
      return;
    }

    console.log("✅ Получен FCM токен для пользователя", userUid, token);
    await saveUserFCMToken(userUid, token);
  } catch (error) {
    console.error("❌ Ошибка при инициализации уведомлений для пользователя:", error);
  }
}

export { app, messaging };
