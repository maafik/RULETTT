# 🔔 Настройка уведомлений от статусов заказов

## ✅ Что уже настроено

- ✅ OneSignal интегрирован в приложение
- ✅ Код отправки уведомлений при изменении статусов готов
- ✅ API endpoint `/api/send-notification` настроен
- ✅ Разрешение `POST_NOTIFICATIONS` добавлено в AndroidManifest.xml

## 📋 Какие статусы отправляют уведомления?

### 1. **payment-pending** (Музыкант подтвердил заказ)
- **Кому:** Клиенту
- **Текст:** "Заказ подтвержден" - "{artistName} подтвердил ваш заказ. Ожидается оплата."
- **Когда:** Музыкант нажимает "Подтвердить заказ"

### 2. **in-progress** (Клиент оплатил)
- **Кому:** Музыканту
- **Текст:** "Заказ оплачен" - "{customerName} оплатил заказ для {artistName}. Заказ в процессе выполнения."
- **Когда:** Клиент нажимает "Оплатить"

### 3. **completed** (Заказ завершен)
- **Кому:** Обеим сторонам (клиенту и музыканту)
- **Клиенту:** "Заказ завершен" - "Заказ от {artistName} успешно завершен. Спасибо!"
- **Музыканту:** "Заказ завершен" - "Заказ для {customerName} успешно завершен."
- **Когда:** Любая сторона нажимает "Завершить заказ"

### 4. **cancelled** (Заказ отменен)
- **Кому:** Противоположной стороне
- **Текст:** "Заказ отменен" - зависит от того, кто отменил
- **Когда:** Любая сторона нажимает "Отменить заказ"

## 🔧 Как это работает?

### Процесс отправки уведомления:

```
1. Пользователь меняет статус заказа
   ↓
2. updateOrderStatus(orderId, newStatus) в firebase-db.ts
   ↓
3. sendStatusChangeNotification() определяет тип уведомления
   ↓
4. Вызывается соответствующая функция:
   - notifyOrderConfirmed()
   - notifyOrderPaid()
   - notifyOrderCompleted()
   - notifyOrderCancelled()
   ↓
5. sendOrderNotification() получает Player ID из Firestore
   ↓
6. Отправка через API /api/send-notification
   ↓
7. OneSignal REST API отправляет push-уведомление
   ↓
8. Уведомление приходит на устройство пользователя
```

## ⚙️ Настройка для Android

### 1. Разрешения (уже добавлено ✅)

В `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 2. OneSignal App ID

Убедитесь, что в переменных окружения есть:
```env
VITE_ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
```

### 3. OneSignal REST API Key (для сервера)

В Vercel Environment Variables:
```env
ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606
ONESIGNAL_REST_API_KEY=os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
```

## 🔍 Проверка работы уведомлений

### Шаг 1: Проверьте инициализацию OneSignal

1. Откройте приложение
2. Войдите в аккаунт
3. Откройте консоль браузера/логи Android
4. Должны увидеть:
   ```
   ✅ OneSignal инициализирован
   ✅ Player ID получен: ...
   ✅ Система уведомлений OneSignal инициализирована
   ```

### Шаг 2: Проверьте сохранение Player ID

1. Откройте Firestore Console
2. Перейдите в коллекцию `userOneSignalIds`
3. Должен быть документ с вашим UID
4. В документе должно быть поле `playerId`

### Шаг 3: Проверьте отправку уведомления

1. Создайте тестовый заказ
2. Измените статус заказа (например, подтвердите заказ)
3. Проверьте консоль - должны увидеть:
   ```
   📤 Отправка уведомления через OneSignal...
   ✅ Уведомление отправлено через OneSignal
   ```
4. Проверьте Firestore - в коллекции `notifications` должен появиться документ

### Шаг 4: Проверьте получение уведомления

1. Убедитесь, что разрешение на уведомления предоставлено
2. Измените статус заказа
3. Уведомление должно прийти на устройство

## 🐛 Решение проблем

### Проблема: Уведомления не приходят

**Проверьте:**

1. ✅ OneSignal инициализирован (проверьте консоль)
2. ✅ Player ID сохранен в Firestore (`userOneSignalIds/{uid}`)
3. ✅ Разрешение на уведомления предоставлено
4. ✅ API endpoint `/api/send-notification` работает
5. ✅ OneSignal REST API Key правильный в Vercel

**Логи для проверки:**

```javascript
// В консоли браузера должны быть:
✅ OneSignal инициализирован
✅ Player ID получен: ...
📤 Отправка уведомления через OneSignal...
✅ Уведомление отправлено через OneSignal
```

### Проблема: Player ID не сохраняется

**Решение:**

1. Проверьте правила Firestore для коллекции `userOneSignalIds`:
   ```javascript
   match /userOneSignalIds/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```

2. Убедитесь, что пользователь авторизован

### Проблема: Уведомления не приходят на Android

**Решение:**

1. Убедитесь, что разрешение `POST_NOTIFICATIONS` добавлено в AndroidManifest.xml
2. Проверьте, что разрешение предоставлено в настройках приложения
3. Для Android 13+ разрешение запрашивается автоматически при первом запуске

## 📝 Файлы, связанные с уведомлениями

- `src/lib/onesignal.ts` - инициализация OneSignal
- `src/lib/notifications.ts` - функции отправки уведомлений
- `src/lib/firebase-db.ts` - функция `updateOrderStatus()` и `sendStatusChangeNotification()`
- `api/send-notification.ts` - API endpoint для отправки через OneSignal REST API
- `src/App.tsx` - инициализация уведомлений при загрузке приложения

## 🎯 Итог

Уведомления от статусов **уже настроены и должны работать**! 

Просто убедитесь, что:
1. ✅ OneSignal App ID указан в переменных окружения
2. ✅ OneSignal REST API Key указан в Vercel
3. ✅ Разрешение на уведомления предоставлено
4. ✅ Player ID сохраняется в Firestore

После этого при изменении статуса заказа уведомления будут отправляться автоматически! 🎉

