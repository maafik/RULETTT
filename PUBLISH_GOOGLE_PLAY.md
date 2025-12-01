# 📱 Публикация приложения в Google Play

## ⚠️ Важно: Debug APK нельзя отправлять в Google Play!

**Текущий APK (debug версия) НЕ подходит для Google Play!**

Для публикации в Google Play нужно:
1. ✅ **Release версия** (не debug)
2. ✅ **Подписанное приложение** (keystore)
3. ✅ **AAB формат** (Android App Bundle, не APK)
4. ✅ **Минимальные требования Google Play**

## 🚀 Пошаговая инструкция

### Шаг 1: Создайте Keystore (ключ для подписи)

**ВАЖНО:** Сохраните этот файл и пароли в безопасном месте! Без них вы не сможете обновлять приложение!

1. **Откройте терминал в Android Studio:**
   - View → Tool Windows → Terminal

2. **Создайте keystore:**
   ```powershell
   cd android
   keytool -genkey -v -keystore musicbooking-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias musicbooking
   ```

3. **Заполните данные:**
   - Пароль для keystore (запомните его!)
   - Пароль для ключа (можно такой же)
   - Имя и фамилия
   - Название организации
   - Город
   - Область/Регион
   - Код страны (например, RU)

4. **Файл будет создан:** `android/musicbooking-release-key.jks`

### Шаг 2: Создайте файл key.properties

1. **Создайте файл `android/key.properties`:**
   ```properties
   storePassword=ваш_пароль_keystore
   keyPassword=ваш_пароль_ключа
   keyAlias=musicbooking
   storeFile=../musicbooking-release-key.jks
   ```

2. **ВАЖНО:** Добавьте `key.properties` в `.gitignore` (не загружайте в Git!)

### Шаг 3: Настройте build.gradle для подписи

Обновите `android/app/build.gradle`:

```gradle
apply plugin: 'com.android.application'

// Загружаем key.properties
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace = "com.musicbooking.app"
    compileSdk = rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId = "com.musicbooking.app"
        minSdk = rootProject.ext.minSdkVersion
        targetSdk = rootProject.ext.targetSdkVersion
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    
    // Настройка подписи
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias = keystoreProperties['keyAlias']
                keyPassword = keystoreProperties['keyPassword']
                storeFile = file(keystoreProperties['storeFile'])
                storePassword = keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            minifyEnabled = false
            proguardFiles = getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig = signingConfigs.release
        }
    }
}

// ... остальной код ...
```

### Шаг 4: Соберите Release AAB

1. **В Android Studio:**
   - Build → Generate Signed Bundle / APK

2. **Выберите "Android App Bundle":**
   - Нажмите "Next"

3. **Выберите keystore:**
   - Выберите файл: `android/musicbooking-release-key.jks`
   - Введите пароли
   - Выберите alias: `musicbooking`
   - Нажмите "Next"

4. **Выберите Release:**
   - Выберите "release"
   - Нажмите "Create"

5. **AAB будет создан:**
   - `android/app/release/app-release.aab`

### Шаг 5: Подготовка к публикации

#### 5.1. Обновите версию приложения

Перед каждой новой публикацией обновляйте версию в `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode = 2  // Увеличьте на 1 для каждого обновления
    versionName = "1.1"  // Версия для пользователей
}
```

#### 5.2. Проверьте требования Google Play

Убедитесь, что у вас есть:

- ✅ **Иконка приложения** (минимум 512x512 px)
- ✅ **Скриншоты** (минимум 2, рекомендуется 8)
- ✅ **Описание приложения** (минимум 80 символов)
- ✅ **Политика конфиденциальности** (если приложение собирает данные)
- ✅ **Категория приложения**
- ✅ **Целевая аудитория**

### Шаг 6: Загрузка в Google Play Console

1. **Откройте [Google Play Console](https://play.google.com/console)**

2. **Создайте приложение** (если еще не создано):
   - Нажмите "Create app"
   - Заполните название, язык, тип приложения
   - Примите условия

3. **Загрузите AAB:**
   - Перейдите в "Production" (или "Testing" для тестирования)
   - Нажмите "Create new release"
   - Загрузите файл `app-release.aab`
   - Заполните "Release notes" (что нового в этой версии)

4. **Заполните информацию о приложении:**
   - Store listing (описание, скриншоты, иконка)
   - Content rating (возрастной рейтинг)
   - Privacy policy (если требуется)

5. **Отправьте на проверку:**
   - Нажмите "Review release"
   - Google проверит приложение (обычно 1-3 дня)

## ⚠️ Важные требования Google Play

### 1. Target SDK Version

Ваше приложение должно использовать **targetSdkVersion 33 или выше** (у вас 34 - отлично!)

### 2. Privacy Policy

Если приложение:
- Собирает личные данные
- Использует интернет
- Имеет аккаунты пользователей

То нужна **Политика конфиденциальности** (Privacy Policy).

### 3. Content Rating

Нужно пройти **опрос о возрастном рейтинге** (Content Rating).

### 4. App Signing

Google Play автоматически управляет подписью приложения после первой загрузки.

## 🔒 Безопасность Keystore

**КРИТИЧЕСКИ ВАЖНО:**

1. **Сохраните keystore в безопасном месте:**
   - Резервная копия на нескольких устройствах
   - Облачное хранилище (зашифрованное)
   - Запишите пароли в безопасном месте

2. **НЕ загружайте keystore в Git:**
   - Убедитесь, что `*.jks` в `.gitignore`
   - Убедитесь, что `key.properties` в `.gitignore`

3. **Если потеряете keystore:**
   - Вы НЕ сможете обновлять приложение
   - Придется создавать новое приложение в Google Play

## 📋 Чек-лист перед публикацией

- [ ] Keystore создан и сохранен в безопасном месте
- [ ] `key.properties` создан (не в Git!)
- [ ] `build.gradle` настроен для подписи
- [ ] Release AAB собран
- [ ] Версия приложения обновлена (versionCode и versionName)
- [ ] Иконка приложения готова (512x512 px)
- [ ] Скриншоты готовы (минимум 2)
- [ ] Описание приложения написано
- [ ] Политика конфиденциальности готова (если требуется)
- [ ] Возрастной рейтинг пройден
- [ ] Приложение протестировано на реальных устройствах

## 🚀 Быстрая команда для сборки AAB

После настройки подписи, можно собирать через терминал:

```powershell
cd android
.\gradlew.bat bundleRelease
```

AAB будет в: `android/app/build/outputs/bundle/release/app-release.aab`

## 📚 Дополнительные ресурсы

- [Google Play Console](https://play.google.com/console)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [App Signing](https://developer.android.com/studio/publish/app-signing)

## ⚠️ Если что-то пошло не так

1. **Проверьте логи сборки** в Android Studio
2. **Убедитесь, что keystore существует** и путь правильный
3. **Проверьте пароли** в `key.properties`
4. **Синхронизируйте проект:** File → Sync Project with Gradle Files


