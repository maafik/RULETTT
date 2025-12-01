const admin = require("firebase-admin");
const path = require("path");

// Инициализация Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, "..", "frebaze-94560-firebase-adminsdk-fbsvc-80df5106db.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Активные статусы заказов, которые НЕ должны удаляться по умолчанию
const ACTIVE_STATUSES = ["created", "pending", "payment-pending", "confirmed", "in-progress"];
// Неактивные статусы, которые можно безопасно удалить
const INACTIVE_STATUSES = ["completed", "cancelled"];

/**
 * Получить статистику по заказам
 */
async function getOrdersStats() {
  const ordersRef = db.collection("orders");
  const snapshot = await ordersRef.get();
  
  if (snapshot.empty) {
    return { total: 0, active: 0, inactive: 0, byStatus: {} };
  }
  
  const stats = {
    total: snapshot.size,
    active: 0,
    inactive: 0,
    byStatus: {}
  };
  
  snapshot.forEach((doc) => {
    const order = doc.data();
    const status = order.status || "unknown";
    
    // Подсчитываем по статусам
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    
    // Разделяем на активные и неактивные
    if (ACTIVE_STATUSES.includes(status)) {
      stats.active++;
    } else if (INACTIVE_STATUSES.includes(status)) {
      stats.inactive++;
    }
  });
  
  return stats;
}

/**
 * Очистить заказы из Firestore
 * @param {boolean} includeActive - удалять ли активные заказы
 */
async function clearOrders(includeActive = false) {
  try {
    console.log("Начинаем очистку заказов из Firestore...");
    
    const ordersRef = db.collection("orders");
    let query = ordersRef;
    
    // Если не удаляем активные, фильтруем только неактивные статусы
    if (!includeActive) {
      query = ordersRef.where("status", "in", INACTIVE_STATUSES);
      console.log(`🔍 Режим: удаление только завершенных и отмененных заказов`);
    } else {
      console.log(`⚠️  Режим: удаление ВСЕХ заказов (включая активные!)`);
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log("✅ Заказов для удаления не найдено");
      process.exit(0);
      return;
    }
    
    console.log(`Найдено ${snapshot.size} заказов для удаления`);
    
    // Удаляем пакетами по 500 (лимит Firestore)
    const batches = [];
    let currentBatch = db.batch();
    let count = 0;
    
    snapshot.forEach((doc) => {
      currentBatch.delete(doc.ref);
      count++;
      
      if (count === 500) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        count = 0;
      }
    });
    
    if (count > 0) {
      batches.push(currentBatch);
    }
    
    // Выполняем все пакеты
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`Удалено ${Math.min((i + 1) * 500, snapshot.size)} заказов...`);
    }
    
    console.log(`✅ Успешно удалено ${snapshot.size} заказов из Firestore`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка при удалении заказов:", error);
    process.exit(1);
  }
}

// Главная функция
async function main() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Показываем статистику
    console.log("📊 Анализ заказов в Firestore...\n");
    const stats = await getOrdersStats();
    
    if (stats.total === 0) {
      console.log("✅ Заказов в Firestore нет");
      process.exit(0);
      return;
    }
    
    console.log("📈 Статистика заказов:");
    console.log(`   Всего заказов: ${stats.total}`);
    console.log(`   Активных: ${stats.active} (не будут удалены по умолчанию)`);
    console.log(`   Завершенных/Отмененных: ${stats.inactive} (будут удалены)`);
    console.log("\n   По статусам:");
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      const isActive = ACTIVE_STATUSES.includes(status);
      const icon = isActive ? "🟢" : "🔴";
      console.log(`   ${icon} ${status}: ${count}`);
    });
    
    console.log("\n" + "=".repeat(50));
    console.log("Выберите режим очистки:");
    console.log("1. Удалить только завершенные и отмененные заказы (безопасно)");
    console.log("2. Удалить ВСЕ заказы, включая активные (опасно!)");
    console.log("3. Отмена");
    console.log("=".repeat(50));
    
    rl.question("\nВаш выбор (1/2/3): ", async (choice) => {
      if (choice === "1") {
        // Безопасное удаление только неактивных
        rl.question("\n⚠️  Удалить завершенные и отмененные заказы? (yes/no): ", (answer) => {
          if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
            clearOrders(false);
          } else {
            console.log("Отменено");
            process.exit(0);
          }
        });
      } else if (choice === "2") {
        // Опасное удаление всех заказов
        rl.question("\n🚨 ВНИМАНИЕ: Это удалит ВСЕ заказы, включая активные!\nВы ТОЧНО уверены? (yes/no): ", (answer) => {
          if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
            clearOrders(true);
          } else {
            console.log("Отменено");
            process.exit(0);
          }
        });
      } else {
        console.log("Отменено");
        process.exit(0);
      }
    });
  } catch (error) {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  }
}

main();






