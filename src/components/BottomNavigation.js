import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

const BottomNavigation = ({ currentScreen, onScreenChange }) => {
  const { isMobile } = useResponsive();

  // Don't render on web
  if (!isMobile) {
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
    <View style={styles.container}>
      {navigationItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.tab,
            currentScreen === item.screen && styles.activeTab,
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
            currentScreen === item.screen && styles.activeLabel,
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
    backgroundColor: '#1a202c',
    borderTopWidth: 1,
    borderTopColor: '#2d3748',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
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
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
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
    color: '#a0aec0',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#4299e1',
    fontWeight: 'bold',
  },
});

export default BottomNavigation;
