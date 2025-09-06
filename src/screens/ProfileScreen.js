import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { signOut as firebaseSignOut, getUserProfile, getDriverCarInfo, updateDriverCarInfo, USER_ROLES, isAdmin, isModerator, subscribePendingRatingRequests, submitRating, getUserReceivedRatings, getUserSentRatings } from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useTheme } from '../hooks/useTheme';
import CustomAlert from '../components/CustomAlert';
import BackgroundPattern from '../components/BackgroundPattern';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorHandler';
// ThemeToggle removido do layout em favor de um switch minimalista
import CarInfoModal from '../components/CarInfoModal';
import UserRating from '../components/UserRating';
import RatingModal from '../components/RatingModal';

const ProfileScreen = ({ setScreen, user, onSignOut }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [carInfo, setCarInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [editCarLoading, setEditCarLoading] = useState(false);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [activeRatingTab, setActiveRatingTab] = useState('received');
  const [receivedRatings, setReceivedRatings] = useState({ asDriver: [], asPassenger: [] });
  const [sentRatings, setSentRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const { isMobile } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Load car information if user is a driver
          if (profile?.isDriver) {
            const car = await getDriverCarInfo(user.uid);
            setCarInfo(car);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Listener para avaliações pendentes
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribePendingRatingRequests(user.uid, (ratings) => {
      setPendingRatings(ratings);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleSignOut = async () => {
    showAlert(
      'Confirmar Saída',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseSignOut();
              onSignOut();
            } catch (error) {
              console.error('Error signing out:', error);
              const errorMessage = getFirebaseErrorMessage(error);
              showAlert('Erro', errorMessage, [
                { text: 'OK', style: 'default' }
              ]);
            }
          },
        },
      ]
    );
  };

  const handleEditCarInfo = () => {
    setShowEditCarModal(true);
  };

  const handleSaveCarInfo = async (carData) => {
    setEditCarLoading(true);
    try {
      await updateDriverCarInfo(user.uid, carData);
      setCarInfo(carData);
      setShowEditCarModal(false);
      showAlert('Sucesso', 'Informações do veículo atualizadas com sucesso!', [
        { text: 'OK', style: 'default' }
      ]);
    } catch (error) {
      console.error('Error updating car info:', error);
      const errorMessage = getFirebaseErrorMessage(error);
      showAlert('Erro', errorMessage, [
        { text: 'OK', style: 'default' }
      ]);
    } finally {
      setEditCarLoading(false);
    }
  };

  const handleCloseEditCarModal = () => {
    setShowEditCarModal(false);
  };

  const handleOpenRating = (ratingRequest) => {
    setSelectedRating(ratingRequest);
    setShowRatingModal(true);
  };

  const handleCloseRatingModal = () => {
    setSelectedRating(null);
    setShowRatingModal(false);
  };

  const handleSubmitRating = async (ratingData) => {
    setSubmittingRating(true);
    try {
      await submitRating(ratingData.requestId, ratingData);
      showAlert('Sucesso', 'Avaliação enviada com sucesso!');
      handleCloseRatingModal();
      // Recarrega as avaliações após enviar uma nova
      loadRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      showAlert('Erro', 'Não foi possível enviar a avaliação. Tente novamente.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const loadRatings = async () => {
    if (!user?.uid) return;
    
    setLoadingRatings(true);
    try {
      // Carrega avaliações recebidas
      const [driverRatings, passengerRatings, sentRatingsData] = await Promise.all([
        getUserReceivedRatings(user.uid, 'driver'),
        getUserReceivedRatings(user.uid, 'passenger'), 
        getUserSentRatings(user.uid)
      ]);
      
      setReceivedRatings({
        asDriver: driverRatings,
        asPassenger: passengerRatings
      });
      setSentRatings(sentRatingsData);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <View style={styles.starsRow}>
        {Array(fullStars).fill().map((_, i) => (
          <Text key={`full-${i}`} style={[styles.star, { color: theme.interactive.active }]}>★</Text>
        ))}
        {hasHalfStar && (
          <Text style={[styles.star, { color: theme.interactive.active }]}>☆</Text>
        )}
        {Array(5 - fullStars - (hasHalfStar ? 1 : 0)).fill().map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.star, { color: theme.text.tertiary }]}>☆</Text>
        ))}
      </View>
    );
  };

  const renderRatingItem = (rating) => (
    <View key={rating.id} style={[styles.ratingItem, { backgroundColor: theme.surface.secondary }]}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingInfo}>
          <Text style={[styles.ratingFromUser, { color: theme.text.primary }]}>
            {rating.isAnonymous ? 'Usuário anônimo' : `Por: ${rating.fromUserName || 'Usuário'}`}
          </Text>
          <View style={styles.ratingScoreRow}>
            {renderStars(rating.rating)}
            <Text style={[styles.ratingScore, { color: theme.text.secondary }]}>
              {rating.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.ratingDate, { color: theme.text.tertiary }]}>
          {rating.createdAt?.toDate ? rating.createdAt.toDate().toLocaleDateString('pt-BR') : 
           new Date(rating.createdAt?.seconds * 1000).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      
      {rating.comment && (
        <Text style={[styles.ratingComment, { color: theme.text.secondary }]}>
          "{rating.comment}"
        </Text>
      )}
    </View>
  );

  const renderSentRatingItem = (rating) => (
    <View key={rating.id} style={[styles.ratingItem, { backgroundColor: theme.surface.secondary }]}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingInfo}>
          <Text style={[styles.ratingFromUser, { color: theme.text.primary }]}>
            Para: {rating.toUserName} ({rating.toUserRole === 'driver' ? 'Motorista' : 'Passageiro'})
          </Text>
          <View style={styles.ratingScoreRow}>
            {renderStars(rating.rating)}
            <Text style={[styles.ratingScore, { color: theme.text.secondary }]}>
              {rating.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.ratingDate, { color: theme.text.tertiary }]}>
          {rating.createdAt?.toDate ? rating.createdAt.toDate().toLocaleDateString('pt-BR') : 
           new Date(rating.createdAt?.seconds * 1000).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      
      {rating.comment && (
        <Text style={[styles.ratingComment, { color: theme.text.secondary }]}>
          "{rating.comment}"
        </Text>
      )}
    </View>
  );

  // Use MobileContainer for mobile, ResponsiveContainer for web
  const Container = isMobile ? MobileContainer : ResponsiveContainer;

  if (loading) {
    return (
      <Container style={styles.container} user={user}>
        <ActivityIndicator size="large" color={theme.interactive.active} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>Carregando perfil...</Text>
      </Container>
    );
  }

  return (
    <Container style={styles.container} user={user}>
      <BackgroundPattern variant="secondary">
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onClose={closeAlert}
        />
      
      <CarInfoModal
        visible={showEditCarModal}
        onClose={handleCloseEditCarModal}
        onSave={handleSaveCarInfo}
        loading={editCarLoading}
        initialValues={carInfo}
        isEditing={true}
      />

      <RatingModal
        visible={showRatingModal}
        ratingRequest={selectedRating}
        onSubmit={handleSubmitRating}
        onClose={handleCloseRatingModal}
        loading={submittingRating}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          {/* Header minimalista */}
          <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}> 
            <View style={styles.headerRow}>
              <View style={[styles.avatar, { backgroundColor: theme.interactive.active }]}>
                <Text style={[styles.avatarText, { color: theme.text.inverse }]}>
                  {(userProfile?.name || user?.email)?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.headerInfoMinimal}>
                <Text style={[styles.name, { color: theme.text.primary }]}>
                  {userProfile?.name || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Usuário'}
                </Text>
                <Text style={[styles.email, { color: theme.text.secondary }]}>{user?.email}</Text>
                <View style={styles.chipsRow}>
                  {isAdmin(userProfile) && (
                    <View style={[styles.chip, { backgroundColor: theme.interactive.active + '20', borderColor: theme.interactive.active }]}>
                      <Text style={[styles.chipText, { color: theme.interactive.active }]}>Admin</Text>
                    </View>
                  )}
                  {isModerator(userProfile) && !isAdmin(userProfile) && (
                    <View style={[styles.chip, { backgroundColor: theme.border.primary + '20', borderColor: theme.border.primary }]}>
                      <Text style={[styles.chipText, { color: theme.text.primary }]}>Moderador</Text>
                    </View>
                  )}
                  {userProfile?.isDriver && (
                    <View style={[styles.chip, { backgroundColor: theme.status.available + '20', borderColor: theme.status.available }]}>
                      <Text style={[styles.chipText, { color: theme.status.available }]}>Motorista</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Veículo */}
          <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}> 
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Veículo</Text>
              <TouchableOpacity onPress={handleEditCarInfo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.editLink, { color: theme.interactive.link }]}>{carInfo ? 'Editar' : 'Adicionar'}</Text>
              </TouchableOpacity>
            </View>
            {carInfo ? (
              <View style={styles.vehicleBody}>
                <Text style={[styles.vehicleLine, { color: theme.text.primary }]}>
                  {carInfo.model} • {carInfo.color}
                </Text>
                <Text style={[styles.vehicleMeta, { color: theme.text.tertiary }]}>Placa: {carInfo.licensePlate}</Text>
              </View>
            ) : (
              <Text style={[styles.emptyInline, { color: theme.text.tertiary }]}>Nenhum veículo cadastrado.</Text>
            )}
          </View>

          {/* Ações rápidas */}
          {/* <View style={[styles.card, { backgroundColor: theme.surface.primary }]}> 
            <View style={styles.quickRow}>
              <TouchableOpacity style={[styles.pill, { borderColor: theme.border.primary }]} onPress={() => setScreen('OfferRide')}>
                <Text style={[styles.pillText, { color: theme.text.primary }]}>Oferecer carona</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, { borderColor: theme.border.primary }]} onPress={() => setScreen('RideHistory')}>
                <Text style={[styles.pillText, { color: theme.text.primary }]}>Histórico</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, { borderColor: theme.border.primary }]} onPress={() => setScreen('ManagePassengers')}>
                <Text style={[styles.pillText, { color: theme.text.primary }]}>Gerenciar</Text>
              </TouchableOpacity>
            </View>
          </View> */}

          {/* Avaliações pendentes */}
          {pendingRatings.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                  ⭐ Avaliações Pendentes
                </Text>
                <View style={[styles.notificationBadge, { backgroundColor: theme.interactive.active }]}>
                  <Text style={[styles.badgeText, { color: theme.text.inverse }]}>
                    {pendingRatings.length}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.sectionSubtitle, { color: theme.text.secondary }]}>
                Avalie suas experiências recentes de carona
              </Text>
              
              {pendingRatings.slice(0, 3).map((request) => {
                const isDriverRating = request.toUserRole === 'driver';
                const timeRemaining = Math.max(0, Math.ceil((new Date(request.expiresAt?.seconds * 1000) - new Date()) / (24 * 60 * 60 * 1000)));
                
                return (
                  <View key={request.id} style={[styles.pendingRatingCard, { backgroundColor: theme.surface.secondary }]}>
                    <View style={styles.pendingRatingHeader}>
                      <View style={styles.pendingRatingInfo}>
                        <Text style={[styles.pendingRatingRole, { color: theme.text.primary }]}>
                          {isDriverRating ? '🚗 Avaliar Motorista' : '👤 Avaliar Passageiro'}
                        </Text>
                        <Text style={[styles.pendingRatingName, { color: theme.text.secondary }]}>
                          {request.toUserName}
                        </Text>
                        <Text style={[styles.pendingRatingRoute, { color: theme.text.tertiary }]}>
                          {request.rideInfo.origin} → {request.rideInfo.destination}
                        </Text>
                      </View>
                      
                      {timeRemaining > 0 && (
                        <Text style={[styles.timeRemaining, { 
                          color: timeRemaining <= 1 ? theme.status.error : theme.status.warning 
                        }]}>
                          {timeRemaining === 1 ? 'Expira hoje' : `${timeRemaining}d`}
                        </Text>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={[styles.rateNowButton, { backgroundColor: theme.interactive.active }]}
                      onPress={() => handleOpenRating(request)}
                    >
                      <Text style={[styles.rateNowText, { color: theme.text.inverse }]}>
                        Avaliar Agora
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              {pendingRatings.length > 3 && (
                <Text style={[styles.moreRatings, { color: theme.text.tertiary }]}>
                  +{pendingRatings.length - 3} mais avaliações pendentes
                </Text>
              )}
            </View>
          )}

          {/* Avaliações do usuário */}
          <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Avaliações
              </Text>
              <TouchableOpacity
                onPress={loadRatings}
                disabled={loadingRatings}
              >
                <Text style={[styles.refreshText, { color: theme.interactive.active }]}>
                  {loadingRatings ? 'Carregando...' : 'Atualizar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Abas de Avaliações */}
            <View style={[styles.tabContainer, { borderBottomColor: theme.border.primary }]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeRatingTab === 'received' && [styles.activeTab, { borderBottomColor: theme.interactive.active }]
                ]}
                onPress={() => setActiveRatingTab('received')}
              >
                <Text style={[
                  styles.tabText,
                  { color: theme.text.secondary },
                  activeRatingTab === 'received' && { color: theme.interactive.active, fontWeight: '600' }
                ]}>
                  Recebidas
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeRatingTab === 'sent' && [styles.activeTab, { borderBottomColor: theme.interactive.active }]
                ]}
                onPress={() => setActiveRatingTab('sent')}
              >
                <Text style={[
                  styles.tabText,
                  { color: theme.text.secondary },
                  activeRatingTab === 'sent' && { color: theme.interactive.active, fontWeight: '600' }
                ]}>
                  Enviadas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Conteúdo das Abas */}
            {activeRatingTab === 'received' && (
              <View style={styles.tabContent}>
                {userProfile?.ratings ? (
                  <>
                    {userProfile.ratings.asDriver && (
                      <UserRating
                        userData={userProfile}
                        role="driver"
                        showBadge={true}
                        onPress={() => {
                          if (receivedRatings.asDriver.length === 0) loadRatings();
                        }}
                      />
                    )}
                    
                    {userProfile.ratings.asPassenger && (
                      <UserRating
                        userData={userProfile}
                        role="passenger"
                        showBadge={true}
                        onPress={() => {
                          if (receivedRatings.asPassenger.length === 0) loadRatings();
                        }}
                      />
                    )}

                    {/* Lista detalhada de avaliações recebidas */}
                    {(receivedRatings.asDriver.length > 0 || receivedRatings.asPassenger.length > 0) && (
                      <View style={styles.ratingsListContainer}>
                        <Text style={[styles.listTitle, { color: theme.text.primary }]}>
                          Avaliações Detalhadas
                        </Text>
                        
                        {receivedRatings.asDriver.length > 0 && (
                          <View style={styles.roleRatings}>
                            <Text style={[styles.roleTitle, { color: theme.text.secondary }]}>
                              🚗 Como Motorista ({receivedRatings.asDriver.length})
                            </Text>
                            {receivedRatings.asDriver.slice(0, 3).map(rating => renderRatingItem(rating))}
                            {receivedRatings.asDriver.length > 3 && (
                              <Text style={[styles.moreRatings, { color: theme.text.tertiary }]}>
                                +{receivedRatings.asDriver.length - 3} mais avaliações
                              </Text>
                            )}
                          </View>
                        )}

                        {receivedRatings.asPassenger.length > 0 && (
                          <View style={styles.roleRatings}>
                            <Text style={[styles.roleTitle, { color: theme.text.secondary }]}>
                              👤 Como Passageiro ({receivedRatings.asPassenger.length})
                            </Text>
                            {receivedRatings.asPassenger.slice(0, 3).map(rating => renderRatingItem(rating))}
                            {receivedRatings.asPassenger.length > 3 && (
                              <Text style={[styles.moreRatings, { color: theme.text.tertiary }]}>
                                +{receivedRatings.asPassenger.length - 3} mais avaliações
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    )}

                    {(!userProfile.ratings.asDriver && !userProfile.ratings.asPassenger) && (
                      <View style={styles.noRatingsContainer}>
                        <Text style={styles.noRatingsIcon}>⭐</Text>
                        <Text style={[styles.noRatingsText, { color: theme.text.tertiary }]}>
                          Você ainda não possui avaliações
                        </Text>
                        <Text style={[styles.noRatingsSubtext, { color: theme.text.tertiary }]}>
                          Complete algumas caronas para receber suas primeiras avaliações
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.noRatingsContainer}>
                    <Text style={styles.noRatingsIcon}>⭐</Text>
                    <Text style={[styles.noRatingsText, { color: theme.text.tertiary }]}>
                      Você ainda não possui avaliações
                    </Text>
                  </View>
                )}
              </View>
            )}

            {activeRatingTab === 'sent' && (
              <View style={styles.tabContent}>
                {sentRatings.length > 0 ? (
                  <View style={styles.ratingsListContainer}>
                    <Text style={[styles.listTitle, { color: theme.text.primary }]}>
                      Avaliações que Você Enviou ({sentRatings.length})
                    </Text>
                    {sentRatings.slice(0, 5).map(rating => renderSentRatingItem(rating))}
                    {sentRatings.length > 5 && (
                      <Text style={[styles.moreRatings, { color: theme.text.tertiary }]}>
                        +{sentRatings.length - 5} mais avaliações enviadas
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.noRatingsContainer}>
                    <Text style={styles.noRatingsIcon}>📤</Text>
                    <Text style={[styles.noRatingsText, { color: theme.text.tertiary }]}>
                      Nenhuma avaliação enviada
                    </Text>
                    <Text style={[styles.noRatingsSubtext, { color: theme.text.tertiary }]}>
                      Complete caronas e avalie outros usuários para aparecer aqui
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Preferências */}
          <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}> 
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text.primary }]}>Tema escuro</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.interactive.button.secondary, true: theme.interactive.active }}
                thumbColor={theme.surface.primary}
              />
            </View>
          </View>

          {/* Sair */}
          <TouchableOpacity onPress={handleSignOut} style={styles.signoutLink}>
            <Text style={[styles.signoutText, { color: theme.interactive.button.danger }]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </BackgroundPattern>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 12,
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
      justifyContent: 'flex-start',
    }),
  },
  page: {
    width: '100%',
    maxWidth: 640,
    gap: 16,
  },

  // Cards minimalistas
  card: {
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 2,
  },

  // Header minimalista
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerInfoMinimal: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Seção veículo
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleBody: {
    gap: 2,
  },
  vehicleLine: {
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleMeta: {
    fontSize: 13,
  },
  emptyInline: {
    fontSize: 14,
  },

  // Avaliações
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notificationBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  pendingRatingCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  pendingRatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pendingRatingInfo: {
    flex: 1,
  },
  pendingRatingRole: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  pendingRatingName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  pendingRatingRoute: {
    fontSize: 12,
  },
  timeRemaining: {
    fontSize: 12,
    fontWeight: '600',
  },
  rateNowButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  rateNowText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreRatings: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabContent: {
    minHeight: 200,
  },
  ratingsListContainer: {
    marginTop: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleRatings: {
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingItem: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 8,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingFromUser: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginRight: 1,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingComment: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  noRatingsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noRatingsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noRatingsText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  noRatingsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Ações rápidas
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Preferências
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Sair
  signoutLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  signoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Profile Header Styles
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    maxWidth: 600,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  userBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  adminBadge: {
    // Admin gets highest priority styling
  },
  moderatorBadge: {
    // Moderator styling
  },
  driverBadge: {
    // Driver styling
  },
  passengerBadge: {
    // Passenger styling
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Card Styles
  infoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    maxWidth: 600,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  
  // Info Row Styles
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
    paddingTop: 2,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  activeStatus: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Button Styles
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  addCarButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCarButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Theme Toggle
  themeToggleContainer: {
    marginBottom: 20,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },
  
  // Sign Out Button
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Loading
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;
