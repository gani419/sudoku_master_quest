export interface ThemeColors {
  background: string;
  cardBg: string;
  surfaceBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGlow: string;
  secondaryAccent: string;
  gridBorderOuter: string;
  gridBorderInner: string;
  cellInitial: string;
  cellInput: string;
  cellError: string;
  cellErrorBg: string;
  cellSelectedBg: string;
  cellHighlightBg: string;
  cellSameNumberBg: string;
  numpadBg: string;
  numpadText: string;
  numpadSubtext: string;
  numpadBorder: string;
  btnActiveBg: string;
  btnInactiveBg: string;
  gold: string;
  success: string;
  danger: string;
  warning: string;
  divider: string;
}

export const darkTheme: ThemeColors = {
  background: '#0B0F19',
  cardBg: '#131B2E',
  surfaceBg: '#1A233A',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#06B6D4', // Vibrant Cyan
  accentGlow: 'rgba(6, 182, 212, 0.25)',
  secondaryAccent: '#8B5CF6', // Purple/Violet
  gridBorderOuter: '#06B6D4',
  gridBorderInner: '#24324D',
  cellInitial: '#38BDF8', // Light blue for given clues
  cellInput: '#F1F5F9', // Pure white for player input
  cellError: '#EF4444',
  cellErrorBg: 'rgba(239, 68, 68, 0.25)',
  cellSelectedBg: '#0E3A53',
  cellHighlightBg: '#16233B',
  cellSameNumberBg: '#1E3A5F',
  numpadBg: '#162035',
  numpadText: '#F8FAFC',
  numpadSubtext: '#64748B',
  numpadBorder: '#253554',
  btnActiveBg: '#06B6D4',
  btnInactiveBg: '#162035',
  gold: '#FBBF24',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  divider: '#1E293B',
};

export const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  surfaceBg: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  accent: '#0284C7', // Deep Sky Blue
  accentGlow: 'rgba(2, 132, 199, 0.15)',
  secondaryAccent: '#7C3AED',
  gridBorderOuter: '#0284C7',
  gridBorderInner: '#CBD5E1',
  cellInitial: '#0369A1', // Deep blue for given clues
  cellInput: '#0F172A', // Dark slate for player input
  cellError: '#DC2626',
  cellErrorBg: 'rgba(220, 38, 38, 0.15)',
  cellSelectedBg: '#BAE6FD',
  cellHighlightBg: '#E0F2FE',
  cellSameNumberBg: '#B9E6FE',
  numpadBg: '#FFFFFF',
  numpadText: '#0F172A',
  numpadSubtext: '#94A3B8',
  numpadBorder: '#E2E8F0',
  btnActiveBg: '#0284C7',
  btnInactiveBg: '#F1F5F9',
  gold: '#D97706',
  success: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  divider: '#E2E8F0',
};
