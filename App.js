import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

// Importação das telas da aplicação
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import OfferRideScreen from './src/screens/OfferRideScreen';
import FindRideScreen from './src/screens/FindRideScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RideHistoryScreen from './src/screens/RideHistoryScreen';
import LoadingScreen from './src/components/LoadingScreen';
import Header from './src/components/Header';
import BottomNavigation from './src/components/BottomNavigation';
import SidebarNavigation from './src/components/SidebarNavigation';
import PassengerManagement from './src/components/PassengerManagement';

// Importação dos serviços Firebase
import { onAuthChanged } from './src/services/firebase';

// Importação do sistema de temas
import { ThemeProvider, useTheme } from './src/hooks/useTheme';

/**
 * Componente principal da aplicação
 * Gerencia o estado global, autenticação e navegação
 */
function AppContent() {
  // ========================================
  // ESTADOS GLOBAIS DA APLICAÇÃO
  // ========================================
  
  // Estado do usuário atual (null se não logado)
  const [user, setUser] = useState(null);
  
  // Estado de carregamento inicial
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado da tela atual (sistema de navegação baseado em estado)
  // Valores possíveis: 'Auth', 'Home', 'OfferRide', 'FindRide', 'Profile'
  const [screen, setScreen] = useState('Auth');
  
  // Hook para acessar o tema atual
  const { theme, isLoaded } = useTheme();

  // ========================================
  // LISTENER DE AUTENTICAÇÃO
  // ========================================
  
  // Configura um listener para mudanças no estado de autenticação
  // É executado sempre que o usuário faz login ou logout
  useEffect(() => {
    // Configura o listener do Firebase Auth
    const unsubscribe = onAuthChanged((currentUser) => {
      if (currentUser) {
        // Se há um usuário logado
        setUser(currentUser);
        setScreen('Home'); // Redireciona para a tela principal
      } else {
        // Se não há usuário logado
        setUser(null);
        setScreen('Auth'); // Redireciona para a tela de autenticação
      }
      setIsLoading(false); // Finaliza o carregamento
    });

    // Função de limpeza (remove o listener quando o componente é desmontado)
    return () => unsubscribe();
  }, []);

  // ========================================
  // LÓGICA DE RENDERIZAÇÃO DAS TELAS
  // ========================================
  
  /**
   * Função que decide qual tela renderizar baseada no estado atual
   * Este é o sistema de navegação da aplicação (não usa roteamento tradicional)
   */
  const renderContent = () => {
    // Se ainda está carregando ou o tema não foi carregado
    if (isLoading || !isLoaded) {
      return <LoadingScreen />;
    }

    // Renderização condicional baseada no estado da tela
    switch (screen) {
      case 'Auth':
        // Tela de autenticação (login/registro)
        return <AuthScreen onAuthSuccess={(authedUser) => {
          console.log('Auth success:', authedUser); // Log para debug
          setUser(authedUser);
          setScreen('Home'); // Navega para a tela principal após login
        }} />;
        
      case 'Home':
        // Tela principal (lista de caronas)
        return <FindRideScreen setScreen={setScreen} user={user} />;
        
      case 'OfferRide':
        // Tela para oferecer carona
        return <OfferRideScreen setScreen={setScreen} user={user} />;
        
      case 'FindRide':
        // Tela para encontrar caronas (mesma da Home)
        return <FindRideScreen setScreen={setScreen} user={user} />;
        
      case 'Profile':
        // Tela de perfil do usuário
        return <ProfileScreen setScreen={setScreen} user={user} onSignOut={() => {
          setUser(null);
          setScreen('Auth'); // Volta para autenticação após logout
        }} />;

      case 'RideHistory':
        // Tela de histórico de caronas
        return <RideHistoryScreen setScreen={setScreen} user={user} />;

      case 'ManagePassengers':
        // Componente de gestão de passageiros
        return <PassengerManagement user={user} />;
        
      default:
        // Fallback para tela de autenticação
        return <AuthScreen onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          setScreen('Home');
        }} />;
    }
  };

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      {/* Barra de status do sistema */}
      <StatusBar style="light" />
      
      {/* Cabeçalho da aplicação */}
      <Header currentScreen={screen} user={user} />
      
      {/* Navegação lateral (apenas na web) */}
      <SidebarNavigation 
        currentScreen={screen} 
        onScreenChange={setScreen}
        user={user}
      />
      
      {/* Área de conteúdo principal */}
      <View style={styles.content}>
        {renderContent()} {/* Renderiza a tela atual */}
      </View>
      
      {/* Navegação inferior (apenas no mobile) */}
      <BottomNavigation 
        currentScreen={screen} 
        onScreenChange={setScreen}
      />
    </View>
  );
}

/**
 * Componente raiz da aplicação
 * Envolve toda a aplicação com o provedor de tema
 */
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
// ========================================
// ESTILOS DA APLICAÇÃO
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa toda a tela disponível
  },
  content: {
    flex: 1, // Ocupa o espaço restante (após header e navegação)
  },
});

