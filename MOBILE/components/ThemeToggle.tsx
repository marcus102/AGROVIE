import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useThemeStore } from '@/stores/theme';

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 24 }: ThemeToggleProps) {
  const { theme, toggleTheme, colors } = useThemeStore();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card }
      ]}
      onPress={toggleTheme}
    >
      {theme === 'light' ? (
        <Moon size={size} color={colors.text} />
      ) : (
        <Sun size={size} color={colors.text} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});