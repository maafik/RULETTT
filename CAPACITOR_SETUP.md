# 📱 Настройка мобильного приложения с Capacitor

Это руководство поможет вам развернуть веб-приложение в мобильное приложение для Android и iOS с помощью Capacitor.

## ✅ Что уже настроено

- ✅ Capacitor установлен и настроен
- ✅ Конфигурация `capacitor.config.json` создана
- ✅ OneSignal интегрирован для пуш-уведомлений
- ✅ Скрипты для работы с Capacitor добавлены в `package.json`

## 🚀 Быстрый старт

### 1. Сборка веб-приложения

```bash
npm run build
```

### 2. Добавление платформ

#### Android:
```bash
npm run cap:add:android
```

#### iOS (только на macOS):
```bash
npm run cap:add:ios
```

### 3. Синхронизация с платформами

После изменений в веб-коде выполните:
```bash
npm run cap:sync
```

Эта команда:
- Соберет веб-приложение (`npm run build`)
- Скопирует файлы в нативные проекты
- Обновит зависимости

### 4. Открытие проектов

#### Android Studio:
```bash
npm run cap:open:android
```

#### Xcode (только на macOS):
```bash
npm run cap:open:ios
```

## 📦 Настройка OneSignal для мобильных приложений

### Android

1. Откройте проект в Android Studio: `npm run cap:open:android`
2. В файле `android/app/build.gradle` добавьте:
```gradle
dependencies {
    implementation 'com.onesignal:OneSignal:[5.0.0, 5.99.99]'
}
```

3. В `android/app/src/main/AndroidManifest.xml` добавьте разрешения:
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

4. В `android/app/src/main/java/.../MainActivity.java` добавьте инициализацию OneSignal:
```java
import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // OneSignal initialization
        OneSignal.initWithContext(this, "YOUR_ONESIGNAL_APP_ID");
        OneSignal.getNotifications().requestPermission(true, null);
    }
}
```

### iOS

1. Откройте проект в Xcode: `npm run cap:open:ios`
2. Установите OneSignal SDK через CocoaPods:
```bash
cd ios/App
pod install
```

3. В `ios/App/App/AppDelegate.swift` добавьте:
```swift
import OneSignal

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // OneSignal initialization
    OneSignal.initWithLaunchOptions(launchOptions)
    OneSignal.setAppId("YOUR_ONESIGNAL_APP_ID")
    
    return true
}
```

## 🔧 Переменные окружения

Убедитесь, что в вашем `.env` файле есть:
```
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
```

## 📱 Разработка с локальным сервером

Для разработки можно использовать локальный IP адрес. Раскомментируйте в `capacitor.config.json`:

```json
{
  "server": {
    "url": "http://192.168.1.XXX:8080",
    "cleartext": true
  }
}
```

Замените `192.168.1.XXX` на IP адрес вашего компьютера в локальной сети.

После изменения выполните:
```bash
npm run cap:sync
```

## 🚀 Сборка для продакшена

### Android APK/AAB

1. Откройте проект в Android Studio
2. Build → Generate Signed Bundle / APK
3. Следуйте инструкциям мастера

### iOS

1. Откройте проект в Xcode
2. Product → Archive
3. Загрузите в App Store Connect

## 📝 Полезные команды

- `npm run cap:sync` - Синхронизировать веб-код с нативными проектами
- `npm run cap:copy` - Скопировать только веб-файлы (без сборки)
- `npm run cap:open:android` - Открыть Android Studio
- `npm run cap:open:ios` - Открыть Xcode

## ⚠️ Важные замечания

1. **Пуш-уведомления без Firebase Functions**: 
   - Уведомления отправляются через OneSignal REST API напрямую
   - Endpoint: `/api/send-notification` (Vercel Serverless Function)
   - Не требуется Firebase Cloud Functions

2. **IP адрес для разработки**:
   - Убедитесь, что устройство и компьютер в одной сети Wi-Fi
   - Используйте IP адрес компьютера, а не localhost

3. **Права доступа**:
   - Android требует разрешение `POST_NOTIFICATIONS` (Android 13+)
   - iOS требует разрешение на уведомления в настройках

## 🔍 Отладка

### Проверка конфигурации
```bash
npx cap doctor
```

### Логи Android
```bash
adb logcat | grep -i capacitor
```

### Логи iOS
Используйте Xcode Console при запуске приложения

## 📚 Дополнительные ресурсы

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [OneSignal Capacitor SDK](https://documentation.onesignal.com/docs/capacitor-sdk-setup)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)


