import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNativeAsyncStorage } from 'firebase/auth';
import { firebaseConfig, googleConfig, adminConfig } from '../config/firebase-config';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

// ========================================
// INICIALIZAÇÃO DO FIREBASE
// ========================================

// Inicializa a aplicação Firebase com as configurações
const app = initializeApp(firebaseConfig);

// Obtém as instâncias de autenticação e banco de dados
const auth = getAuth(app);
const db = getFirestore(app);

// Configura a persistência da autenticação para usar AsyncStorage
// Isso mantém o usuário logado mesmo após fechar o app
auth.setPersistence(ReactNativeAsyncStorage);

// ========================================
// FUNÇÕES DE AUTENTICAÇÃO
// ========================================

/**
 * Configura um listener para mudanças no estado de autenticação
 * É chamado sempre que o usuário faz login/logout
 * @param {Function} callback - Função chamada quando o estado muda
 * @returns {Function} Função para cancelar o listener
 */
export const onAuthChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Faz login do usuário com email e senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise} Resultado da autenticação
 */
export const signIn = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Cria uma nova conta de usuário com email e senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise} Resultado da criação da conta
 */
export const signUp = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Faz logout do usuário atual
 * @returns {Promise} Resultado do logout
 */
export const signOut = async () => {
  return firebaseSignOut(auth);
};

// ========================================
// FUNÇÕES DE PERFIL DO USUÁRIO
// ========================================

/**
 * Salva ou atualiza o perfil do usuário no Firestore
 * Chamado após registro ou quando o perfil não existe
 * @param {string} userId - ID único do usuário
 * @param {Object} profileData - Dados do perfil (nome, email, etc.)
 */
export const setUserProfile = async (userId, profileData) => {
  // Cria uma referência para o documento do usuário
  const userRef = doc(db, 'users', userId);
  
  // Salva os dados no Firestore com timestamps
  await setDoc(userRef, {
    ...profileData,
    createdAt: new Date(), // Data de criação
    updatedAt: new Date()  // Data da última atualização
  });
};

/**
 * Busca o perfil do usuário no Firestore
 * @param {string} userId - ID único do usuário
 * @returns {Promise<Object|null>} Dados do perfil ou null se não existir
 */
export const getUserProfile = async (userId) => {
  // Cria uma referência para o documento do usuário
  const userRef = doc(db, 'users', userId);
  
  // Busca o documento
  const userSnap = await getDoc(userRef);
  
  // Retorna os dados se existir, null caso contrário
  return userSnap.exists() ? userSnap.data() : null;
};

// ========================================
// FUNÇÕES DE INFORMAÇÕES DO VEÍCULO
// ========================================

/**
 * Salva as informações do carro do motorista
 * Chamado quando o usuário se torna motorista pela primeira vez
 * @param {string} userId - ID único do usuário
 * @param {Object} carInfo - Informações do carro (modelo, placa, cor)
 */
export const setDriverCarInfo = async (userId, carInfo) => {
  // Cria uma referência para o documento do carro (subcoleção)
  const carRef = doc(db, 'users', userId, 'car', 'info');
  
  // Salva as informações do carro
  await setDoc(carRef, {
    ...carInfo,
    updatedAt: new Date() // Data da última atualização
  });
};

/**
 * Busca as informações do carro do motorista
 * @param {string} userId - ID único do usuário
 * @returns {Promise<Object|null>} Informações do carro ou null se não existir
 */
export const getDriverCarInfo = async (userId) => {
  // Cria uma referência para o documento do carro
  const carRef = doc(db, 'users', userId, 'car', 'info');
  
  // Busca o documento
  const carSnap = await getDoc(carRef);
  
  // Retorna os dados se existir, null caso contrário
  return carSnap.exists() ? carSnap.data() : null;
};

/**
 * Atualiza o usuário para motorista
 * Chamado quando o usuário preenche as informações do carro
 * @param {string} userId - ID único do usuário
 */
export const updateUserToDriver = async (userId) => {
  // Cria uma referência para o documento do usuário
  const userRef = doc(db, 'users', userId);
  
  // Atualiza o campo isDriver para true
  await updateDoc(userRef, {
    isDriver: true,
    updatedAt: new Date() // Data da última atualização
  });
};

