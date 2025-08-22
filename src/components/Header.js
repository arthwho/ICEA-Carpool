import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const Header = ({ currentScreen, user }) => {
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
      default:
        return 'ICEA Caronas';
    }
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[
      styles.header,
      isWeb ? styles.webHeader : styles.mobileHeader
    ]}>
      <View style={[
        styles.headerContent,
        isWeb ? styles.webHeaderContent : styles.mobileHeaderContent
      ]}>
        <Text style={styles.title}>{getScreenTitle()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1a202c',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
    elevation: 4,
    shadowColor: '#000',
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
    justifyContent: 'flex-start',
    paddingHorizontal: 24, // Add horizontal padding for web content
  },
  mobileHeaderContent: {
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'left',
  },
});

export default Header;
