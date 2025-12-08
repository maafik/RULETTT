package com.musicbooking.app;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.HashSet;
import java.util.Set;

import ru.yoomoney.sdk.kassa.payments.Amount;
import ru.yoomoney.sdk.kassa.payments.Checkout;
import ru.yoomoney.sdk.kassa.payments.PaymentMethodType;
import ru.yoomoney.sdk.kassa.payments.PaymentParameters;
import ru.yoomoney.sdk.kassa.payments.SavePaymentMethod;

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

        try {
            BigDecimal value = new BigDecimal(amount.replace(",", "."));
            Amount paymentAmount = new Amount(value, Currency.getInstance("RUB"));

            String title = (description != null && !description.isEmpty())
                    ? description
                    : "Оплата заказа";
            String subtitle = "Оплата банковской картой";

            Set<PaymentMethodType> paymentMethodTypes = new HashSet<>();
            paymentMethodTypes.add(PaymentMethodType.BANK_CARD);

            PaymentParameters paymentParameters = new PaymentParameters(
                    paymentAmount,
                    title,
                    subtitle,
                    TEST_SDK_KEY,
                    SHOP_ID,
                    SavePaymentMethod.OFF,
                    paymentMethodTypes
            );

            Intent intent = Checkout.createTokenizeIntent(
                    activity,
                    paymentParameters
            );

            activity.startActivityForResult(intent, TOKENIZE_REQUEST_CODE);
        } catch (Exception e) {
            Log.e(TAG, "Error starting YooKassa payment", e);
        }
    }
}
