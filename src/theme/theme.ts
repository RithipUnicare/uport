import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#8D6E63', // Warm Natural Brown
    primaryContainer: '#D7CCC8', // Light Tan/Beige
    secondary: '#B8860B', // Golden accent
    secondaryContainer: '#F5DEB3', // Wheat
    background: '#FAF9F6', // Off-white/Creamy background
    surface: '#FFFFFF',
    error: '#D32F2F',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#3E2723', // Deep coffee brown for text
    onSurface: '#3E2723',
    onSurfaceVariant: '#795548',
    outline: '#A1887F',
  },
};

export type AppTheme = typeof theme;
