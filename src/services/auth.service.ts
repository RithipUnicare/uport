import ApiService from './api';
import { StorageService } from '../utils/storage';
import { User, APIResponse } from '../types';

export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  mobile: string;
  password: string;
  company_name: string;
  area_id: string;
  address: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

class AuthService {
  // Login
  async login(data: LoginRequest): Promise<APIResponse<User>> {
    const response = await ApiService.post<APIResponse<User>>(
      '/api/v1/Login',
      data,
    );

    if (response.status === 1 && response.result) {
      // Save user data to storage
      await StorageService.saveUser({
        id: response.result.id,
        name: response.result.name,
        user_type: response.result.user_type,
        token: response.result.token || '',
      });
    }

    return response;
  }

  // Register - Step 1: Send OTP
  async register(data: RegisterRequest): Promise<APIResponse> {
    return await ApiService.post<APIResponse>('/api/v1/Register', data);
  }

  // Register - Step 2: Verify OTP
  async verifyOtp(mobile: string, otp: string): Promise<APIResponse<User>> {
    const response = await ApiService.post<APIResponse<User>>(
      '/api/v1/VerifyOTP',
      {
        mobile,
        otp,
      },
    );

    if (response.status === 1 && response.result) {
      await StorageService.saveUser({
        id: response.result.id,
        name: response.result.name,
        user_type: response.result.user_type,
        token: response.result.token || '',
      });
    }

    return response;
  }

  // Change Password
  async changePassword(data: ChangePasswordRequest): Promise<APIResponse> {
    return await ApiService.post<APIResponse>('/api/v1/ChangePassword', data);
  }

  // Logout
  async logout(): Promise<void> {
    await StorageService.clearUser();
  }

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    return await StorageService.isLoggedIn();
  }

  // Get current user
  async getCurrentUser(): Promise<{
    id: string | null;
    name: string | null;
    user_type: string | null;
    token: string | null;
  }> {
    return await StorageService.getUser();
  }

  // Get areas for registration dropdown
  async getAreas(): Promise<APIResponse> {
    return await ApiService.get<APIResponse>('/api/v1/GetAreas');
  }
}

export default new AuthService();
