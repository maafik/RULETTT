# 🔑 Где взять ключи OneSignal?

## 📍 Где найти REST API Key в OneSignal

### Шаг 1: Войдите в OneSignal Dashboard

1. Откройте https://onesignal.com/
2. Войдите в свой аккаунт

### Шаг 2: Выберите ваше приложение

1. В списке приложений выберите ваше приложение (например, "stage-spotlight-web")

### Шаг 3: Перейдите в Settings → Keys & IDs

1. В левом меню нажмите **Settings** (Настройки)
2. Выберите **Keys & IDs** (Ключи и ID)

### Шаг 4: Найдите REST API Key

В разделе **API Keys** вы увидите:

```
REST API Key
os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i
```

**Или если ключ еще не создан:**

1. Нажмите кнопку **"Add Key"** (Добавить ключ)
2. Введите название (например, "yaroslav" или "Production")
3. Скопируйте созданный ключ

---

## 🔍 Что вы увидите в разделе Keys & IDs

### OneSignal App ID
```
0ae1d329-0160-4eac-aacc-df8f50479606
```
- ✅ Используется в клиентской части
- ✅ Используется в серверной части

### REST API Keys (API Keys)

Таблица с ключами:
```
Key ID                          | Created by | Created    | Last used
ii3zjingleti53c3wpzel2ksg      | yaroslav   | 30.11.2025 | 30.11.2025
```

**Чтобы увидеть полный ключ:**
1. Нажмите на строку с ключом
2. Или нажмите кнопку "View" / "Показать"
3. Скопируйте полный ключ (начинается с `os_v2_app_...`)

---

## ⚠️ Важно!

### REST API Key - секретный ключ!

- 🔒 **Не показывайте** никому
- 🔒 **Не коммитьте** в Git
- 🔒 **Не добавляйте** в `.env.local` (только в Vercel)
- ✅ **ТОЛЬКО** в Vercel Environment Variables

### Если ключ скомпрометирован:

1. В OneSignal Dashboard → Settings → Keys & IDs
2. Найдите скомпрометированный ключ
3. Нажмите **"Revoke"** (Отозвать) или **"Delete"** (Удалить)
4. Создайте новый ключ через **"Add Key"**

---

## 📋 Полный путь в OneSignal

```
OneSignal Dashboard
  ↓
Ваше приложение (stage-spotlight-web)
  ↓
Settings (Настройки) → в левом меню
  ↓
Keys & IDs (Ключи и ID)
  ↓
API Keys раздел
  ↓
REST API Key (os_v2_app_...)
```

---

## 🎯 Итог

**REST API Key находится:**
- OneSignal Dashboard → Ваше приложение → Settings → Keys & IDs → API Keys

**Ваш текущий ключ:**
- Key ID: `ii3zjingleti53c3wpzel2ksg`
- Полный ключ: `os_v2_app_blq5gkibmbhkzkwm36hvar4wa3ii3zjingleti53c3wpzel2ksgzpjmxi7tgjvqtfjnrogn5nlv5kasbkchjuhucqgxiffergxl5z2i`
- Создан: 30.11.2025 пользователем yaroslav

