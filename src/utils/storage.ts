import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  USER_ID: 'user_id',
  USER_NAME: 'user_name',
  USER_TYPE: 'user_type',
  TOKEN: 'token',
  CART_VAL: 'cartval',
  DELIVERY_CHARGE: 'delcharge',
  MIN_QTY: 'min_qty',
};

export const StorageService = {
  // Save data
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  // Get data
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  // Remove data
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  // Clear all data
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // User specific methods
  async saveUser(user: {
    user_id?: string;
    id?: number;
    username?: string;
    name?: string;
    user_type?: string;
    token?: string;
    minimum_qty?: number;
    pincode?: string;
    area?: string;
  }): Promise<void> {
    // Support both new (user_id) and old (id) formats
    const userId = user.user_id || user.id?.toString() || '';
    const userName = user.username || user.name || '';
    const userType = user.user_type || '1';
    const token = user.token || '';

    await this.setItem(STORAGE_KEYS.USER_ID, userId);
    await this.setItem(STORAGE_KEYS.USER_NAME, userName);
    await this.setItem(STORAGE_KEYS.USER_TYPE, userType);
    await this.setItem(STORAGE_KEYS.TOKEN, token);

    // Store additional user info if available
    if (user.minimum_qty) {
      await this.setItem(STORAGE_KEYS.MIN_QTY, user.minimum_qty.toString());
    }
  },

  async getUser(): Promise<{
    id: string | null;
    name: string | null;
    user_type: string | null;
    token: string | null;
  }> {
    return {
      id: await this.getItem(STORAGE_KEYS.USER_ID),
      name: await this.getItem(STORAGE_KEYS.USER_NAME),
      user_type: await this.getItem(STORAGE_KEYS.USER_TYPE),
      token: await this.getItem(STORAGE_KEYS.TOKEN),
    };
  },

  async clearUser(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.USER_ID);
    await this.removeItem(STORAGE_KEYS.USER_NAME);
    await this.removeItem(STORAGE_KEYS.USER_TYPE);
    await this.removeItem(STORAGE_KEYS.TOKEN);
  },

  async isLoggedIn(): Promise<boolean> {
    const userId = await this.getItem(STORAGE_KEYS.USER_ID);
    return userId !== null;
  },
};
