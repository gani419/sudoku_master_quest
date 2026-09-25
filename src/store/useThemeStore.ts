import { create } from 'zustand';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';
import { storage, StorageKeys } from '../services/storage';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const getInitialMode = (): ThemeMode => {
  const saved = storage.getString(StorageKeys.THEME_MODE);
  return saved === 'light' ? 'light' : 'dark';
};

export const useThemeStore = create<ThemeState>((set) => {
  const initialMode = getInitialMode();
  return {
    mode: initialMode,
    colors: initialMode === 'light' ? lightTheme : darkTheme,
    toggleTheme: () =>
      set((state) => {
        const nextMode = state.mode === 'dark' ? 'light' : 'dark';
        storage.set(StorageKeys.THEME_MODE, nextMode);
        return {
          mode: nextMode,
          colors: nextMode === 'light' ? lightTheme : darkTheme,
        };
      }),
    setTheme: (mode: ThemeMode) => {
      storage.set(StorageKeys.THEME_MODE, mode);
      set({
        mode,
        colors: mode === 'light' ? lightTheme : darkTheme,
      });
    },
  };
});
