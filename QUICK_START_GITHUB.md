# 🚀 Быстрый старт: Загрузка в GitHub

## 📦 Что нужно загрузить

### ✅ Обязательные файлы (уже созданы):

1. **`api/send-notification.ts`** - API endpoint для Vercel
2. **`vercel.json`** - Конфигурация Vercel
3. **`package.json`** - Обновлен с зависимостью `@vercel/node`
4. **`src/lib/notifications.ts`** - Обновленный код уведомлений
5. **`.gitignore`** - Обновлен для защиты секретов

## 🔧 Шаги

### 1. Установите зависимость

```bash
npm install @vercel/node
```

### 2. Проверьте .gitignore

Убедитесь, что в `.gitignore` есть:
```
.env
.env.local
*-firebase-adminsdk-*.json
```

### 3. Добавьте файлы в Git

```bash
git add api/send-notification.ts
git add vercel.json
git add package.json
git add src/lib/notifications.ts
git add .gitignore
```

### 4. Проверьте, что секретные файлы НЕ добавлены

```bash
git status
```

**Убедитесь, что НЕТ:**
- ❌ `.env.local`
- ❌ `*-firebase-adminsdk-*.json`
- ❌ Любых файлов с ключами

### 5. Закоммитьте

```bash
git commit -m "Добавлена поддержка Vercel API для push-уведомлений"
```

### 6. Загрузите в GitHub

```bash
git push origin main
```

## ⚠️ ВАЖНО: Безопасность

**НЕ коммитьте:**
- ❌ `.env.local` - переменные окружения
- ❌ `*-firebase-adminsdk-*.json` - Service Account ключи
- ❌ Любые файлы с секретами

**Эти файлы уже в .gitignore, но проверьте!**

## 📋 После загрузки в GitHub

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в Vercel
3. Деплой автоматический!

Подробнее: `SETUP_VERCEL.md`

