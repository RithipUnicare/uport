import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import NotificationService from './src/services/notification.service';

function App() {
  useEffect(() => {
    // Initialize OneSignal notifications
    NotificationService.initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
        />
        <AppNavigator />
        <Toast />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
export default App;
