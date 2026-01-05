import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32', // Dark green for grocery theme
    primaryContainer: '#A5D6A7', // Light green
    secondary: '#FF9800', // Orange accent
    secondaryContainer: '#FFE0B2', // Light orange
    background: '#F1F8E9', // Light green background
    surface: '#FFFFFF', // White surface
    error: '#D32F2F', // Red for errors
    onPrimary: '#FFFFFF', // White text on primary
    onSecondary: '#000000', // Black text on secondary
    onBackground: '#1B1B1B', // Dark text on background
    onSurface: '#1B1B1B', // Dark text on surface
    onSurfaceVariant: '#666666', // Gray text for secondary content
    outline: '#4CAF50', // Green outline
  },
};

export type AppTheme = typeof theme;
