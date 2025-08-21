import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const ProfileScreen = ({ setScreen, user, onSignOut }) => {
  const handleSignOut = async () => {
    // Mock sign out - replace with real implementation later
    onSignOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      <Text style={styles.subtitle}>Email: {user?.email}</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Sair (Logout)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setScreen('Home')}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
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
    backgroundColor: '#4299e1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    padding: 15,
  },
  backButtonText: {
    color: '#63b3ed',
    fontSize: 16,
  },
});

export default ProfileScreen;
