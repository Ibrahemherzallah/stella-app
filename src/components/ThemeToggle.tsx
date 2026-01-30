// src/components/ThemeToggle.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react-native';

export const ThemeToggle: React.FC = () => {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.surface }]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      {mode === 'dark' ? (
        <Sun size={20} color={theme.goldPrimary} />
      ) : (
        <Moon size={20} color={theme.goldPrimary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
