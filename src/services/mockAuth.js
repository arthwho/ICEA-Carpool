// Mock authentication service for development
// Replace with real Firebase or other auth service later

const ADMIN_EMAIL = 'arthwho@gmail.com';

const mockAuth = {
  currentUser: null,
  
  signInWithEmailAndPassword: async (email, password) => {
    if (password === 'password') {
      const user = { uid: email, email };
      mockAuth.currentUser = user;
      return { user };
    }
    throw new Error('Credenciais inválidas');
  },
  
  createUserWithEmailAndPassword: async (email, password) => {
    const user = { uid: email, email };
    mockAuth.currentUser = user;
    return { user };
  },
  
  signInWithGoogle: async () => {
    console.log("Simulating Google Sign-In...");
    const mockUser = { uid: 'usuario.google@gmail.com', email: 'usuario.google@gmail.com' };
    mockAuth.currentUser = mockUser;
    return { user: mockUser };
  },
  
  signOut: async () => {
    mockAuth.currentUser = null;
  },
  
  onAuthStateChanged: (callback) => {
    // Simulate auth state change
    if (mockAuth.currentUser) {
      callback(mockAuth.currentUser);
    }
    return () => {}; // Unsubscribe function
  },
};

export { mockAuth, ADMIN_EMAIL };
