# 🔧 Исправление ошибки Android Emulator Hypervisor Driver

## 🚀 БЫСТРОЕ РЕШЕНИЕ (если эмулятор не запускается)

### Для AMD процессоров (самое частое решение):

1. **Включите Windows Hypervisor Platform:**
   - Нажмите `Win + R`
   - Введите: `appwiz.cpl` → Enter
   - Нажмите "Включение или отключение компонентов Windows"
   - Включите: ✅ **Windows Hypervisor Platform** и ✅ **Платформа виртуальной машины**
   - **ПЕРЕЗАГРУЗИТЕ компьютер**

2. **После перезагрузки:**
   - Откройте Android Studio
   - Tools → Device Manager → Create Device
   - Выберите **x86_64** архитектуру
   - Запустите эмулятор

### Для Intel процессоров:

1. **Запустите установщик HAXM от имени администратора:**
   ```
   C:\Users\Maafi\AppData\Local\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat
   ```
   (Правой кнопкой → "Запуск от имени администратора")

2. **Запустите Android Studio от имени администратора**

3. **Создайте AVD с архитектурой x86_64**

### Диагностика системы:

Запустите скрипт для проверки:
```powershell
# Правой кнопкой на check-emulator-setup.ps1 → "Запуск с PowerShell"
.\check-emulator-setup.ps1
```

---

## ⚠️ Проблема 1: Папка не существует

```
Unable to run Android Emulator hypervisor driver installer: 
Cannot start a process, the working directory 
'C:\Users\Maafi\AppData\Local\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver' 
does not exist
```

## ⚠️ Проблема 2: Ошибки установки службы Windows

После установки драйвера могут появиться ошибки:
```
[SC] ControlService: ошибка: 1062
[SC] DeleteService: ошибка
[SC] StartService ошибка 4294967201
```

**Это означает:** Драйвер установлен, но служба Windows не была установлена/запущена. Обычно это происходит из-за отсутствия прав администратора.

## ✅ Решение 0: Исправление ошибок установки службы (если драйвер уже установлен)

Если вы видите ошибки `[SC] ControlService`, `[SC] DeleteService`, `[SC] StartService`, но драйвер уже установлен:

### Вариант A: Запуск установщика от имени администратора

1. **Закройте Android Studio**

2. **Найдите установщик драйвера:**
   ```
   C:\Users\Maafi\AppData\Local\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat
   ```

3. **Запустите от имени администратора:**
   - Правой кнопкой мыши на `silent_install.bat`
   - Выберите "Запуск от имени администратора"
   - Дождитесь завершения

4. **Или используйте PowerShell от имени администратора:**
   ```powershell
   cd "C:\Users\Maafi\AppData\Local\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver"
   .\silent_install.bat
   ```

### Вариант B: Проверка, работает ли эмулятор

**Важно:** Эмулятор может работать даже с этими ошибками! Попробуйте:

1. **Откройте Android Studio**
2. **Tools → Device Manager**
3. **Создайте или запустите AVD (Android Virtual Device)**
4. **Если эмулятор запускается** - ошибки можно игнорировать

### Вариант C: Для AMD процессоров - используйте Windows Hypervisor Platform

Если у вас AMD процессор, эти ошибки нормальны. Используйте Windows Hypervisor Platform:

1. **Включите Windows Hypervisor Platform:**
   - Win + R → `appwiz.cpl` → Enter
   - Нажмите "Включение или отключение компонентов Windows"
   - Включите:
     - ✅ **Windows Hypervisor Platform**
     - ✅ **Платформа виртуальной машины**
   - Перезагрузите компьютер

2. **Создайте AVD с правильной архитектурой:**
   - Tools → Device Manager → Create Device
   - Выберите "x86_64" архитектуру

## ✅ Решение 1: Установка через Android Studio SDK Manager (Рекомендуется)

1. **Откройте Android Studio**

2. **Откройте SDK Manager:**
   - Tools → SDK Manager
   - Или: File → Settings → Appearance & Behavior → System Settings → Android SDK

3. **Перейдите на вкладку "SDK Tools"**

4. **Установите необходимые компоненты:**
   - ✅ **Android Emulator** (если не установлен)
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Android SDK Build-Tools**
   - ✅ **Intel x86 Emulator Accelerator (HAXM installer)** (для Intel процессоров)
   - ✅ **Google Play Intel x86 Atom System Images** (если нужны)

5. **Нажмите "Apply"** и дождитесь установки

6. **После установки перезапустите Android Studio**

## ✅ Решение 2: Установка Hypervisor Driver вручную

Если через SDK Manager не получается:

1. **Проверьте, существует ли папка SDK:**
   ```
   C:\Users\Maafi\AppData\Local\Android\Sdk
   ```

