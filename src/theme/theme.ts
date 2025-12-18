import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#b90617',
    primaryContainer: '#ffb3ba',
    secondary: '#4caf50',
    secondaryContainer: '#c8e6c9',
    background: '#ffffff',
    surface: '#ffffff',
    error: '#b00020',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
  },
};

export type AppTheme = typeof theme;
