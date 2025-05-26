import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeType, lightTheme, darkTheme } from '@/types/theme';

interface ThemeState {
  theme: ThemeType;
  colors: Theme['colors'];
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      colors: lightTheme.colors,
      setTheme: (theme) =>
        set({
          theme,
          colors: theme === 'light' ? lightTheme.colors : darkTheme.colors,
        }),
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          return {
            theme: newTheme,
            colors: newTheme === 'light' ? lightTheme.colors : darkTheme.colors,
          };
        }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);