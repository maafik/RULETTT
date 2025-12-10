import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Проверка инициализации Firestore
if (!db) {
  console.warn("⚠️ Firestore не инициализирован! Проверьте конфигурацию Firebase.");
  console.warn("⚠️ Функции работы с базой данных будут недоступны.");
}

// Типы для Firebase данных
export interface UserProfile {
  musicianName?: string;
  role: "musician" | "customer";
  linkedAt?: number;
  city?: string;
  phone?: string;
  allowWhatsAppTelegramNotifications?: boolean;
}

export interface MusicianProfile {
  uid: string;
  linkedAt?: number;
}

/**
 * Получить профиль пользователя по UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) {
    console.warn("⚠️ Firestore недоступен, возвращаем профиль по умолчанию");
    return {
      role: "customer",
      city: "Москва",
    } as UserProfile;
  }
  
  try {
    const profileRef = doc(db, "userProfiles", uid);
    const snapshot = await getDoc(profileRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const profile = {
        musicianName: data.musicianName,
        role: data.role || "customer",
        linkedAt: data.linkedAt?.toMillis?.() || data.linkedAt,
        city: data.city || "Москва",
        phone: data.phone || null,
        allowWhatsAppTelegramNotifications: data.allowWhatsAppTelegramNotifications || false,
      } as UserProfile;
      
      if (profile.role === "musician" || profile.musicianName) {
        console.log(`👤 Профиль музыканта для UID ${uid}:`, profile);
      }
      
      return profile;
    }
    
    // Профиль не найден - возвращаем профиль с городом по умолчанию
    // Предупреждение только если это известный музыкант
    if (uid === "JFiWds7FPDZEh5n0h5H235re0vu1") {
      console.warn(`⚠️ Профиль не найден для Дмитрия Волкова (UID: ${uid})`);
      console.warn(`💡 Запустите: npm run link-profile`);
    }
    
    // Для новых пользователей возвращаем профиль с городом по умолчанию
    return {
      role: "customer",
      city: "Москва",
    } as UserProfile;
  } catch (error: any) {
    // Обработка ошибок подключения
    if (error.code === "unavailable" || error.message?.includes("offline") || error.message?.includes("network")) {
      console.warn("⚠️ Firestore недоступен (офлайн режим). Используем профиль по умолчанию.");
      console.warn("💡 Проверьте:");
      console.warn("   1. Интернет-соединение");
      console.warn("   2. Переменные окружения Firebase (.env файл)");
      console.warn("   3. Настройки Firebase для localhost");
      
      // Возвращаем профиль по умолчанию вместо null
      return {
        role: "customer",
        city: "Москва",
      } as UserProfile;
    }
    
    console.error("❌ Ошибка при получении профиля пользователя:", error);
    return null;
  }
}

/**
 * Создать или обновить профиль пользователя
 */
export async function createOrUpdateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const profileRef = doc(db, "userProfiles", uid);
    const snapshot = await getDoc(profileRef);
    
    if (snapshot.exists()) {
      // Обновляем существующий профиль
      await updateDoc(profileRef, {
        ...data,
      });
    } else {
      // Создаем новый профиль с городом по умолчанию
      await setDoc(profileRef, {
        role: "customer",
        city: "Москва",
        ...data,
      });
    }
  } catch (error) {
    console.error("❌ Ошибка при создании/обновлении профиля пользователя:", error);
  }
}

/**
 * Проверка, является ли пользователь администратором (Анна Смирнова)
 */
export function isAdminProfile(uid: string, profile: UserProfile | null): boolean {
  // Жёстко привязываем админские права к конкретному UID аккаунта
  if (uid === "DypkhitMEzLyPzSBTLoPMGYQxHM2") {
    return true;
  }

  // На всякий случай оставляем старую проверку по имени (fallback)
  const name = profile?.musicianName?.trim().toLowerCase();
  return !!name && name === "анна смирнова";
}

/**
 * Получить UID музыканта по имени
 */
export async function getMusicianUid(musicianName: string): Promise<string | null> {
  try {
    const musicianRef = doc(db, "musicians", encodeURIComponent(musicianName));
    const snapshot = await getDoc(musicianRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.uid || null;
    }
    
    return null;
  } catch (error) {
    console.error("Ошибка при получении UID музыканта:", error);
    return null;
  }
}

/**
 * Получить имя музыканта по UID
 */
export async function getMusicianName(uid: string): Promise<string | null> {
  const profile = await getUserProfile(uid);
  return profile?.musicianName || null;
}

/**
 * Сохранить заказ в Firestore
 */
