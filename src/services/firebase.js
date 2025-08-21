import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

// Import secure configuration
import { firebaseConfig, googleConfig, adminConfig, validateConfig } from '../config/firebase-config';

// IMPORTANT: Do NOT import firebase/analytics in React Native/Expo Go.
// Analytics only works on web. If needed later, guard with Platform.OS === 'web'.

// Validate configuration on startup
validateConfig();

// Initialize core SDKs
const app = initializeApp(firebaseConfig);

// Auth with React Native persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // In case auth is already initialized (e.g., during HMR)
  auth = getAuth(app);
}

// Firestore
const db = getFirestore(app);

// Auth helpers
const onAuthChanged = (callback) => firebaseOnAuthStateChanged(auth, callback);

const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);

const signOut = () => firebaseSignOut(auth);

// Google Sign-In helper (Expo Proxy approach)
const signInWithGoogle = async () => {
  try {
    console.log('Starting Google Sign-In with Expo Proxy...');
    
    // Use Expo proxy for OAuth (works with Expo Go)
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true, // This is crucial for Expo Go
    });
    
    console.log('Expo Proxy Redirect URI:', redirectUri);

    // Create the auth request
    const request = new AuthSession.AuthRequest({
      clientId: googleConfig.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    });

    console.log('Auth request created, prompting user...');

    // Start the auth session
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    });

    console.log('Auth result type:', result.type);

    if (result.type === 'success') {
      console.log('Auth successful, exchanging code for tokens...');
      
      // Exchange the code for tokens
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: googleConfig.clientId,
          clientSecret: googleConfig.clientSecret,
          code: result.params.code,
          redirectUri,
        },
        {
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
        }
      );

      console.log('Token exchange successful, creating Firebase credential...');

      // Create Firebase credential
      const credential = GoogleAuthProvider.credential(tokenResult.accessToken);
      
      // Sign in to Firebase
      const userCredential = await signInWithCredential(auth, credential);
      
      console.log('Firebase sign-in successful:', userCredential.user.email);
      return userCredential;
    } else {
      console.log('Auth cancelled or failed:', result);
      throw new Error('Google sign-in was cancelled');
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

// Debug function to get redirect URI (Expo Proxy)
const getRedirectUri = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true, // Use Expo proxy
  });
  console.log('Debug - Expo Proxy Redirect URI:', redirectUri);
  return redirectUri;
};

// Alternative Google Sign-In helper (simpler approach)
const signInWithGoogleSimple = async () => {
  try {
    console.log('Starting Simple Google Sign-In...');
    
    // For Expo Go, we need to use a different approach
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true, // This is important for Expo Go
    });
    
    console.log('Simple Redirect URI:', redirectUri);

    const request = new AuthSession.AuthRequest({
      clientId: googleConfig.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    });

    console.log('Simple auth request created, prompting user...');

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    });

    console.log('Simple auth result type:', result.type);

    if (result.type === 'success') {
      console.log('Simple auth successful, exchanging code for tokens...');
      
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: googleConfig.clientId,
          clientSecret: googleConfig.clientSecret,
          code: result.params.code,
          redirectUri,
        },
        {
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
        }
      );

      console.log('Simple token exchange successful, creating Firebase credential...');

      const credential = GoogleAuthProvider.credential(tokenResult.accessToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      console.log('Simple Firebase sign-in successful:', userCredential.user.email);
      return userCredential;
    } else {
      console.log('Simple auth cancelled or failed:', result);
      throw new Error('Google sign-in was cancelled');
    }
  } catch (error) {
    console.error('Simple Google sign-in error:', error);
    throw error;
  }
};

// User profile helpers
const getUserProfile = async (uid) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

const setUserProfile = async (uid, data) => {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, data, { merge: true });
};

// Ride helpers
const addRide = async (ride) => {
  const ridesRef = collection(db, 'rides');
  const docRef = await addDoc(ridesRef, {
    ...ride,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

const subscribeAvailableRides = (callback) => {
  const ridesRef = collection(db, 'rides');
  const q = query(ridesRef, where('status', '==', 'available'));
  return onSnapshot(q, (querySnap) => {
    const data = [];
    querySnap.forEach((d) => data.push({ id: d.id, ...d.data() }));
    callback(data);
  });
};

const updateRide = async (rideId, data) => {
  const ref = doc(db, 'rides', rideId);
  await updateDoc(ref, data);
};

const deleteRide = async (rideId) => {
  const ref = doc(db, 'rides', rideId);
  await deleteDoc(ref);
};

export {
  app,
  auth,
  db,
  onAuthChanged,
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  signInWithGoogleSimple,
  getRedirectUri,
  getUserProfile,
  setUserProfile,
  addRide,
  subscribeAvailableRides,
  updateRide,
  deleteRide,
  adminConfig,
};


