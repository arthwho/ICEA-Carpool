import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { 
  approveReservation, 
  rejectReservation, 
  completeRide,
  subscribeAvailableRides 
} from '../services/firebase';
import { useTheme } from '../hooks/useTheme';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from './CustomAlert';
import BackgroundPattern from './BackgroundPattern';

/**
 * Componente para gestão de passageiros pelo motorista
 * Permite aprovar/rejeitar pedidos e gerenciar caronas ativas
 * @param {Object} user - Dados do usuário logado (motorista)
 */
const PassengerManagement = ({ user }) => {
  // ========================================
  // ESTADOS DO COMPONENTE
  // ========================================
  
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  
  // ========================================
  // HOOKS PARA TEMA E ALERTAS
  // ========================================
  
  const { theme } = useTheme();
  const { showAlert, alertState, closeAlert } = useCustomAlert();

  // ========================================
  // LISTENER EM TEMPO REAL PARA CARONAS DO MOTORISTA
  // ========================================
  
  useEffect(() => {
    if (!user?.uid) return;
    
    // Listener para caronas disponíveis do motorista
    const unsubscribe = subscribeAvailableRides((allRides) => {
      // Filtra apenas as caronas do motorista atual
      const driverRides = allRides.filter(ride => ride.driverId === user.uid);
      setMyRides(driverRides);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ========================================
  // FUNÇÕES DE GESTÃO DE PASSAGEIROS
  // ========================================
  
  /**
   * Aprova um pedido de reserva
   * @param {string} rideId - ID da carona
   * @param {string} passengerId - ID do passageiro
   */
  const handleApprove = async (rideId, passengerId) => {
    setProcessingRequest(`${rideId}_${passengerId}_approve`);
    try {
      await approveReservation(rideId, passengerId);
      showAlert('Sucesso', 'Reserva aprovada com sucesso!');
    } catch (error) {
      console.error('Error approving reservation:', error);
      showAlert('Erro', 'Não foi possível aprovar a reserva.');
    } finally {
      setProcessingRequest(null);
    }
  };

  /**
   * Rejeita um pedido de reserva
   * @param {string} rideId - ID da carona
   * @param {string} passengerId - ID do passageiro
   */
  const handleReject = async (rideId, passengerId) => {
    setProcessingRequest(`${rideId}_${passengerId}_reject`);
    try {
      await rejectReservation(rideId, passengerId);
      showAlert('Reserva Rejeitada', 'O passageiro foi notificado.');
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      showAlert('Erro', 'Não foi possível rejeitar a reserva.');
    } finally {
      setProcessingRequest(null);
    }
  };

  /**
   * Marca uma carona como finalizada
   * @param {string} rideId - ID da carona
   */
  const handleCompleteRide = async (rideId) => {
    showAlert(
      'Finalizar Carona',
      'Tem certeza que deseja marcar esta carona como finalizada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'default',
          onPress: async () => {
            setProcessingRequest(`${rideId}_complete`);
            try {
              await completeRide(rideId);
              showAlert(
                'Carona Finalizada!', 
                'A carona foi finalizada com sucesso. Você e os passageiros poderão se avaliar mutuamente no seu perfil.',
                [
                  { text: 'OK', style: 'default' }
                ]
              );
            } catch (error) {
              console.error('Error completing ride:', error);
              showAlert('Erro', 'Não foi possível finalizar a carona.');
            } finally {
              setProcessingRequest(null);
            }
          }
        }
      ]
    );
  };

  // ========================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ========================================
  
  /**
   * Renderiza um card de passageiro pendente
   */
  const renderPendingRequest = (ride, request) => (
    <View
      key={`${ride.id}_${request.passengerId}`}
      style={[styles.requestCard, { backgroundColor: theme.surface.elevated }]}
    >
      <Text style={[styles.passengerName, { color: theme.text.primary }]}>
        {request.passengerName}
      </Text>
      <Text style={[styles.requestTime, { color: theme.text.tertiary }]}>
        Solicitou em: {new Date(request.requestedAt?.seconds * 1000).toLocaleString()}
      </Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.approveButton, { backgroundColor: theme.status.available }]}
          onPress={() => handleApprove(ride.id, request.passengerId)}
          disabled={processingRequest === `${ride.id}_${request.passengerId}_approve`}
        >
          {processingRequest === `${ride.id}_${request.passengerId}_approve` ? (
            <ActivityIndicator size="small" color={theme.text.inverse} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Aprovar</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.rejectButton, { backgroundColor: theme.interactive.button.danger }]}
          onPress={() => handleReject(ride.id, request.passengerId)}
          disabled={processingRequest === `${ride.id}_${request.passengerId}_reject`}
        >
          {processingRequest === `${ride.id}_${request.passengerId}_reject` ? (
            <ActivityIndicator size="small" color={theme.text.inverse} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Rejeitar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Renderiza um card de passageiro confirmado
   */
  const renderConfirmedPassenger = (passenger) => (
    <View
      key={passenger.passengerId}
      style={[styles.passengerCard, { backgroundColor: theme.surface.elevated }]}
    >
      <Text style={[styles.passengerName, { color: theme.text.primary }]}>
        {passenger.passengerName}
      </Text>
      <Text style={[styles.confirmedText, { color: theme.status.available }]}>
        ✓ Confirmado
      </Text>
    </View>
  );

  /**
   * Renderiza um card de pessoa na lista de espera
   */
  const renderWaitingListItem = (item) => (
    <View
      key={item.passengerId}
      style={[styles.waitingCard, { backgroundColor: theme.surface.elevated }]}
    >
      <Text style={[styles.passengerName, { color: theme.text.primary }]}>
        {item.passengerName}
      </Text>
      <Text style={[styles.waitingText, { color: theme.interactive.active }]}>
        Na lista de espera
      </Text>
    </View>
  );

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.interactive.active} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          Carregando suas caronas...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackgroundPattern variant="secondary">
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onClose={closeAlert}
        />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {myRides.length === 0 ? (
          <Text style={[styles.noRidesText, { color: theme.text.tertiary }]}>
            Você não tem caronas ativas no momento.
          </Text>
        ) : (
          myRides.map((ride) => (
            <View
              key={ride.id}
              style={[styles.rideCard, { backgroundColor: theme.surface.primary }]}
            >
              {/* Informações da carona */}
              <View style={styles.rideHeader}>
                <Text style={[styles.rideTitle, { color: theme.text.primary }]}>
                  {ride.origin} → ICEA
                </Text>
                <Text style={[styles.rideTime, { color: theme.text.secondary }]}>
                  {ride.departureTime}
                </Text>
              </View>

              {/* Estatísticas da carona */}
              <View style={styles.statsContainer}>
                <Text style={[styles.statsText, { color: theme.text.tertiary }]}>
                  Confirmados: {ride.passengers?.length || 0}/{ride.availableSeats}
                </Text>
                <Text style={[styles.statsText, { color: theme.text.tertiary }]}>
                  Pendentes: {ride.pendingRequests?.length || 0}
                </Text>
                <Text style={[styles.statsText, { color: theme.text.tertiary }]}>
                  Lista de espera: {ride.waitingList?.length || 0}
                </Text>
              </View>

              {/* Pedidos pendentes */}
              {ride.pendingRequests && ride.pendingRequests.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.interactive.active }]}>
                    Pedidos Pendentes
                  </Text>
                  {ride.pendingRequests.map((request) => renderPendingRequest(ride, request))}
                </View>
              )}

              {/* Passageiros confirmados */}
              {ride.passengers && ride.passengers.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.status.available }]}>
                    Passageiros Confirmados
                  </Text>
                  {ride.passengers.map(renderConfirmedPassenger)}
                </View>
              )}

              {/* Lista de espera */}
              {ride.waitingList && ride.waitingList.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
                    Lista de Espera
                  </Text>
                  {ride.waitingList.map(renderWaitingListItem)}
                </View>
              )}

              {/* Botão para finalizar carona */}
              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: theme.interactive.button.primary }]}
                onPress={() => handleCompleteRide(ride.id)}
                disabled={processingRequest === `${ride.id}_complete`}
              >
                {processingRequest === `${ride.id}_complete` ? (
                  <ActivityIndicator size="small" color={theme.text.inverse} />
                ) : (
                  <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
                    Finalizar Carona
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      </BackgroundPattern>
    </View>
  );
};

// ========================================
// ESTILOS DO COMPONENTE
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
    padding: 16,
    paddingBottom: 80,
  },
  noRidesText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  rideCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rideHeader: {
    marginBottom: 12,
  },
  rideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rideTime: {
    fontSize: 16,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requestCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  passengerCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waitingCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestTime: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  confirmedText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  waitingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  completeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PassengerManagement;