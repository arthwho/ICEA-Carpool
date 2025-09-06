import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { subscribeUserRideHistory } from '../services/firebase';
import { ResponsiveContainer, MobileContainer, ResponsiveGrid, ResponsiveCard } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../hooks/useTheme';
import BackgroundPattern from '../components/BackgroundPattern';

/**
 * Tela para visualizar o histórico de caronas do usuário
 * Mostra tanto caronas como motorista quanto como passageiro
 * @param {Function} setScreen - Função para navegar entre telas
 * @param {Object} user - Dados do usuário logado
 */
const RideHistoryScreen = ({ setScreen, user }) => {
  // ========================================
  // ESTADOS DA TELA
  // ========================================
  
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'driver', 'passenger'
  
  // ========================================
  // HOOKS PARA RESPONSIVIDADE E TEMA
  // ========================================
  
  const { isMobile } = useResponsive();
  const { theme } = useTheme();

  // ========================================
  // LISTENER EM TEMPO REAL PARA HISTÓRICO
  // ========================================
  
  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = subscribeUserRideHistory(user.uid, (history) => {
      setRideHistory(history);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================
  
  /**
   * Filtra o histórico baseado no filtro selecionado
   */
  const getFilteredHistory = () => {
    if (filter === 'all') return rideHistory;
    return rideHistory.filter(ride => ride.role === filter);
  };

  /**
   * Formata a data para exibição
   */
  const formatDate = (dateField) => {
    if (!dateField) return 'Data não disponível';
    
    let date;
    if (dateField.seconds) {
      // Timestamp do Firestore
      date = new Date(dateField.seconds * 1000);
    } else if (dateField instanceof Date) {
      date = dateField;
    } else {
      date = new Date(dateField);
    }
    
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Retorna estatísticas do histórico
   */
  const getStats = () => {
    const asDriver = rideHistory.filter(ride => ride.role === 'driver').length;
    const asPassenger = rideHistory.filter(ride => ride.role === 'passenger').length;
    const totalMoney = rideHistory.reduce((sum, ride) => {
      if (ride.role === 'driver') {
        // Como motorista, multiplica pelo número de passageiros
        return sum + (ride.price * (ride.passengers?.length || 0));
      } else {
        // Como passageiro, apenas o preço pago
        return sum + (ride.price || 0);
      }
    }, 0);

    return { asDriver, asPassenger, totalMoney };
  };

  // ========================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ========================================
  
  /**
   * Renderiza os botões de filtro
   */
  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: filter === 'all' ? theme.interactive.active : theme.surface.primary,
            borderColor: filter === 'all' ? theme.interactive.active : theme.border.primary,
          }
        ]}
        onPress={() => setFilter('all')}
      >
        <Text style={[
          styles.filterButtonText,
          {
            color: filter === 'all' ? theme.text.inverse : theme.text.primary
          }
        ]}>
          Todas
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: filter === 'driver' ? theme.interactive.active : theme.surface.primary,
            borderColor: filter === 'driver' ? theme.interactive.active : theme.border.primary,
          }
        ]}
        onPress={() => setFilter('driver')}
      >
        <Text style={[
          styles.filterButtonText,
          {
            color: filter === 'driver' ? theme.text.inverse : theme.text.primary
          }
        ]}>
          Como Motorista
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: filter === 'passenger' ? theme.interactive.active : theme.surface.primary,
            borderColor: filter === 'passenger' ? theme.interactive.active : theme.border.primary,
          }
        ]}
        onPress={() => setFilter('passenger')}
      >
        <Text style={[
          styles.filterButtonText,
          {
            color: filter === 'passenger' ? theme.text.inverse : theme.text.primary
          }
        ]}>
          Como Passageiro
        </Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renderiza o card de estatísticas
   */
  const renderStats = () => {
    const stats = getStats();
    
    return (
      <ResponsiveCard style={[styles.statsCard, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}>
        <Text style={[styles.statsTitle, { color: theme.text.primary }]}>
          Estatísticas Gerais
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.interactive.active }]}>
              {stats.asDriver}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
              Como Motorista
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.status.available }]}>
              {stats.asPassenger}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
              Como Passageiro
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text.primary }]}>
              R$ {stats.totalMoney.toFixed(2).replace('.', ',')}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
              Valor Total
            </Text>
          </View>
        </View>
      </ResponsiveCard>
    );
  };

  /**
   * Renderiza um item do histórico
   */
  const renderHistoryItem = (item) => (
    <ResponsiveCard
      key={item.id}
      style={[styles.historyCard, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.routeText, { color: theme.text.primary }]}>
          {item.origin} → {item.destination}
        </Text>
        <View style={[
          styles.roleTag,
          {
            backgroundColor: item.role === 'driver' 
              ? theme.interactive.active + '20' 
              : theme.status.available + '20'
          }
        ]}>
          <Text style={[
            styles.roleText,
            {
              color: item.role === 'driver' 
                ? theme.interactive.active 
                : theme.status.available
            }
          ]}>
            {item.role === 'driver' ? 'Motorista' : 'Passageiro'}
          </Text>
        </View>
      </View>

      <Text style={[styles.dateText, { color: theme.text.tertiary }]}>
        Partida: {item.departureTime}
      </Text>
      
      <Text style={[styles.dateText, { color: theme.text.tertiary }]}>
        Finalizada: {formatDate(item.completedAt)}
      </Text>

      {item.role === 'driver' && (
        <View style={styles.driverInfo}>
          <Text style={[styles.passengerCount, { color: theme.text.secondary }]}>
            Passageiros: {item.passengers?.length || 0}
          </Text>
          {item.passengers && item.passengers.length > 0 && (
            <View style={styles.passengerList}>
              {item.passengers.map((passenger, index) => (
                <Text
                  key={index}
                  style={[styles.passengerName, { color: theme.text.tertiary }]}
                >
                  • {passenger.passengerName}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {item.role === 'passenger' && item.driverName && (
        <Text style={[styles.driverName, { color: theme.text.secondary }]}>
          Motorista: {item.driverName}
        </Text>
      )}

      <View style={styles.priceContainer}>
        <Text style={[styles.priceLabel, { color: theme.text.tertiary }]}>
          {item.role === 'driver' ? 'Valor arrecadado:' : 'Valor pago:'}
        </Text>
        {!item.price || item.price === 0 ? (
          <Text style={[styles.priceValue, { color: theme.status.available }]}>Gratuito</Text>
        ) : (
          <Text style={[styles.priceValue, { color: theme.text.primary }]}>
            R$ {(item.role === 'driver' 
              ? item.price * (item.passengers?.length || 0)
              : item.price
            ).toFixed(2).replace('.', ',')}
          </Text>
        )}
      </View>
    </ResponsiveCard>
  );

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  // Escolhe o container baseado na plataforma
  const Container = isMobile ? MobileContainer : ResponsiveContainer;

  // Tela de carregamento
  if (loading) {
    return (
      <Container style={styles.loadingContainer} user={user}>
        <ActivityIndicator size="large" color={theme.interactive.active} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          Carregando histórico...
        </Text>
      </Container>
    );
  }

  const filteredHistory = getFilteredHistory();

  return (
    <Container style={styles.container} user={user}>
      <BackgroundPattern variant="default">
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Estatísticas */}
        {rideHistory.length > 0 && renderStats()}

        {/* Filtros */}
        {rideHistory.length > 0 && renderFilterButtons()}

        {/* Lista do histórico */}
        {filteredHistory.length > 0 ? (
          <ResponsiveGrid>
            {filteredHistory.map(renderHistoryItem)}
          </ResponsiveGrid>
        ) : rideHistory.length > 0 ? (
          <Text style={[styles.noResultsText, { color: theme.text.tertiary }]}>
            Nenhuma carona encontrada com o filtro selecionado.
          </Text>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              Nenhuma carona no histórico
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.text.tertiary }]}>
              Quando você completar caronas, elas aparecerão aqui.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.interactive.active }]}
              onPress={() => setScreen('Home')}
            >
              <Text style={[styles.actionButtonText, { color: theme.text.inverse }]}>
                Procurar Caronas
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </BackgroundPattern>
    </Container>
  );
};

// ========================================
// ESTILOS DA TELA
// ========================================

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
    marginTop: 10,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80,
  },
  statsCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    marginBottom: 4,
  },
  driverInfo: {
    marginTop: 8,
  },
  passengerCount: {
    fontSize: 14,
    marginBottom: 4,
  },
  passengerList: {
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 12,
    marginBottom: 2,
  },
  driverName: {
    fontSize: 14,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RideHistoryScreen;