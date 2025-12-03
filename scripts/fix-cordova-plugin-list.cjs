#!/usr/bin/env node

/**
 * Capacitor генерирует пустой cordova_plugins.js, если Cordova-плагинов нет.
 * Пустой файл ломает загрузку cordova.js в Android WebView → белый экран.
 * Скрипт гарантирует, что файл содержит валидный модуль даже без плагинов.
 */

const fs = require("fs");
const path = require("path");

const targetPath = path.resolve(
  __dirname,
  "../android/app/src/main/assets/public/cordova_plugins.js"
);

const stub = `cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [];
  module.exports.metadata =
  // TOP OF METADATA
  {};
  // BOTTOM OF METADATA
});
`;

try {
  if (!fs.existsSync(targetPath)) {
    console.warn(
      "⚠️  cordova_plugins.js не найден, создаем новый stub:",
      targetPath
    );
    fs.writeFileSync(targetPath, stub, "utf8");
    return;
  }

  const currentContent = fs.readFileSync(targetPath, "utf8");
  if (currentContent.trim() === stub.trim()) {
    console.log("ℹ️ cordova_plugins.js уже содержит корректный stub");
    return;
  }

  fs.writeFileSync(targetPath, stub, "utf8");
  console.log("✅ cordova_plugins.js обновлен для корректной загрузки приложения");
} catch (error) {
  console.error("❌ Не удалось обновить cordova_plugins.js:", error);
  process.exitCode = 1;
}




