import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const HomeScreen = ({ setScreen }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>O que você deseja fazer?</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={() => setScreen('FindRide')}
      >
        <Text style={styles.buttonText}>Procurar Carona</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={() => setScreen('OfferRide')}
      >
        <Text style={styles.buttonText}>Oferecer Carona</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.tertiaryButton]} 
        onPress={() => setScreen('Profile')}
      >
        <Text style={styles.buttonText}>Meu Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#a0aec0',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#38b2ac',
  },
  secondaryButton: {
    backgroundColor: '#ed8936',
  },
  tertiaryButton: {
    backgroundColor: '#718096',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
