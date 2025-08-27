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
import { signOut as firebaseSignOut, getUserProfile, getDriverCarInfo, updateDriverCarInfo, USER_ROLES, isAdmin, isModerator } from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useTheme } from '../hooks/useTheme';
import CustomAlert from '../components/CustomAlert';
import BackgroundPattern from '../components/BackgroundPattern';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorHandler';
// ThemeToggle removido do layout em favor de um switch minimalista
import CarInfoModal from '../components/CarInfoModal';

const ProfileScreen = ({ setScreen, user, onSignOut }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [carInfo, setCarInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [editCarLoading, setEditCarLoading] = useState(false);
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
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          {/* Header minimalista */}
          <View style={[styles.card, { backgroundColor: theme.surface.primary }]}> 
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
          <View style={[styles.card, { backgroundColor: theme.surface.primary }]}> 
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
          <View style={[styles.card, { backgroundColor: theme.surface.primary }]}> 
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
          </View>

          {/* Preferências */}
          <View style={[styles.card, { backgroundColor: theme.surface.primary }]}> 
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
