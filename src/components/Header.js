import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';

const Header = ({ currentScreen, user }) => {
  const { theme } = useTheme();
  
  // Don't show header on Auth screen
  if (currentScreen === 'Auth') {
    return null;
  }

  // Get screen title based on current screen
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'Home':
        return 'Caronas Disponíveis';
      case 'OfferRide':
        return 'Oferecer Carona';
      case 'FindRide':
        return 'Caronas Disponíveis';
      case 'Profile':
        return 'Meu Perfil';
      case 'ManagePassengers':
        return 'Gerenciar Passageiros';
      case 'RideHistory':
        return 'Histórico de Caronas';
      case 'AdminPanel':
        return 'Painel Administrativo';
      default:
        return 'ICEA Caronas';
    }
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[
      styles.header,
      isWeb ? styles.webHeader : styles.mobileHeader,
      {
        backgroundColor: theme.background.primary,
        borderBottomColor: theme.border.secondary,
        shadowColor: theme.shadow.primary,
      }
    ]}>
      <View style={[
        styles.headerContent,
        isWeb ? styles.webHeaderContent : styles.mobileHeaderContent
      ]}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{getScreenTitle()}</Text>
        {isWeb && <ThemeToggle />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  webHeader: {
    height: 76, // Fixed height to match sidebar
    position: 'fixed',
    top: 0,
    left: 250, // Account for sidebar width
    right: 0,
    zIndex: 999, // Lower than sidebar but higher than content
  },
  mobileHeader: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 28, // Standard mobile padding
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webHeaderContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24, // Add horizontal padding for web content
  },
  mobileHeaderContent: {
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});

export default Header;
