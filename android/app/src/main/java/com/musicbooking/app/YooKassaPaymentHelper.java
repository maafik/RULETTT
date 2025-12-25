package com.musicbooking.app;

import android.app.Activity;
import android.util.Log;

/**
 * Java-хелпер для запуска нативной формы YooKassa SDK.
 */
public class YooKassaPaymentHelper {

    private static final String TAG = "YooKassaPaymentHelper";

    // Тестовый ключ SDK
    private static final String TEST_SDK_KEY = "test_MTIyMjkyMz8tBA5_zr2TiXGJDffc0cG9u6TNq-TbJYw";

    // Твой shopId из backend
    private static final String SHOP_ID = "1222923";

    // Request code для startActivityForResult
    public static final int TOKENIZE_REQUEST_CODE = 1001;

    public static void startPayment(Activity activity, String amount, String description) {
        if (activity == null) {
            Log.e(TAG, "Activity is null, cannot start payment");
            return;
        }

        // Нативный SDK YooKassa сейчас не используется.
        // Вся оплата проходит через веб-флоу (Redirect + return_url).
        // Этот метод оставлен как заглушка, чтобы не ломать возможные вызовы.
        Log.w(TAG, "YooKassaPaymentHelper.startPayment called, but native SDK is not integrated. Using web-based payments instead.");
    }
}