export async function saveOrderToFirebase(order: any, customerUid: string, customerEmail?: string, customerName?: string, customerPhone?: string): Promise<string | null> {
  try {
    if (!db) {
      console.error("Firestore не инициализирован");
      throw new Error("Firestore не инициализирован");
    }

    const ordersRef = collection(db, "orders");
    
    // Преобразуем createdAt в Timestamp, если оно есть как число
    let createdAtTimestamp: Timestamp;
    if (order.createdAt && typeof order.createdAt === 'number') {
      createdAtTimestamp = Timestamp.fromMillis(order.createdAt);
    } else if (order.createdAt?.toMillis) {
      createdAtTimestamp = order.createdAt;
    } else {
      createdAtTimestamp = Timestamp.now();
    }
    
    const orderWithCustomer = {
      ...order,
      customerUid,
      customerEmail: customerEmail || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      createdAt: createdAtTimestamp,
      updatedAt: Timestamp.now(),
    };
    
    // Удаляем id из данных, так как он используется как ID документа
    delete (orderWithCustomer as any).id;
    
    console.log("💾 Сохранение заказа в Firestore:");
    console.log("   artistName:", order.artistName);
    console.log("   customerUid:", customerUid);
    console.log("   customerEmail:", customerEmail);
    console.log("   customerName:", customerName);
    console.log("   orderId:", order.id);
    
    // Используем числовой ID из заказа вместо автогенерируемого Firestore ID
    const orderDocRef = doc(ordersRef, order.id);
    await setDoc(orderDocRef, orderWithCustomer);
    
    console.log("✅ Заказ успешно сохранен в Firestore!");
    console.log("   Firestore ID:", order.id);
    console.log("   artistName:", order.artistName);
    return order.id;
  } catch (error: any) {
    console.error("❌ Ошибка при сохранении заказа в Firestore:", error);
    console.error("Детали ошибки:", {
      code: error.code,
      message: error.message,
      name: error.name,
    });
    
    // Если ошибка связана с сетевым подключением
    if (error.message?.includes("ERR_CONNECTION_RESET") || 
        error.message?.includes("network") ||
        error.code === "unavailable" ||
        error.code === "deadline-exceeded") {
      console.error("🌐 Ошибка сетевого подключения к Firebase");
      console.error("💡 Проверьте:");
      console.error("   1. Интернет-соединение");
      console.error("   2. Файрвол/антивирус не блокирует Firebase");
      console.error("   3. Попробуйте обновить страницу");
      throw new Error("Проблема с подключением к Firebase. Проверьте интернет-соединение.");
    }
    
    // Если ошибка связана с правилами безопасности
    if (error.code === "permission-denied") {
      console.error("Ошибка доступа: проверьте правила Firestore");
      throw new Error("Нет доступа к Firestore. Проверьте правила безопасности.");
    }
    
    // Если ошибка связана с отсутствием индекса
    if (error.code === "failed-precondition") {
      console.error("Требуется создать индекс в Firestore");
      throw new Error("Требуется создать индекс. Следуйте ссылке в консоли.");
    }
    
    throw error;
  }
}

/**
 * Получить заказы для музыканта (где он исполнитель)
 */
export async function getOrdersForMusician(musicianUid: string): Promise<any[]> {
  try {
    const musicianName = await getMusicianName(musicianUid);
    
    if (!musicianName) {
      console.warn("⚠️ Не найдено имя музыканта для UID:", musicianUid);
      return [];
    }
    
    console.log("🔍 Поиск заказов для музыканта:", musicianName);
    
    const ordersRef = collection(db, "orders");
    
    // Пробуем сначала с orderBy
    let q = query(
      ordersRef,
      where("artistName", "==", musicianName),
      orderBy("createdAt", "desc")
    );
    
    try {
      const snapshot = await getDocs(q);
      const orders: any[] = [];
      
      console.log(`✅ Найдено ${snapshot.size} заказов для ${musicianName}`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📦 Заказ:", doc.id, "artistName:", data.artistName, "customerName:", data.customerName || data.customerEmail);
        orders.push({
          ...data,
          id: doc.id || data.id,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        });
      });
      
      return orders;
    } catch (error: any) {
      // Если ошибка из-за отсутствия индекса, используем запрос без orderBy
      if (error.code === "failed-precondition") {
        console.warn("⚠️ Индекс не найден, используем запрос без сортировки");
        
        q = query(
          ordersRef,
          where("artistName", "==", musicianName)
        );
        
        const snapshot = await getDocs(q);
        const orders: any[] = [];
        
        console.log(`✅ Найдено ${snapshot.size} заказов (без сортировки) для ${musicianName}`);
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("📦 Заказ:", doc.id, "artistName:", data.artistName);
          orders.push({
            ...data,
            id: doc.id || data.id,
            createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          });
        });
        
        // Сортируем на клиенте
        orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        return orders;
      }
      throw error;
    }
  } catch (error: any) {
    console.error("❌ Ошибка при получении заказов для музыканта:", error);
    console.error("Детали:", {
      code: error.code,
      message: error.message,
    });
    return [];
  }
}

