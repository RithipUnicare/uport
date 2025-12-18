// OneSignal notification service
// OneSignal v5 API - significantly different from v3 and earlier versions

import { OneSignal } from 'react-native-onesignal';

const ONESIGNAL_APP_ID = 'cf672b5c-42d5-4040-a469-00d753116017';

class NotificationService {
  // Initialize OneSignal (v5 API)
  initialize(): void {
    try {
      // OneSignal v5 uses initialize() instead of setAppId()
      OneSignal.initialize(ONESIGNAL_APP_ID);

      console.log('OneSignal initialized');

      // Optional: Request permission (iOS and Android 13+)
      // OneSignal.Notifications.requestPermission(true);
    } catch (error) {
      console.error('OneSignal initialization error:', error);
    }
  }

  // Set external user ID (for targeting specific users)
  async setUserId(userId: string): Promise<void> {
    try {
      // OneSignal v5 uses login() to set external user ID
      await OneSignal.login(userId);
      console.log('OneSignal user ID set:', userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  // Remove user (on logout)
  async removeUser(): Promise<void> {
    try {
      // OneSignal v5 uses logout() to remove the user
      await OneSignal.logout();
      console.log('User removed from OneSignal');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }
}

export default new NotificationService();
