import { Capacitor, registerPlugin } from "@capacitor/core";

interface NativePayOptions {
  orderId: string;
  amount: number;
  description: string;
}

interface NativePayResult {
  status: string;
  orderId?: string;
}

const YooKassaNativePay = registerPlugin<{
  pay(options: NativePayOptions): Promise<NativePayResult>;
}>("YooKassaNativePay");

export async function tryPayWithNativeYooKassa(
  options: NativePayOptions
): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return false;
  }

  try {
    await YooKassaNativePay.pay(options);
    return true;
  } catch (error) {
    console.error("Ошибка нативной оплаты YooKassa:", error);
    return false;
  }
}
