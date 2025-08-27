import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { signIn, signUp, setUserProfile, getUserProfile, signInWithGoogle, getRedirectUri } from '../services/firebase';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import { getFirebaseErrorMessage, isValidationError, isNetworkError, testFirebaseErrorHandler } from '../utils/firebaseErrorHandler';

/**
 * Tela de autenticação da aplicação
 * Permite login, registro e login com Google
 * @param {Function} onAuthSuccess - Função chamada quando autenticação é bem-sucedida
 */
const AuthScreen = ({ onAuthSuccess }) => {
  // ========================================
  // ESTADOS DOS CAMPOS DO FORMULÁRIO
  // ========================================
  
  // Campos de autenticação
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Campos de registro (nome e sobrenome)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Estado do modo (login ou registro)
  const [isLogin, setIsLogin] = useState(true);
  
  // Estado de carregamento durante autenticação
  const [loading, setLoading] = useState(false);
  
  // ========================================
  // HOOKS PARA TEMA E RESPONSIVIDADE
  // ========================================
  
  const { theme } = useTheme();
  const { isWeb, isDesktop, getResponsiveStyle } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();
  
  // ========================================
  // REFS PARA FOCUS DOS INPUTS
  // ========================================
  
  const firstNameRef = React.useRef(null);
  const lastNameRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);

  // ========================================
  // FUNÇÃO PRINCIPAL DE AUTENTICAÇÃO
  // ========================================
  
  /**
   * Função principal que gerencia login e registro
   * Salva o perfil do usuário no Firestore após autenticação bem-sucedida
   */
  const handleAuth = async () => {
    // Validação dos campos obrigatórios
    if (!email || !password) {
      showAlert('Erro', 'Por favor, preencha email e senha.', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    // Validação adicional para registro (nome e sobrenome)
    if (!isLogin && (!firstName.trim() || !lastName.trim())) {
      showAlert('Erro', 'Por favor, preencha nome e sobrenome.', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // ========================================
        // PROCESSO DE LOGIN
        // ========================================
        
        // Faz login no Firebase com email e senha
        const cred = await signIn(email.trim(), password);
        
        // Verifica se o perfil do usuário existe no Firestore
        const existing = await getUserProfile(cred.user.uid);
        
        // Se o perfil não existe, cria um perfil básico
        // Isso pode acontecer se o usuário foi criado antes da implementação do perfil
        if (!existing) {
          await setUserProfile(cred.user.uid, {
            email: cred.user.email,
            firstName: (cred.user.email || '').split('@')[0], // Usa parte do email como nome
            lastName: '',
            name: (cred.user.email || '').split('@')[0],
            isDriver: false, // Usuário não é motorista por padrão
          });
        }
        
        // Chama a função de sucesso para navegar para a próxima tela
        onAuthSuccess(cred.user);
        
      } else {
        // ========================================
        // PROCESSO DE REGISTRO
        // ========================================
        
        // Cria uma nova conta no Firebase
        const cred = await signUp(email.trim(), password);
        
        // Monta o nome completo
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        
        // Salva o perfil completo do usuário no Firestore
        // Este é o momento onde os dados são salvos na coleção 'users'
        await setUserProfile(cred.user.uid, {
          email: cred.user.email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: fullName,
          isDriver: false, // Usuário não é motorista por padrão
        });
        
        // Chama a função de sucesso para navegar para a próxima tela
        onAuthSuccess(cred.user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      console.log('Error type:', typeof err);
      console.log('Error code:', err.code);
      console.log('Error message:', err.message);
      
      // Usa o handler de erro do Firebase para mensagens amigáveis
      const errorMessage = getFirebaseErrorMessage(err);
      console.log('Processed error message:', errorMessage);
      
      // Define o título baseado no tipo de erro
      let errorTitle = 'Erro';
      if (isValidationError(err)) {
        errorTitle = 'Dados Inválidos';
      } else if (isNetworkError(err)) {
        errorTitle = 'Erro de Conexão';
      }
      
      console.log('Showing alert with title:', errorTitle, 'message:', errorMessage);
      showAlert(errorTitle, errorMessage, [
        { text: 'OK', style: 'default' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNÇÃO DE LOGIN COM GOOGLE
  // ========================================
  
  /**
   * Função para autenticação usando conta Google
   * Também salva o perfil do usuário no Firestore se necessário
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('AuthScreen: Starting Google Sign-In...');
      
      // Faz login com Google (implementa OAuth 2.0)
      const cred = await signInWithGoogle();

      // Verifica se o perfil do usuário existe no Firestore
      const existing = await getUserProfile(cred.user.uid);
      
      // Se o perfil não existe, cria um perfil com dados do Google
      if (!existing) {
        const displayName = cred.user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Salva o perfil no Firestore com dados do Google
        await setUserProfile(cred.user.uid, {
          email: cred.user.email,
          firstName: firstName,
          lastName: lastName,
          name: displayName || (cred.user.email || '').split('@')[0],
          isDriver: false, // Usuário não é motorista por padrão
        });
      }

      // Chama a função de sucesso para navegar para a próxima tela
      onAuthSuccess(cred.user);
    } catch (err) {
      console.error('AuthScreen: Google sign-in error:', err);
      console.log('Google error type:', typeof err);
      console.log('Google error code:', err.code);
      console.log('Google error message:', err.message);
      
      if (err.message !== 'Google sign-in was cancelled') {
        // Usa o handler de erro do Firebase para mensagens amigáveis
        const errorMessage = getFirebaseErrorMessage(err);
        console.log('Google processed error message:', errorMessage);
        
        // Define o título baseado no tipo de erro
        let errorTitle = 'Erro no Google Sign-In';
        if (isNetworkError(err)) {
          errorTitle = 'Erro de Conexão';
        }
        
        console.log('Showing Google alert with title:', errorTitle, 'message:', errorMessage);
        showAlert(errorTitle, errorMessage, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const debugRedirectUri = () => {
    const uri = getRedirectUri();
    showAlert('Redirect URI', `Copy this URI to Google Cloud Console:\n\n${uri}`, [
      { text: 'OK', style: 'default' }
    ]);
  };

  const testErrorHandler = () => {
    testFirebaseErrorHandler(showAlert);
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container, 
        { backgroundColor: theme.background.primary }
      ]}
    >
      <View style={[
        styles.contentContainer,
        getResponsiveStyle(
          styles.mobileContent, // mobile styles
          {
            ...styles.webContent,
            backgroundColor: theme.surface.elevated,
            borderColor: theme.border.secondary,
          }
        )
      ]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/adaptive-icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.text.primary }]}>
          {isLogin ? 'Login' : 'Criar Conta'}
        </Text>

        {!isLogin && (
          <>
            <TextInput
              ref={firstNameRef}
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.surface.primary,
                  color: theme.text.primary,
                  borderColor: theme.border.primary
                },
                getResponsiveStyle(
                  styles.mobileInput, // mobile styles
                  styles.webInput     // web styles
                )
              ]}
              placeholder="Nome"
              placeholderTextColor={theme.text.tertiary}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus next input (lastName)
                if (lastNameRef.current) {
                  lastNameRef.current.focus();
                }
              }}
            />

            <TextInput
              ref={lastNameRef}
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.surface.primary,
                  color: theme.text.primary,
                  borderColor: theme.border.primary
                },
                getResponsiveStyle(
                  styles.mobileInput, // mobile styles
                  styles.webInput     // web styles
                )
              ]}
              placeholder="Sobrenome"
              placeholderTextColor={theme.text.tertiary}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus next input (email)
                if (emailRef.current) {
                  emailRef.current.focus();
                }
              }}
            />
          </>
        )}

        <TextInput
          ref={emailRef}
          style={[
            styles.input, 
            { 
              backgroundColor: theme.surface.primary,
              color: theme.text.primary,
              borderColor: theme.border.primary
            },
            getResponsiveStyle(
              styles.mobileInput, // mobile styles
              styles.webInput     // web styles
            )
          ]}
          placeholder="Email"
          placeholderTextColor={theme.text.tertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType={isLogin ? "done" : "next"}
          onSubmitEditing={() => {
            if (isLogin) {
              // In login mode, submit the form when Enter is pressed on email
              handleAuth();
            } else {
              // In register mode, focus next input (password)
              if (passwordRef.current) {
                passwordRef.current.focus();
              }
            }
          }}
        />

        <TextInput
          ref={passwordRef}
          style={[
            styles.input, 
            { 
              backgroundColor: theme.surface.primary,
              color: theme.text.primary,
              borderColor: theme.border.primary
            },
            getResponsiveStyle(
              styles.mobileInput, // mobile styles
              styles.webInput     // web styles
            )
          ]}
          placeholder="Senha"
          placeholderTextColor={theme.text.tertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleAuth}
        />

        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: theme.interactive.button.primary },
            getResponsiveStyle(
              styles.mobileButton, // mobile styles
              styles.webButton     // web styles
            )
          ]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.text.inverse} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
              {isLogin ? 'Entrar' : 'Registrar'}
            </Text>
          )}
        </TouchableOpacity>

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
          <Text style={[styles.toggleText, { color: theme.interactive.link }]}>
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </Text>
        </TouchableOpacity>
      </View>
      <CustomAlert 
        visible={alertState.visible} 
        title={alertState.title} 
        message={alertState.message} 
        buttons={alertState.buttons}
        onClose={closeAlert} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  mobileContent: {
    // Mobile: full width, no additional styling
  },
  webContent: {
    // Web: card-like container with max width and shadow
    maxWidth: 400,
    borderRadius: 16,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  mobileInput: {
    width: '100%',
  },
  webInput: {
    width: '100%',
    maxWidth: 320,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  mobileButton: {
    width: '100%',
  },
  webButton: {
    width: '100%',
    maxWidth: 320,
  },
  googleButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  transparentButton: {
    padding: 10,
  },
  toggleText: {
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
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 14,
  },
});

export default AuthScreen;
