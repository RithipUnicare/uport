import ApiService from './api';
import {
  CategoryResponse,
  SubCategoryResponse,
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
  async getSubCategories(categoryId: number): Promise<SubCategoryResponse> {
    return await ApiService.get<SubCategoryResponse>(
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
  async searchProducts(query: string, userId?: number): Promise<ProductResponse> {
    return await ApiService.post<ProductResponse>('/api/v1/SearchProductBB', {
      query,
      user_id: userId || 1,
    });
  }

  // Get featured products (products from first subcategory of first category)
  async getFeaturedProducts(userId?: number): Promise<ProductResponse> {
    try {
      console.log('Fetching featured products sequence...');
      // First get categories
      const categoriesRes = await this.getCategories();
      console.log('Categories status:', categoriesRes.status, 'Count:', categoriesRes.categories?.length);

      if (categoriesRes.categories && categoriesRes.categories.length > 0) {
        // Get subcategories of first category
        const firstCatId = categoriesRes.categories[0].id;
        console.log('Fetching subcategories for Cat ID:', firstCatId);
        const subcategoriesRes = await this.getSubCategories(firstCatId);
        console.log('Subcategories status:', subcategoriesRes.status, 'Count:', subcategoriesRes.subcategories?.length);

        if (subcategoriesRes.subcategories && subcategoriesRes.subcategories.length > 0) {
          // Get products from first subcategory
          const firstSubCatId = subcategoriesRes.subcategories[0].id;
          console.log('Fetching products for SubCat ID:', firstSubCatId);
          const productsRes = await this.getProducts(firstSubCatId, userId);
          console.log('Products status:', productsRes.status, 'Count:', productsRes.products?.length);
          return { ...productsRes, subcategoryId: firstSubCatId };
        }
      }

      console.log('Sequence incomplete, falling back to search "rice"');
      // Fallback: try to search for common products
      return await this.searchProducts('rice');
    } catch (error: any) {
      console.error('Error getting featured products:', error?.message);
      // Return empty response instead of throwing
      return { status: 0, products: [], image_url: '' };
    }
  }
}

export default new ProductService();
