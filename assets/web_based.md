import React, { useState, useEffect } from 'react';

// --- MOCK FIREBASE SETUP (for demonstration) ---
// This section simulates Firebase functionality for this environment.
const ADMIN_EMAIL = 'arthwho@gmail.com';

const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: async (email, password) => {
    if (password === 'password') {
      mockAuth.currentUser = { uid: email, email };
      return { user: mockAuth.currentUser };
    }
    throw new Error('Credenciais inválidas');
  },
  createUserWithEmailAndPassword: async (email, password) => {
    mockAuth.currentUser = { uid: email, email };
    return { user: mockAuth.currentUser };
  },
  signInWithGoogle: async () => {
    console.log("Simulating Google Sign-In...");
    const mockUser = { uid: 'usuario.google@gmail.com', email: 'usuario.google@gmail.com' };
    mockAuth.currentUser = mockUser;
    if (!mockDb.users[mockUser.uid]) {
        await mockFirestore.collection('users').doc(mockUser.uid).set({
            email: mockUser.email,
            name: 'Usuário Google',
            isDriver: false,
        });
    }
    return { user: mockUser };
  },
  signOut: async () => {
    mockAuth.currentUser = null;
  },
  onAuthStateChanged: (callback) => {
    return () => {}; // Unsubscribe function
  },
};

const mockFirestore = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      set: async (data) => {
        console.log(`Firestore SET: ${collectionName}/${docId}`, data);
        if (collectionName === 'users') {
            mockDb.users[docId] = data;
        }
      },
      update: async (data) => {
        console.log(`Firestore UPDATE: ${collectionName}/${docId}`, data);
        if (collectionName === 'rides' && mockDb.rides[docId]) {
            mockDb.rides[docId] = { ...mockDb.rides[docId], ...data };
        }
      },
      delete: async () => {
        console.log(`Firestore DELETE: ${collectionName}/${docId}`);
        if (collectionName === 'rides') {
            delete mockDb.rides[docId];
            mockDb.rideOrder = mockDb.rideOrder.filter(id => id !== docId);
        }
      },
      get: async () => {
        console.log(`Firestore GET: ${collectionName}/${docId}`);
        return {
            exists: !!mockDb.users[docId],
            data: () => mockDb.users[docId],
        };
      },
    }),
    add: async (data) => {
      const id = `ride_${Date.now()}`;
      console.log(`Firestore ADD: ${collectionName}/${id}`, data);
      mockDb.rides[id] = { ...data, id };
      mockDb.rideOrder.unshift(id);
      return { id };
    },
    where: (field, op, value) => ({
        onSnapshot: (callback) => {
            console.log(`Firestore SNAPSHOT on ${collectionName}`);
            const ridesArray = mockDb.rideOrder
                .map(id => mockDb.rides[id])
                .filter(ride => ride && ride.status === 'available');
            
            callback({
                docs: ridesArray.map(doc => ({
                    id: doc.id,
                    data: () => doc,
                }))
            });
            return () => {}; // Unsubscribe
        }
    })
  }),
};

let mockDb = {
    users: {},
    rides: {
        'ride_1': { id: 'ride_1', driverName: 'Ana', origin: 'Centro', departureTime: '08:00', availableSeats: 3, status: 'available', createdAt: new Date(Date.now() - 100000).toISOString() },
        'ride_2': { id: 'ride_2', driverName: 'Bruno', origin: 'Bairro de Fátima', departureTime: '07:45', availableSeats: 1, status: 'available', createdAt: new Date(Date.now() - 200000).toISOString() },
    },
    rideOrder: ['ride_1', 'ride_2'], // To maintain order
};
// --- END MOCK FIREBASE SETUP ---


// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState('Auth'); // Auth, Home, OfferRide, FindRide, Profile

  // --- Authentication Effect ---
  useEffect(() => {
    setTimeout(() => {
      const currentUser = mockAuth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        setScreen('Home');
      } else {
        setScreen('Auth');
      }
      setIsLoading(false);
    }, 1500);
  }, []);


  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return <LoadingScreen />;
    }

    switch (screen) {
      case 'Auth':
        return <AuthScreen onAuthSuccess={(authedUser) => { setUser(authedUser); setScreen('Home'); }} />;
      case 'Home':
        return <HomeScreen setScreen={setScreen} />;
      case 'OfferRide':
        return <OfferRideScreen setScreen={setScreen} user={user} />;
      case 'FindRide':
        return <FindRideScreen setScreen={setScreen} user={user}/>;
      case 'Profile':
          return <ProfileScreen setScreen={setScreen} user={user} onSignOut={() => { setUser(null); setScreen('Auth'); }}/>
      default:
        return <AuthScreen onAuthSuccess={(authedUser) => { setUser(authedUser); setScreen('Home'); }} />;
    }
  };

  return (
    <div style={styles.safeArea}>
      <div style={styles.appContainer}>
        <Header title="ICEA Caronas" />
        {renderContent()}
      </div>
    </div>
  );
}

