const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения из .env.local вручную
function loadEnvFile(filePath) {
  const env = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  }
  return env;
}

// Загружаем переменные из .env.local и .env
const envLocal = loadEnvFile(path.join(__dirname, '..', '.env.local'));
const env = loadEnvFile(path.join(__dirname, '..', '.env'));

// Объединяем переменные (process.env имеет приоритет)
Object.assign(process.env, env, envLocal);

// Загружаем service account
const serviceAccountPath = path.join(__dirname, '..', 'frebaze-94560-firebase-adminsdk-fbsvc-80df5106db.json');

let db = null;

if (!fs.existsSync(serviceAccountPath)) {
  console.warn('⚠️ Файл service account не найден:', serviceAccountPath);
  console.warn('💡 Пропускаем проверку Firestore (нужен для проверки коллекции)');
} else {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Проверяем, не инициализирован ли уже Firebase Admin
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    
    db = admin.firestore();
    console.log('✅ Firebase Admin инициализирован\n');
  } catch (error) {
    console.warn('⚠️ Ошибка инициализации Firebase Admin:', error.message);
    console.warn('💡 Пропускаем проверку Firestore\n');
  }
}

async function checkOneSignalSetup() {
  console.log('🔍 Проверка настройки OneSignal...\n');

  // Проверяем коллекцию userOneSignalIds
  console.log('📋 Проверка коллекции userOneSignalIds:');
  if (!db) {
    console.log('   ⚠️ Firebase Admin не инициализирован - пропускаем проверку коллекции');
    console.log('   💡 Для проверки коллекции нужен файл service account');
  } else {
    try {
      const snapshot = await db.collection('userOneSignalIds').get();
      
      if (snapshot.empty) {
        console.log('   ⚠️ Коллекция userOneSignalIds пуста - Player ID не сохранены');
        console.log('   💡 Пользователи должны разрешить уведомления в браузере');
        console.log('   💡 После разрешения Player ID должен сохраниться автоматически');
      } else {
        console.log(`   ✅ Найдено ${snapshot.size} записей Player ID:`);
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`      - UID: ${doc.id}`);
          console.log(`        Player ID: ${data.playerId ? data.playerId.substring(0, 20) + '...' : 'НЕТ'}`);
          console.log(`        Обновлено: ${data.updatedAt || data.createdAt || 'НЕТ'}`);
          console.log('');
        });
      }
    } catch (error) {
      if (error.message.includes('UNAUTHENTICATED') || error.message.includes('invalid authentication')) {
        console.error('   ❌ Ошибка аутентификации Firebase Admin');
        console.error('   💡 Возможно, файл service account устарел или неправильный');
        console.error('   💡 Скачайте новый файл из Firebase Console:');
        console.error('      Project Settings → Service Accounts → Generate new private key');
      } else {
        console.error('   ❌ Ошибка при проверке коллекции:', error.message);
      }
    }
  }

  // Проверяем правила Firestore
  console.log('\n📋 Проверка правил Firestore:');
  console.log('   💡 Убедитесь, что в firestore.rules есть правило:');
  console.log('   match /userOneSignalIds/{userId} {');
  console.log('     allow read, write: if request.auth != null && request.auth.uid == userId;');
  console.log('   }');
  console.log('   💡 И что правила задеплоены в Firebase Console');

  // Проверяем переменные окружения
  console.log('\n📋 Проверка переменных окружения:');
  
  // Проверяем наличие .env.local
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envLocalPath) && !fs.existsSync(envPath)) {
    console.log('   ⚠️ Файл .env.local не найден');
    console.log('   💡 Создайте файл .env.local в корне проекта с переменными:');
    console.log('      VITE_ONESIGNAL_APP_ID=ваш-app-id');
    console.log('      VITE_API_URL=/api/send-notification');
    console.log('      VITE_APP_URL=http://localhost:5173');
  } else {
    const envFile = fs.existsSync(envLocalPath) ? envLocalPath : envPath;
    console.log(`   📄 Используется файл: ${path.basename(envFile)}`);
  }
  
  const requiredVars = [
    { name: 'VITE_ONESIGNAL_APP_ID', description: 'Для клиентской части (браузер)' },
    { name: 'ONESIGNAL_APP_ID', description: 'Для серверной части (Vercel API)' },
    { name: 'ONESIGNAL_REST_API_KEY', description: 'Для серверной части (Vercel API)' },
  ];
  
  let hasClientVars = false;
  let hasServerVars = false;
  
  requiredVars.forEach(({ name, description }) => {
    const value = process.env[name];
    if (value) {
      console.log(`   ✅ ${name}: ${value.substring(0, 20)}... (${description})`);
      if (name.startsWith('VITE_')) {
        hasClientVars = true;
      } else {
        hasServerVars = true;
      }
    } else {
      console.log(`   ⚠️ ${name}: НЕ НАЙДЕНА (${description})`);
    }
  });
  
  if (!hasClientVars) {
    console.log('\n   💡 Для локальной разработки добавьте в .env.local:');
    console.log('      VITE_ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606');
  }
  
  if (!hasServerVars) {
    console.log('\n   💡 Для работы API в Vercel добавьте переменные окружения:');
    console.log('      ONESIGNAL_APP_ID=0ae1d329-0160-4eac-aacc-df8f50479606');
    console.log('      ONESIGNAL_REST_API_KEY=ваш-rest-api-key');
    console.log('   💡 Эти переменные нужны только в Vercel, не в .env.local');
  }

  console.log('\n✅ Проверка завершена');
  process.exit(0);
}

checkOneSignalSetup().catch((error) => {
  console.error('❌ Ошибка при проверке:', error);
  process.exit(1);
});

