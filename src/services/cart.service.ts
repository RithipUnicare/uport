import ApiService from './api';
import { APIResponse, CartItem } from '../types';
import { StorageService, STORAGE_KEYS } from '../utils/storage';

interface AddToCartRequest {
  user_id: number;
  product_id: number;
  quantity: number;
}

interface UpdateCartRequest {
  id: number;
  quantity: number;
}

class CartService {
  // Get cart details
  async getCartDetails(userId: number): Promise<APIResponse<CartItem[]>> {
    const response = await ApiService.get<APIResponse<CartItem[]>>(
      `/api/v1/GetCartDetails/${userId}`,
    );

    // Update cart count in storage
    if (response.status === 1 && response.result) {
      await StorageService.setItem(
        STORAGE_KEYS.CART_VAL,
        response.result.length.toString(),
      );
    } else {
      await StorageService.setItem(STORAGE_KEYS.CART_VAL, '0');
    }

    return response;
  }

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<APIResponse> {
    return await ApiService.post<APIResponse>('/api/v1/AddToCart', data);
  }

  // Update cart item quantity
  async updateCart(data: UpdateCartRequest): Promise<APIResponse> {
    return await ApiService.post<APIResponse>('/api/v1/UpdateCart', data);
  }

  // Remove item from cart
  async removeFromCart(cartItemId: number): Promise<APIResponse> {
    return await ApiService.post<APIResponse>('/api/v1/RemoveFromCart', {
      id: cartItemId,
    });
  }

  // Get delivery charge
  async getDeliveryCharge(userId: number): Promise<APIResponse> {
    const response = await ApiService.get<APIResponse>(
      `/api/v1/GetDeliveryCharge/${userId}`,
    );

    // Save delivery charge to storage
    if (response.status === 1 && response.result?.area?.delivery_charge) {
      await StorageService.setItem(
        STORAGE_KEYS.DELIVERY_CHARGE,
        response.result.area.delivery_charge.toString(),
      );
    }

    return response;
  }

  // Get cart count from storage
  async getCartCount(): Promise<number> {
    const count = await StorageService.getItem(STORAGE_KEYS.CART_VAL);
    return count ? parseInt(count, 10) : 0;
  }
}

export default new CartService();
