# ✅ Проверка FIREBASE_PRIVATE_KEY

## 📋 Ваш ключ выглядит правильно!

Формат ключа:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfkQJTBX2orOWu\ndO/iXnw/Wf1GapPB5if2P3O2YkWk1wuyTwKvXhf9yAoulj9FIe9/FzVGy2vjWRrR\n...
-----END PRIVATE KEY-----\n
```

## ✅ Что правильно:

1. ✅ Начинается с `-----BEGIN PRIVATE KEY-----\n`
2. ✅ Заканчивается на `-----END PRIVATE KEY-----\n`
3. ✅ Содержит символы `\n` (не переносы строк, а буквально `\n`)
4. ✅ Полный ключ присутствует

## ⚠️ Важно для Vercel:

Vercel может обработать ключ двумя способами:

### Вариант 1: С символами `\n` (как у вас) ✅
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfkQJTBX2orOWu\ndO/iXnw/Wf1GapPB5if2P3O2YkWk1wuyTwKvXhf9yAoulj9FIe9/FzVGy2vjWRrR\n...
-----END PRIVATE KEY-----\n
```

### Вариант 2: С реальными переносами строк (тоже работает)
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfkQJTBX2orOWu
dO/iXnw/Wf1GapPB5if2P3O2YkWk1wuyTwKvXhf9yAoulj9FIe9/FzVGy2vjWRrR
...
-----END PRIVATE KEY-----
```

## 🔍 Как проверить, что ключ работает:

После добавления ключа в Vercel и передеплоя:

1. **Проверьте логи Vercel функции:**
   - Vercel Dashboard → Functions → `api/send-notification`
   - Должно быть: `✅ Firebase Admin инициализирован`
   - НЕ должно быть: `❌ Ошибка инициализации Firebase Admin`

2. **Попробуйте отправить уведомление:**
   - Если ошибка 403 исчезла и уведомления отправляются - ключ работает! ✅
   - Если все еще ошибка - проверьте формат ключа

## 💡 Если ключ не работает:

1. **Попробуйте вариант с реальными переносами строк:**
   - Скопируйте ключ из JSON файла
   - Вставьте в Vercel с реальными переносами (не `\n`, а Enter)

2. **Или убедитесь, что `\n` обрабатываются правильно:**
   - В коде есть обработка: `privateKey.replace(/\\n/g, '\n')`
   - Это должно работать с вашим форматом

## ✅ Итог:

**Ваш ключ выглядит правильно!** Формат корректный. Если после передеплоя Firebase Admin инициализируется без ошибок - все работает! 🎉

