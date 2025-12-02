# 🔧 Исправление ошибки 404 для API endpoint

## ❌ Проблема

```
POST https://rulettt.vercel.app/api/send-notification 404 (Not Found)
```

## ✅ Решения

### 1. Проверьте, что файл правильно задеплоен

Убедитесь, что файл `api/send-notification.ts` находится в корне проекта (не в `src/api/`).

**Правильная структура:**
```
project/
├── api/
│   └── send-notification.ts  ✅
├── src/
├── vercel.json
└── package.json
```

### 2. Проверьте vercel.json

Убедитесь, что в `vercel.json` есть правильная конфигурация:

```json
{
  "rewrites": [
    {
      "source": "/((?!OneSignalSDKWorker\\.js|OneSignalSDK\\.sw\\.js|api/).*)",
      "destination": "/"
    }
  ],
  "functions": {
    "api/send-notification.ts": {
      "maxDuration": 10
    }
  }
}
```

### 3. Передеплойте проект

После изменений нужно передеплоить:

1. Закоммитьте изменения:
   ```bash
   git add api/send-notification.ts vercel.json
   git commit -m "Fix API endpoint configuration"
   git push
   ```

2. Vercel автоматически задеплоит, или:
   - Vercel Dashboard → Deployments → Redeploy

### 4. Проверьте логи Vercel

После деплоя проверьте:
- Vercel Dashboard → Functions → `api/send-notification`
- Должны быть логи без ошибок

### 5. Проверьте URL

После деплоя проверьте, что endpoint доступен:
- Откройте: `https://rulettt.vercel.app/api/send-notification`
- Должен вернуть ошибку метода (405), а не 404

---

## 🔍 Проверка Player ID

**Player ID не найден** - это нормально, если пользователь еще не разрешил уведомления.

### Что нужно сделать:

1. Пользователь `DypkhitMEzLyPzSBTLoPMGYQxHM2` (Анна Смирнова) должен:
   - Открыть сайт `https://rulettt.vercel.app`
   - Войти в систему
   - Разрешить уведомления в браузере
   - После этого Player ID автоматически сохранится в Firestore

2. Проверьте в Firestore:
   - Коллекция: `userOneSignalIds`
   - Документ: `DypkhitMEzLyPzSBTLoPMGYQxHM2`
   - Должно быть поле: `playerId`

---

## ✅ После исправления

1. ✅ API endpoint должен отвечать (не 404)
2. ✅ Player ID должен появиться после разрешения уведомлений
3. ✅ Уведомления должны отправляться

