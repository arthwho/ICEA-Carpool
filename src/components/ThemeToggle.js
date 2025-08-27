import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text.primary }]}>
        {isDarkMode ? 'Modo escuro' : 'Modo claro'}
      </Text>
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        trackColor={{ 
          false: theme.interactive.button.secondary, 
          true: theme.interactive.active 
        }}
        thumbColor={theme.surface.primary}
        ios_backgroundColor={theme.interactive.button.secondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
});

export default ThemeToggle;
