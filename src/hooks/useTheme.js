import { useState, useContext, createContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { getTheme, darkTheme, lightTheme } from '../config/theme';
import { 
  getSavedThemePreference, 
  saveThemePreference, 
  clearThemePreference,
  getSystemThemePreference,
  isSystemThemeDetectionAvailable
} from '../utils/themeUtils';

// Create theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const theme = getTheme(isDarkMode);

  // Load theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await getSavedThemePreference();
        
        if (savedTheme !== null) {
          const isDark = savedTheme === 'dark';
          setIsDarkMode(isDark);
        } else {
          // If no saved preference, try to detect system theme (web only)
          if (isSystemThemeDetectionAvailable()) {
            const systemTheme = getSystemThemePreference();
            if (systemTheme !== null) {
              setIsDarkMode(systemTheme);
            }
            
            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleSystemThemeChange = (e) => {
              const currentSavedTheme = localStorage.getItem('icea-theme-preference');
              if (currentSavedTheme === null) {
                setIsDarkMode(e.matches);
              }
            };
            
            mediaQuery.addEventListener('change', handleSystemThemeChange);
            
            // Cleanup listener on unmount
            return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to dark mode if there's an error
        setIsDarkMode(true);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (isDark) => {
    setIsDarkMode(isDark);
    saveThemePreference(isDark);
  };

  const clearSavedTheme = async () => {
    await clearThemePreference();
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme, isLoaded, clearSavedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export theme objects for direct use if needed
export { darkTheme, lightTheme };
