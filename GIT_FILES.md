# 📦 Какие файлы загружать в GitHub

## ✅ Файлы, которые НУЖНО загрузить в Git

### 📁 Основные файлы проекта
```
✅ api/
   └── send-notification.ts          # Vercel API endpoint

✅ src/
   └── lib/
       └── notifications.ts          # Обновленный код уведомлений

✅ vercel.json                        # Конфигурация Vercel

✅ package.json                       # Обновлен с @vercel/node

✅ firestore.rules                    # Правила Firestore

✅ public/
   └── firebase-messaging-sw.js      # Service Worker

✅ Все остальные файлы проекта
```

## ❌ Файлы, которые НЕ нужно загружать в Git

### 🔒 Секретные файлы (добавлены в .gitignore)
```
❌ .env.local                         # Локальные переменные окружения
❌ .env                               # Переменные окружения
❌ *.local                            # Все .local файлы
❌ node_modules/                      # Зависимости
❌ dist/                              # Собранные файлы
❌ frebaze-94560-firebase-adminsdk-*.json  # Service Account ключи
```

## 📋 Структура для GitHub

```
your-project/
├── api/                              ✅ Закоммитить
│   └── send-notification.ts
├── src/                              ✅ Закоммитить
│   └── lib/
│       └── notifications.ts
├── public/                           ✅ Закоммитить
│   └── firebase-messaging-sw.js
├── vercel.json                       ✅ Закоммитить
├── package.json                      ✅ Закоммитить (обновлен)
├── firestore.rules                   ✅ Закоммитить
├── .gitignore                        ✅ Закоммитить (проверьте)
├── .env.local                        ❌ НЕ коммитить
└── README.md                         ✅ Закоммитить
```

## 🚀 Команды для загрузки в GitHub

### 1. Проверьте, что файлы добавлены в .gitignore

Убедитесь, что в `.gitignore` есть:
```
.env
.env.local
*.local
node_modules/
dist/
*-firebase-adminsdk-*.json
```

### 2. Добавьте файлы в Git

```bash
# Добавьте все новые файлы
git add api/send-notification.ts
git add vercel.json
git add package.json
git add src/lib/notifications.ts

# Или добавьте все изменения
git add .
```

### 3. Проверьте, что секретные файлы не добавлены

```bash
# Проверьте статус
git status

# Убедитесь, что НЕТ:
# - .env.local
# - *.json файлов с Service Account
# - node_modules/
```

### 4. Закоммитьте изменения

```bash
git commit -m "Добавлена поддержка Vercel API для уведомлений"
```

### 5. Загрузите в GitHub

```bash
git push origin main
# или
git push origin master
```

## ⚠️ ВАЖНО: Безопасность

### ❌ НИКОГДА не коммитьте:

1. **Service Account ключи:**
   ```
   ❌ frebaze-94560-firebase-adminsdk-*.json
   ❌ Любые JSON файлы с ключами Firebase
   ```

2. **Переменные окружения:**
   ```
   ❌ .env
   ❌ .env.local
   ❌ .env.production
   ```

3. **Секретные данные:**
   ```
   ❌ FIREBASE_PRIVATE_KEY
   ❌ VAPID ключи (если они секретные)
   ```

### ✅ Что можно коммитить:

- ✅ Код приложения
- ✅ Конфигурационные файлы (без секретов)
- ✅ Документацию
- ✅ Структуру проекта

## 🔍 Проверка перед коммитом

### Выполните команду:

```bash
git status
```

### Убедитесь, что НЕТ в списке:

- ❌ `.env.local`
- ❌ `*-firebase-adminsdk-*.json`
- ❌ `node_modules/`
- ❌ Любые файлы с секретами

### Если видите секретные файлы:

```bash
# Удалите их из индекса (но оставьте локально)
git rm --cached .env.local
git rm --cached *-firebase-adminsdk-*.json

# Добавьте в .gitignore
echo ".env.local" >> .gitignore
echo "*-firebase-adminsdk-*.json" >> .gitignore
```

## 📝 Чеклист перед push

- [ ] Проверил `.gitignore` - секретные файлы игнорируются
- [ ] Проверил `git status` - нет секретных файлов
- [ ] Добавил `api/send-notification.ts`
- [ ] Добавил `vercel.json`
- [ ] Обновил `package.json` (добавлен `@vercel/node`)
- [ ] Обновил `src/lib/notifications.ts`
- [ ] Закоммитил изменения
- [ ] Готов к push в GitHub

## 🎯 Итог

**Закоммитьте:**
- ✅ `api/send-notification.ts`
- ✅ `vercel.json`
- ✅ Обновленный `package.json`
- ✅ Обновленный `src/lib/notifications.ts`
- ✅ Все остальные файлы проекта

**НЕ коммитьте:**
- ❌ `.env.local`
- ❌ Service Account JSON файлы
- ❌ `node_modules/`
- ❌ Секретные данные

После push в GitHub:
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в Vercel Dashboard
3. Деплой автоматический!

