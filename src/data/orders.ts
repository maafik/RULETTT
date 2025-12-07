export type OrderStatus = "created" | "pending" | "payment-pending" | "confirmed" | "in-progress" | "completed" | "cancelled";

export interface Order {
  id: string;
  status: OrderStatus;
  artistName: string;
  style: string;
  rating: number;
  price: string;
  date: string;
  time: string;
  location: string;
  format: string;
  comment: string;
  image?: string;
  videoUrl?: string;
  gallery?: string[];
  description?: string;
  city?: string;
  experience?: string;
  tags?: string[];
  createdAt?: number; // timestamp времени создания заказа
  customerUid?: string; // UID заказчика
  customerEmail?: string; // Email заказчика
  customerName?: string; // Имя заказчика
  customerPhone?: string; // Телефон заказчика
  prepayment?: string; // Предоплата
}

export const orders: Order[] = [
  {
    id: "3452",
    status: "confirmed",
    artistName: "Игорь Логинов",
    style: "Поп / Каверы / Вокал",
    rating: 4.8,
    price: "10 000 ₽",
    date: "28 мая 2025",
    time: "19:00–21:00",
    location: "Москва, ул. Тверская, 27",
    format: "соло-вокал, живая гитара",
    comment: "Нужны каверы на поп-музыку, спокойная атмосфера",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    gallery: [
      "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=600",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600",
      "https://images.unsplash.com/photo-1484795819573-86ae049cb815?q=80&w=600",
    ],
    description: "Певец и гитарист, создающий уютную атмосферу камерных мероприятий.",
    city: "Москва",
    experience: "8 лет",
    tags: ["Поп", "Каверы", "Соло"],
  },
  {
    id: "3453",
    status: "pending",
    artistName: "Анна Смирнова",
    style: "Джаз / Soul",
    rating: 4.9,
    price: "15 000 ₽",
    date: "2 июня 2025",
    time: "20:00–22:00",
    location: "Санкт-Петербург, Невский пр., 12",
    format: "джазовый сет с живой группой",
    comment: "Нужны спокойные композиции и один драйвовый сет",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    gallery: [
      "https://images.unsplash.com/photo-1507878866276-a947ef722fee?q=80&w=600",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600",
      "https://images.unsplash.com/photo-1484795819573-86ae049cb815?q=80&w=600",
    ],
    description: "Джазовая певица с сильным голосом и авторскими интерпретациями.",
    city: "Санкт-Петербург",
    experience: "10 лет",
    tags: ["Джаз", "Soul"],
  },
  {
    id: "3454",
    status: "completed",
    artistName: "Группа \"Ритм\"",
    style: "Рок / Cover band",
    rating: 4.6,
    price: "25 000 ₽",
    date: "15 мая 2025",
    time: "21:00–23:00",
    location: "Москва, клуб \"Сцена\"",
    format: "полноценный кавер-сет на 2 часа",
    comment: "Заказчик просил добавить несколько русских рок-хитов",
    image: "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=600",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    gallery: [
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600",
      "https://images.unsplash.com/photo-1454922915609-78549ad709bb?q=80&w=600",
      "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=600",
    ],
    description: "Пятичленная кавер-группа, устраивающая драйв на корпоративных сценах.",
    city: "Москва",
    experience: "6 лет",
    tags: ["Рок", "Cover band", "Живой звук"],
  },
];



