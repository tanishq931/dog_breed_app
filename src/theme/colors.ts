export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceSubtle: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  error: string;
  errorSurface: string;
  errorBorder: string;
  cardShadow: string;
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  surfaceSubtle: '#F8FAFC',
  border: '#E2E8F0',
  borderSubtle: '#EDF2F7',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  accent: '#D97706',
  accentLight: '#FEF3C7',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  errorSurface: '#FEF2F2',
  errorBorder: '#FECACA',
  cardShadow: 'rgba(15, 23, 42, 0.05)',
};

export const darkColors: ThemeColors = {
  background: '#0B0F19',
  surface: '#151D2C',
  surfaceHover: '#1E293B',
  surfaceSubtle: '#0F172A',
  border: '#273449',
  borderSubtle: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  primary: '#3B82F6',
  primaryLight: '#1E293B',
  primaryDark: '#60A5FA',
  accent: '#F59E0B',
  accentLight: '#2A2315',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  errorSurface: '#2B1717',
  errorBorder: '#4C1D1D',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
};