/**
 * Получить заказы для заказчика (где он заказал)
 */
export async function getOrdersForCustomer(customerUid: string): Promise<any[]> {
  try {
    const ordersRef = collection(db, "orders");
    
    // Пробуем сначала с orderBy
    let q = query(
      ordersRef,
      where("customerUid", "==", customerUid),
      orderBy("createdAt", "desc")
    );
    
    try {
      const snapshot = await getDocs(q);
      const orders: any[] = [];
      
      console.log(`✅ Найдено ${snapshot.size} заказов для заказчика ${customerUid}`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          ...data,
          id: doc.id || data.id,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        });
      });
      
      return orders;
    } catch (error: any) {
      // Если ошибка из-за отсутствия индекса, используем запрос без orderBy
      if (error.code === "failed-precondition") {
        console.warn("⚠️ Индекс не найден для заказчика, используем запрос без сортировки");
        console.log("💡 Для оптимизации создайте индекс: orders → customerUid (Asc), createdAt (Desc)");
        
        q = query(
          ordersRef,
          where("customerUid", "==", customerUid)
        );
        
        const snapshot = await getDocs(q);
        const orders: any[] = [];
        
        console.log(`✅ Найдено ${snapshot.size} заказов (без сортировки) для заказчика ${customerUid}`);
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({
            ...data,
            id: doc.id || data.id,
            createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          });
        });
        
        // Сортируем на клиенте
        orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        return orders;
      }
      throw error;
    }
  } catch (error: any) {
    console.error("❌ Ошибка при получении заказов для заказчика:", error);
    console.error("Детали:", {
      code: error.code,
      message: error.message,
      name: error.name,
    });
    
    // Если ошибка связана с сетевым подключением
    if (error.message?.includes("ERR_CONNECTION_RESET") || 
        error.message?.includes("network") ||
        error.code === "unavailable" ||
        error.code === "deadline-exceeded") {
      console.error("🌐 Ошибка сетевого подключения к Firebase");
      console.error("💡 Проверьте интернет-соединение и попробуйте обновить страницу");
    }
    
    // Если есть ссылка на создание индекса, показываем её
    if (error.message && error.message.includes("create it here")) {
      const urlMatch = error.message.match(/https:\/\/[^\s]+/);
      if (urlMatch) {
        console.log("🔗 Ссылка для создания индекса:", urlMatch[0]);
      }
    }
    
    return [];
  }
}

/**
 * Получить все заказы (для админа)
 */
export async function getAllOrders(): Promise<any[]> {
  try {
    const ordersRef = collection(db, "orders");

    let q = query(ordersRef, orderBy("createdAt", "desc"));

    try {
      const snapshot = await getDocs(q);
      const orders: any[] = [];

      console.log(`✅ Найдено ${snapshot.size} заказов (все заказы)`);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        orders.push({
          ...data,
          id: docSnap.id || data.id,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        });
      });

      return orders;
    } catch (error: any) {
      if (error.code === "failed-precondition") {
        console.warn("⚠️ Индекс не найден для всех заказов, используем запрос без сортировки");

        q = query(ordersRef);
        const snapshot = await getDocs(q);
        const orders: any[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          orders.push({
            ...data,
            id: docSnap.id || data.id,
            createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          });
        });

        orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return orders;
      }
      throw error;
    }
  } catch (error: any) {
    console.error("❌ Ошибка при получении всех заказов (админ):", error);
    return [];
  }
}

/**
 * Подписаться на изменения заказов для музыканта
 */
