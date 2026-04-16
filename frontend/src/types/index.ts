export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  digital_id: string;
  is_verified: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  image: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  category: string;
  category_name: string;
  base_price: string;
  weight: string;
  unit: string;
  image: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  product: string;
  product_detail: Product;
  quantity: number;
  unit_price: string;
  seller_type: string;
  seller_id: string | null;
  line_total: string;
  added_at: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  subtotal: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface OrderTracking {
  id: string;
  status: string;
  location: string;
  notes: string;
  timestamp: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: string;
  tax: string;
  delivery_fee: string;
  total: string;
  delivery_address: string;
  payment_method: string;
  payment_status: string;
  notes: string;
  items: OrderItem[];
  tracking_updates: OrderTracking[];
  created_at: string;
}

export interface FinanceReport {
  revenue: number;
  expenses: number;
  profit: number;
  total_transactions: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  reference: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
