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
  console.error("⚠️ Firestore не инициализирован! Проверьте конфигурацию Firebase.");
}

// Типы для Firebase данных
export interface UserProfile {
  musicianName?: string;
  role: "musician" | "customer";
  linkedAt?: number;
}

export interface MusicianProfile {
  uid: string;
  linkedAt?: number;
}

/**
 * Получить профиль пользователя по UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const profileRef = doc(db, "userProfiles", uid);
    const snapshot = await getDoc(profileRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const profile = {
        musicianName: data.musicianName,
        role: data.role || "customer",
        linkedAt: data.linkedAt?.toMillis?.() || data.linkedAt,
      } as UserProfile;
      
      if (profile.role === "musician" || profile.musicianName) {
        console.log(`👤 Профиль музыканта для UID ${uid}:`, profile);
      }
      
      return profile;
    }
    
    // Профиль не найден - это нормально для обычных клиентов
    // Предупреждение только если это известный музыкант
    if (uid === "JFiWds7FPDZEh5n0h5H235re0vu1") {
      console.warn(`⚠️ Профиль не найден для Дмитрия Волкова (UID: ${uid})`);
      console.warn(`💡 Запустите: npm run link-profile`);
    }
    
    return null;
  } catch (error) {
    console.error("❌ Ошибка при получении профиля пользователя:", error);
    return null;
  }
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

    // Отправляем уведомления при изменении статуса
    if (oldStatus !== status) {
      await sendStatusChangeNotification(orderId, orderData, oldStatus, status);
    }

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

    // Получаем UID музыканта по имени
    const musicianUid = await getMusicianUidByName(artistName);

    switch (newStatus) {
      case "payment-pending":
        // Музыкант подтвердил заказ -> уведомление клиенту
        if (customerUid) {
          await notifyOrderConfirmed(customerUid, orderId, artistName);
        }
        break;

      case "in-progress":
        // Клиент оплатил -> уведомление музыканту
        if (musicianUid) {
          await notifyOrderPaid(musicianUid, orderId, customerName, artistName);
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
    
    if (!customerUid || !artistName) {
      console.warn("⚠️ Недостаточно данных заказа для отправки уведомления:", { customerUid, artistName });
      return;
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
    
    if (!targetUserUid) {
      console.warn("⚠️ Не удалось определить получателя уведомления");
      return;
    }
    
    // Не отправляем уведомление самому себе
    if (targetUserUid === message.senderUid) {
      console.log("ℹ️ Пропускаем уведомление - отправитель и получатель совпадают");
      return;
    }
    
    // Импортируем функцию уведомлений
    const { notifyChatMessage } = await import("./notifications");
    
    // Отправляем уведомление
    const notificationSent = await notifyChatMessage(
      targetUserUid,
      orderId,
      senderName,
      message.text
    );
    
    if (notificationSent) {
      console.log(`✅ Уведомление о сообщении отправлено пользователю ${targetUserUid}`);
    } else {
      console.warn(`⚠️ Не удалось отправить уведомление пользователю ${targetUserUid} (Player ID не найден или ошибка API)`);
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