export function subscribeToMusicianOrders(
  musicianUid: string,
  callback: (orders: any[]) => void
): () => void {
  let unsubscribe: (() => void) | null = null;
  
  getMusicianName(musicianUid).then((musicianName) => {
    if (!musicianName) {
      console.warn("⚠️ Не найдено имя музыканта для UID:", musicianUid);
      console.warn("💡 Запустите: npm run link-profile");
      callback([]);
      return;
    }
    
    console.log("🎵 Подписка на заказы для музыканта:", musicianName);
    console.log("🔍 Ищем заказы где artistName == '" + musicianName + "'");
    
    const ordersRef = collection(db, "orders");
    
    // Пробуем сначала с orderBy (требует индекс)
    const qWithOrderBy = query(
      ordersRef,
      where("artistName", "==", musicianName),
      orderBy("createdAt", "desc")
    );
    
    unsubscribe = onSnapshot(
      qWithOrderBy,
      (snapshot) => {
        const orders: any[] = [];
        console.log(`✅ Получено ${snapshot.size} заказов для ${musicianName}`);
        
        if (snapshot.size === 0) {
          console.log("ℹ️ Заказов не найдено. Проверьте:");
          console.log("  1. Создан ли заказ в Firestore?");
          console.log("  2. Совпадает ли artistName в заказе с '" + musicianName + "'?");
        }
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("📦 Заказ:", doc.id);
          console.log("   artistName:", data.artistName, data.artistName === musicianName ? "✅" : "❌ НЕ СОВПАДАЕТ!");
          console.log("   customerName:", data.customerName || data.customerEmail || "не указано");
          console.log("   status:", data.status);
          
          orders.push({
            ...data,
            id: doc.id || data.id,
            createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          });
        });
        
        // Сортируем на клиенте (на случай если orderBy не работает)
        orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        callback(orders);
      },
      (error) => {
        console.error("❌ Ошибка при подписке на заказы:", error);
        console.error("Детали:", {
          code: error.code,
          message: error.message,
        });
        
        // Если ошибка из-за отсутствия индекса, используем запрос без orderBy
        const isIndexError = error.code === "failed-precondition" || 
                            error.message?.includes("index") || 
                            error.message?.includes("requires an index");
        
        if (isIndexError) {
          console.warn("⚠️ Индекс не найден, используем запрос без сортировки");
          console.log("💡 Для лучшей производительности создайте индекс по ссылке из ошибки выше");
          
          const qWithoutOrderBy = query(
            ordersRef,
            where("artistName", "==", musicianName)
          );
          
          // Отписываемся от предыдущего запроса, если он был
          if (unsubscribe) {
            unsubscribe();
          }
          
          unsubscribe = onSnapshot(
            qWithoutOrderBy,
            (snapshot) => {
              const orders: any[] = [];
              console.log(`✅ Получено ${snapshot.size} заказов (без сортировки) для ${musicianName}`);
              
              snapshot.forEach((doc) => {
                const data = doc.data();
                console.log("📦 Заказ:", doc.id, "artistName:", data.artistName, data.artistName === musicianName ? "✅" : "❌");
                orders.push({
                  ...data,
                  id: doc.id || data.id,
                  createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
                });
              });
              
              // Сортируем на клиенте
              orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
              
              callback(orders);
            },
            (fallbackError) => {
              console.error("❌ Ошибка при подписке (fallback):", fallbackError);
              callback([]);
            }
          );
        } else if (error.code === "permission-denied") {
          console.error("🚫 Ошибка доступа: проверьте правила Firestore");
          console.error("💡 См. QUICK_FIX.md для обновления правил");
          callback([]);
        } else if (error.message?.includes("ERR_CONNECTION_RESET") || 
                   error.message?.includes("network") ||
                   error.code === "unavailable" ||
                   error.code === "deadline-exceeded") {
          console.error("🌐 Ошибка сетевого подключения к Firebase");
          console.error("💡 Проверьте интернет-соединение и попробуйте обновить страницу");
          callback([]);
        } else {
          callback([]);
        }
      }
    );
  });
  
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}

/**
 * Подписаться на все заказы (для администратора)
 */
export function subscribeToAllOrders(
  callback: (orders: any[]) => void
): () => void {
  if (!db) {
    console.error("❌ Firestore не инициализирован");
    callback([]);
    return () => {};
  }

  const ordersRef = collection(db, "orders");

  let unsubscribe: (() => void) | null = null;

  const qWithOrderBy = query(
    ordersRef,
    orderBy("createdAt", "desc")
  );

  unsubscribe = onSnapshot(
    qWithOrderBy,
    (snapshot) => {
      const orders: any[] = [];
      console.log(`✅ Получено ${snapshot.size} заказов (админ просмотр всех заказов)`);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        orders.push({
          ...data,
          id: docSnap.id || data.id,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        });
      });

      orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(orders);
    },
    (error) => {
      console.error("❌ Ошибка при подписке на все заказы:", error);

      if (error.code === "failed-precondition") {
        console.warn("⚠️ Индекс не найден для всех заказов, используем запрос без сортировки");

        const qWithoutOrderBy = query(ordersRef);

        if (unsubscribe) {
          unsubscribe();
        }

        unsubscribe = onSnapshot(
          qWithoutOrderBy,
          (snapshot) => {
            const orders: any[] = [];
            console.log(`✅ Получено ${snapshot.size} заказов (без сортировки, админ)`);

            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              orders.push({
                ...data,
                id: docSnap.id || data.id,
                createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
              });
            });

            orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            callback(orders);
          },
          (fallbackError) => {
            console.error("❌ Ошибка при подписке (fallback) на все заказы:", fallbackError);
            callback([]);
          }
        );
      } else {
        callback([]);
      }
    }
  );

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}

