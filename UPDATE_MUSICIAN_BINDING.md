# 🔄 Обновление привязки музыканта "Анна Смирнова"

## ✅ Новая привязка
- **UID**: `DypkhitMEzLyPzSBTLoPMGYQxHM2`
- **Музыкант**: Анна Смирнова

## 🗑️ Старая привязка (нужно удалить)
- **UID**: `tw2mIULtdwa4D5TZxxtgsSagpED3`

---

## 📋 Инструкция через Firebase Console

### Шаг 1: Обновить userProfiles

1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Выберите проект `frebaze-94560`
3. Перейдите: **Firestore Database** → **Data**
4. Найдите коллекцию `userProfiles`

#### Удалить старую привязку:
- Найдите документ с ID: `tw2mIULtdwa4D5TZxxtgsSagpED3`
- Если он существует и содержит `musicianName: "Анна Смирнова"`, удалите его (кнопка "Delete document")

#### Создать новую привязку:
- Создайте новый документ с ID: `DypkhitMEzLyPzSBTLoPMGYQxHM2`
- Добавьте поля:
  - `musicianName` (string): `Анна Смирнова`
  - `role` (string): `musician`
  - `linkedAt` (timestamp): текущая дата/время

### Шаг 2: Обновить musicians

1. В той же Firestore Database найдите коллекцию `musicians`
2. Найдите документ с ID: `Анна%20Смирнова` (URL-encoded имя)
3. Если документ существует:
   - Обновите поле `uid` на: `DypkhitMEzLyPzSBTLoPMGYQxHM2`
   - Обновите поле `linkedAt` на текущую дату/время
4. Если документа нет:
   - Создайте новый документ с ID: `Анна%20Смирнова`
   - Добавьте поля:
     - `uid` (string): `DypkhitMEzLyPzSBTLoPMGYQxHM2`
     - `linkedAt` (timestamp): текущая дата/время

---

## ✅ Проверка

После обновления проверьте:

1. **userProfiles/DypkhitMEzLyPzSBTLoPMGYQxHM2** существует и содержит:
   - `musicianName: "Анна Смирнова"`
   - `role: "musician"`

2. **musicians/Анна%20Смирнова** существует и содержит:
   - `uid: "DypkhitMEzLyPzSBTLoPMGYQxHM2"`

3. **userProfiles/tw2mIULtdwa4D5TZxxtgsSagpED3** удален (если существовал)

---

## 🔧 Альтернатива: через скрипт (если service account актуален)

Если у вас актуальный service account файл, можно запустить:

```bash
npm run link-profile
```

Но сначала убедитесь, что файл `frebaze-94560-firebase-adminsdk-fbsvc-80df5106db.json` актуален и имеет правильные права доступа.

