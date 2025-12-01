export interface Musician {
  name: string;
  style: string;
  price: string;
  priceValue: number;
  rating: number;
  status: "available" | "busy" | "online" | "unavailable";
  types: string[];
  nearby: boolean;
  description: string;
  videoUrl: string;
  gallery: string[];
  city: string;
  experience: string;
  tags?: string[];
  image?: string;
}

export type FavoriteMusician = Pick<Musician, "name" | "style" | "price" | "rating" | "status" | "image">;



