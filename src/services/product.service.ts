import ApiService from './api';
import {
  CategoryResponse,
  ProductResponse,
  APIResponse,
  BannerResponse,
} from '../types';

class ProductService {
  // Get banner images
  async getBanners(userType: number = 1): Promise<BannerResponse> {
    return await ApiService.get<BannerResponse>(
      `/api/v1/GetBanner/${userType}`,
    );
  }

  // Get categories (B2B)
  async getCategories(): Promise<CategoryResponse> {
    return await ApiService.get<CategoryResponse>('/api/v1/GetCategoryBB');
  }

  // Get subcategories
  async getSubCategories(categoryId: number): Promise<APIResponse> {
    return await ApiService.get<APIResponse>(
      `/api/v1/GetSubCategoryBB/${categoryId}`,
    );
  }

  // Get products by subcategory
  async getProducts(
    subcategoryId: number,
    userId?: number,
  ): Promise<ProductResponse> {
    const requestData = {
      subcategory_id: subcategoryId,
      user_id: userId || 1,
    };

    return await ApiService.post<ProductResponse>(
      '/api/v1/GetProductBB',
      requestData,
    );
  }

  // Check app version
  async checkVersion(version: string): Promise<APIResponse> {
    return await ApiService.get<APIResponse>(`/api/v1/CheckVersion/${version}`);
  }

  // Search products
  async searchProducts(query: string): Promise<ProductResponse> {
    return await ApiService.post<ProductResponse>('/api/v1/SearchProducts', {
      query,
    });
  }
}

export default new ProductService();
