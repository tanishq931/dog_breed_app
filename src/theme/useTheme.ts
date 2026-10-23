import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './colors';

export interface AppTheme {
  isDark: boolean;
  colors: ThemeColors;
}

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
}
