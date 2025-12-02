# ⚡ Быстрое создание привязки музыканта

## 📋 Данные для привязки
- **UID**: `DypkhitMEzLyPzSBTLoPMGYQxHM2`
- **Музыкант**: `Анна Смирнова`

---

## 🚀 Быстрая инструкция (2 минуты)

### 1. Откройте Firebase Console
👉 [https://console.firebase.google.com](https://console.firebase.google.com)
- Выберите проект: `frebaze-94560`
- Перейдите: **Firestore Database** → **Data**

### 2. Создайте документ в `userProfiles`

1. Нажмите на коллекцию `userProfiles`
2. Нажмите **"Add document"**
3. **Document ID**: вставьте `DypkhitMEzLyPzSBTLoPMGYQxHM2`
4. Добавьте поля:
   - `musicianName` (string) → `Анна Смирнова`
   - `role` (string) → `musician`
   - `linkedAt` (timestamp) → нажмите на иконку часов и выберите "now"
5. Нажмите **"Save"**

### 3. Обновите документ в `musicians`

1. Найдите коллекцию `musicians`
2. Найдите документ с ID: `Анна%20Смирнова` (или создайте новый)
3. Если документ существует:
   - Обновите поле `uid` на: `DypkhitMEzLyPzSBTLoPMGYQxHM2`
   - Обновите поле `linkedAt` на текущее время
4. Если документа нет:
   - Создайте новый документ с ID: `Анна%20Смирнова`
   - Добавьте поля:
     - `uid` (string) → `DypkhitMEzLyPzSBTLoPMGYQxHM2`
     - `linkedAt` (timestamp) → "now"

---

## ✅ Проверка

После создания проверьте:

1. **userProfiles/DypkhitMEzLyPzSBTLoPMGYQxHM2** существует
2. **musicians/Анна%20Смирнова** содержит `uid: DypkhitMEzLyPzSBTLoPMGYQxHM2`

Готово! 🎉

