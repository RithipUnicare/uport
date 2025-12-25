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
  order_id: string;
  order_no: string;
  total_amount: string;
  payment_type: string;
  order_status: string;
  payment_status: string;
  created_on: string;
  modified_on: string;
  delivery_charge: string;
  order_details: OrderItem[];
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  regular_price: string;
  product_amount: string;
  discount_amount: string;
  quantity: string;
  sale_tot_amount: string;
  discount_tot_amount: string;
}

// Order API Response
export interface OrderResponse {
  status: number;
  order: Order[];
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

// GetCategoryBB returns an object with categories array
export interface CategoryResponse {
  status: number;
  categories: Category[];
  image_url?: string;
}

// GetSubCategoryBB returns an object with subcategories
export interface SubCategoryResponse {
  status: number;
  subcategories: SubCategory[];
  image_url: string;
}

export interface ProductResponse {
  status: number;
  products: Product[];
  image_url: string;
}

// Order-related request/response types
export interface PlaceOrderRequest {
  order: {
    user_id: number;
    medicine: Array<{
      product_id: number;
      quantity: number;
    }>;
  };
}

export interface OrderDetailsRequest {
  order: {
    order_id: number;
    user_id: number;
    user_type: number;
  };
}

export interface MinimumOrderResponse {
  status: number;
  minimum_order: number;
  message?: string;
}
