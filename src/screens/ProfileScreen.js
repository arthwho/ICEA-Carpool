import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { signOut as firebaseSignOut, getUserProfile, getDriverCarInfo, updateDriverCarInfo, USER_ROLES, isAdmin, isModerator } from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useTheme } from '../hooks/useTheme';
import CustomAlert from '../components/CustomAlert';
import BackgroundPattern from '../components/BackgroundPattern';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorHandler';
import ThemeToggle from '../components/ThemeToggle';
import CarInfoModal from '../components/CarInfoModal';

const ProfileScreen = ({ setScreen, user, onSignOut }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [carInfo, setCarInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [editCarLoading, setEditCarLoading] = useState(false);
  const { isMobile } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();
  const { theme } = useTheme();

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
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.surface.primary }]}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.interactive.active + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.interactive.active }]}>
              {(userProfile?.name || user?.email)?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.userName, { color: theme.text.primary }]}>
              {userProfile?.name || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Usuário'}
            </Text>
            <View style={styles.userBadges}>
              {/* Admin Badge */}
              {isAdmin(userProfile) && (
                <View style={[styles.statusBadge, styles.adminBadge, { backgroundColor: theme.interactive.button.danger }]}>
                  <Text style={[styles.statusText, { color: theme.text.inverse }]}>
                    👑 Admin
                  </Text>
                </View>
              )}
              
              {/* Moderator Badge */}
              {isModerator(userProfile) && !isAdmin(userProfile) && (
                <View style={[styles.statusBadge, styles.moderatorBadge, { backgroundColor: theme.interactive.button.secondary }]}>
                  <Text style={[styles.statusText, { color: theme.text.primary }]}>
                    🛡️ Moderador
                  </Text>
                </View>
              )}
              
              {/* Driver Badge */}
              {userProfile?.isDriver && (
                <View style={[styles.statusBadge, styles.driverBadge, { backgroundColor: theme.interactive.active }]}>
                  <Text style={[styles.statusText, { color: theme.text.inverse }]}>
                    🚗 Motorista
                  </Text>
                </View>
              )}
              
              {/* Passenger Badge - Always show for all users since everyone can request rides */}
              <View style={[styles.statusBadge, styles.passengerBadge, { backgroundColor: theme.status.available }]}>
                <Text style={[styles.statusText, { color: theme.text.inverse }]}>
                  👤 Passageiro
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface.primary }]}>
          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Informações Pessoais</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.iconText}>📧</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Email</Text>
              <Text style={[styles.infoValue, { color: theme.text.secondary }]}>{user?.email}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.iconText}>✅</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Status da Conta</Text>
              <Text style={[styles.activeStatus, { color: theme.status.available }]}>Ativo</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.iconText}>🎯</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Nível de Acesso</Text>
              <Text style={[styles.infoValue, { color: theme.text.secondary }]}>
                {isAdmin(userProfile) ? 'Administrador' : 
                 isModerator(userProfile) ? 'Moderador' : 
                 'Usuário Padrão'}
              </Text>
            </View>
          </View>
        </View>

        {/* Car Information Card for Drivers */}
        {userProfile?.isDriver && (
          <View style={[styles.infoCard, { backgroundColor: theme.surface.primary }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Meu Veículo</Text>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.interactive.button.primary }]}
                onPress={handleEditCarInfo}
              >
                <Text style={[styles.editButtonText, { color: theme.text.inverse }]}>Editar</Text>
              </TouchableOpacity>
            </View>
            
            {carInfo ? (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.iconText}>🚗</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Modelo</Text>
                    <Text style={[styles.infoValue, { color: theme.text.secondary }]}>{carInfo.model}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.iconText}>🎨</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Cor</Text>
                    <Text style={[styles.infoValue, { color: theme.text.secondary }]}>{carInfo.color}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.iconText}>🔢</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Placa</Text>
                    <Text style={[styles.infoValue, { color: theme.text.secondary }]}>{carInfo.licensePlate}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.text.tertiary }]}>
                  Adicione as informações do seu veículo para começar a oferecer caronas
                </Text>
                <TouchableOpacity
                  style={[styles.addCarButton, { backgroundColor: theme.interactive.button.secondary }]}
                  onPress={handleEditCarInfo}
                >
                  <Text style={[styles.addCarButtonText, { color: theme.text.primary }]}>Adicionar Veículo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {/* Theme Toggle for Mobile */}
        {isMobile && (
          <View style={styles.themeToggleContainer}>
            <ThemeToggle />
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: theme.interactive.button.danger }]} 
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutButtonText, { color: theme.text.inverse }]}>Sair da Conta</Text>
        </TouchableOpacity>
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
