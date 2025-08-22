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
import { signIn, signUp, setUserProfile, getUserProfile, signInWithGoogle, getRedirectUri } from '../services/firebase';

const AuthScreen = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha email e senha.');
      return;
    }

    if (!isLogin && (!firstName.trim() || !lastName.trim())) {
      Alert.alert('Erro', 'Por favor, preencha nome e sobrenome.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const cred = await signIn(email.trim(), password);
        // Ensure user profile exists
        const existing = await getUserProfile(cred.user.uid);
        if (!existing) {
          await setUserProfile(cred.user.uid, {
            email: cred.user.email,
            firstName: (cred.user.email || '').split('@')[0],
            lastName: '',
            name: (cred.user.email || '').split('@')[0],
            isDriver: false,
          });
        }
        onAuthSuccess(cred.user);
      } else {
        const cred = await signUp(email.trim(), password);
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        await setUserProfile(cred.user.uid, {
          email: cred.user.email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: fullName,
          isDriver: false,
        });
        onAuthSuccess(cred.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      Alert.alert('Erro', err.message || 'Falha ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('AuthScreen: Starting Google Sign-In...');
      const cred = await signInWithGoogle();

      // Ensure user profile exists
      const existing = await getUserProfile(cred.user.uid);
      if (!existing) {
        const displayName = cred.user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await setUserProfile(cred.user.uid, {
          email: cred.user.email,
          firstName: firstName,
          lastName: lastName,
          name: displayName || (cred.user.email || '').split('@')[0],
          isDriver: false,
        });
      }

      onAuthSuccess(cred.user);
    } catch (err) {
      console.error('AuthScreen: Google sign-in error:', err);
      if (err.message !== 'Google sign-in was cancelled') {
        Alert.alert('Erro', `Falha no login com Google: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const debugRedirectUri = () => {
    const uri = getRedirectUri();
    Alert.alert('Redirect URI', `Copy this URI to Google Cloud Console:\n\n${uri}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Criar Conta'}</Text>

      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#a0aec0"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Sobrenome"
            placeholderTextColor="#a0aec0"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </>
      )}

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
{/*
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

       Temporary debug button - remove after setup 
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#666', marginTop: 10 }]}
        onPress={debugRedirectUri}
      >
        <Text style={styles.buttonText}>🔧 Debug: Get Redirect URI</Text>
      </TouchableOpacity>
*/}
      <TouchableOpacity
        style={styles.transparentButton}
        onPress={() => {
          setIsLogin(!isLogin);
          // Clear name fields when switching modes
          if (isLogin) {
            setFirstName('');
            setLastName('');
          }
        }}
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
    fontWeight: '500',
  },
  transparentButton: {
    padding: 10,
  },
  toggleText: {
    color: '#4299e1',
    fontSize: 16,
    textAlign: 'center',
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
    color: '#a0aec0',
    paddingHorizontal: 15,
    fontSize: 14,
  },
});

export default AuthScreen;