// ========================================
// FUNÇÕES DE CARONAS
// ========================================

/**
 * Adiciona uma nova carona ao Firestore
 * Chamado quando o usuário publica uma carona
 * @param {Object} rideData - Dados da carona (origem, horário, vagas, etc.)
 * @returns {Promise<string>} ID da carona criada
 */
export const addRide = async (rideData) => {
  // Cria uma referência para a coleção de caronas
  const ridesRef = collection(db, 'rides');
  
  // Adiciona o documento com timestamps
  const docRef = await addDoc(ridesRef, {
    ...rideData,
    createdAt: new Date(), // Data de criação
    updatedAt: new Date()  // Data da última atualização
  });
  
  return docRef.id; // Retorna o ID da carona criada
};

/**
 * Configura um listener em tempo real para caronas disponíveis
 * Atualiza automaticamente quando caronas são adicionadas/removidas
 * @param {Function} callback - Função chamada quando os dados mudam
 * @returns {Function} Função para cancelar o listener
 */
export const subscribeAvailableRides = (callback) => {
  // Cria uma referência para a coleção de caronas
  const ridesRef = collection(db, 'rides');
  
  // Cria uma query para buscar apenas caronas disponíveis
  const q = query(ridesRef, where('status', '==', 'available'));
  
  // Configura o listener em tempo real
  return onSnapshot(q, (snapshot) => {
    const rides = [];
    
    // Processa cada documento retornado
    snapshot.forEach((doc) => {
      rides.push({
        id: doc.id,        // ID do documento
        ...doc.data()      // Dados da carona
      });
    });
    
    // Chama a função de callback com as caronas atualizadas
    callback(rides);
  });
};

/**
 * Remove uma carona do Firestore
 * Usado apenas por administradores
 * @param {string} rideId - ID da carona a ser removida
 */
export const deleteRide = async (rideId) => {
  // Cria uma referência para o documento da carona
  const rideRef = doc(db, 'rides', rideId);
  
  // Remove o documento
  await deleteDoc(rideRef);
};

/**
 * Atualiza uma carona existente
 * @param {string} rideId - ID da carona
 * @param {Object} updateData - Novos dados para atualizar
 */
export const updateRide = async (rideId, updateData) => {
  // Cria uma referência para o documento da carona
  const rideRef = doc(db, 'rides', rideId);
  
  // Atualiza o documento
  await updateDoc(rideRef, {
    ...updateData,
    updatedAt: new Date() // Data da última atualização
  });
};

// ========================================
// FUNÇÕES DE LOGIN COM GOOGLE
// ========================================

/**
 * Realiza login usando conta Google
 * Implementa o fluxo OAuth 2.0 com PKCE
 * @returns {Promise} Resultado da autenticação Google
 */
export const signInWithGoogle = async () => {
  // Cria a URI de redirecionamento para o OAuth
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  
  // Cria a requisição de autenticação
  const request = new AuthSession.AuthRequest({
    clientId: googleConfig.clientId,
    scopes: ['openid', 'profile', 'email'], // Permissões solicitadas
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    codeChallenge: await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'challenge',
      { encoding: Crypto.CryptoEncoding.HEX }
    ),
    codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
  });

  // Abre a tela de login do Google
  const result = await request.promptAsync({
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  });

  // Se o login foi bem-sucedido
  if (result.type === 'success') {
    const { code } = result.params;
    
    // Troca o código de autorização por um token de acesso
    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: googleConfig.clientId,
        code,
        redirectUri,
        extraParams: {
          code_verifier: 'challenge',
        },
      },
      {
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      }
    );

    // Cria uma credencial Firebase com o token do Google
    const credential = GoogleAuthProvider.credential(tokenResponse.accessToken);
    
    // Faz login no Firebase com a credencial
    return signInWithCredential(auth, credential);
  } else {
    // Se o usuário cancelou o login
    throw new Error('Google sign-in was cancelled');
  }
};

/**
 * Obtém a URI de redirecionamento para OAuth
 * @returns {string} URI de redirecionamento
 */
export const getRedirectUri = () => {
  return AuthSession.makeRedirectUri({ useProxy: true });
};

// ========================================
// CONFIGURAÇÕES DE ADMINISTRADOR
// ========================================

// Exporta as configurações de administrador
export { adminConfig };


