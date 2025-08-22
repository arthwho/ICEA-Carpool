import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../hooks/useTheme';

const BottomNavigation = ({ currentScreen, onScreenChange }) => {
  const { isMobile } = useResponsive();
  const { theme } = useTheme();

  // Don't render on web or on Auth screen
  if (!isMobile || currentScreen === 'Auth') {
    return null;
  }

  const navigationItems = [
    {
      id: 'Home',
      label: 'Caronas',
      icon: '🚗',
      screen: 'Home',
    },
    {
      id: 'OfferRide',
      label: 'Oferecer',
      icon: '➕',
      screen: 'OfferRide',
    },
    {
      id: 'Profile',
      label: 'Perfil',
      icon: '👤',
      screen: 'Profile',
    },
  ];

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.background.primary, 
      borderTopColor: theme.border.secondary,
      shadowColor: theme.shadow.primary
    }]}>
      {navigationItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.tab,
            currentScreen === item.screen && [styles.activeTab, { backgroundColor: theme.interactive.active + '1A' }],
          ]}
          onPress={() => onScreenChange(item.screen)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.icon,
            currentScreen === item.screen && styles.activeIcon,
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.label,
            { color: theme.text.tertiary },
            currentScreen === item.screen && { color: theme.interactive.active, fontWeight: 'bold' },
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Background color will be applied dynamically
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BottomNavigation;
