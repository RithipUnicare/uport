import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { StorageService, STORAGE_KEYS } from '../utils/storage';

// Splash screen
import SplashScreen from '../screens/SplashScreen';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';

// Home screens
import HomeScreen from '../screens/home/HomeScreen';
import SubCategoryScreen from '../screens/home/SubCategoryScreen';
import ProductScreen from '../screens/home/ProductScreen';
import CategoriesScreen from '../screens/home/CategoriesScreen';

// Cart screens
import CartScreen from '../screens/cart/CartScreen';

// Orders screens
import MyOrdersScreen from '../screens/orders/MyOrdersScreen';

// Settings screens
import SettingsScreen from '../screens/settings/SettingsScreen';

// Info screens
import ContactUsScreen from '../screens/info/ContactUsScreen';
import TermsAndConditionsScreen from '../screens/info/TermsAndConditionsScreen';
import PrivacyPolicyScreen from '../screens/info/PrivacyPolicyScreen';

// Define navigation types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  VerifyOtp: {
    otp: number;
    registerData: {
      name: string;
      mobile: string;
      password: string;
      email: string;
      area_id: string;
    };
  };
  Home: undefined;
  Categories: undefined;
  SubCategory: { categoryId: number; categoryName: string };
  Product: {
    subcategoryId?: number;
    subcategoryName?: string;
    searchQuery?: string;
    product?: any;
  };
  Cart: undefined;
  MyOrders: undefined;
  ChangePassword: undefined;
  Profile: undefined;
  Settings: undefined;
  UploadGroceryList: undefined;
  ContactUs: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#b90617',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyOtp"
          component={VerifyOtpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ headerShown: false }}
        />

        {/* Home Screens */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SubCategory"
          component={SubCategoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Product"
          component={ProductScreen}
          options={{ headerShown: false }}
        />

        {/* Cart */}
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: false }}
        />

        {/* Orders */}
        <Stack.Screen
          name="MyOrders"
          component={MyOrdersScreen}
          options={{ headerShown: false }}
        />

        {/* Settings */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />

        {/* Info Screens */}
        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsAndConditions"
          component={TermsAndConditionsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
