import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeType, lightTheme, darkTheme } from '@/types/theme';

interface ThemeState {
  theme: ThemeType;
  colors: Theme['colors'];
  isLoading: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      colors: lightTheme.colors,
      isLoading: true,

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

      initializeTheme: async () => {
        try {
          const storedTheme = await AsyncStorage.getItem('theme-storage');
          if (storedTheme) {
            const parsedTheme = JSON.parse(storedTheme);
            const theme = parsedTheme.state?.theme || 'light';
            set({
              theme,
              colors: theme === 'light' ? lightTheme.colors : darkTheme.colors,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error loading theme from AsyncStorage:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
