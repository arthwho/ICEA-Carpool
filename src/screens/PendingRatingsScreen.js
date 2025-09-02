import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  subscribePendingRatingRequests,
  submitRating,
} from '../services/firebase';
import { useTheme } from '../hooks/useTheme';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import RatingModal from '../components/RatingModal';
import BackgroundPattern from '../components/BackgroundPattern';

/**
 * Tela para exibir e gerenciar avaliações pendentes
 * @param {Object} user - Dados do usuário logado
 */
const PendingRatingsScreen = ({ user }) => {
  // Estados do componente
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Hooks
  const { theme } = useTheme();
  const { showAlert, alertState, closeAlert } = useCustomAlert();

  // Listener para solicitações pendentes
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribePendingRatingRequests(user.uid, (requests) => {
      setPendingRequests(requests);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Função para refresh manual
  const handleRefresh = () => {
    setRefreshing(true);
  };

  // Abre modal de avaliação
  const openRatingModal = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  // Fecha modal de avaliação
  const closeRatingModal = () => {
    setSelectedRequest(null);
    setModalVisible(false);
  };

  // Submete avaliação
  const handleSubmitRating = async (ratingData) => {
    setSubmittingRating(true);
    try {
      await submitRating(ratingData.requestId, ratingData);
      showAlert('Sucesso', 'Avaliação enviada com sucesso!');
      closeRatingModal();
    } catch (error) {
      console.error('Error submitting rating:', error);
      showAlert('Erro', 'Não foi possível enviar a avaliação. Tente novamente.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Renderiza card de solicitação de avaliação
  const renderRatingRequest = (request) => {
    const isDriverRating = request.toUserRole === 'driver';
    const timeRemaining = Math.max(0, Math.ceil((new Date(request.expiresAt?.seconds * 1000) - new Date()) / (24 * 60 * 60 * 1000)));

    return (
      <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.surface.primary }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.roleContainer}>
            <View style={[styles.roleIcon, { backgroundColor: isDriverRating ? theme.interactive.active + '20' : theme.status.available + '20' }]}>
              <Text style={styles.roleEmoji}>
                {isDriverRating ? '🚗' : '👤'}
              </Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={[styles.roleTitle, { color: theme.text.primary }]}>
                Avaliar {isDriverRating ? 'Motorista' : 'Passageiro'}
              </Text>
              <Text style={[styles.userName, { color: theme.text.secondary }]}>
                {request.toUserName}
              </Text>
            </View>
          </View>

          {timeRemaining > 0 && (
            <View style={[styles.timeBadge, { backgroundColor: timeRemaining <= 1 ? theme.status.error + '20' : theme.status.warning + '20' }]}>
              <Text style={[styles.timeText, { 
                color: timeRemaining <= 1 ? theme.status.error : theme.status.warning 
              }]}>
                {timeRemaining === 1 ? 'Expira hoje' : `${timeRemaining} dias`}
              </Text>
            </View>
          )}
        </View>

        {/* Informações da carona */}
        <View style={[styles.rideInfo, { backgroundColor: theme.surface.secondary }]}>
          <View style={styles.routeContainer}>
            <Text style={[styles.routeText, { color: theme.text.primary }]}>
              {request.rideInfo.origin}
            </Text>
            <View style={[styles.routeArrow, { backgroundColor: theme.text.tertiary }]} />
            <Text style={[styles.routeText, { color: theme.text.primary }]}>
              {request.rideInfo.destination}
            </Text>
          </View>
          <Text style={[styles.rideDate, { color: theme.text.tertiary }]}>
            {new Date(request.rideInfo.departureTime).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {/* Botão de avaliar */}
        <TouchableOpacity
          style={[styles.rateButton, { backgroundColor: theme.interactive.active }]}
          onPress={() => openRatingModal(request)}
        >
          <Text style={[styles.rateButtonText, { color: theme.text.inverse }]}>
            ⭐ Avaliar Agora
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.interactive.active} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          Carregando avaliações pendentes...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <BackgroundPattern>
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onClose={closeAlert}
        />

        <RatingModal
          visible={modalVisible}
          ratingRequest={selectedRequest}
          onSubmit={handleSubmitRating}
          onClose={closeRatingModal}
          loading={submittingRating}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.interactive.active]}
              tintColor={theme.interactive.active}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              Avaliações Pendentes
            </Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Avalie suas experiências de carona
            </Text>
          </View>

          {/* Lista de solicitações */}
          {pendingRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                Nenhuma avaliação pendente
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.text.tertiary }]}>
                Suas avaliações aparecerão aqui após completar caronas
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.surface.primary }]}>
                  <Text style={[styles.statNumber, { color: theme.interactive.active }]}>
                    {pendingRequests.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                    {pendingRequests.length === 1 ? 'Avaliação Pendente' : 'Avaliações Pendentes'}
                  </Text>
                </View>
              </View>

              {pendingRequests.map(renderRatingRequest)}
            </>
          )}
        </ScrollView>
      </BackgroundPattern>
    </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleEmoji: {
    fontSize: 20,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  rideInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeArrow: {
    width: 20,
    height: 2,
    marginHorizontal: 12,
  },
  rideDate: {
    fontSize: 14,
    textAlign: 'center',
  },
  rateButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
    lineHeight: 24,
    maxWidth: 280,
  },
});

export default PendingRatingsScreen;