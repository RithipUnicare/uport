import ApiService from './api';
import { StorageService } from '../utils/storage';
import { User, APIResponse } from '../types';

export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message?: string;
  user_id?: string;
  username?: string;
  token?: string;
  user_type?: string;
  minimum_qty?: number;
  pincode?: string;
  area?: string;
}

export interface RegisterRequest {
  name: string;
  mobile: string;
  password: string;
  email: string;
  company_name: string;
  landmark: string;
  address: string;
  area_id: string;
}

export interface UpdateProfileRequest {
  user_id: string;
  name: string;
  landmark: string;
  address: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

class AuthService {
  // Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await ApiService.post<LoginResponse>('/api/v1/login', {
      customer: {
        mobile: data.mobile,
        password: data.password,
      },
    });

    if (response.status === 1) {
      // Save user data to storage - the response contains user data directly
      await StorageService.saveUser({
        user_id: response.user_id,
        username: response.username,
        user_type: response.user_type,
        token: response.token,
        minimum_qty: response.minimum_qty,
        pincode: response.pincode,
        area: response.area,
      });
    }

    return response;
  }

  // Register - Step 1: Send OTP
  async register(data: RegisterRequest): Promise<APIResponse> {
    return await ApiService.post<APIResponse>('/api/v1/send_otp', {
      customer: {
        name: data.name,
        mobile: data.mobile,
        password: data.password,
        email: data.email,
        company_name: data.company_name,
        landmark: data.landmark,
        address: data.address,
        area_id: data.area_id,
      },
    });
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
      //@ts-ignore
      await StorageService.saveUser(response.result);
    }

    return response;
  }

  // Change Password
  async changePassword(data: ChangePasswordRequest): Promise<APIResponse> {
    return await ApiService.post<APIResponse>('/api/v1/reset_password', data);
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

  // Get user profile
  async getMyProfile(userId: string): Promise<APIResponse> {
    return await ApiService.get<APIResponse>(`/api/v1/MyProfile/${userId}`);
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<APIResponse> {
    return await ApiService.post<APIResponse>('/api/v1/UpdateProfile', data);
  }

  // Get available areas for registration dropdown
  async getAreas(): Promise<APIResponse> {
    return await ApiService.get<APIResponse>('/api/v1/GetArea');
  }
}

export default new AuthService();
