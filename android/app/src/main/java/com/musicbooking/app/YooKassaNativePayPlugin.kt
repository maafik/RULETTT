package com.musicbooking.app

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.PluginMethod

/**
 * Capacitor-плагин для вызова нативной оплаты через YooKassa Android SDK.
 * 
 * JS-сторона позже сможет вызывать:
 *   YooKassaNativePay.pay({ orderId, amount, description })
 */
@CapacitorPlugin(name = "YooKassaNativePay")
class YooKassaNativePayPlugin : Plugin() {

    @PluginMethod
    fun pay(call: PluginCall) {
        val orderId = call.getString("orderId")
        val amount = call.getString("amount")
        val description = call.getString("description")

        if (orderId.isNullOrBlank() || amount.isNullOrBlank()) {
            call.reject("orderId и amount обязательны")
            return
        }

        val activity = activity
        if (activity == null) {
            call.reject("Activity недоступна")
            return
        }

        // Пока что просто вызываем заготовку помощника.
        // На следующем шаге сюда добавим реальный запуск YooKassa SDK
        // и обработку результата (успех/ошибка/отмена) с последующим
        // вызовом call.resolve / call.reject.
        YooKassaPaymentHelper.startPayment(
            activity = activity,
            amount = amount,
            description = description ?: "Оплата заказа $orderId",
        )

        // Временное поведение: сразу отвечаем, что вызов отправлен.
        // Когда добавим реальную интеграцию SDK, будем резолвить после результата оплаты.
        call.resolve(
            com.getcapacitor.JSObject().apply {
                put("status", "started")
                put("orderId", orderId)
            }
        )
    }
}
