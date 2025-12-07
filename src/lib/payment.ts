// YooKassa Payment Service
// Test key for mobile SDK: test_MTIyMjkyMz8tBA5_zr2TiXGJDffc0cG9u6TNq-TbJYw

const YOOKASSA_TEST_KEY = "test_MTIyMjkyMz8tBA5_zr2TiXGJDffc0cG9u6TNq-TbJYw";

export interface PaymentData {
  amount: {
    value: string; // Сумма в рублях (например, "1000.00")
    currency: string; // Валюта (например, "RUB")
  };
  confirmation: {
    type: string; // Тип подтверждения (например, "redirect" или "embedded")
    return_url: string; // URL для возврата после оплаты
  };
  description?: string; // Описание платежа
  metadata?: Record<string, string>; // Дополнительные данные
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  confirmationUrl?: string;
  error?: string;
}

/**
 * Создает платеж через YooKassa
 * @param amount - Сумма платежа в рублях
 * @param description - Описание платежа
 * @param orderId - ID заказа
 * @returns Результат создания платежа
 */
export const createYooKassaPayment = async (
  amount: number,
  description: string,
  orderId: string
): Promise<PaymentResult> => {
  try {
    // Форматируем сумму (YooKassa ожидает строку с двумя знаками после запятой)
    const amountValue = amount.toFixed(2);

    console.log("💳 Запрос на создание платежа YooKassa через payment-server:", {
      amount: amountValue,
      description,
      orderId,
    });

    // Базовый URL payment-сервера
    // Для разработки: http://localhost:4000
    // Для продакшена: задается через VITE_PAYMENT_API_URL
    const baseUrl = import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:4000";
    const url = `${baseUrl.replace(/\/$/, "")}/create-payment`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountValue,
        description,
        orderId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Ошибка ответа backend при создании платежа:", response.status, text);
      return {
        success: false,
        error: "Ошибка при создании платежа на сервере",
      };
    }

    const result = await response.json();

    if (!result.success || !result.confirmationUrl) {
      console.error("❌ Backend вернул ошибку при создании платежа:", result);
      return {
        success: false,
        error: result.error || "Не удалось создать платеж",
      };
    }

    return {
      success: true,
      paymentId: result.paymentId,
      confirmationUrl: result.confirmationUrl,
    };
  } catch (error) {
    console.error("❌ Ошибка при создании платежа YooKassa:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
  }
};

/**
 * Инициализирует YooKassa SDK для мобильного приложения
 * @param shopId - ID магазина в YooKassa (опционально)
 */
export const initializeYooKassa = async (shopId?: string): Promise<void> => {
  try {
    // Для мобильного приложения может потребоваться инициализация нативного SDK
    // В зависимости от платформы (Android/iOS)
    
    console.log("🔧 Инициализация YooKassa SDK", {
      testKey: YOOKASSA_TEST_KEY.substring(0, 20) + "...",
      shopId,
    });

    // TODO: Добавить инициализацию нативного SDK для Android/iOS
    // Для Android может потребоваться:
    // - Добавить зависимость в build.gradle
    // - Инициализировать SDK в MainActivity
    // - Создать Capacitor plugin для взаимодействия с нативным SDK

    // Для веб-версии можно использовать JavaScript SDK
    if (typeof window !== "undefined" && !window.navigator.userAgent.includes("Mobile")) {
      // Инициализация для веб
      console.log("🌐 Инициализация YooKassa для веб");
    }
  } catch (error) {
    console.error("❌ Ошибка при инициализации YooKassa:", error);
  }
};

/**
 * Обрабатывает возврат после оплаты
 * @param paymentId - ID платежа
 * @param orderId - ID заказа
 */
export const handlePaymentReturn = async (
  paymentId: string,
  orderId: string
): Promise<PaymentResult> => {
  try {
    console.log("🔄 Обработка возврата после оплаты:", { paymentId, orderId });

    // TODO: Проверить статус платежа через ваш бэкенд
    /*
    const response = await fetch(`/api/payments/${paymentId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${YOOKASSA_TEST_KEY}`,
      },
    });

    const status = await response.json();
    */

    // Временная заглушка
    return {
      success: true,
      paymentId,
    };
  } catch (error) {
    console.error("❌ Ошибка при обработке возврата:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
  }
};


