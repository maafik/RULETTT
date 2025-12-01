# Android Emulator Setup Check Script
# Run as Administrator: Right-click -> "Run with PowerShell"

$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Emulator Setup Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check processor type
Write-Host "1. Checking processor..." -ForegroundColor Yellow
$processor = Get-CimInstance Win32_Processor | Select-Object -First 1
$processorName = $processor.Name
Write-Host "   Processor: $processorName" -ForegroundColor White

if ($processorName -match "Intel") {
    Write-Host "   Type: Intel" -ForegroundColor Green
    $isIntel = $true
} elseif ($processorName -match "AMD") {
    Write-Host "   Type: AMD" -ForegroundColor Green
    $isIntel = $false
} else {
    Write-Host "   Type: Unknown" -ForegroundColor Yellow
    $isIntel = $null
}
Write-Host ""

# Check SDK path
Write-Host "2. Checking Android SDK..." -ForegroundColor Yellow
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $sdkPath) {
    Write-Host "   SDK found: $sdkPath" -ForegroundColor Green
} else {
    Write-Host "   SDK NOT found: $sdkPath" -ForegroundColor Red
    Write-Host "   Install Android SDK via Android Studio" -ForegroundColor Yellow
}
Write-Host ""

# Check Hypervisor Driver
Write-Host "3. Checking Hypervisor Driver..." -ForegroundColor Yellow
$driverPath = "$sdkPath\extras\google\Android_Emulator_Hypervisor_Driver"
if (Test-Path $driverPath) {
    Write-Host "   Hypervisor Driver found: $driverPath" -ForegroundColor Green
    
    $installerPath = Join-Path $driverPath "silent_install.bat"
    if (Test-Path $installerPath) {
        Write-Host "   Installer found: $installerPath" -ForegroundColor Green
    } else {
        Write-Host "   Installer NOT found" -ForegroundColor Red
    }
} else {
    Write-Host "   Hypervisor Driver NOT found" -ForegroundColor Red
    Write-Host "   Install via: Android Studio -> SDK Manager -> SDK Tools" -ForegroundColor Yellow
}
Write-Host ""

# Check HAXM (for Intel)
$haxmPath = "$sdkPath\extras\intel\Hardware_Accelerated_Execution_Manager"
if ($isIntel) {
    Write-Host "4. Checking HAXM (Intel)..." -ForegroundColor Yellow
    if (Test-Path $haxmPath) {
        Write-Host "   HAXM found: $haxmPath" -ForegroundColor Green
        
        $haxmInstaller = Join-Path $haxmPath "intelhaxm-android.exe"
        if (Test-Path $haxmInstaller) {
            Write-Host "   HAXM installer found" -ForegroundColor Green
        }
    } else {
        Write-Host "   HAXM NOT found" -ForegroundColor Yellow
        Write-Host "   Install via: Android Studio -> SDK Manager -> SDK Tools" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Check Windows Hypervisor Platform (for AMD)
if (-not $isIntel -and $null -ne $isIntel) {
    Write-Host "4. Checking Windows Hypervisor Platform (AMD)..." -ForegroundColor Yellow
    $hyperVFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -ErrorAction SilentlyContinue
    $whpFeature = Get-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform -ErrorAction SilentlyContinue
    $vmpFeature = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -ErrorAction SilentlyContinue
    
    if ($whpFeature) {
        if ($whpFeature.State -eq "Enabled") {
            Write-Host "   Windows Hypervisor Platform: ENABLED [OK]" -ForegroundColor Green
        } else {
            Write-Host "   Windows Hypervisor Platform: DISABLED [REQUIRED!]" -ForegroundColor Red
            Write-Host "   Enable via: Win+R -> appwiz.cpl -> Windows Features" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   Windows Hypervisor Platform: NOT AVAILABLE" -ForegroundColor Yellow
    }
    
    if ($vmpFeature) {
        if ($vmpFeature.State -eq "Enabled") {
            Write-Host "   Virtual Machine Platform: ENABLED [OK]" -ForegroundColor Green
        } else {
            Write-Host "   Virtual Machine Platform: DISABLED [RECOMMENDED]" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# Check emulator
Write-Host "5. Checking Android Emulator..." -ForegroundColor Yellow
$emulatorPath = "$sdkPath\emulator\emulator.exe"
if (Test-Path $emulatorPath) {
    Write-Host "   Emulator found: $emulatorPath" -ForegroundColor Green
} else {
    Write-Host "   Emulator NOT found" -ForegroundColor Red
    Write-Host "   Install via: Android Studio -> SDK Manager -> SDK Tools" -ForegroundColor Yellow
}
Write-Host ""

# Recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RECOMMENDATIONS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $isIntel -and $null -ne $isIntel) {
    Write-Host "For AMD processor:" -ForegroundColor Yellow
    Write-Host "1. Enable Windows Hypervisor Platform:" -ForegroundColor White
    Write-Host "   Win+R -> appwiz.cpl -> Windows Features" -ForegroundColor Gray
    Write-Host "   [X] Windows Hypervisor Platform" -ForegroundColor Gray
    Write-Host "   [X] Virtual Machine Platform" -ForegroundColor Gray
    Write-Host "2. RESTART your computer" -ForegroundColor White
    Write-Host "3. Create AVD with x86_64 architecture" -ForegroundColor White
    Write-Host ""
} elseif ($isIntel) {
    Write-Host "For Intel processor:" -ForegroundColor Yellow
    Write-Host "1. Install HAXM as Administrator:" -ForegroundColor White
    if (Test-Path $haxmPath) {
        $haxmInstaller = Join-Path $haxmPath "intelhaxm-android.exe"
        if (Test-Path $haxmInstaller) {
            Write-Host "   $haxmInstaller" -ForegroundColor Gray
        }
    }
    Write-Host "   Or run: $driverPath\silent_install.bat" -ForegroundColor Gray
    Write-Host "   (Right-click -> Run as Administrator)" -ForegroundColor Gray
    Write-Host "2. Run Android Studio as Administrator" -ForegroundColor White
    Write-Host "3. Create AVD with x86_64 or x86 architecture" -ForegroundColor White
    Write-Host ""
}

Write-Host "If emulator still doesn't work, use physical device:" -ForegroundColor Yellow
Write-Host "- Enable USB debugging on phone" -ForegroundColor White
Write-Host "- Connect via USB" -ForegroundColor White
Write-Host "- Run app from Android Studio" -ForegroundColor White
Write-Host ""

Write-Host "Detailed instructions: FIX_EMULATOR_HYPERVISOR.md" -ForegroundColor Cyan
Write-Host ""
