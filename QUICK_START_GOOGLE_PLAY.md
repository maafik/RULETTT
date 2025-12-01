# 🚀 Быстрый старт: Публикация в Google Play

## ❌ Текущий Debug APK НЕ подходит для Google Play!

**Что нужно:**
- ✅ Release версия (не debug)
- ✅ Подписанное приложение (keystore)
- ✅ AAB формат (Android App Bundle)

## 📋 Быстрая инструкция (5 шагов)

### 1️⃣ Создайте Keystore

```powershell
cd android
keytool -genkey -v -keystore musicbooking-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias musicbooking
```

**Заполните данные и запомните пароли!**

### 2️⃣ Создайте key.properties

Создайте файл `android/key.properties`:

```properties
storePassword=ваш_пароль
keyPassword=ваш_пароль
keyAlias=musicbooking
storeFile=../musicbooking-release-key.jks
```

### 3️⃣ Соберите Release AAB

В Android Studio:
- **Build → Generate Signed Bundle / APK**
- Выберите **"Android App Bundle"**
- Выберите keystore и введите пароли
- Выберите **"release"**
- Нажмите **"Create"**

### 4️⃣ Загрузите в Google Play Console

1. Откройте [Google Play Console](https://play.google.com/console)
2. Создайте приложение (если еще не создано)
3. Загрузите `app-release.aab`
4. Заполните информацию о приложении
5. Отправьте на проверку

### 5️⃣ Дождитесь проверки

Google проверит приложение (обычно 1-3 дня)

## ⚠️ ВАЖНО

- **Сохраните keystore в безопасном месте!** Без него вы не сможете обновлять приложение
- **НЕ загружайте keystore в Git!**
- **Запишите пароли!**

## 📚 Подробная инструкция

Смотрите файл: **[PUBLISH_GOOGLE_PLAY.md](PUBLISH_GOOGLE_PLAY.md)**

## ✅ Что уже настроено

- ✅ `build.gradle` настроен для подписи
- ✅ `.gitignore` настроен (keystore не попадет в Git)
- ✅ Создан пример `key.properties.example`

## 🔧 Если что-то не работает

1. Убедитесь, что keystore создан
2. Проверьте путь в `key.properties`
3. Проверьте пароли
4. Синхронизируйте проект: **File → Sync Project with Gradle Files**


