import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

const AuthScreen = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    console.log('Attempting auth with:', { email, password, isLogin }); // Debug log
    
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha email e senha.');
      return;
    }
    
    setLoading(true);
    try {
      // Mock authentication - replace with real auth later
      if (password === 'password') {
        console.log('Password correct, creating user...'); // Debug log
        const mockUser = { uid: email, email };
        console.log('User created:', mockUser); // Debug log
        onAuthSuccess(mockUser);
      } else {
        console.log('Password incorrect:', password); // Debug log
        Alert.alert('Erro', 'Credenciais inválidas');
      }
    } catch (err) {
      console.error('Auth error:', err); // Debug log
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Mock Google sign-in - replace with real implementation later
      const mockUser = { uid: 'usuario.google@gmail.com', email: 'usuario.google@gmail.com' };
      onAuthSuccess(mockUser);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Criar Conta'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#a0aec0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#a0aec0"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? 'Entrar' : 'Registrar'}
          </Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OU</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <TouchableOpacity 
        style={[styles.button, styles.googleButton]} 
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        <Text style={styles.googleButtonText}>Entrar com o Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.transparentButton} 
        onPress={() => setIsLogin(!isLogin)}
      >
        <Text style={styles.toggleText}>
          {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#4a5568',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 0,
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
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 18,
    fontWeight: 'bold',
  },
  transparentButton: {
    padding: 10,
    marginTop: 10,
  },
  toggleText: {
    color: '#63b3ed',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4a5568',
  },
  dividerText: {
    width: 50,
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: 16,
  },
});

export default AuthScreen;
