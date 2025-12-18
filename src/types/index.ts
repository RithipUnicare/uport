// User types
export interface User {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  user_type: number; // 1 = regular, 2 = B2B
  company_name?: string;
  area?: string;
  address?: string;
  token?: string;
}

// Product types
export interface Product {
  id: number;
  eng_name: string;
  tml_name?: string;
  pro_image: string;
  list_product: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product_size: string;
  sales_price: number;
  regular_price: number;
  offer_price: number;
  state_gst: string;
  central_gst: string;
  quantity: number;
  available_stock: number;
}

// Category types
export interface Category {
  id: number;
  name: string;
  sub_name?: string;
  image: string;
}

export interface SubCategory {
  id: number;
  name: string;
  short_desc?: string;
  image: string;
}

// Cart types
export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  sales_price: number;
  regular_price: number;
  offer_price: number;
  quantity: number;
  product_size: string;
}

// Order types
export interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  delivery_charge: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

// API Response types
export interface APIResponse<T = any> {
  status: number;
  message?: string;
  result?: T;
  image_url?: string;
}

export interface BannerResponse {
  status: number;
  sliders: Array<{ slider: string }>;
  image_url: string;
}

export interface CategoryResponse {
  status: number;
  categories: Category[];
  image_url: string;
}

export interface ProductResponse {
  status: number;
  products: Product[];
  image_url: string;
}
