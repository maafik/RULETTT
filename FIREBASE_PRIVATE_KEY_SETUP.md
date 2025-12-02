# 🔑 Настройка FIREBASE_PRIVATE_KEY в Vercel

## ✅ Правильный способ

### Вариант 1: Скопировать из JSON как есть (рекомендуется)

1. Откройте файл Service Account JSON (например, `frebaze-94560-firebase-adminsdk-*.json`)
2. Найдите поле `"private_key"`
3. Скопируйте **всё значение** (включая кавычки и `\n`)
4. В Vercel вставьте **только значение** (без кавычек)

**Пример:**
```json
В JSON файле:
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

В Vercel вставьте:
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

### Вариант 2: С реальными переносами строк

Если Vercel не принимает `\n`, можно вставить с реальными переносами:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(все строки ключа)
-----END PRIVATE KEY-----
```

---

## ⚠️ Важно:

1. **НЕ начинайте с `/n`** - это неправильно
2. **НЕ начинайте с `\n`** - это тоже неправильно  
3. **Начинайте с `-----BEGIN PRIVATE KEY-----`**
4. **Заканчивайте на `-----END PRIVATE KEY-----\n`**

---

## ✅ Environments (галочки)

**Да, ставьте все три галочки:**
- ✅ Production
- ✅ Preview  
- ✅ Development

Это нужно, чтобы переменные работали во всех окружениях.

---

## 🔍 Проверка

После добавления переменной и передеплоя, проверьте в логах Vercel:
- Должно быть: `✅ Firebase Admin инициализирован`
- НЕ должно быть: `❌ Ошибка инициализации Firebase Admin`