2. **Если папка не существует, создайте её:**
   - Откройте Android Studio
   - File → Settings → Appearance & Behavior → System Settings → Android SDK
   - Укажите путь: `C:\Users\Maafi\AppData\Local\Android\Sdk`
   - Нажмите "Apply"

3. **Скачайте Hypervisor Driver вручную:**
   - Откройте Android Studio
   - Tools → SDK Manager → SDK Tools
   - Найдите "Android Emulator Hypervisor Driver for AMD Processors" (для AMD)
   - Или "Intel x86 Emulator Accelerator (HAXM installer)" (для Intel)
   - Установите

## ✅ Решение 3: Для процессоров AMD (Windows Hypervisor Platform)

Если у вас процессор AMD, используйте Windows Hypervisor Platform вместо HAXM:

1. **Включите Windows Hypervisor Platform:**
   - Откройте "Параметры Windows" → "Программы и компоненты"
   - Нажмите "Включение или отключение компонентов Windows"
   - Найдите и включите:
     - ✅ **Windows Hypervisor Platform**
     - ✅ **Платформа виртуальной машины** (Virtual Machine Platform)
   - Перезагрузите компьютер

2. **В Android Studio:**
   - Tools → SDK Manager → SDK Tools
   - Установите "Android Emulator Hypervisor Driver for AMD Processors"

3. **Создайте AVD (Android Virtual Device):**
   - Tools → Device Manager
   - Create Device
   - Выберите устройство и образ системы
   - При создании выберите "x86_64" архитектуру

## ✅ Решение 4: Проверка пути SDK

Если путь к SDK неправильный:

1. **Проверьте путь в Android Studio:**
   - File → Settings → Appearance & Behavior → System Settings → Android SDK
   - Убедитесь, что путь: `C:\Users\Maafi\AppData\Local\Android\Sdk`

2. **Проверьте в проекте:**
   - Откройте `android/local.properties`
   - Должна быть строка:
     ```properties
     sdk.dir=C\:\\Users\\Maafi\\AppData\\Local\\Android\\Sdk
     ```

3. **Если файл `local.properties` отсутствует:**
   - Android Studio создаст его автоматически при синхронизации
   - Или создайте вручную с правильным путем

## 🔍 Проверка установки

После установки проверьте:

1. **Проверьте наличие папки:**
   ```
   C:\Users\Maafi\AppData\Local\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver
   ```
   ✅ Если папка существует - драйвер установлен

2. **Или для Intel HAXM:**
   ```
   C:\Users\Maafi\AppData\Local\Android\Sdk\extras\intel\Hardware_Accelerated_Execution_Manager
   ```

3. **Проверьте эмулятор (ГЛАВНОЕ!):**
   - Tools → Device Manager
   - Создайте новый AVD или запустите существующий
   - **Запустите эмулятор**
   - ✅ **Если эмулятор запускается и работает** - всё в порядке, ошибки службы можно игнорировать
   - ❌ Если эмулятор не запускается - следуйте решениям ниже

## 🚨 ЭМУЛЯТОР НЕ ЗАПУСКАЕТСЯ - Пошаговая диагностика

### Шаг 1: Определите тип процессора

**Проверьте, какой у вас процессор (Intel или AMD):**

1. Нажмите `Win + X` → "Система"
2. Или откройте PowerShell и выполните:
   ```powershell
   Get-CimInstance Win32_Processor | Select-Object Name
   ```

### Шаг 2: Для AMD процессоров - Включите Windows Hypervisor Platform

**Это самое важное для AMD!**

1. **Откройте компоненты Windows:**
   - Нажмите `Win + R`
   - Введите: `appwiz.cpl`
   - Нажмите Enter
   - Нажмите "Включение или отключение компонентов Windows"

2. **Включите следующие компоненты:**
   - ✅ **Windows Hypervisor Platform** (ОБЯЗАТЕЛЬНО!)
   - ✅ **Платформа виртуальной машины** (Virtual Machine Platform)
   - ✅ **Подсистема Windows для Linux** (опционально, но рекомендуется)

3. **Нажмите "OK"** и дождитесь установки

4. **ПЕРЕЗАГРУЗИТЕ КОМПЬЮТЕР** (обязательно!)

5. **После перезагрузки:**
   - Откройте Android Studio
   - Tools → Device Manager
   - Создайте новый AVD с архитектурой **x86_64**
   - Запустите эмулятор

### Шаг 3: Для Intel процессоров - Установите HAXM от имени администратора

1. **Закройте Android Studio**

2. **Найдите установщик HAXM:**
   ```
   C:\Users\Maafi\AppData\Local\Android\Sdk\extras\intel\Hardware_Accelerated_Execution_Manager\intelhaxm-android.exe
   ```

