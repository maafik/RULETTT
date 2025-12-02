const admin = require("firebase-admin");
const path = require("path");

// Инициализация Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, "..", "frebaze-94560-firebase-adminsdk-fbsvc-58dc784745.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Данные для создания
const MUSICIAN_NAME = "Анна Смирнова";
const USER_UID = "DypkhitMEzLyPzSBTLoPMGYQxHM2";

async function createMusicianDoc() {
  try {
    console.log(`\n📝 Создание документа в коллекции musicians...\n`);
    console.log(`Музыкант: ${MUSICIAN_NAME}`);
    console.log(`UID: ${USER_UID}\n`);
    
    // Создаем документ в коллекции musicians
    // ID документа должен быть URL-encoded именем музыканта
    const musicianDocId = encodeURIComponent(MUSICIAN_NAME);
    const musicianRef = db.collection("musicians").doc(musicianDocId);
    
    await musicianRef.set({
      uid: USER_UID,
      linkedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Документ успешно создан!`);
    console.log(`   Коллекция: musicians`);
    console.log(`   Document ID: ${musicianDocId}`);
    console.log(`   Поля:`);
    console.log(`     - uid: ${USER_UID}`);
    console.log(`     - linkedAt: ${new Date().toISOString()}`);
    console.log(`\n✅ Готово!\n`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка при создании документа:", error);
    console.error("\n💡 Если ошибка аутентификации, создайте документ вручную через Firebase Console:");
    console.error(`   - Коллекция: musicians`);
    console.error(`   - Document ID: ${encodeURIComponent(MUSICIAN_NAME)}`);
    console.error(`   - Поля: uid (string) = ${USER_UID}, linkedAt (timestamp) = now`);
    process.exit(1);
  }
}

createMusicianDoc();

