import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

const SidebarNavigation = ({ currentScreen, onScreenChange, user }) => {
  const { isWeb } = useResponsive();

  // Don't render on mobile or when user is not logged in
  if (!isWeb || !user || currentScreen === 'Auth') {
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
    <View style={styles.sidebar}>
      <View style={styles.header}>
        <Text style={styles.logo}>ICEA Caronas</Text>
      </View>
      
      <View style={styles.navigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              currentScreen === item.screen && styles.activeNavItem,
            ]}
            onPress={() => onScreenChange(item.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[
              styles.navLabel,
              currentScreen === item.screen && styles.activeNavLabel,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#1a202c',
    borderRightWidth: 1,
    borderRightColor: '#2d3748',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: 76, // Fixed height instead of padding
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4299e1',
    textAlign: 'center',
  },
  navigation: {
    flex: 1,
    paddingTop: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 8,
    transition: 'all 0.2s ease',
  },
  activeNavItem: {
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#4299e1',
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 16,
    color: '#a0aec0',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#4299e1',
    fontWeight: 'bold',
  },
});

export default SidebarNavigation;
