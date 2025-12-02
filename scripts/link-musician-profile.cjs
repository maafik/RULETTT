const admin = require("firebase-admin");
const path = require("path");

// Инициализация Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, "..", "frebaze-94560-firebase-adminsdk-fbsvc-58dc784745.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// UID пользователя и имя музыканта
const NEW_USER_UID = "DypkhitMEzLyPzSBTLoPMGYQxHM2";
const MUSICIAN_NAME = "Анна Смирнова";

async function linkMusicianProfile() {
  try {
    console.log(`\n✅ Создание привязки для "${MUSICIAN_NAME}"...\n`);
    console.log(`ℹ️  Старая привязка уже удалена вручную\n`);
    
    // 2. Создаем новую привязку
    console.log(`\n✅ Создание новой привязки для UID ${NEW_USER_UID}...`);
    
    const userProfileRef = db.collection("userProfiles").doc(NEW_USER_UID);
    
    await userProfileRef.set({
      musicianName: MUSICIAN_NAME,
      linkedAt: admin.firestore.FieldValue.serverTimestamp(),
      role: "musician"
    });
    
    console.log("✓ Связь успешно создана в userProfiles!");
    console.log(`✓ Пользователь ${NEW_USER_UID} теперь связан с профилем "${MUSICIAN_NAME}"`);
    
    // 3. Обновляем обратную связь: имя музыканта -> новый UID
    const musicianRef = db.collection("musicians").doc(encodeURIComponent(MUSICIAN_NAME));
    
    await musicianRef.set({
      uid: NEW_USER_UID,
      linkedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log("✓ Обратная связь обновлена в musicians!");
    console.log("\n✅ Привязка успешно создана:");
    console.log(`  - UID: ${NEW_USER_UID}`);
    console.log(`  - Музыкант: ${MUSICIAN_NAME}`);
    console.log("\n✓ Теперь можно создавать заказы в коллекции 'orders'");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка при обновлении связи:", error);
    process.exit(1);
  }
}

linkMusicianProfile();




