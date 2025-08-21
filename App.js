import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

// Import screens
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import OfferRideScreen from './src/screens/OfferRideScreen';
import FindRideScreen from './src/screens/FindRideScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoadingScreen from './src/components/LoadingScreen';
import Header from './src/components/Header';

// Import services
import { mockAuth } from './src/services/mockAuth';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState('Auth'); // Auth, Home, OfferRide, FindRide, Profile

  // Authentication effect
  useEffect(() => {
    // Simulate initial app loading
    setTimeout(() => {
      setIsLoading(false);
      setScreen('Auth'); // Always start with Auth screen
    }, 1500);
  }, []);

  // Render logic
  const renderContent = () => {
    if (isLoading) {
      return <LoadingScreen />;
    }

    switch (screen) {
      case 'Auth':
        return <AuthScreen onAuthSuccess={(authedUser) => { 
          console.log('Auth success:', authedUser); // Debug log
          setUser(authedUser); 
          setScreen('Home'); 
        }} />;
      case 'Home':
        return <HomeScreen setScreen={setScreen} />;
      case 'OfferRide':
        return <OfferRideScreen setScreen={setScreen} user={user} />;
      case 'FindRide':
        return <FindRideScreen setScreen={setScreen} user={user} />;
      case 'Profile':
        return <ProfileScreen setScreen={setScreen} user={user} onSignOut={() => { 
          setUser(null); 
          setScreen('Auth'); 
        }} />;
      default:
        return <AuthScreen onAuthSuccess={(authedUser) => { 
          setUser(authedUser); 
          setScreen('Home'); 
        }} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header title="ICEA Caronas" />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d3748',
  },
});
