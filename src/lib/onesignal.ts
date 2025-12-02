import OneSignal from "react-onesignal";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Capacitor } from "@capacitor/core";

// Инициализация OneSignal
let oneSignalInitialized = false;
let oneSignalNotificationsInitialized = false;

// Проверка, запущено ли приложение в нативном режиме
const isNative = typeof window !== "undefined" && Capacitor.isNativePlatform();

/**
 * Проверить, инициализирован ли OneSignal SDK
 */
function isOneSignalSDKInitialized(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  try {
    // Проверяем, есть ли глобальный объект OneSignal и инициализирован ли он
    const globalOneSignal = (window as any).OneSignal;
    if (globalOneSignal) {
      // Проверяем, инициализирован ли через глобальный SDK
      if (globalOneSignal.initialized || globalOneSignal.SdkInitialized) {
        return true;
      }
    }
    
    // Альтернативная проверка через react-onesignal
    if (OneSignal && (OneSignal as any).initialized) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Инициализировать OneSignal
 */
export async function initializeOneSignal(): Promise<boolean> {
  // Проверяем наш флаг
  if (oneSignalInitialized) {
    return true;
  }

  // Проверяем, инициализирован ли SDK
  if (isOneSignalSDKInitialized()) {
    console.log("✅ OneSignal SDK уже инициализирован");
    oneSignalInitialized = true;
    return true;
  }

  if (typeof window === "undefined") {
    console.warn("⚠️ Не в браузере, OneSignal недоступен");
    return false;
  }

  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (!appId) {
    console.error("❌ VITE_ONESIGNAL_APP_ID не найден в переменных окружения");
    return false;
  }

  // Проверяем, на каком домене мы находимся
  const currentHost = window.location.hostname;
  const isLocalhost =
    currentHost === "localhost" ||
    currentHost === "127.0.0.1" ||
    currentHost.startsWith("192.168.") ||
    currentHost.startsWith("10.") ||
    currentHost.startsWith("172.");

  const allowedDomains = [
    "quirkynest.ru",
    "rulettt.vercel.app",
  ];

  const isAllowedDomain = allowedDomains.some(
    (domain) => currentHost === domain || currentHost.endsWith(`.${domain}`)
  );

  // OneSignal SDK v16 поддерживает localhost из коробки через allowLocalhostAsSecureOrigin
  // Разрешаем инициализацию на localhost и разрешенных доменах
  if (!isLocalhost && !isAllowedDomain) {
    console.warn("⚠️ OneSignal не настроен для домена:", currentHost);
    console.warn("💡 Для работы добавьте домен в настройки OneSignal:");
    console.warn("   OneSignal Dashboard → Settings → Web Push → Configure → Allowed Domains");
    console.warn("   Или используйте localhost для разработки (поддерживается автоматически).");
    // Помечаем как "инициализирован", чтобы не пытаться снова
    oneSignalInitialized = true;
    return false; // Возвращаем false, чтобы показать, что инициализация не прошла
  }

  try {
    // Определяем правильный путь к service worker
    const serviceWorkerPath = typeof window !== "undefined" 
      ? new URL("/OneSignalSDKWorker.js", window.location.origin).href
      : "/OneSignalSDKWorker.js";

    const initOptions: any = {
      appId: appId,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false, // Скрываем кнопку подписки, используем свою
      },
      // Явно указываем абсолютный URL к service worker
      serviceWorkerPath: serviceWorkerPath,
      serviceWorkerParam: { scope: "/" },
    };

    // Для нативных приложений добавляем дополнительные опции
    if (isNative) {
      initOptions.serviceWorkerParam = { scope: "/push/onesignal/" };
      initOptions.serviceWorkerPath = "OneSignalSDKWorker.js";
    }

    console.log("🔧 OneSignal инициализация с serviceWorkerPath:", serviceWorkerPath);

    await OneSignal.init(initOptions);

    oneSignalInitialized = true;
    console.log("✅ OneSignal инициализирован");
    return true;
  } catch (error: any) {
    // Если ошибка о домене, пропускаем инициализацию
    if (error?.message?.includes("Can only be used on") || error?.message?.includes("domain")) {
      console.warn("⚠️ OneSignal не настроен для текущего домена:", currentHost);
      console.warn("💡 Добавьте домен в настройки OneSignal:");
      console.warn("   OneSignal Dashboard → Settings → Web Push → Configure → Allowed Domains");
      oneSignalInitialized = true; // Помечаем как "инициализирован", чтобы не пытаться снова
      return false;
    }
    
    // Если ошибка "SDK already initialized", считаем что инициализация успешна
    if (error?.message?.includes("already initialized") || error?.message?.includes("SDK already initialized")) {
      console.log("✅ OneSignal SDK уже был инициализирован");
      oneSignalInitialized = true;
      return true;
    }
    
    console.error("❌ Ошибка при инициализации OneSignal:", error);
    return false;
  }
}

/**
 * Запросить разрешение на уведомления и получить Player ID
 */
export async function requestNotificationPermission(): Promise<string | null> {
  console.log("🔔 Запрос разрешения на уведомления через OneSignal...");

  if (typeof window === "undefined") {
    console.warn("⚠️ Не в браузере, уведомления недоступны");
    return null;
  }

  try {
    // Инициализируем OneSignal, если еще не инициализирован
    const initialized = await initializeOneSignal();
    if (!initialized) {
      return null;
    }

    // Запрашиваем разрешение
    const permission = await OneSignal.Notifications.requestPermission();
    console.log("📋 Разрешение:", permission);

    if (permission) {
      // Получаем Player ID через User PushSubscription
      // Ждем немного, чтобы подписка была готова
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const pushSubscription = await OneSignal.User.PushSubscription;
      const userId = pushSubscription?.id;
      
      if (userId) {
        console.log("✅ Player ID получен:", userId.substring(0, 20) + "...");
        // Сохраняем Player ID в Firestore
        await saveUserOneSignalId(userId);
        return userId;
      } else {
        // Пробуем альтернативный способ получения Player ID
        try {
          const user = await OneSignal.User;
          const playerId = user?.onesignalId;
          if (playerId) {
            console.log("✅ Player ID получен (альтернативный способ):", playerId.substring(0, 20) + "...");
            await saveUserOneSignalId(playerId);
            return playerId;
          }
        } catch (e) {
          console.warn("⚠️ Не удалось получить Player ID альтернативным способом");
        }
        
        console.warn("⚠️ Player ID не получен");
        return null;
      }
    } else {
      console.warn("⚠️ Пользователь отклонил разрешение на уведомления");
      return null;
    }
  } catch (error: any) {
    console.error("❌ Ошибка при запросе разрешения на уведомления:", error);
    return null;
  }
}

/**
 * Сохранить OneSignal Player ID пользователя в Firestore
 */
async function saveUserOneSignalId(playerId: string) {
  try {
    const { auth } = await import("./firebase");
    const user = auth.currentUser;

    if (!user) {
      console.warn("⚠️ Пользователь не авторизован, Player ID не сохранен");
      return;
    }

    console.log("💾 Сохраняем OneSignal Player ID для пользователя:", user.uid);

    const userRef = doc(db, "userOneSignalIds", user.uid);

    // Пробуем обновить существующий документ
    try {
      await updateDoc(userRef, {
        playerId,
        updatedAt: new Date().toISOString(),
      });
      console.log("✅ OneSignal Player ID обновлен для пользователя:", user.uid);
    } catch (updateError: any) {
      // Если документа нет или ошибка обновления, создаем новый
      if (updateError.code === "not-found" || updateError.code === "permission-denied") {
        try {
          await setDoc(userRef, {
            playerId,
            uid: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log("✅ OneSignal Player ID создан для пользователя:", user.uid);
        } catch (createError: any) {
          if (createError.code === "permission-denied") {
            console.error("❌ Нет прав на запись в Firestore для userOneSignalIds");
            console.error("💡 Обновите правила Firestore:");
            console.error(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешаем пользователям читать и писать свои OneSignal ID
    match /userOneSignalIds/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Остальные правила...
  }
}
            `);
          } else {
            console.error("❌ Ошибка при создании OneSignal Player ID:", createError);
          }
        }
      } else {
        console.error("❌ Ошибка при обновлении OneSignal Player ID:", updateError);
      }
    }
  } catch (error: any) {
    console.error("❌ Ошибка при сохранении OneSignal Player ID:", error);
    if (error.code === "permission-denied") {
      console.error("💡 Нужно обновить правила Firestore для коллекции userOneSignalIds");
    }
  }
}

/**
 * Получить OneSignal Player ID пользователя из Firestore
 */
export async function getUserOneSignalId(userUid: string): Promise<string | null> {
  try {
    const userRef = doc(db, "userOneSignalIds", userUid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().playerId || null;
    }

    return null;
  } catch (error) {
    console.error("❌ Ошибка при получении OneSignal Player ID:", error);
    return null;
  }
}

/**
 * Настроить обработку входящих уведомлений OneSignal
 */
export function setupOneSignalNotificationListener(navigate: (path: string) => void) {
  if (typeof window === "undefined") {
    return;
  }

  console.log("👂 Настраиваем слушатель уведомлений OneSignal...");

  // Обработка кликов по уведомлениям
  OneSignal.Notifications.addEventListener("click", (event) => {
    console.log("📬 Получено уведомление OneSignal:", event);
    
    const data = event.notification.additionalData as { orderId?: string; status?: string };
    
    if (data?.orderId) {
      navigate(`/order/${data.orderId}`);
    }
  });

  console.log("✅ Слушатель уведомлений OneSignal настроен");
}

/**
 * Инициализировать уведомления OneSignal при загрузке приложения
 */
export async function initializeOneSignalNotifications(navigate: (path: string) => void) {
  // Проверяем, не инициализированы ли уже уведомления
  if (oneSignalNotificationsInitialized) {
    console.log("✅ Система уведомлений OneSignal уже инициализирована");
    return;
  }

  console.log("🚀 Инициализация системы уведомлений OneSignal...");

  // Проверяем, что мы в браузере
  if (typeof window === "undefined") {
    console.warn("⚠️ Не в браузере, уведомления недоступны");
    return;
  }

  // Инициализируем OneSignal
  const initialized = await initializeOneSignal();
  if (!initialized) {
    console.warn("⚠️ OneSignal не инициализирован (возможно, не настроен для текущего домена)");
    // Помечаем как инициализированный, чтобы не пытаться снова
    oneSignalNotificationsInitialized = true;
    return;
  }

  // Запрашиваем разрешение и получаем Player ID
  const playerId = await requestNotificationPermission();

  if (playerId) {
    console.log("✅ Player ID получен, настраиваем слушатели...");
    // Настраиваем обработчики
    setupOneSignalNotificationListener(navigate);
    oneSignalNotificationsInitialized = true;
    console.log("✅ Система уведомлений OneSignal инициализирована");
  } else {
    console.warn("⚠️ Player ID не получен, но слушатели все равно настроим");
    setupOneSignalNotificationListener(navigate);
    oneSignalNotificationsInitialized = true;
  }
}

