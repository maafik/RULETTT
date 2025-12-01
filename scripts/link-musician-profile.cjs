const admin = require("firebase-admin");
const path = require("path");

// Инициализация Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, "..", "frebaze-94560-firebase-adminsdk-fbsvc-80df5106db.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// UID пользователя и имя музыканта
const USER_UID = "tw2mIULtdwa4D5TZxxtgsSagpED3";
const MUSICIAN_NAME = "Анна Смирнова";

async function linkMusicianProfile() {
  try {
    console.log(`Связываем UID ${USER_UID} с профилем музыканта "${MUSICIAN_NAME}"...`);
    
    // Создаем связь в Firestore
    const userProfileRef = db.collection("userProfiles").doc(USER_UID);
    
    await userProfileRef.set({
      musicianName: MUSICIAN_NAME,
      linkedAt: admin.firestore.FieldValue.serverTimestamp(),
      role: "musician"
    });
    
    console.log("✓ Связь успешно создана в userProfiles!");
    console.log(`✓ Пользователь ${USER_UID} теперь связан с профилем "${MUSICIAN_NAME}"`);
    
    // Также создаем обратную связь: имя музыканта -> UID
    const musicianRef = db.collection("musicians").doc(encodeURIComponent(MUSICIAN_NAME));
    
    await musicianRef.set({
      uid: USER_UID,
      linkedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log("✓ Обратная связь также создана в musicians!");
    console.log("\n✓ Коллекции созданы в Firestore:");
    console.log("  - userProfiles/{UID}");
    console.log("  - musicians/{musicianName}");
    console.log("\n✓ Теперь можно создавать заказы в коллекции 'orders'");
    
    process.exit(0);
  } catch (error) {
    console.error("Ошибка при создании связи:", error);
    process.exit(1);
  }
}

linkMusicianProfile();




