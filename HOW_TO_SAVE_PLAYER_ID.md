# 💾 Как сохранить Player ID в Firestore вручную

## 📋 Пошаговая инструкция

### Шаг 1: Получите Player ID из браузера

1. **Откройте приложение в браузере**
   - Запустите: `npm run dev`
   - Откройте в браузере: `http://localhost:5173`

2. **Войдите в систему**
   - Войдите под нужным пользователем

3. **Откройте консоль браузера**
   - Нажмите `F12` или `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Перейдите на вкладку **Console**

4. **Разрешите уведомления**
   - Браузер запросит разрешение на уведомления
   - Нажмите **Разрешить** (Allow)

5. **Найдите Player ID в логах**
   - В консоли должно появиться: `✅ Player ID получен: ...`
   - Скопируйте весь Player ID (это длинная строка)

   **Пример:**
   ```
   ✅ Player ID получен: 01234567-89ab-cdef-0123-456789abcdef
   ```

### Шаг 2: Узнайте UID пользователя

**Способ 1: Из консоли браузера**
- В консоли должно быть: `✅ OneSignal Player ID создан для пользователя: <UID>`
- Скопируйте UID

**Способ 2: Из Firebase Console**
- Откройте [Firebase Console](https://console.firebase.google.com)
- Перейдите: **Authentication** → **Users**
- Найдите нужного пользователя
- Скопируйте UID

**Способ 3: Из консоли браузера (через Firebase)**
- В консоли браузера выполните:
  ```javascript
  firebase.auth().currentUser.uid
  ```
- Скопируйте выведенный UID

### Шаг 3: Сохраните Player ID в Firestore

Запустите скрипт с UID и Player ID:

```bash
npm run save-player-id <USER_UID> <PLAYER_ID>
```

**Пример:**
```bash
npm run save-player-id KTTDwA8YyrZOHGUsWqVsMFNDATu2 01234567-89ab-cdef-0123-456789abcdef
```

**Или напрямую через node:**
```bash
node scripts/save-onesignal-player-id.cjs KTTDwA8YyrZOHGUsWqVsMFNDATu2 01234567-89ab-cdef-0123-456789abcdef
```

### Шаг 4: Проверьте результат

1. **В консоли должно быть:**
   ```
   ✅ Player ID создан в Firestore
   Документ: userOneSignalIds/KTTDwA8YyrZOHGUsWqVsMFNDATu2
   ✅ Готово! Player ID сохранен в Firestore
   ```

2. **Проверьте в Firebase Console:**
   - Откройте [Firebase Console](https://console.firebase.google.com)
   - Перейдите: **Firestore Database** → **Data**
   - Найдите коллекцию `userOneSignalIds`
   - Должен быть документ с вашим UID
   - В документе должно быть поле `playerId` с вашим Player ID

## 🐛 Если что-то не работает

### Ошибка: "Файл service account не найден"

**Решение:**
- Убедитесь, что файл `frebaze-94560-firebase-adminsdk-fbsvc-80df5106db.json` существует в корне проекта
- Если файла нет, скачайте новый из Firebase Console:
  - Project Settings → Service Accounts → Generate new private key

### Ошибка: "UNAUTHENTICATED"

**Решение:**
- Файл service account устарел
- Скачайте новый файл из Firebase Console
- Замените старый файл новым

### Ошибка: "permission-denied"

**Решение:**
- Убедитесь, что правила Firestore обновлены
- Откройте Firebase Console → Firestore → Rules
- Убедитесь, что есть правило для `userOneSignalIds`
- Нажмите **Publish**

### Player ID не получается в браузере

**Решение:**
1. Проверьте, что OneSignal инициализирован:
   - В консоли должно быть: `✅ OneSignal инициализирован`
2. Проверьте, что разрешение на уведомления дано:
   - В консоли должно быть: `📋 Разрешение: granted`
3. Проверьте переменные окружения:
   - Должна быть переменная `VITE_ONESIGNAL_APP_ID` в `.env.local`
4. Если на localhost не работает:
   - OneSignal может не работать на localhost
   - Используйте продакшен домен для тестирования

## 📝 Альтернативный способ: через Firebase Console

Если скрипт не работает, можно создать документ вручную:

1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Перейдите: **Firestore Database** → **Data**
3. Нажмите **Start collection** (если коллекции нет)
4. Collection ID: `userOneSignalIds`
5. Document ID: ваш UID (например, `KTTDwA8YyrZOHGUsWqVsMFNDATu2`)
6. Добавьте поля:
   - `playerId` (string): вставьте ваш Player ID
   - `uid` (string): ваш UID
   - `createdAt` (string): текущая дата/время (например, `2024-01-15T10:30:00.000Z`)
   - `updatedAt` (string): текущая дата/время
7. Нажмите **Save**

## ✅ После сохранения

После сохранения Player ID:

1. **Уведомления должны работать**
   - Отправьте сообщение в чат
   - Должно прийти push-уведомление на телефон

2. **Проверьте логи:**
   - В консоли браузера должно быть: `✅ Уведомление отправлено через OneSignal`
   - НЕ должно быть: `404 (Not Found)` или `Player ID не найден`

3. **Проверьте в Firestore:**
   - Документ должен существовать
   - Поле `playerId` должно содержать ваш Player ID

## 🎯 Итог

После выполнения всех шагов:
- ✅ Player ID сохранен в Firestore
- ✅ Уведомления должны работать
- ✅ При отправке сообщений в чат будут приходить push-уведомления