// --- Screens ---

const LoadingScreen = () => (
  <div style={styles.screen}>
    <p style={styles.loadingText}>Carregando...</p>
  </div>
);

const AuthScreen = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
        setError("Por favor, preencha email e senha.");
        return;
    }
    setLoading(true);
    setError('');
    try {
      let response;
      if (isLogin) {
        response = await mockAuth.signInWithEmailAndPassword(email, password);
      } else {
        response = await mockAuth.createUserWithEmailAndPassword(email, password);
        await mockFirestore.collection('users').doc(response.user.uid).set({
            email: response.user.email,
            name: email.split('@')[0],
            isDriver: false,
        });
      }
      onAuthSuccess(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
        const response = await mockAuth.signInWithGoogle();
        onAuthSuccess(response.user);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={styles.screen}>
        <h1 style={styles.title}>{isLogin ? 'Login' : 'Criar Conta'}</h1>
        {error ? <p style={styles.errorText}>{error}</p> : null}
        <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
        />
        <input
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
        />
        <button style={styles.button} onClick={handleAuth} disabled={loading}>
            <span style={styles.buttonText}>{loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Registrar')}</span>
        </button>
        <div style={styles.dividerContainer}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>OU</span>
            <div style={styles.dividerLine}></div>
        </div>
        <button style={{...styles.button, ...styles.googleButton}} onClick={handleGoogleSignIn} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 18 18" style={{marginRight: '10px'}}><path fill="#4285F4" d="M17.64 9.20455c0-.63864-.05727-1.25455-.16818-1.84091H9.18182v3.48182h4.79182c-.20818 1.125-.84182 2.07818-1.77727 2.72182v2.25909h2.90818c1.70182-1.56682 2.68409-3.87409 2.68409-6.62182z"></path><path fill="#34A853" d="M9.18182 18c2.43 0 4.46727-.80545 5.95636-2.18182l-2.90818-2.25909c-.80545.54-1.84091.86136-3.04818.86136-2.34545 0-4.32818-1.58182-5.03727-3.71045H1.19273v2.33182C2.70545 16.14818 5.73409 18 9.18182 18z"></path><path fill="#FBBC05" d="M4.14455 10.8877c-.20818-.61091-.325-1.25455-.325-1.92136s.11682-1.31045.325-1.92136V4.71227H1.19273C.437727 6.13773 0 7.72364 0 9.45455s.437727 3.31682 1.19273 4.74227l2.95182-2.30909z"></path><path fill="#EA4335" d="M9.18182 3.55909c1.32273 0 2.50727.45545 3.44 1.34636l2.58182-2.58182C13.64545.831818 11.60818 0 9.18182 0 2.73409 0 2.70545 1.85182 1.19273 4.71227l2.95182 2.30909c.70909-2.12864 2.69182-3.71045 5.03727-3.71045z"></path></svg>
            <span style={styles.googleButtonText}>Entrar com o Google</span>
        </button>
        <button style={styles.transparentButton} onClick={() => setIsLogin(!isLogin)}>
            <span style={styles.toggleText}>
                {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </span>
        </button>
    </div>
  );
};

const HomeScreen = ({ setScreen }) => (
  <div style={styles.screen}>
    <h1 style={styles.title}>Bem-vindo!</h1>
    <p style={styles.subtitle}>O que você deseja fazer?</p>
    <button style={{...styles.button, ...styles.primaryButton}} onClick={() => setScreen('FindRide')}>
      <span style={styles.buttonText}>Procurar Carona</span>
    </button>
    <button style={{...styles.button, ...styles.secondaryButton}} onClick={() => setScreen('OfferRide')}>
      <span style={styles.buttonText}>Oferecer Carona</span>
    </button>
     <button style={{...styles.button, ...styles.tertiaryButton}} onClick={() => setScreen('Profile')}>
      <span style={styles.buttonText}>Meu Perfil</span>
    </button>
  </div>
);

const OfferRideScreen = ({ setScreen, user }) => {
    const [origin, setOrigin] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [availableSeats, setAvailableSeats] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOfferRide = async () => {
        if (!origin || !departureTime || !availableSeats) {
            setError('Por favor, preencha todos os campos.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const userDoc = await mockFirestore.collection('users').doc(user.uid).get();
            const userName = userDoc.exists ? userDoc.data().name : user.email;

            await mockFirestore.collection('rides').add({
                driverId: user.uid,
                driverName: userName,
                origin,
                destination: 'ICEA - UFOP',
                departureTime,
                availableSeats: parseInt(availableSeats, 10),
                passengers: [],
                status: 'available',
                createdAt: new Date().toISOString(),
            });
            setScreen('Home');
        } catch (err) {
            setError('Não foi possível oferecer a carona. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.scrollScreen}>
            <h1 style={styles.title}>Oferecer Carona</h1>
            {error ? <p style={styles.errorText}>{error}</p> : null}
            <input
                style={styles.input}
                placeholder="Ponto de Partida (Ex: Centro)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
            />
            <input
                style={styles.input}
                placeholder="Horário de Saída (Ex: 07:30)"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
            />
            <input
                style={styles.input}
                placeholder="Vagas Disponíveis"
                value={availableSeats}
                onChange={(e) => setAvailableSeats(e.target.value)}
                type="number"
            />
            <button style={styles.button} onClick={handleOfferRide} disabled={loading}>
                <span style={styles.buttonText}>{loading ? 'Publicando...' : 'Publicar Carona'}</span>
            </button>
            <button style={styles.backButton} onClick={() => setScreen('Home')}>
                <span style={styles.toggleText}>Voltar</span>
            </button>
        </div>
    );
};

const FindRideScreen = ({ setScreen, user }) => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRide, setEditingRide] = useState(null); // State for the ride being edited

    const isAdmin = user?.email === ADMIN_EMAIL;

    useEffect(() => {
        const unsubscribe = mockFirestore
            .collection('rides')
            .where('status', '==', 'available')
            .onSnapshot(querySnapshot => {
                const ridesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setRides(ridesData);
                setLoading(false);
            }, error => {
                console.error("Error fetching rides: ", error);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const handleBookRide = (rideId) => {
        alert(`Reserva para a carona ${rideId} solicitada! (Funcionalidade a ser implementada)`);
    };

    const handleDeleteRide = async (rideId) => {
        if (window.confirm("Tem certeza que deseja excluir esta carona?")) {
            await mockFirestore.collection('rides').doc(rideId).delete();
            // The onSnapshot listener will automatically update the UI
        }
    };

    const handleUpdateRide = async (updatedRide) => {
        await mockFirestore.collection('rides').doc(updatedRide.id).update({
            origin: updatedRide.origin,
            departureTime: updatedRide.departureTime,
            availableSeats: parseInt(updatedRide.availableSeats, 10),
        });
        setEditingRide(null); // Close the modal
    };

    return (
        <div style={styles.scrollScreen}>
            {editingRide && (
                <EditRideModal 
                    ride={editingRide}
                    onSave={handleUpdateRide}
                    onCancel={() => setEditingRide(null)}
                />
            )}
            <h1 style={styles.title}>Caronas Disponíveis</h1>
            {loading ? (
                <p style={styles.loadingText}>Buscando caronas...</p>
            ) : (
                <div style={{width: '100%'}}>
                    {rides.length > 0 ? rides.map(item => (
                        <div key={item.id} style={styles.rideItem}>
                            <p style={styles.rideText}><span style={styles.bold}>Motorista:</span> {item.driverName}</p>
                            <p style={styles.rideText}><span style={styles.bold}>Saída:</span> {item.origin}</p>
                            <p style={styles.rideText}><span style={styles.bold}>Horário:</span> {item.departureTime}</p>
                            <p style={styles.rideText}><span style={styles.bold}>Vagas:</span> {item.availableSeats}</p>
                            
                            {isAdmin ? (
                                <div style={styles.adminControls}>
                                    <button style={{...styles.adminButton, ...styles.editButton}} onClick={() => setEditingRide(item)}>
                                        <span style={styles.bookButtonText}>Editar</span>
                                    </button>
                                    <button style={{...styles.adminButton, ...styles.deleteButton}} onClick={() => handleDeleteRide(item.id)}>
                                        <span style={styles.bookButtonText}>Excluir</span>
                                    </button>
                                </div>
                            ) : (
                                <button style={styles.bookButton} onClick={() => handleBookRide(item.id)}>
                                    <span style={styles.bookButtonText}>Pedir Carona</span>
                                </button>
                            )}
                        </div>
                    )) : <p style={styles.emptyText}>Nenhuma carona disponível no momento.</p>}
                </div>
            )}
            <button style={styles.backButton} onClick={() => setScreen('Home')}>
                <span style={styles.toggleText}>Voltar</span>
            </button>
        </div>
    );
};

const ProfileScreen = ({ setScreen, user, onSignOut }) => {
    const handleSignOut = async () => {
        await mockAuth.signOut();
        onSignOut();
    };

    return (
        <div style={styles.screen}>
            <h1 style={styles.title}>Meu Perfil</h1>
            <p style={styles.subtitle}>Email: {user?.email}</p>
            <button style={styles.button} onClick={handleSignOut}>
                <span style={styles.buttonText}>Sair (Logout)</span>
            </button>
            <button style={styles.backButton} onClick={() => setScreen('Home')}>
                <span style={styles.toggleText}>Voltar</span>
            </button>
        </div>
    );
};


// --- Components ---

const Header = ({ title }) => (
  <div style={styles.header}>
    <h1 style={styles.headerTitle}>{title}</h1>
  </div>
);

const EditRideModal = ({ ride, onSave, onCancel }) => {
    const [origin, setOrigin] = useState(ride.origin);
    const [departureTime, setDepartureTime] = useState(ride.departureTime);
    const [availableSeats, setAvailableSeats] = useState(ride.availableSeats.toString());

    const handleSave = () => {
        onSave({ ...ride, origin, departureTime, availableSeats });
    };

    return (
        <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <h2 style={styles.title}>Editar Carona</h2>
                <input
                    style={styles.input}
                    placeholder="Ponto de Partida"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Horário de Saída"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Vagas Disponíveis"
                    value={availableSeats}
                    onChange={(e) => setAvailableSeats(e.target.value)}
                    type="number"
                />
                <div style={styles.modalButtons}>
                    <button style={{...styles.button, flex: 1, marginRight: 5}} onClick={handleSave}>
                        <span style={styles.buttonText}>Salvar</span>
                    </button>
                    <button style={{...styles.button, flex: 1, marginLeft: 5, backgroundColor: '#718096'}} onClick={onCancel}>
                        <span style={styles.buttonText}>Cancelar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Styles ---
const styles = {
  safeArea: {
    height: '100vh',
    backgroundColor: '#1a202c',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#2d3748',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: 20,
    backgroundColor: '#1a202c',
    textAlign: 'center',
    borderBottom: '1px solid #4a5568',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e2e8f0',
    margin: 0,
  },
  screen: {
    flex: 1,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxSizing: 'border-box',
  },
  scrollScreen: {
    flexGrow: 1,
    padding: '20px',
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    boxSizing: 'border-box',
    paddingBottom: '60px',
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
  input: {
    width: '100%',
    backgroundColor: '#4a5568',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    border: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: '#4299e1',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
      backgroundColor: '#FFFFFF',
      marginBottom: 15,
      border: '1px solid #dadce0',
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
  primaryButton: {
    backgroundColor: '#38b2ac',
  },
  secondaryButton: {
    backgroundColor: '#ed8936',
  },
  tertiaryButton: {
      backgroundColor: '#718096',
  },
  transparentButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      marginTop: 10,
  },
  toggleText: {
    color: '#63b3ed',
  },
  backButton: {
      position: 'absolute',
      bottom: 20,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
  },
  errorText: {
      color: '#fc8181',
      marginBottom: 10,
      textAlign: 'center',
  },
  loadingText: {
      marginTop: 10,
      color: '#fff',
      fontSize: 16,
  },
  rideItem: {
      backgroundColor: '#4a5568',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      width: '100%',
      boxSizing: 'border-box',
  },
  rideText: {
      color: '#e2e8f0',
      fontSize: 16,
      marginBottom: 5,
      margin: 0,
  },
  bold: {
      fontWeight: 'bold',
  },
  bookButton: {
      backgroundColor: '#38b2ac',
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      textAlign: 'center',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
  },
  bookButtonText: {
      color: '#fff',
      fontWeight: 'bold',
  },
  emptyText: {
      color: '#a0aec0',
      textAlign: 'center',
      marginTop: 20,
  },
  dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      margin: '10px 0',
      display: 'flex',
  },
  dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#4a5568',
  },
  dividerText: {
      width: 50,
      textAlign: 'center',
      color: '#a0aec0'
  },
  adminControls: {
      display: 'flex',
      flexDirection: 'row',
      marginTop: 10,
  },
  adminButton: {
      flex: 1,
      padding: 10,
      borderRadius: 5,
      textAlign: 'center',
      border: 'none',
      cursor: 'pointer',
  },
  editButton: {
      backgroundColor: '#ed8936',
      marginRight: 5,
  },
  deleteButton: {
      backgroundColor: '#fc8181',
      marginLeft: 5,
  },
  modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
  },
  modalContent: {
      backgroundColor: '#2d3748',
      padding: 20,
      borderRadius: 8,
      width: '90%',
      maxWidth: 400,
  },
  modalButtons: {
      display: 'flex',
      flexDirection: 'row',
      marginTop: 10,
  }
};