3. **Запустите от имени администратора:**
   - Правой кнопкой мыши на `intelhaxm-android.exe`
   - Выберите "Запуск от имени администратора"
   - Следуйте инструкциям установщика

4. **Или используйте установщик из папки драйвера:**
   ```
   C:\Users\Maafi\AppData\Local\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat
   ```
   - Правой кнопкой → "Запуск от имени администратора"

5. **Перезапустите Android Studio от имени администратора:**
   - Правой кнопкой на ярлык Android Studio
   - "Запуск от имени администратора"

6. **Попробуйте запустить эмулятор**

### Шаг 4: Проверьте виртуализацию в BIOS

**Если эмулятор всё ещё не запускается:**

1. **Перезагрузите компьютер**
2. **Войдите в BIOS** (обычно F2, F10, F12 или Del при загрузке)
3. **Найдите настройки виртуализации:**
   - Для Intel: "Intel Virtualization Technology" или "VT-x"
   - Для AMD: "AMD-V" или "SVM Mode"
4. **Включите виртуализацию** (Enabled)
5. **Сохраните и выйдите** (F10)
6. **Перезагрузите компьютер**

### Шаг 5: Проверьте, не конфликтует ли Hyper-V

**Если у вас Windows Pro/Enterprise и включен Hyper-V:**

1. **Откройте PowerShell от имени администратора**

2. **Проверьте статус Hyper-V:**
   ```powershell
   Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
   ```

3. **Если Hyper-V включен и у вас AMD процессор:**
   - Это нормально, Windows Hypervisor Platform работает с Hyper-V

4. **Если Hyper-V включен и у вас Intel процессор:**
   - Может быть конфликт с HAXM
   - Попробуйте отключить Hyper-V (если не нужен):
     ```powershell
     Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
     ```
   - Перезагрузите компьютер

### Шаг 6: Проверьте логи эмулятора

**Если эмулятор не запускается, проверьте логи:**

1. **В Android Studio:**
   - View → Tool Windows → Logcat
   - Или откройте терминал в Android Studio

2. **Запустите эмулятор из командной строки для диагностики:**
   ```powershell
   cd "C:\Users\Maafi\AppData\Local\Android\Sdk\emulator"
   .\emulator.exe -avd YOUR_AVD_NAME -verbose
   ```
   (Замените `YOUR_AVD_NAME` на имя вашего AVD)

3. **Посмотрите на ошибки в выводе** - они подскажут, в чём проблема

### Шаг 7: Создайте новый AVD с правильными настройками

**Если старый AVD не работает, создайте новый:**

1. **Tools → Device Manager**
2. **Create Device**
3. **Выберите устройство** (например, Pixel 5)
4. **Выберите System Image:**
   - Для AMD: выберите **x86_64** с Google APIs или Google Play
   - Для Intel: выберите **x86_64** или **x86**
   - **ВАЖНО:** Не выбирайте ARM образы - они очень медленные!
5. **Завершите создание AVD**
6. **Запустите новый AVD**

### Шаг 8: Альтернатива - Используйте физическое устройство

**Если эмулятор всё ещё не работает, используйте реальный телефон:**

1. **Включите USB-отладку на телефоне:**
   - Настройки → О телефоне → Нажмите 7 раз на "Номер сборки"
   - Настройки → Для разработчиков → USB-отладка (включить)

2. **Подключите телефон по USB**

3. **В Android Studio:**
   - Запустите приложение
   - Выберите ваше устройство в списке

4. **Или установите APK вручную:**
   - Соберите APK в Android Studio
   - Скопируйте на телефон
   - Установите на телефоне

## ⚠️ Важные замечания

1. **Для Intel процессоров:**
   - Используйте HAXM (Intel x86 Emulator Accelerator)
   - Требуются права администратора для установки

2. **Для AMD процессоров:**
   - Используйте Windows Hypervisor Platform
   - Требуется включить в настройках Windows

3. **BIOS настройки:**
   - Убедитесь, что виртуализация включена в BIOS
   - Обычно называется "Virtualization Technology" или "VT-x"

4. **Альтернатива:**
   - Если эмулятор не работает, используйте физическое устройство через USB
   - Включите USB-отладку на телефоне
   - Подключите через USB и запустите приложение

## 🚀 Быстрая проверка

1. Откройте Android Studio
2. Tools → SDK Manager → SDK Tools
3. Установите "Android Emulator" и "Android Emulator Hypervisor Driver"
4. Tools → Device Manager → Create Device
5. Запустите эмулятор

## 📚 Дополнительная информация

- [Android Emulator Documentation](https://developer.android.com/studio/run/emulator)
- [HAXM Installation Guide](https://github.com/intel/haxm)
- [Windows Hypervisor Platform](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/)

