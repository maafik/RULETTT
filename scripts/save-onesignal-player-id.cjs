const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Получаем аргументы из командной строки
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Недостаточно аргументов');
  console.log('\n📋 Использование:');
  console.log('   node scripts/save-onesignal-player-id.cjs <USER_UID> <PLAYER_ID>');
  console.log('\n📝 Пример:');
  console.log('   node scripts/save-onesignal-player-id.cjs KTTDwA8YyrZOHGUsWqVsMFNDATu2 abc123def456...');
  console.log('\n💡 Как получить Player ID:');
  console.log('   1. Откройте приложение в браузере');
  console.log('   2. Войдите в систему');
  console.log('   3. Откройте консоль браузера (F12)');
  console.log('   4. Разрешите уведомления');
  console.log('   5. Найдите в логах: "✅ Player ID получен: ..."');
  console.log('   6. Скопируйте Player ID');
  process.exit(1);
}

const userUid = args[0];
const playerId = args[1];

if (!userUid || !playerId) {
  console.error('❌ UID и Player ID обязательны');
  process.exit(1);
}

// Загружаем service account
const serviceAccountPath = path.join(__dirname, '..', 'frebaze-94560-firebase-adminsdk-fbsvc-80df5106db.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Файл service account не найден:', serviceAccountPath);
  console.error('💡 Убедитесь, что файл существует в корне проекта');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Инициализируем Firebase Admin
try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  console.log('✅ Firebase Admin инициализирован\n');
} catch (error) {
  console.error('❌ Ошибка инициализации Firebase Admin:', error.message);
  if (error.message.includes('UNAUTHENTICATED') || error.message.includes('invalid authentication')) {
    console.error('💡 Возможно, файл service account устарел');
    console.error('💡 Скачайте новый файл из Firebase Console:');
    console.error('   Project Settings → Service Accounts → Generate new private key');
  }
  process.exit(1);
}

const db = admin.firestore();

async function savePlayerId() {
  try {
    console.log('💾 Сохранение Player ID в Firestore...');
    console.log(`   UID: ${userUid}`);
    console.log(`   Player ID: ${playerId.substring(0, 20)}...\n`);

    const userRef = db.collection('userOneSignalIds').doc(userUid);

    // Проверяем, существует ли уже документ
    const existingDoc = await userRef.get();
    
    const data = {
      playerId,
      uid: userUid,
      updatedAt: new Date().toISOString(),
    };

    if (existingDoc.exists) {
      // Обновляем существующий документ
      await userRef.update(data);
      console.log('✅ Player ID обновлен в Firestore');
      console.log(`   Документ: userOneSignalIds/${userUid}`);
    } else {
      // Создаем новый документ
      data.createdAt = new Date().toISOString();
      await userRef.set(data);
      console.log('✅ Player ID создан в Firestore');
      console.log(`   Документ: userOneSignalIds/${userUid}`);
    }

    // Проверяем, что документ сохранен
    const savedDoc = await userRef.get();
    if (savedDoc.exists) {
      const savedData = savedDoc.data();
      console.log('\n✅ Проверка сохраненного документа:');
      console.log(`   UID: ${savedData.uid}`);
      console.log(`   Player ID: ${savedData.playerId ? savedData.playerId.substring(0, 20) + '...' : 'НЕТ'}`);
      console.log(`   Создан: ${savedData.createdAt || 'НЕТ'}`);
      console.log(`   Обновлен: ${savedData.updatedAt || 'НЕТ'}`);
      console.log('\n✅ Готово! Player ID сохранен в Firestore');
      console.log('💡 Теперь уведомления должны работать для этого пользователя');
    } else {
      console.error('❌ Документ не найден после сохранения');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при сохранении Player ID:', error.message);
    
    if (error.message.includes('permission-denied')) {
      console.error('💡 Ошибка прав доступа');
      console.error('💡 Убедитесь, что правила Firestore обновлены:');
      console.error('   match /userOneSignalIds/{userId} {');
      console.error('     allow read, write: if request.auth != null && request.auth.uid == userId;');
      console.error('   }');
      console.error('💡 И что правила задеплоены в Firebase Console');
    } else if (error.message.includes('UNAUTHENTICATED')) {
      console.error('💡 Ошибка аутентификации Firebase Admin');
      console.error('💡 Возможно, файл service account устарел');
      console.error('💡 Скачайте новый файл из Firebase Console');
    }
    
    process.exit(1);
  }
}

savePlayerId();


