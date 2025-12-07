import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export async function openPaymentUrl(confirmationUrl: string): Promise<void> {
  if (!confirmationUrl) return;

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: confirmationUrl, presentationStyle: 'fullscreen' });
  } else {
    window.location.href = confirmationUrl;
  }
}

export async function closeInAppBrowserIfNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Browser.close();
  } catch (e) {
    console.warn("⚠️ Не удалось закрыть встроенный браузер:", e);
  }
}
