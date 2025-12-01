# 🔧 Установка HAXM для Intel процессора (эмулятор не запускается)

## ✅ Ваша ситуация

- **Процессор:** Intel Xeon X3440
- **Проблема:** Эмулятор не запускается
- **Причина:** HAXM (Intel Hardware Accelerated Execution Manager) не установлен

## 🚀 Решение: Установка HAXM

### Способ 1: Через Android Studio SDK Manager (Рекомендуется)

1. **Откройте Android Studio**

2. **Откройте SDK Manager:**
   - Tools → SDK Manager
   - Или: File → Settings → Appearance & Behavior → System Settings → Android SDK

3. **Перейдите на вкладку "SDK Tools"**

4. **Установите:**
   - ✅ **Intel x86 Emulator Accelerator (HAXM installer)**
   - Нажмите "Apply" и дождитесь установки

5. **После установки:**
   - Закройте Android Studio
   - Найдите установщик HAXM:
     ```
     C:\Users\Maafi\AppData\Local\Android\Sdk\extras\intel\Hardware_Accelerated_Execution_Manager\intelhaxm-android.exe
     ```

6. **Запустите установщик ОТ ИМЕНИ АДМИНИСТРАТОРА:**
   - Правой кнопкой мыши на `intelhaxm-android.exe`
   - Выберите "Запуск от имени администратора"
   - Следуйте инструкциям установщика
   - Выберите размер памяти для HAXM (рекомендуется 2-4 GB)

7. **Перезапустите Android Studio**

8. **Попробуйте запустить эмулятор**

### Способ 2: Установка HAXM вручную (если способ 1 не работает)

1. **Скачайте HAXM вручную:**
   - Откройте: https://github.com/intel/haxm/releases
   - Скачайте последнюю версию для Windows (например, `haxm-windows_vX.X.X.zip`)

2. **Распакуйте архив**

3. **Запустите установщик от имени администратора:**
   - Правой кнопкой на `silent_install.bat` или `intelhaxm-android.exe`
   - "Запуск от имени администратора"

4. **Перезапустите компьютер**

5. **Проверьте установку:**
   ```powershell
   # Откройте PowerShell от имени администратора
   sc query intelhaxm
   ```
   Должно показать, что служба установлена

### Способ 3: Использование Hypervisor Driver (альтернатива)

Если HAXM не работает, попробуйте использовать Android Emulator Hypervisor Driver:

1. **В Android Studio:**
   - Tools → SDK Manager → SDK Tools
   - Установите "Android Emulator Hypervisor Driver (installer)"

2. **После установки:**
   - Найдите установщик:
     ```
     C:\Users\Maafi\AppData\Local\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat
     ```

3. **Запустите от имени администратора:**
   - Правой кнопкой → "Запуск от имени администратора"

4. **Перезапустите Android Studio**

## ⚠️ Важные замечания

### 1. Права администратора

**ВАЖНО:** HAXM требует прав администратора для установки драйвера!

- Всегда запускайте установщик от имени администратора
- После установки можно запускать Android Studio без прав администратора

### 2. Виртуализация в BIOS

Убедитесь, что виртуализация включена в BIOS:

1. Перезагрузите компьютер
2. Войдите в BIOS (обычно F2, F10, F12 или Del)
3. Найдите "Intel Virtualization Technology" или "VT-x"
4. Включите (Enabled)
5. Сохраните и выйдите (F10)

### 3. Конфликт с Hyper-V

Если у вас Windows Pro/Enterprise и включен Hyper-V, может быть конфликт:

1. Откройте PowerShell от имени администратора
2. Проверьте статус:
   ```powershell
   Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
   ```
3. Если Hyper-V включен и мешает, временно отключите:
   ```powershell
   Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
   ```
4. Перезагрузите компьютер

### 4. Размер памяти HAXM

При установке HAXM выберите размер памяти:
- **Рекомендуется:** 2-4 GB
- **Минимум:** 1 GB
- **Максимум:** половина доступной RAM

## 🔍 Проверка установки

После установки проверьте:

1. **Проверьте наличие папки:**
   ```
   C:\Users\Maafi\AppData\Local\Android\Sdk\extras\intel\Hardware_Accelerated_Execution_Manager
   ```

2. **Проверьте службу HAXM:**
   ```powershell
   sc query intelhaxm
   ```
   Должно показать, что служба установлена и запущена

3. **Попробуйте запустить эмулятор:**
   - Android Studio → Tools → Device Manager
   - Создайте или запустите AVD
   - Выберите архитектуру **x86** или **x86_64** (НЕ ARM!)

## 🚨 Если эмулятор всё ещё не запускается

### Проверьте логи эмулятора:

1. **Запустите эмулятор из командной строки:**
   ```powershell
   cd "C:\Users\Maafi\AppData\Local\Android\Sdk\emulator"
   .\emulator.exe -list-avds
   ```
   (Покажет список доступных AVD)

2. **Запустите с подробным выводом:**
   ```powershell
   .\emulator.exe -avd YOUR_AVD_NAME -verbose
   ```
   (Замените YOUR_AVD_NAME на имя вашего AVD)

3. **Посмотрите на ошибки** - они подскажут проблему

### Создайте новый AVD с правильными настройками:

1. **Tools → Device Manager → Create Device**
2. **Выберите устройство** (например, Pixel 5)
3. **Выберите System Image:**
   - ✅ **x86_64** с Google APIs или Google Play
   - ✅ **x86** с Google APIs
   - ❌ **НЕ выбирайте ARM** - они очень медленные!
4. **Завершите создание**
5. **Запустите новый AVD**

## 📱 Альтернатива: Используйте физическое устройство

Если эмулятор всё ещё не работает, используйте реальный телефон:

1. **Включите USB-отладку:**
   - Настройки → О телефоне → Нажмите 7 раз на "Номер сборки"
   - Настройки → Для разработчиков → USB-отладка (включить)

2. **Подключите телефон по USB**

3. **В Android Studio:**
   - Запустите приложение
   - Выберите ваше устройство в списке

4. **Или установите APK вручную:**
   - Соберите APK: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Скопируйте APK на телефон
   - Установите на телефоне

## ✅ Быстрая проверка

Запустите скрипт диагностики:
```powershell
.\check-emulator-setup.ps1
```

Он покажет, что именно нужно исправить.


