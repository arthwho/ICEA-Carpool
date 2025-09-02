import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc,
  updateDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { firebaseConfig, googleConfig, adminConfig } from '../config/firebase-config';

// ========================================
// SISTEMA DE ROLES E PERMISSÕES
// ========================================

/**
 * Define os tipos de usuário e suas permissões
 */
const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator', 
  USER: 'user'
};

/**
 * Define permissões por role
 */
const PERMISSIONS = {
  // Permissões de administrador
  ADMIN: [
    'rides:delete:any',      // Excluir qualquer carona
    'rides:edit:any',        // Editar qualquer carona
    'users:view:all',        // Ver todos os usuários
    'users:edit:any',        // Editar qualquer usuário
    'users:ban',             // Banir usuários
    'reports:view:all',      // Ver todos os relatórios
    'analytics:view',        // Ver analytics
    'system:manage'          // Gerenciar sistema
  ],
  
  // Permissões de moderador
  MODERATOR: [
    'rides:delete:reported',  // Excluir caronas reportadas
    'rides:moderate',        // Moderar caronas
    'users:warn',           // Advertir usuários
    'reports:view:assigned', // Ver relatórios atribuídos
    'disputes:resolve'       // Resolver disputas
  ],
  
  // Permissões de usuário normal
  USER: [
    'rides:create',          // Criar caronas
    'rides:edit:own',        // Editar próprias caronas
    'rides:delete:own',      // Excluir próprias caronas
    'reservations:manage',   // Gerenciar reservas
    'profile:edit:own'       // Editar próprio perfil
  ]
};

/**
 * Retorna as permissões padrão para um role
 * @param {string} role - Role do usuário
 * @returns {Array} Lista de permissões
 */
const getDefaultPermissions = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return [...PERMISSIONS.ADMIN, ...PERMISSIONS.MODERATOR, ...PERMISSIONS.USER];
    case USER_ROLES.MODERATOR:
      return [...PERMISSIONS.MODERATOR, ...PERMISSIONS.USER];
    case USER_ROLES.USER:
    default:
      return PERMISSIONS.USER;
  }
};
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

// ========================================
// INICIALIZAÇÃO DO FIREBASE
// ========================================

// Inicializa a aplicação Firebase com as configurações
const app = initializeApp(firebaseConfig);

// Obtém as instâncias de autenticação e banco de dados
// Para React Native, é necessário inicializar o Auth com persistência baseada em AsyncStorage
const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
const db = getFirestore(app);

