// src/context/ThemeContext.tsx
import React, {createContext, useContext, useState, useEffect,} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Theme {
  background: string;
  surface: string;
  surfaceVariant: string;
  goldPrimary: string;
  goldSecondary: string;
  darkText: string;
  lightText: string;
  lightGray: string;
  mediumGray: string;
  white: string;
  transparent: string;
  error: string;
  success: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_KEY = 'stella_theme_mode';

/**
 * Define light & dark themes HERE instead of importing from other files.
 * They match the Theme interface above and use values from src/theme/colors.ts
 */
const lightTheme: Theme = {
  background: colors.background,
  surface: '#FFFFFF',
  surfaceVariant: '#F8F6F3',
  goldPrimary: colors.goldPrimary,
  goldSecondary: colors.goldSecondary,
  darkText: colors.darkText,
  lightText: '#666666',
  lightGray: colors.lightGray,
  mediumGray: colors.mediumGray,
  white: colors.white,
  transparent: colors.transparent,
  error: colors.error,
  success: colors.success,
};

const darkTheme: Theme = {
  background: '#101012',
  surface: '#171719',
  surfaceVariant: '#1F1F23',
  goldPrimary: '#D4B28A',
  goldSecondary: '#C79A6A',
  darkText: '#FFFFFF',
  lightText: '#BBBBBB',
  lightGray: '#2A2A30',
  mediumGray: '#3C3C42',
  white: '#FFFFFF',
  transparent: 'transparent',
  error: colors.error,
  success: colors.success,
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                         children,
                                                                       }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (
          savedMode === 'light' ||
          savedMode === 'dark' ||
          savedMode === 'system'
      ) {
        setModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem(THEME_MODE_KEY, newMode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    await setMode(newMode);
  };

  const getTheme = (): Theme => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getTheme();

  if (isLoading) {
    // you can return a small loader here if you want
    return null;
  }

  return (
      <ThemeContext.Provider value={{ mode, theme, setMode, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