/**
 * Получить заказ по ID из Firestore
 */
export async function getOrderById(orderId: string): Promise<any | null> {
  try {
    if (!db) {
      console.error("❌ Firestore не инициализирован");
      return null;
    }

    const orderRef = doc(db, "orders", orderId);
    const snapshot = await getDoc(orderRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      
      // Преобразуем все Timestamp поля в числа
      const order: any = {
        ...data,
        id: snapshot.id || data.id || orderId,
        createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt,
      };
      
      // Убеждаемся, что все обязательные поля присутствуют
      if (!order.status) {
        order.status = "created";
      }
      
      console.log(`📦 Заказ ${orderId} загружен из Firestore:`, {
        id: order.id,
        status: order.status,
        artistName: order.artistName,
        date: order.date,
        time: order.time,
      });
      
      return order;
    }
    
    console.log(`⚠️ Заказ ${orderId} не найден в Firestore`);
    return null;
  } catch (error: any) {
    console.error("❌ Ошибка при получении заказа по ID:", error);
    console.error("Детали ошибки:", {
      code: error.code,
      message: error.message,
      orderId,
    });
    return null;
  }
}

/**
 * Обновить статус заказа и отправить уведомление
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      console.error("❌ Заказ не найден:", orderId);
      return false;
    }

    const orderData = orderDoc.data();
    const oldStatus = orderData.status;
    
    // Обновляем статус
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Статус заказа ${orderId} обновлен с "${oldStatus}" на "${status}" в Firestore`);

    // Отправляем уведомления (даже если статус уже был обновлен ранее)
    if (oldStatus === status) {
      console.log("ℹ️ Статус уже установлен, принудительно уведомляем подписчиков");
    }
    await sendStatusChangeNotification(orderId, orderData, oldStatus, status);

    return true;
  } catch (error) {
    console.error("❌ Ошибка при обновлении статуса заказа:", error);
    return false;
  }
}

/**
 * Отправить уведомление при изменении статуса заказа
 */
async function sendStatusChangeNotification(
  orderId: string,
  orderData: any,
  oldStatus: string,
  newStatus: string
) {
  try {
    const {
      notifyOrderConfirmed,
      notifyOrderPaid,
      notifyOrderCompleted,
      notifyOrderCancelled,
    } = await import("./notifications");

    const customerUid = orderData.customerUid;
    const artistName = orderData.artistName;
    const customerName = orderData.customerName || "Клиент";
    const customerPhone: string | null = orderData.customerPhone || null;
    const customerEmail: string | null = orderData.customerEmail || null;

    // Дополнительные данные для расширенного Telegram-уведомления об оплате
    let enrichedCustomerPhone: string | null = customerPhone;
    let allowWhatsAppTelegramNotifications = false;
    const amount: string | null =
      typeof orderData.price === "string" ? orderData.price : null;

    if (customerUid) {
      try {
        const customerProfile = await getUserProfile(customerUid);
        if (customerProfile) {
          allowWhatsAppTelegramNotifications =
            customerProfile.allowWhatsAppTelegramNotifications || false;

          if (!enrichedCustomerPhone && customerProfile.phone) {
            enrichedCustomerPhone = customerProfile.phone;
          }
        }
      } catch (error) {
        console.warn(
          "⚠️ Не удалось получить профиль клиента для Telegram-уведомления об оплате:",
          error
        );
      }
    }

    // Получаем UID музыканта по имени
    const musicianUid = await getMusicianUidByName(artistName);

    switch (newStatus) {
      case "payment-pending":
        // Музыкант подтвердил заказ -> уведомление клиенту
        if (customerUid) {
          await notifyOrderConfirmed(customerUid, orderId, artistName);
          await sendOrderConfirmedPush(orderId, artistName, customerUid);
        }
        break;

      case "in-progress":
        // Клиент оплатил -> уведомление музыканту и push клиенту
        if (musicianUid) {
          await notifyOrderPaid(
            musicianUid,
            orderId,
            customerName,
            artistName,
            enrichedCustomerPhone,
            customerEmail,
            amount,
            allowWhatsAppTelegramNotifications
          );
        }

        if (customerUid) {
          await sendOrderPaidPush(orderId, customerUid);
        }
        break;

      case "completed":
        // Заказ завершен -> уведомления обеим сторонам
        if (customerUid) {
          await notifyOrderCompleted(customerUid, orderId, false, artistName);
        }
        if (musicianUid) {
          await notifyOrderCompleted(musicianUid, orderId, true, customerName);
        }
        break;

      case "cancelled":
        // Заказ отменен -> уведомления обеим сторонам
        if (customerUid && musicianUid) {
          // Определяем, кто отменил (по старому статусу)
          const cancelledByCustomer = oldStatus === "created" || oldStatus === "pending";
          if (cancelledByCustomer) {
            await notifyOrderCancelled(musicianUid, orderId, true, customerName);
          } else {
            await notifyOrderCancelled(customerUid, orderId, false, artistName);
          }
        }
        break;
    }
  } catch (error) {
    console.error("❌ Ошибка при отправке уведомления:", error);
  }
}

