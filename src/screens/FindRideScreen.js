import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { 
  subscribeAvailableRides, 
  deleteRide as dbDeleteRide, 
  requestRide,
  getUserProfile,
  hasPermission,
  isAdmin 
} from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useTheme } from '../hooks/useTheme';
import CustomAlert from '../components/CustomAlert';
import RideCard from '../components/RideCard';
import RideFilters from '../components/RideFilters';
import { useEntranceAnimation } from '../hooks/useAnimations';

/**
 * Tela para encontrar e visualizar caronas disponíveis
 * Utiliza listener em tempo real para atualizações automáticas
 * @param {Function} setScreen - Função para navegar entre telas
 * @param {Object} user - Dados do usuário logado
 */
const FindRideScreen = ({ setScreen, user }) => {
  // ========================================
  // ESTADOS DA TELA
  // ========================================
  
  // Lista de caronas disponíveis (atualizada em tempo real)
  const [rides, setRides] = useState([]);
  
  // Estado de carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Estados para reserva de carona
  const [requestingRide, setRequestingRide] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Estados para filtros e UI
  const [filters, setFilters] = useState({});
  const [filteredRides, setFilteredRides] = useState([]);
  
  // ========================================
  // HOOKS PARA RESPONSIVIDADE E TEMA
  // ========================================
  
  const { isMobile } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();
  const { theme } = useTheme();
  const { scaleAnim, pressAnimation } = useEntranceAnimation();

  // ========================================
  // VERIFICAÇÃO DE ADMINISTRADOR
  // ========================================
  
  // Verifica se o usuário atual é administrador
  // Administradores podem excluir caronas
  const userIsAdmin = userProfile && isAdmin(userProfile);

  // ========================================
  // LISTENER EM TEMPO REAL PARA CARONAS
  // ========================================
  
  /**
   * Configura um listener em tempo real para caronas disponíveis
   * Este listener é executado sempre que há mudanças na coleção 'rides'
   * Não precisa recarregar manualmente - atualiza automaticamente
   */
  useEffect(() => {
    // Configura o listener do Firestore
    // subscribeAvailableRides retorna uma função para cancelar o listener
    const unsubscribe = subscribeAvailableRides((fetchedRides) => {
      // Esta função é chamada sempre que os dados mudam no Firestore
      setRides(fetchedRides); // Atualiza a lista de caronas
      setLoading(false);      // Finaliza o carregamento
    });

    // Função de limpeza - remove o listener quando o componente é desmontado
    // Isso evita vazamentos de memória e listeners desnecessários
    return () => unsubscribe();
  }, []);

  /**
   * Carrega o perfil do usuário para obter informações necessárias para reserva
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.uid]);

  /**
   * Aplica filtros às caronas sempre que a lista ou filtros mudam
   */
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...rides];

      // Filtro de busca por origem
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        filtered = filtered.filter(ride => 
          ride.origin.toLowerCase().includes(searchTerm) ||
          ride.driverName.toLowerCase().includes(searchTerm)
        );
      }

      // Filtro de preço
      if (filters.priceRange && filters.priceRange !== 'all') {
        if (filters.priceRange === 'free') {
          filtered = filtered.filter(ride => !ride.price || ride.price === 0);
        } else if (filters.priceRange === 'paid') {
          filtered = filtered.filter(ride => ride.price && ride.price > 0);
        }
      }

      // Filtro de vagas disponíveis
      if (filters.availableSeats && filters.availableSeats !== 'all') {
        const minSeats = parseInt(filters.availableSeats);
        filtered = filtered.filter(ride => {
          const availableSeats = ride.availableSeats - (ride.passengers?.length || 0);
          return availableSeats >= minSeats;
        });
      }

      // Filtro de horário
      if (filters.timeRange && filters.timeRange !== 'all') {
        filtered = filtered.filter(ride => {
          const time = ride.departureTime;
          const hour = parseInt(time.split(':')[0]);
          
          switch (filters.timeRange) {
            case 'morning':
              return hour >= 6 && hour < 12;
            case 'afternoon':
              return hour >= 12 && hour < 18;
            case 'evening':
              return hour >= 18 || hour < 6;
            default:
              return true;
          }
        });
      }

      setFilteredRides(filtered);
    };

    applyFilters();
  }, [rides, filters]);

  // ========================================
  // FUNÇÕES DE GESTÃO DE CARONAS
  // ========================================
  
  /**
   * Função para solicitar uma reserva de carona
   * @param {string} rideId - ID da carona
   */
  const handleRequestRide = async (rideId) => {
    // Verifica se o usuário não é o próprio motorista
    const ride = rides.find(r => r.id === rideId);
    if (ride?.driverId === user?.uid) {
      showAlert('Erro', 'Você não pode reservar sua própria carona.');
      return;
    }

    // Verifica se o usuário já fez um pedido para esta carona
    if (ride?.pendingRequests?.some(req => req.passengerId === user?.uid) ||
        ride?.passengers?.some(p => p.passengerId === user?.uid) ||
        ride?.waitingList?.some(w => w.passengerId === user?.uid)) {
      showAlert('Aviso', 'Você já solicitou uma reserva para esta carona.');
      return;
    }

    // Verifica se o perfil do usuário está carregado
    if (!userProfile) {
      showAlert('Erro', 'Carregando informações do perfil. Tente novamente.');
      return;
    }

    setRequestingRide(rideId);
    try {
      // Prepara as informações do passageiro
      const passengerInfo = {
        name: userProfile.name || 
              `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 
              user.email?.split('@')[0] || 
              'Usuário',
        phone: userProfile.phone || 'Não informado'
      };

      await requestRide(rideId, user.uid, passengerInfo);
      
      // Verifica se foi para lista de espera ou pendentes
      const updatedRide = rides.find(r => r.id === rideId);
      const currentRequests = updatedRide?.pendingRequests?.length || 0;
      
      if (currentRequests >= updatedRide?.availableSeats) {
        showAlert(
          'Na Lista de Espera', 
          'A carona está lotada. Você foi adicionado à lista de espera e será notificado se uma vaga abrir.'
        );
      } else {
        showAlert(
          'Solicitação Enviada', 
          'Sua solicitação foi enviada ao motorista. Você receberá uma confirmação em breve.'
        );
      }
    } catch (error) {
      console.error('Error requesting ride:', error);
      showAlert('Erro', 'Não foi possível solicitar a reserva. Tente novamente.');
    } finally {
      setRequestingRide(null);
    }
  };

  /**
   * Função para excluir uma carona (apenas para administradores)
   * Remove a carona do Firestore, que automaticamente atualiza a lista
   * @param {string} rideId - ID da carona a ser excluída
   */
  const handleDeleteRide = (rideId) => {
    // Mostra um alerta de confirmação antes de excluir
    showAlert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta carona?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('Exclusão cancelada'),
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove a carona do Firestore
              await dbDeleteRide(rideId);
              
              // Como o listener está ativo, a lista será atualizada automaticamente
              // Não precisamos atualizar o estado manualmente
              showAlert('Sucesso', 'Carona excluída com sucesso!');
            } catch (error) {
              console.error('Error deleting ride:', error);
              showAlert('Erro', 'Não foi possível excluir a carona.');
            }
          },
        },
      ]
    );
  };

  // ========================================
  // FUNÇÕES AUXILIARES PARA RENDERIZAÇÃO
  // ========================================
  
  /**
   * Determina o status do usuário para uma carona específica
   */
  const getUserStatusForRide = (ride) => {
    if (ride.driverId === user?.uid) return 'own';
    
    const hasRequested = ride.pendingRequests?.some(req => req.passengerId === user?.uid);
    const isConfirmed = ride.passengers?.some(p => p.passengerId === user?.uid);
    const isWaiting = ride.waitingList?.some(w => w.passengerId === user?.uid);
    
    if (isConfirmed) return 'confirmed';
    if (hasRequested) return 'pending';
    if (isWaiting) return 'waiting';
    return 'available';
  };

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  // Escolhe o container baseado na plataforma (mobile ou web)
  const Container = isMobile ? MobileContainer : ResponsiveContainer;

  // Tela de carregamento enquanto os dados estão sendo buscados
  if (loading) {
    const LoadingContainer = isMobile ? MobileContainer : ResponsiveContainer;
    return (
      <LoadingContainer style={styles.loadingContainer} user={user}>
        <ActivityIndicator size="large" color={theme.interactive.active} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>Buscando caronas...</Text>
      </LoadingContainer>
    );
  }

  return (
    <Container style={styles.container} user={user}>
      {/* Alerta customizado para web */}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={closeAlert}
      />
      
      {/* Container principal com padding responsivo */}
      <View style={styles.contentContainer}>
        

        {/* Filtros */}
        <RideFilters
          onFiltersChange={setFilters}
          ridesCount={filteredRides.length}
          initialFilters={filters}
        />

        {/* Lista de caronas */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRides.length > 0 ? (
            <>
              {filteredRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  userStatus={getUserStatusForRide(ride)}
                  isRequesting={requestingRide === ride.id}
                  showAdminActions={userIsAdmin}
                  onPress={() => handleRequestRide(ride.id)}
                  onAdminAction={handleDeleteRide}
                />
              ))}
            </>
          ) : rides.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateIcon, { color: theme.text.tertiary }]}>🚗</Text>
              <Text style={[styles.emptyStateTitle, { color: theme.text.primary }]}>
                Nenhuma carona disponível
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.text.tertiary }]}>
                Seja o primeiro a oferecer uma carona!
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateIcon, { color: theme.text.tertiary }]}>🔍</Text>
              <Text style={[styles.emptyStateTitle, { color: theme.text.primary }]}>
                Nenhuma carona encontrada
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.text.tertiary }]}>
                Tente ajustar seus filtros de busca
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Floating Action Button para Oferecer Carona */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.interactive.active }]}
            onPress={() => {
              pressAnimation(() => setScreen('OfferRide'));
            }}
            activeOpacity={0.9}
          >
            <Text style={[styles.fabText, { color: theme.text.inverse }]}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    fontWeight: '300',
  },
});

export default FindRideScreen;