// Nota: no ambiente web, a persistência padrão do Firebase será utilizada.

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
  
  // Salva os dados no Firestore com timestamps e role padrão
  await setDoc(userRef, {
    ...profileData,
    role: profileData.role || 'user', // Default: usuário normal
    permissions: getDefaultPermissions(profileData.role || 'user'),
    isDriver: profileData.isDriver || false,
    createdAt: new Date(),
    updatedAt: new Date()
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
 * Atualiza as informações do carro do motorista
 * Chamado quando o motorista edita as informações do carro
 * @param {string} userId - ID único do usuário
 * @param {Object} carInfo - Novas informações do carro (modelo, placa, cor)
 */
export const updateDriverCarInfo = async (userId, carInfo) => {
  // Cria uma referência para o documento do carro (subcoleção)
  const carRef = doc(db, 'users', userId, 'car', 'info');
  
  // Atualiza as informações do carro
  await updateDoc(carRef, {
    ...carInfo,
    updatedAt: new Date() // Data da última atualização
  });
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
 * Configura um listener em tempo real para caronas disponíveis com avaliações dos motoristas
 * @param {Function} callback - Função chamada quando os dados mudam
 * @returns {Function} Função para cancelar o listener
 */
export const subscribeAvailableRidesWithRatings = (callback) => {
  const ridesRef = collection(db, 'rides');
  const q = query(ridesRef, where('status', '==', 'available'));
  
  return onSnapshot(q, async (snapshot) => {
    const rides = [];
    
    // Processa cada documento e busca as avaliações do motorista
    for (const docSnap of snapshot.docs) {
      const rideData = { id: docSnap.id, ...docSnap.data() };
      
      // Busca as avaliações do motorista
      if (rideData.driverId) {
        try {
          const driverProfile = await getUserProfile(rideData.driverId);
          if (driverProfile && driverProfile.ratings) {
            rideData.driverRating = driverProfile.ratings;
          }
        } catch (error) {
          console.error('Error fetching driver ratings:', error);
        }
      }
      
      rides.push(rideData);
    }
    
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
// FUNÇÕES DE RESERVA E GESTÃO DE PASSAGEIROS
// ========================================

/**
 * Faz uma reserva de carona
 * @param {string} rideId - ID da carona
 * @param {string} passengerId - ID do passageiro
 * @param {Object} passengerInfo - Informações do passageiro (nome, telefone, etc.)
 */
export const requestRide = async (rideId, passengerId, passengerInfo) => {
  const reservationRef = doc(db, 'reservations', `${rideId}_${passengerId}`);
  
  await setDoc(reservationRef, {
    rideId,
    passengerId,
    passengerName: passengerInfo.name,
    passengerPhone: passengerInfo.phone,
    status: 'pending', // pending, accepted, rejected, cancelled
    requestedAt: new Date(),
    updatedAt: new Date()
  });
  
  // Adiciona à lista de espera da carona
  const rideRef = doc(db, 'rides', rideId);
  const rideSnap = await getDoc(rideRef);
  const rideData = rideSnap.data();
  
  const currentRequests = rideData.pendingRequests || [];
  const waitingList = rideData.waitingList || [];
  
  // Se ainda há vagas disponíveis, adiciona à lista de pedidos pendentes
  if (currentRequests.length < rideData.availableSeats) {
    await updateDoc(rideRef, {
      pendingRequests: [...currentRequests, {
        passengerId,
        passengerName: passengerInfo.name,
        requestedAt: new Date()
      }],
      updatedAt: new Date()
    });
  } else {
    // Se não há vagas, adiciona à lista de espera
    await updateDoc(rideRef, {
      waitingList: [...waitingList, {
        passengerId,
        passengerName: passengerInfo.name,
        requestedAt: new Date()
      }],
      updatedAt: new Date()
    });
  }
};

/**
 * Aprova uma reserva de carona (usado pelo motorista)
 * @param {string} rideId - ID da carona
 * @param {string} passengerId - ID do passageiro
 */
export const approveReservation = async (rideId, passengerId) => {
  const reservationRef = doc(db, 'reservations', `${rideId}_${passengerId}`);
  
  // Atualiza o status da reserva
  await updateDoc(reservationRef, {
    status: 'accepted',
    approvedAt: new Date(),
    updatedAt: new Date()
  });
  
  // Atualiza a carona
  const rideRef = doc(db, 'rides', rideId);
  const rideSnap = await getDoc(rideRef);
  const rideData = rideSnap.data();
  
  const pendingRequests = rideData.pendingRequests || [];
  const passengers = rideData.passengers || [];
  const waitingList = rideData.waitingList || [];
  
  // Remove da lista de pedidos pendentes
  const updatedPendingRequests = pendingRequests.filter(req => req.passengerId !== passengerId);
  
  // Adiciona à lista de passageiros confirmados
  const approvedPassenger = pendingRequests.find(req => req.passengerId === passengerId);
  const updatedPassengers = [...passengers, {
    ...approvedPassenger,
    approvedAt: new Date()
  }];
  
  // Se houver pessoas na lista de espera e ainda há vagas, move uma para pendentes
  let updatedWaitingList = waitingList;
  if (waitingList.length > 0 && updatedPendingRequests.length < rideData.availableSeats - updatedPassengers.length) {
    const nextInLine = waitingList[0];
    updatedWaitingList = waitingList.slice(1);
    updatedPendingRequests.push(nextInLine);
  }
  
  await updateDoc(rideRef, {
    pendingRequests: updatedPendingRequests,
    passengers: updatedPassengers,
    waitingList: updatedWaitingList,
    updatedAt: new Date()
  });
};

/**
 * Rejeita uma reserva de carona (usado pelo motorista)
 * @param {string} rideId - ID da carona
 * @param {string} passengerId - ID do passageiro
 */
export const rejectReservation = async (rideId, passengerId) => {
  const reservationRef = doc(db, 'reservations', `${rideId}_${passengerId}`);
  
  // Atualiza o status da reserva
  await updateDoc(reservationRef, {
    status: 'rejected',
    rejectedAt: new Date(),
    updatedAt: new Date()
  });
  
  // Remove da lista de pedidos pendentes
  const rideRef = doc(db, 'rides', rideId);
  const rideSnap = await getDoc(rideRef);
  const rideData = rideSnap.data();
  
  const pendingRequests = rideData.pendingRequests || [];
  const waitingList = rideData.waitingList || [];
  
  const updatedPendingRequests = pendingRequests.filter(req => req.passengerId !== passengerId);
  
  // Se houver pessoas na lista de espera, move uma para pendentes
  let updatedWaitingList = waitingList;
  if (waitingList.length > 0) {
    const nextInLine = waitingList[0];
    updatedWaitingList = waitingList.slice(1);
    updatedPendingRequests.push(nextInLine);
  }
  
  await updateDoc(rideRef, {
    pendingRequests: updatedPendingRequests,
    waitingList: updatedWaitingList,
    updatedAt: new Date()
  });
};

/**
 * Cancela uma reserva (usado pelo passageiro)
 * @param {string} rideId - ID da carona
 * @param {string} passengerId - ID do passageiro
 */
export const cancelReservation = async (rideId, passengerId) => {
  const reservationRef = doc(db, 'reservations', `${rideId}_${passengerId}`);
  
  // Atualiza o status da reserva
  await updateDoc(reservationRef, {
    status: 'cancelled',
    cancelledAt: new Date(),
    updatedAt: new Date()
  });
  
  // Remove da carona
  const rideRef = doc(db, 'rides', rideId);
  const rideSnap = await getDoc(rideRef);
  const rideData = rideSnap.data();
  
  const pendingRequests = rideData.pendingRequests || [];
  const passengers = rideData.passengers || [];
  const waitingList = rideData.waitingList || [];
  
  // Remove das listas relevantes
  const updatedPendingRequests = pendingRequests.filter(req => req.passengerId !== passengerId);
  const updatedPassengers = passengers.filter(p => p.passengerId !== passengerId);
  
  // Se houver pessoas na lista de espera, move uma para pendentes
  let updatedWaitingList = waitingList;
  if (waitingList.length > 0 && updatedPendingRequests.length + updatedPassengers.length < rideData.availableSeats) {
    const nextInLine = waitingList[0];
    updatedWaitingList = waitingList.slice(1);
    updatedPendingRequests.push(nextInLine);
  }
  
  await updateDoc(rideRef, {
    pendingRequests: updatedPendingRequests,
    passengers: updatedPassengers,
    waitingList: updatedWaitingList,
    updatedAt: new Date()
  });
};

/**
 * Busca reservas de um usuário específico
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de reservas do usuário
 */
export const getUserReservations = async (userId) => {
  const reservationsRef = collection(db, 'reservations');
  const q = query(reservationsRef, where('passengerId', '==', userId));
  
  const snapshot = await getDocs(q);
  const reservations = [];
  
  snapshot.forEach((doc) => {
    reservations.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return reservations;
};

/**
 * Busca reservas para caronas de um motorista específico
 * @param {string} driverId - ID do motorista
 * @returns {Promise<Array>} Lista de reservas para caronas do motorista
 */
export const getDriverReservations = async (driverId) => {
  // Primeiro busca as caronas do motorista
  const ridesRef = collection(db, 'rides');
  const ridesQuery = query(ridesRef, where('driverId', '==', driverId));
  const ridesSnapshot = await getDocs(ridesQuery);
  
  const rideIds = [];
  ridesSnapshot.forEach((doc) => {
    rideIds.push(doc.id);
  });
  
  // Depois busca as reservas para essas caronas
  if (rideIds.length === 0) return [];
  
  const reservationsRef = collection(db, 'reservations');
  const reservationsQuery = query(reservationsRef, where('rideId', 'in', rideIds));
  const reservationsSnapshot = await getDocs(reservationsQuery);
  
  const reservations = [];
  reservationsSnapshot.forEach((doc) => {
    reservations.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return reservations;
};

/**
 * Listener em tempo real para reservas de um usuário
 * @param {string} userId - ID do usuário
 * @param {Function} callback - Função chamada quando as reservas mudam
 * @returns {Function} Função para cancelar o listener
 */
export const subscribeUserReservations = (userId, callback) => {
  const reservationsRef = collection(db, 'reservations');
  const q = query(reservationsRef, where('passengerId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const reservations = [];
    snapshot.forEach((doc) => {
      reservations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(reservations);
  });
};

// ========================================
// FUNÇÕES DE AVALIAÇÃO
// ========================================

/**
 * Cria solicitações de avaliação após completar carona
 * @param {string} rideId - ID da carona
 * @param {string} driverId - ID do motorista
 * @param {string} driverName - Nome do motorista
 * @param {Array} passengers - Lista de passageiros
 */
export const createRatingRequests = async (rideId, driverId, driverName, passengers, rideData) => {
  const ratingsRef = collection(db, 'ratingRequests');
  
  // Para cada passageiro, cria 2 solicitações: driver->passenger e passenger->driver
  for (const passenger of passengers) {
    // Solicitação para motorista avaliar passageiro
    await addDoc(ratingsRef, {
      rideId,
      fromUserId: driverId,
      toUserId: passenger.passengerId,
      fromUserName: driverName,
      toUserName: passenger.passengerName,
      fromUserRole: 'driver',
      toUserRole: 'passenger',
      rideInfo: {
        origin: rideData.origin,
        destination: rideData.destination,
        departureTime: rideData.departureTime,
        completedAt: rideData.completedAt
      },
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    });
    
    // Solicitação para passageiro avaliar motorista  
    await addDoc(ratingsRef, {
      rideId,
      fromUserId: passenger.passengerId,
      toUserId: driverId,
      fromUserName: passenger.passengerName,
      toUserName: driverName,
      fromUserRole: 'passenger',
      toUserRole: 'driver',
      rideInfo: {
        origin: rideData.origin,
        destination: rideData.destination,
        departureTime: rideData.departureTime,
        completedAt: rideData.completedAt
      },
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }
};

/**
 * Submete uma avaliação
 * @param {string} requestId - ID da solicitação de avaliação
 * @param {Object} ratingData - Dados da avaliação
 */
export const submitRating = async (requestId, ratingData) => {
  const ratingsRef = collection(db, 'ratings');
  const requestRef = doc(db, 'ratingRequests', requestId);
  
  // Salva a avaliação
  await addDoc(ratingsRef, {
    ...ratingData,
    createdAt: new Date()
  });
  
  // Marca a solicitação como completa
  await updateDoc(requestRef, {
    status: 'completed',
    completedAt: new Date()
  });
  
  // Atualiza as estatísticas do usuário avaliado
  await updateUserRatingStats(ratingData.toUserId, ratingData.toUserRole, ratingData);
};

/**
 * Atualiza as estatísticas de avaliação do usuário
 * @param {string} userId - ID do usuário avaliado
 * @param {string} role - Role do usuário (driver ou passenger)
 * @param {Object} ratingData - Dados da avaliação
 */
export const updateUserRatingStats = async (userId, role, ratingData) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  
  const roleKey = role === 'driver' ? 'asDriver' : 'asPassenger';
  const currentRatings = userData.ratings?.[roleKey] || {
    average: 0,
    count: 0,
    breakdown: role === 'driver' ? {
      punctuality: 0,
      communication: 0,
      cleanliness: 0,
      behavior: 0
    } : {
      punctuality: 0,
      communication: 0,
      behavior: 0
    }
  };
  
  const newCount = currentRatings.count + 1;
  const categories = ratingData.categories || {};
  
  // Calcula novas médias (apenas para categorias que existem no role)
  const newBreakdown = {};
  Object.keys(currentRatings.breakdown).forEach(key => {
    if (categories[key] !== undefined) {
      newBreakdown[key] = Number(((Number(currentRatings.breakdown[key]) * currentRatings.count) + categories[key]) / newCount);
    } else {
      newBreakdown[key] = Number(currentRatings.breakdown[key]);
    }
  });
  
  const newAverage = ((currentRatings.average * currentRatings.count) + ratingData.rating) / newCount;
  
  // Atualiza o documento do usuário
  await updateDoc(userRef, {
    [`ratings.${roleKey}`]: {
      average: Number(newAverage.toFixed(2)),
      count: newCount,
      breakdown: newBreakdown
    },
    updatedAt: new Date()
  });
};

/**
 * Busca solicitações de avaliação pendentes
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de solicitações pendentes
 */
export const getPendingRatingRequests = async (userId) => {
  const requestsRef = collection(db, 'ratingRequests');
  const q = query(
    requestsRef, 
    where('fromUserId', '==', userId),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Listener em tempo real para solicitações de avaliação pendentes
 * @param {string} userId - ID do usuário
 * @param {Function} callback - Função de callback
 * @returns {Function} Função para cancelar o listener
 */
export const subscribePendingRatingRequests = (userId, callback) => {
  const requestsRef = collection(db, 'ratingRequests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', userId),
    where('status', '==', 'pending')
  );
  
  return onSnapshot(q, (snapshot) => {
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(requests);
  });
};

/**
 * Busca avaliações recebidas por um usuário
 * @param {string} userId - ID do usuário
 * @param {string} role - Role (driver ou passenger)
 * @returns {Promise<Array>} Lista de avaliações recebidas
 */
export const getUserReceivedRatings = async (userId, role) => {
  const ratingsRef = collection(db, 'ratings');
  const q = query(
    ratingsRef,
    where('toUserId', '==', userId),
    where('toUserRole', '==', role)
  );
  
  const snapshot = await getDocs(q);
  const ratings = [];
  
  snapshot.forEach((doc) => {
    ratings.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return ratings.sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Busca avaliações enviadas por um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de avaliações enviadas
 */
export const getUserSentRatings = async (userId) => {
  const ratingsRef = collection(db, 'ratings');
  const q = query(
    ratingsRef,
    where('fromUserId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const ratings = [];
  
  snapshot.forEach((doc) => {
    ratings.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return ratings.sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Busca avaliações de um usuário (compatibilidade - usar getUserReceivedRatings)
 * @deprecated Use getUserReceivedRatings instead
 */
export const getUserRatings = getUserReceivedRatings;

// ========================================
// FUNÇÕES DE HISTÓRICO DE CARONAS
// ========================================

/**
 * Marca uma carona como finalizada e move para o histórico
 * @param {string} rideId - ID da carona
 */
export const completeRide = async (rideId) => {
  const rideRef = doc(db, 'rides', rideId);
  
  // Busca os dados da carona
  const rideSnap = await getDoc(rideRef);
  const rideData = rideSnap.data();
  
  const completedAt = new Date();
  
  // Atualiza o status para completed
  await updateDoc(rideRef, {
    status: 'completed',
    completedAt: completedAt,
    updatedAt: completedAt
  });
  
  // Cria entradas no histórico para o motorista e passageiros
  const historyRef = collection(db, 'rideHistory');
  
  // Histórico do motorista
  await addDoc(historyRef, {
    userId: rideData.driverId,
    rideId: rideId,
    role: 'driver',
    origin: rideData.origin,
    destination: rideData.destination,
    departureTime: rideData.departureTime,
    passengers: rideData.passengers || [],
    price: rideData.price,
    completedAt: completedAt
  });
  
  // Histórico dos passageiros
  const passengers = rideData.passengers || [];
  for (const passenger of passengers) {
    await addDoc(historyRef, {
      userId: passenger.passengerId,
      rideId: rideId,
      role: 'passenger',
      origin: rideData.origin,
      destination: rideData.destination,
      departureTime: rideData.departureTime,
      driverName: rideData.driverName,
      price: rideData.price,
      completedAt: completedAt
    });
  }
  
  // Cria solicitações de avaliação
  if (passengers.length > 0) {
    await createRatingRequests(
      rideId, 
      rideData.driverId, 
      rideData.driverName, 
      passengers,
      { ...rideData, completedAt }
    );
  }
};

/**
 * Busca o histórico de caronas de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de caronas no histórico
 */
export const getUserRideHistory = async (userId) => {
  const historyRef = collection(db, 'rideHistory');
  const q = query(historyRef, where('userId', '==', userId));
  
  const snapshot = await getDocs(q);
  const history = [];
  
  snapshot.forEach((doc) => {
    history.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  // Ordena por data de conclusão (mais recente primeiro)
  return history.sort((a, b) => b.completedAt - a.completedAt);
};

/**
 * Listener em tempo real para histórico de caronas de um usuário
 * @param {string} userId - ID do usuário
 * @param {Function} callback - Função chamada quando o histórico muda
 * @returns {Function} Função para cancelar o listener
 */
export const subscribeUserRideHistory = (userId, callback) => {
  const historyRef = collection(db, 'rideHistory');
  const q = query(historyRef, where('userId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const history = [];
    snapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Ordena por data de conclusão (mais recente primeiro)
    const sortedHistory = history.sort((a, b) => b.completedAt - a.completedAt);
    callback(sortedHistory);
  });
};

// ========================================
// FUNÇÕES DE GERENCIAMENTO DE ROLES
// ========================================

/**
 * Verifica se um usuário tem uma permissão específica
 * @param {Object} user - Dados do usuário
 * @param {string} permission - Permissão a verificar
 * @returns {boolean} Se o usuário tem a permissão
 */
const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  
  // Admin sempre tem todas as permissões
  if (user.role === USER_ROLES.ADMIN) return true;
  
  return user.permissions.includes(permission);
};

/**
 * Verifica se um usuário é administrador
 * @param {Object} user - Dados do usuário
 * @returns {boolean} Se é admin
 */
const isAdmin = (user) => {
  return user && user.role === USER_ROLES.ADMIN;
};

/**
 * Verifica se um usuário é moderador ou admin
 * @param {Object} user - Dados do usuário
 * @returns {boolean} Se é moderador ou admin
 */
const isModerator = (user) => {
  return user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.MODERATOR);
};

/**
 * Promove um usuário para administrador (só admins podem fazer isso)
 * @param {string} adminUserId - ID do admin que está promovendo
 * @param {string} targetUserId - ID do usuário a ser promovido
 */
export const promoteToAdmin = async (adminUserId, targetUserId) => {
  // Verifica se quem está promovendo é admin
  const adminProfile = await getUserProfile(adminUserId);
  if (!isAdmin(adminProfile)) {
    throw new Error('Apenas administradores podem promover outros usuários');
  }
  
  const userRef = doc(db, 'users', targetUserId);
  await updateDoc(userRef, {
    role: USER_ROLES.ADMIN,
    permissions: getDefaultPermissions(USER_ROLES.ADMIN),
    promotedAt: new Date(),
    promotedBy: adminUserId,
    updatedAt: new Date()
  });
  
  // Log da ação administrativa
  await logAdminAction(adminUserId, 'PROMOTE_USER', {
    targetUserId,
    newRole: USER_ROLES.ADMIN
  });
};

/**
 * Remove privilégios administrativos de um usuário
 * @param {string} adminUserId - ID do admin que está removendo
 * @param {string} targetUserId - ID do usuário a perder privilégios
 */
export const demoteUser = async (adminUserId, targetUserId) => {
  // Verifica se quem está removendo é admin
  const adminProfile = await getUserProfile(adminUserId);
  if (!isAdmin(adminProfile)) {
    throw new Error('Apenas administradores podem remover privilégios');
  }
  
  // Não pode remover privilégios de si mesmo
  if (adminUserId === targetUserId) {
    throw new Error('Você não pode remover seus próprios privilégios');
  }
  
  const userRef = doc(db, 'users', targetUserId);
  await updateDoc(userRef, {
    role: USER_ROLES.USER,
    permissions: getDefaultPermissions(USER_ROLES.USER),
    demotedAt: new Date(),
    demotedBy: adminUserId,
    updatedAt: new Date()
  });
  
  // Log da ação administrativa
  await logAdminAction(adminUserId, 'DEMOTE_USER', {
    targetUserId,
    newRole: USER_ROLES.USER
  });
};

/**
 * Bane um usuário do sistema
 * @param {string} adminUserId - ID do admin que está banindo
 * @param {string} targetUserId - ID do usuário a ser banido
 * @param {string} reason - Motivo do banimento
 */
export const banUser = async (adminUserId, targetUserId, reason) => {
  // Verifica permissão
  const adminProfile = await getUserProfile(adminUserId);
  if (!hasPermission(adminProfile, 'users:ban')) {
    throw new Error('Você não tem permissão para banir usuários');
  }
  
  const userRef = doc(db, 'users', targetUserId);
  await updateDoc(userRef, {
    banned: true,
    bannedAt: new Date(),
    bannedBy: adminUserId,
    banReason: reason,
    updatedAt: new Date()
  });
  
  // Log da ação administrativa
  await logAdminAction(adminUserId, 'BAN_USER', {
    targetUserId,
    reason
  });
};

/**
 * Remove o banimento de um usuário
 * @param {string} adminUserId - ID do admin
 * @param {string} targetUserId - ID do usuário
 */
export const unbanUser = async (adminUserId, targetUserId) => {
  // Verifica permissão
  const adminProfile = await getUserProfile(adminUserId);
  if (!hasPermission(adminProfile, 'users:ban')) {
    throw new Error('Você não tem permissão para desbanir usuários');
  }
  
  const userRef = doc(db, 'users', targetUserId);
  await updateDoc(userRef, {
    banned: false,
    unbannedAt: new Date(),
    unbannedBy: adminUserId,
    banReason: null,
    updatedAt: new Date()
  });
  
  // Log da ação administrativa
  await logAdminAction(adminUserId, 'UNBAN_USER', {
    targetUserId
  });
};

/**
 * Registra ações administrativas para auditoria
 * @param {string} adminUserId - ID do admin
 * @param {string} action - Ação realizada
 * @param {Object} details - Detalhes da ação
 */
export const logAdminAction = async (adminUserId, action, details = {}) => {
  const adminLogsRef = collection(db, 'adminLogs');
  
  await addDoc(adminLogsRef, {
    adminUserId,
    action,
    details,
    timestamp: new Date(),
    ipAddress: 'unknown', // Pode ser implementado
    userAgent: 'unknown'  // Pode ser implementado
  });
};

/**
 * Busca logs administrativos (apenas para admins)
 * @param {string} adminUserId - ID do admin consultando
 * @param {number} limit - Limite de registros
 * @returns {Promise<Array>} Lista de logs
 */
export const getAdminLogs = async (adminUserId, limit = 50) => {
  // Verifica se é admin
  const adminProfile = await getUserProfile(adminUserId);
  if (!isAdmin(adminProfile)) {
    throw new Error('Apenas administradores podem visualizar logs');
  }
  
  const logsRef = collection(db, 'adminLogs');
  const q = query(logsRef, limit(limit));
  
  const snapshot = await getDocs(q);
  const logs = [];
  
  snapshot.forEach((doc) => {
    logs.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Busca todos os usuários (apenas para admins e moderadores)
 * @param {string} requesterUserId - ID de quem está consultando
 * @returns {Promise<Array>} Lista de usuários
 */
export const getAllUsers = async (requesterUserId) => {
  // Verifica permissão
  const requesterProfile = await getUserProfile(requesterUserId);
  if (!hasPermission(requesterProfile, 'users:view:all')) {
    throw new Error('Você não tem permissão para visualizar todos os usuários');
  }
  
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  const users = [];
  snapshot.forEach((doc) => {
    const userData = doc.data();
    // Remove informações sensíveis para moderadores
    if (!isAdmin(requesterProfile)) {
      delete userData.email;
      delete userData.phone;
    }
    
    users.push({
      id: doc.id,
      ...userData
    });
  });
  
  return users;
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

// Exporta as configurações de administrador e funções de roles
export { 
  adminConfig, 
  USER_ROLES, 
  PERMISSIONS, 
  getDefaultPermissions,
  hasPermission, 
  isAdmin, 
  isModerator 
};

