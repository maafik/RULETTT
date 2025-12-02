# 🔧 Исправление ошибки 403 Forbidden от OneSignal API

## ❌ Проблема

```
POST https://rulettt.vercel.app/api/send-notification 403 (Forbidden)
❌ Ошибка OneSignal API: {error: 'Failed to send notification via OneSignal'}
```

## 🔍 Причины ошибки 403

Ошибка 403 (Forbidden) от OneSignal API означает проблему с авторизацией:

1. **Неправильный REST API Key** - ключ неверный или устарел
2. **REST API Key не имеет прав** - ключ не активирован или не имеет прав на отправку
3. **Неправильный формат ключа** - ключ скопирован с лишними пробелами или символами
4. **Ключ не добавлен в Vercel** - переменная `ONESIGNAL_REST_API_KEY` не установлена

---

## ✅ Решения

### 1. Проверьте REST API Key в OneSignal Dashboard

1. Откройте [OneSignal Dashboard](https://app.onesignal.com)
2. Перейдите: **Settings** → **Keys & IDs**
3. Найдите **REST API Key**
4. Убедитесь, что ключ активен и имеет права на отправку уведомлений

### 2. Проверьте переменную в Vercel

1. Откройте [Vercel Dashboard](https://vercel.com)
2. Перейдите: **Settings** → **Environment Variables**
3. Найдите переменную `ONESIGNAL_REST_API_KEY`
4. Убедитесь, что:
   - ✅ Значение правильное (скопировано полностью)
   - ✅ Нет лишних пробелов в начале/конце
   - ✅ Выбраны все окружения (Production, Preview, Development)

### 3. Скопируйте REST API Key заново

1. В OneSignal Dashboard → Settings → Keys & IDs
2. Скопируйте **REST API Key** (начинается с `os_v2_app_...`)
3. В Vercel удалите старую переменную `ONESIGNAL_REST_API_KEY`
4. Создайте новую с тем же именем и вставьте скопированный ключ
5. Выберите все окружения
6. Сохраните и **Redeploy** проект

### 4. Проверьте формат ключа

REST API Key должен выглядеть так:
```
os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
```

**Важно:**
- ✅ Начинается с `os_v2_app_`
- ✅ Длинный (около 100+ символов)
- ✅ Без пробелов и переносов строк
- ✅ Без кавычек

### 5. Проверьте логи Vercel

После передеплоя проверьте логи функции:

1. Vercel Dashboard → **Functions** → `api/send-notification`
2. Найдите последний вызов
3. Проверьте логи на наличие:
   - `❌ Ошибка OneSignal API:` - детали ошибки
   - `💡 403 Forbidden - проверьте ONESIGNAL_REST_API_KEY` - подсказка

---

## 🔍 Проверка

После исправления проверьте:

1. ✅ REST API Key правильный в OneSignal Dashboard
2. ✅ Переменная `ONESIGNAL_REST_API_KEY` установлена в Vercel
3. ✅ Проект передеплоен
4. ✅ Попробуйте отправить уведомление снова

---

## 📝 Пример правильной настройки

**Vercel Environment Variables:**

```
Key: ONESIGNAL_REST_API_KEY
Value: os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
Environment: ✅ Production, ✅ Preview, ✅ Development
```

---

## ⚠️ Если проблема останется

1. Проверьте, что App ID правильный: `0ae1d329-0160-4eac-aacc-df8f50479606`
2. Убедитесь, что REST API Key соответствует этому App ID
3. Проверьте, что в OneSignal Dashboard включена отправка уведомлений
4. Попробуйте создать новый REST API Key в OneSignal Dashboard

