# 🔍 Проверка OneSignal REST API Key (403 Forbidden)

## ❌ Проблема

```
POST https://rulettt.vercel.app/api/send-notification 403 (Forbidden)
❌ Ошибка OneSignal API: {error: 'Failed to send notification via OneSignal'}
```

## ✅ Что нужно проверить

### 1. Проверьте логи Vercel функции

1. Откройте [Vercel Dashboard](https://vercel.com)
2. Перейдите: **Functions** → `api/send-notification`
3. Найдите последний вызов функции
4. Проверьте логи на наличие:
   - `🔍 Проверка OneSignal credentials:` - должны быть `hasApiKey: true`
   - `❌ Ошибка OneSignal API:` - детали ошибки от OneSignal
   - `💡 403 Forbidden - проблема с авторизацией` - подсказки

### 2. Проверьте REST API Key в Vercel

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Найдите переменную `ONESIGNAL_REST_API_KEY`
3. Убедитесь, что:
   - ✅ Переменная существует
   - ✅ Значение правильное (начинается с `os_v2_app_...`)
   - ✅ Нет лишних пробелов
   - ✅ Выбраны все окружения (Production, Preview, Development)

### 3. Проверьте REST API Key в OneSignal Dashboard

1. Откройте [OneSignal Dashboard](https://app.onesignal.com)
2. Перейдите: **Settings** → **Keys & IDs**
3. Найдите **REST API Key**
4. Убедитесь, что:
   - ✅ Ключ активен (не отозван)
   - ✅ Ключ имеет права на отправку уведомлений
   - ✅ Key ID: `ii3zjingleti53c3wpzel2ksg` активен

### 4. Если ключ неправильный или отозван

1. В OneSignal Dashboard → Settings → Keys & IDs
2. Найдите ключ с Key ID: `ii3zjingleti53c3wpzel2ksg`
3. Если он отозван или неактивен:
   - Создайте новый ключ через **"Add Key"**
   - Скопируйте новый полный ключ
   - Обновите в Vercel: удалите старую переменную и создайте новую
   - **Redeploy** проект

---

## 🔧 Быстрое исправление

### Шаг 1: Проверьте текущий ключ

В Vercel Environment Variables должно быть:
```
Key: ONESIGNAL_REST_API_KEY
Value: os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
```

### Шаг 2: Если ключ неправильный

1. OneSignal Dashboard → Settings → Keys & IDs
2. Скопируйте **полный REST API Key** (начинается с `os_v2_app_...`)
3. В Vercel:
   - Удалите старую переменную `ONESIGNAL_REST_API_KEY`
   - Создайте новую с тем же именем
   - Вставьте скопированный ключ
   - Выберите все окружения
   - Сохраните

### Шаг 3: Передеплойте проект

После обновления переменной:
- Vercel Dashboard → **Deployments** → **Redeploy** (последний деплой)

Или через Git:
```bash
git commit --allow-empty -m "Trigger redeploy for OneSignal API key"
git push
```

---

## ✅ После исправления

После обновления REST API Key и передеплоя:

1. ✅ Проверьте логи Vercel функции - не должно быть ошибок 403
2. ✅ Попробуйте отправить сообщение в чате
3. ✅ Уведомление должно отправиться успешно

---

## 📝 Проверка в логах

После передеплоя в логах Vercel функции должно быть:

```
🔍 Проверка OneSignal credentials: {
  hasAppId: true,
  hasApiKey: true,
  apiKeyLength: 100+ (примерно),
  apiKeyPrefix: 'os_v2_app_blq5'
}
```

Если `hasApiKey: false` или `apiKeyLength: 0` - ключ не установлен в Vercel!

