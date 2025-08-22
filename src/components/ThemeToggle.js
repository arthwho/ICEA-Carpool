import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.toggleButton,
        {
          backgroundColor: theme.interactive.button.secondary,
          borderColor: theme.border.primary,
        }
      ]}
      onPress={toggleTheme}
    >
      <Text style={[styles.toggleText, { color: theme.text.primary }]}>
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeToggle;
