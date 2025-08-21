import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

const LoadingScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#4299e1" />
    <Text style={styles.loadingText}>Carregando...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d3748',
  },
  loadingText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 18,
  },
});

export default LoadingScreen;
