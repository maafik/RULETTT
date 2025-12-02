# 📝 Создание документа в коллекции musicians

## 📋 Данные для создания

### Коллекция: `musicians`
### Document ID: `Анна%20Смирнова` (URL-encoded)

### Поля документа:
```json
{
  "uid": "DypkhitMEzLyPzSBTLoPMGYQxHM2",
  "linkedAt": [текущее время]
}
```

---

## 🚀 Инструкция через Firebase Console

1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Выберите проект: `frebaze-94560`
3. Перейдите: **Firestore Database** → **Data**
4. Найдите коллекцию `musicians` (или создайте, если её нет)
5. Нажмите **"Add document"**
6. **Document ID**: вставьте `Анна%20Смирнова`
   - Или просто введите `Анна Смирнова` - Firebase автоматически закодирует
7. Добавьте поля:
   - `uid` (string) → `DypkhitMEzLyPzSBTLoPMGYQxHM2`
   - `linkedAt` (timestamp) → нажмите на иконку часов и выберите "now"
8. Нажмите **"Save"**

---

## ✅ Проверка

После создания проверьте:
- Документ `musicians/Анна%20Смирнова` существует
- Поле `uid` содержит: `DypkhitMEzLyPzSBTLoPMGYQxHM2`
- Поле `linkedAt` установлено

Готово! 🎉

