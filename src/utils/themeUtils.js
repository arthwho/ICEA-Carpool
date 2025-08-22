import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme storage key
export const THEME_STORAGE_KEY = 'icea-theme-preference';

// Get saved theme preference
export const getSavedThemePreference = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } else {
      return await AsyncStorage.getItem(THEME_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error getting saved theme preference:', error);
    return null;
  }
};

// Save theme preference
export const saveThemePreference = async (isDark) => {
  try {
    const themeValue = isDark ? 'dark' : 'light';
    
    if (Platform.OS === 'web') {
      localStorage.setItem(THEME_STORAGE_KEY, themeValue);
    } else {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeValue);
    }
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
};

// Clear theme preference
export const clearThemePreference = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error clearing theme preference:', error);
  }
};

// Detect system theme preference (web only)
export const getSystemThemePreference = () => {
  if (Platform.OS === 'web' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return null;
};

// Check if system theme detection is available
export const isSystemThemeDetectionAvailable = () => {
  return Platform.OS === 'web' && window.matchMedia;
};
