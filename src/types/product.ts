export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

export type SortOption = "price-asc" | "price-desc" | "rating-asc" | "rating-desc";
