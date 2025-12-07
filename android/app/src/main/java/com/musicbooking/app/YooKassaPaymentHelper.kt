package com.musicbooking.app

import android.app.Activity
import java.math.BigDecimal
import java.util.Currency
import ru.yoomoney.sdk.kassa.payments.Checkout
import ru.yoomoney.sdk.kassa.payments.TokenizationResult
import ru.yoomoney.sdk.kassa.payments.Amount
import ru.yoomoney.sdk.kassa.payments.PaymentParameters
import ru.yoomoney.sdk.kassa.payments.SavePaymentMethod
import ru.yoomoney.sdk.kassa.payments.PaymentMethodType

// Заготовка для интеграции YooKassa Android SDK.
// Далее сюда добавим реальный вызов SDK и обработку результата.
object YooKassaPaymentHelper {

    // Тестовый ключ SDK, который ты выдал
    private const val TEST_SDK_KEY: String = "test_MTIyMjkyMz8tBA5_zr2TiXGJDffc0cG9u6TNq-TbJYw"

    // Твой shopId из backend
    private const val SHOP_ID: String = "1222923"

    // Request code для startActivityForResult
    const val TOKENIZE_REQUEST_CODE: Int = 1001

    /**
     * Базовый метод для старта оплаты через YooKassa SDK.
     * Позже сюда добавим конкретные параметры SDK (shopId, amount, currency и т.д.)
     * и вызов экрана оплаты.
     */
    fun startPayment(
        activity: Activity,
        amount: String,
        description: String?,
    ) {
        // Преобразуем сумму в BigDecimal
        val value = try {
            BigDecimal(amount.replace(",", "."))
        } catch (e: Exception) {
            e.printStackTrace()
            return
        }

        val paymentAmount = Amount(value, Currency.getInstance("RUB"))

        val title = description ?: "Оплата заказа"
        val subtitle = "Оплата банковской картой"

        // Разрешаем только оплату банковской картой
        val paymentMethodTypes = setOf(PaymentMethodType.BANK_CARD)

        val paymentParameters = PaymentParameters(
            amount = paymentAmount,
            title = title,
            subtitle = subtitle,
            clientApplicationKey = TEST_SDK_KEY,
            shopId = SHOP_ID,
            savePaymentMethod = SavePaymentMethod.OFF,
            paymentMethodTypes = paymentMethodTypes,
        )

        val intent = Checkout.createTokenizeIntent(
            context = activity,
            paymentParameters = paymentParameters,
        )

        activity.startActivityForResult(intent, TOKENIZE_REQUEST_CODE)
    }
}
