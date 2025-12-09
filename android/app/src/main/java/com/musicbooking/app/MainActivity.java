package com.musicbooking.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Включаем edge-to-edge режим для поддержки системных панелей
        // Это позволяет контенту отображаться под статус-баром и навигацией
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Настраиваем внешний вид системных панелей
        WindowInsetsControllerCompat windowInsetsController =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (windowInsetsController != null) {
            // Делаем статус-бар светлым (темный текст на светлом фоне)
            // Это обеспечивает хорошую читаемость на светлом фоне приложения
            windowInsetsController.setAppearanceLightStatusBars(true);
            
            // Делаем навигационную панель светлой (темный текст на светлом фоне)
            // Это обеспечивает хорошую читаемость на светлом фоне приложения
            windowInsetsController.setAppearanceLightNavigationBars(true);
        }
        
        // WebView автоматически будет использовать CSS env(safe-area-inset-*) переменные
        // для правильного отображения контента на всех устройствах
    }

    @Override
    protected void onResume() {
        super.onResume();

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat windowInsetsController =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (windowInsetsController != null) {
            windowInsetsController.setAppearanceLightStatusBars(true);
            windowInsetsController.setAppearanceLightNavigationBars(true);
        }
    }
}

