import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast as showToast } from "@/hooks/use-toast";

export async function initializeCapacitorPushForCurrentUser(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const user = auth?.currentUser;
    if (!user || !db) {
      return;
    }

    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive !== "granted") {
      console.warn("⚠️ Push permissions not granted (Capacitor)");
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener("registration", async (token) => {
      try {
        console.log("📲 Capacitor push token:", token.value);
        const ref = doc(db, "userFCMTokens", user.uid);
        await setDoc(
          ref,
          {
            token: token.value,
            platform: "android-capacitor",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("✅ Capacitor FCM токен сохранен для", user.uid);
      } catch (error) {
        console.error("❌ Ошибка при сохранении Capacitor push токена:", error);
      }
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("❌ Ошибка регистрации push-уведомлений (Capacitor):", error);
    });

    // Foreground-слушатель полученных push-уведомлений на нативном Android (Capacitor)
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("📩 Push получен (Capacitor):", notification);

      const data: any = notification.data || {};

      const title =
        notification.title ||
        (typeof data.title === "string" ? data.title : "Новое уведомление");

      const body =
        notification.body || (typeof data.body === "string" ? data.body : "");

      showToast({
        title,
        description: body,
      });
    });
  } catch (error) {
    console.error("❌ Ошибка при инициализации Capacitor push:", error);
  }
}
