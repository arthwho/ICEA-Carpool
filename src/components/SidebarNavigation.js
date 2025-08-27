import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../hooks/useTheme';

const SidebarNavigation = ({ currentScreen, onScreenChange, user }) => {
  const { isWeb } = useResponsive();
  const { theme } = useTheme();

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
      id: 'ManagePassengers',
      label: 'Gerenciar Passageiros',
      icon: '👥',
      screen: 'ManagePassengers',
    },
    {
      id: 'RideHistory',
      label: 'Histórico',
      icon: '📋',
      screen: 'RideHistory',
    },
    {
      id: 'Profile',
      label: 'Perfil',
      icon: '👤',
      screen: 'Profile',
    },
  ];

  return (
    <View style={[styles.sidebar, { backgroundColor: theme.background.primary, borderRightColor: theme.border.secondary }]}>
      <View style={[styles.header, { borderBottomColor: theme.border.secondary }]}>
        <Image 
          source={require('../../assets/horizontal-icon.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.navigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              currentScreen === item.screen && [styles.activeNavItem, { backgroundColor: theme.interactive.active + '1A', borderLeftColor: theme.interactive.active }],
            ]}
            onPress={() => onScreenChange(item.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[
              styles.navLabel,
              { color: theme.text.tertiary },
              currentScreen === item.screen && { color: theme.interactive.active, fontWeight: 'bold' },
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
    borderRightWidth: 1,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: 76, // Fixed height instead of padding
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  logoImage: {
    width: 180,
    height: 40,
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
    borderLeftWidth: 3,
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SidebarNavigation;
