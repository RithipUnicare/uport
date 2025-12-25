import ApiService from './api';
import {
  APIResponse,
  Order,
  OrderResponse,
  PlaceOrderRequest,
  OrderDetailsRequest,
  MinimumOrderResponse,
} from '../types';

class OrderService {
  // Get minimum order amount
  async getMinimumOrder(): Promise<MinimumOrderResponse> {
    return await ApiService.get<MinimumOrderResponse>(
      '/api/v1/GetMinimumOrder',
    );
  }

  // Place order
  async placeOrder(
    userId: number,
    products: Array<{ product_id: number; quantity: number }>,
  ): Promise<APIResponse> {
    const requestData: PlaceOrderRequest = {
      order: {
        user_id: userId,
        medicine: products,
      },
    };

    return await ApiService.post<APIResponse>(
      '/api/v1/place_order',
      requestData,
    );
  }

  // Get my orders
  async getMyOrders(userId: number): Promise<OrderResponse> {
    return await ApiService.get<OrderResponse>(`/api/v1/GetMyOrder/${userId}`);
  }

  // Get order details
  async getOrderDetails(
    orderId: number,
    userId: number,
    userType: number = 2,
  ): Promise<APIResponse<Order>> {
    const requestData: OrderDetailsRequest = {
      order: {
        order_id: orderId,
        user_id: userId,
        user_type: userType,
      },
    };

    return await ApiService.post<APIResponse<Order>>(
      '/api/v1/GetOrderDetails',
      requestData,
    );
  }
}

export default new OrderService();