/**
 * Отправить push-уведомление клиенту при подтверждении заказа музыкантом через Render backend.
 */
async function sendOrderConfirmedPush(
  orderId: string,
  artistName: string,
  customerUid: string
): Promise<void> {
  try {
    const title = "Заказ подтвержден";
    const body = `${artistName} подтвердил заказ. Ожидается оплата.`;

    const baseUrl =
      (import.meta as any).env.VITE_PAYMENT_API_URL ||
      "http://localhost:4000";
    const url = `${baseUrl.replace(/\/$/, "")}/send-order-push`;

    console.log("📲 Отправка push-уведомления клиенту через backend (Admin SDK):", {
      url,
      orderId,
      customerUid,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerUid,
        title,
        body,
        data: {
          orderId,
          type: "order-confirmed",
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        "❌ Ошибка ответа backend при отправке push-уведомления (Admin SDK):",
        response.status,
        text
      );
    } else {
      console.log("✅ Push-уведомление клиенту отправлено через backend (Admin SDK)");
    }
  } catch (error) {
    console.error("❌ Ошибка при отправке push-уведомления клиенту (Admin SDK):", error);
  }
}

/**
 * Отправить push-уведомление клиенту после успешной оплаты через Render backend.
 */
async function sendOrderPaidPush(
  orderId: string,
  customerUid: string
): Promise<void> {
  try {
    const title = "Оплата успешно обработана";
    const body = "Статус заказа доступен во вкладке „Заказы“ в приложении.";

    const baseUrl =
      (import.meta as any).env.VITE_PAYMENT_API_URL ||
      "http://localhost:4000";
    const url = `${baseUrl.replace(/\/$/, "")}/send-order-push`;

    console.log(
      "📲 Отправка push-уведомления клиенту после оплаты через backend (Admin SDK):",
      {
        url,
        orderId,
        customerUid,
      }
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerUid,
        title,
        body,
        data: {
          orderId,
          type: "order-paid",
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        "❌ Ошибка ответа backend при отправке push-уведомления клиенту после оплаты (Admin SDK):",
        response.status,
        text
      );
    } else {
      console.log(
        "✅ Push-уведомление клиенту после оплаты отправлено через backend (Admin SDK)"
      );
    }
  } catch (error) {
    console.error(
      "❌ Ошибка при отправке push-уведомления клиенту после оплаты (Admin SDK):",
      error
    );
  }
}

/**
 * Получить UID музыканта по имени
 */
export async function getMusicianUidByName(musicianName: string): Promise<string | null> {
  try {
    const musicianRef = doc(db, "musicians", encodeURIComponent(musicianName));
    const musicianDoc = await getDoc(musicianRef);
    
    if (musicianDoc.exists()) {
      return musicianDoc.data().uid || null;
    }
    
    return null;
  } catch (error) {
    console.error("❌ Ошибка при получении UID музыканта:", error);
    return null;
  }
}

/**
 * Обновить данные заказа в Firestore
 */
export async function updateOrderInFirebase(orderId: string, updatedData: Partial<Order>): Promise<boolean> {
  try {
    const orderRef = doc(db, "orders", orderId);
    
    // Преобразуем данные для Firestore
    const firestoreData: any = {
      ...updatedData,
      updatedAt: Timestamp.now(),
    };
    
    // Удаляем поля, которые не должны быть в Firestore
    delete firestoreData.id;
    delete firestoreData.createdAt; // createdAt не обновляем
    
    await updateDoc(orderRef, firestoreData);
    console.log(`✅ Заказ ${orderId} обновлен в Firestore:`, Object.keys(updatedData));
    return true;
  } catch (error) {
    console.error("❌ Ошибка при обновлении заказа в Firestore:", error);
    return false;
  }
}

/**
 * Отправить сообщение в чат заказа
 */
export async function sendChatMessage(
  orderId: string,
  message: { text: string; sender: "client" | "musician"; senderUid: string }
): Promise<boolean> {
  try {
    if (!db) {
      console.error("❌ Firestore не инициализирован");
      throw new Error("Firestore не инициализирован");
    }

    console.log("💬 Отправка сообщения в чат заказа:", orderId);
    console.log("   Текст:", message.text);
    console.log("   Отправитель:", message.sender);
    console.log("   UID отправителя:", message.senderUid);

    const messagesRef = collection(db, "orders", orderId, "messages");
    const docRef = await addDoc(messagesRef, {
      text: message.text,
      sender: message.sender,
      senderUid: message.senderUid,
      createdAt: Timestamp.now(),
    });
    
    console.log(`✅ Сообщение отправлено в чат заказа ${orderId}, ID: ${docRef.id}`);
    
    // Отправляем уведомление получателю
    try {
      await sendChatMessageNotification(orderId, message);
    } catch (notificationError) {
      // Не прерываем выполнение, если уведомление не отправилось
      console.error("⚠️ Ошибка при отправке уведомления о сообщении:", notificationError);
    }
    
    return true;
  } catch (error: any) {
    console.error("❌ Ошибка при отправке сообщения:", error);
    console.error("Детали ошибки:", {
      code: error.code,
      message: error.message,
      name: error.name,
    });
    
    // Если ошибка связана с правами доступа
    if (error.code === "permission-denied") {
      console.error("🚫 Ошибка доступа: проверьте правила Firestore для подколлекции messages");
      throw new Error("Нет доступа к отправке сообщений. Проверьте правила безопасности.");
    }
    
    throw error;
  }
}

/**
 * Отправить уведомление о новом сообщении в чате получателю
 */
async function sendChatMessageNotification(
  orderId: string,
  message: { text: string; sender: "client" | "musician"; senderUid: string }
): Promise<void> {
  try {
    // Получаем данные заказа
    const orderRef = doc(db, "orders", orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      console.warn("⚠️ Заказ не найден для отправки уведомления:", orderId);
      return;
    }
    
    const orderData = orderDoc.data();
    const customerUid = orderData.customerUid;
    const artistName = orderData.artistName;
    let customerPhone: string | null = orderData.customerPhone || null;
    const customerEmail: string | null = orderData.customerEmail || null;
    
    if (!customerUid || !artistName) {
      console.warn("⚠️ Недостаточно данных заказа для отправки уведомления:", { customerUid, artistName });
      return;
    }
    
    // Получаем профиль клиента для получения номера телефона и настройки уведомлений
    let customerProfile = null;
    let allowWhatsAppTelegramNotifications = false;
    
    if (message.sender === "client") {
      try {
        customerProfile = await getUserProfile(customerUid);
        if (customerProfile) {
          allowWhatsAppTelegramNotifications = customerProfile.allowWhatsAppTelegramNotifications || false;
          
          // Если номера телефона нет в заказе, пытаемся получить из профиля пользователя или Firebase Auth
          if (!customerPhone) {
            if (customerProfile.phone) {
              customerPhone = customerProfile.phone;
              console.log("📞 Номер телефона получен из профиля пользователя:", customerPhone);
            } else {
              // Если нет в профиле, пробуем получить из Firebase Auth текущего пользователя
              const { auth } = await import("./firebase");
              if (auth && auth.currentUser?.uid === customerUid && auth.currentUser.phoneNumber) {
                customerPhone = auth.currentUser.phoneNumber;
                console.log("📞 Номер телефона получен из Firebase Auth:", customerPhone);
              }
            }
          }
        }
      } catch (error) {
        console.warn("⚠️ Не удалось получить профиль клиента:", error);
      }
    }
    
    // Определяем получателя уведомления
    let targetUserUid: string | null = null;
    let senderName: string = "";
    
    if (message.sender === "client") {
      // Отправитель - клиент, получатель - музыкант
      targetUserUid = await getMusicianUidByName(artistName);
      // Получаем имя клиента
      const customerName = orderData.customerName || orderData.customerEmail || "Клиент";
      senderName = customerName;
    } else {
      // Отправитель - музыкант, получатель - клиент
      targetUserUid = customerUid;
      senderName = artistName;
    }
    
    // Импортируем функцию уведомлений
    const { notifyChatMessage, maybeSendTelegramAlert } = await import("./notifications");
    const direction: "client-to-musician" | "musician-to-client" =
      message.sender === "client" ? "client-to-musician" : "musician-to-client";
    
    // Для сообщений от клиентов всегда отправляем в Telegram, даже если targetUserUid не найден
    if (message.sender === "client") {
      console.log("💬 Отправка сообщения от клиента в Telegram");
      console.log("   Номер телефона клиента:", customerPhone || "не указан");
      console.log("   Email клиента:", customerEmail || "не указан");
      const telegramResult = await maybeSendTelegramAlert({
        orderId,
        senderName,
        messageText: message.text,
        musicianName: artistName,
        customerPhone,
        customerEmail,
        direction,
        allowWhatsAppTelegramNotifications,
      });
      
      if (telegramResult.attempted) {
        if (telegramResult.sent) {
          console.log("✅ Telegram уведомление доставлено");
        } else {
          console.warn(
            "⚠️ Telegram уведомление не отправлено:",
            telegramResult.error || telegramResult.skippedReason
          );
        }
      }
    }
    
    // Сохраняем уведомление в Firestore только если targetUserUid найден
    if (targetUserUid) {
      // Не отправляем уведомление самому себе
      if (targetUserUid === message.senderUid) {
        console.log("ℹ️ Пропускаем сохранение уведомления - отправитель и получатель совпадают");
        return;
      }
      
      // Отправляем уведомление для сохранения в истории
      // Пропускаем отправку в Telegram, так как уже отправили выше
      const notificationResult = await notifyChatMessage(
        targetUserUid,
        orderId,
        senderName,
        message.text,
        { direction, musicianName: artistName, customerPhone, customerEmail, skipTelegram: message.sender === "client" }
      );
      
      if (notificationResult.savedToHistory) {
        console.log(`✅ Запись уведомления сохранена для пользователя ${targetUserUid}`);
      } else {
        console.warn("⚠️ Не удалось сохранить запись уведомления в Firestore");
      }
    } else {
      console.warn("⚠️ Не удалось определить получателя уведомления для сохранения в Firestore");
    }
  } catch (error) {
    console.error("❌ Ошибка при отправке уведомления о сообщении:", error);
    // Не пробрасываем ошибку, чтобы не прерывать отправку сообщения
  }
}

/**
 * Подписаться на сообщения чата заказа в реальном времени
 */
export function subscribeToChatMessages(
  orderId: string,
  callback: (messages: any[]) => void
): () => void {
  if (!db) {
    console.error("❌ Firestore не инициализирован");
    callback([]);
    return () => {};
  }

  console.log("💬 Подписка на сообщения чата заказа:", orderId);
  const messagesRef = collection(db, "orders", orderId, "messages");
  
  let unsubscribe: (() => void) | null = null;

  // Пробуем сначала с orderBy
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const messages: any[] = [];
      console.log(`📨 Получено ${snapshot.size} сообщений для заказа ${orderId}`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const message = {
          id: doc.id,
          text: data.text,
          sender: data.sender,
          senderUid: data.senderUid,
          time: data.createdAt?.toDate?.().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }) || new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
        };
        messages.push(message);
        console.log("   Сообщение:", message.text.substring(0, 50) + "...", "от", message.sender);
      });
      
      console.log(`✅ Отправлено ${messages.length} сообщений в callback`);
      callback(messages);
    },
    (error) => {
      console.error("❌ Ошибка при подписке на сообщения:", error);
      console.error("Детали:", {
        code: error.code,
        message: error.message,
      });
      
      // Если ошибка из-за отсутствия индекса, используем запрос без orderBy
      if (error.code === "failed-precondition") {
        console.warn("⚠️ Индекс не найден, используем запрос без сортировки");
        const qWithoutOrderBy = query(messagesRef);
        
        unsubscribe = onSnapshot(
          qWithoutOrderBy,
          (snapshot) => {
            const messages: any[] = [];
            console.log(`📨 Получено ${snapshot.size} сообщений (без сортировки) для заказа ${orderId}`);
            
            snapshot.forEach((doc) => {
              const data = doc.data();
              messages.push({
                id: doc.id,
                text: data.text,
                sender: data.sender,
                senderUid: data.senderUid,
                time: data.createdAt?.toDate?.().toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) || new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
                createdAt: data.createdAt?.toMillis?.() || Date.now(),
              });
            });
            
            // Сортируем на клиенте
            messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            console.log(`✅ Отправлено ${messages.length} сообщений в callback (fallback)`);
            callback(messages);
          },
          (fallbackError) => {
            console.error("❌ Ошибка при подписке (fallback):", fallbackError);
            callback([]);
          }
        );
      } else if (error.code === "permission-denied") {
        console.error("🚫 Ошибка доступа: проверьте правила Firestore для подколлекции messages");
        callback([]);
      } else {
        callback([]);
      }
    }
  );

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}

