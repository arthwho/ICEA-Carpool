import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { signOut as firebaseSignOut, getUserProfile, getDriverCarInfo, updateDriverCarInfo } from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useTheme } from '../hooks/useTheme';
import CustomAlert from '../components/CustomAlert';
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
        <View style={[styles.profileCard, { backgroundColor: theme.surface.primary }]}>
          
          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: theme.text.tertiary }]}>Nome:</Text>
            <Text style={[styles.value, { color: theme.text.secondary }]}>
              {userProfile?.firstName || user?.email?.split('@')[0] || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: theme.text.tertiary }]}>Sobrenome:</Text>
            <Text style={[styles.value, { color: theme.text.secondary }]}>
              {userProfile?.lastName || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: theme.text.tertiary }]}>Nome Completo:</Text>
            <Text style={[styles.value, { color: theme.text.secondary }]}>
              {userProfile?.name || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: theme.text.tertiary }]}>Email:</Text>
            <Text style={[styles.value, { color: theme.text.secondary }]}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: theme.text.tertiary }]}>ID do Usuário:</Text>
            <Text style={[styles.value, { color: theme.text.secondary }]}>{user?.uid}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: theme.text.tertiary }]}>Status:</Text>
            <Text style={[styles.status, { color: theme.status.available }]}>Ativo</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: theme.text.tertiary }]}>Tipo de Usuário:</Text>
            <Text style={[
              styles.value, 
              { color: theme.text.secondary },
              userProfile?.isDriver && { color: theme.interactive.active, fontWeight: 'bold' }
            ]}>
              {userProfile?.isDriver ? 'Motorista' : 'Passageiro'}
            </Text>
          </View>

          {/* Car Information Card for Drivers */}
          {userProfile?.isDriver && carInfo && (
            <View style={[styles.carInfoCard, { 
              backgroundColor: theme.interactive.active + '1A',
              borderLeftColor: theme.interactive.active 
            }]}>
              <View style={styles.carInfoHeader}>
                <Text style={[styles.carInfoTitle, { color: theme.interactive.active }]}>Informações do Veículo</Text>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: theme.interactive.button.primary }]}
                  onPress={handleEditCarInfo}
                >
                  <Text style={[styles.editButtonText, { color: theme.text.inverse }]}>Editar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.carInfoSection}>
                <Text style={[styles.carInfoLabel, { color: theme.text.tertiary }]}>Modelo:</Text>
                <Text style={[styles.carInfoValue, { color: theme.text.secondary }]}>{carInfo.model}</Text>
              </View>
              <View style={styles.carInfoSection}>
                <Text style={[styles.carInfoLabel, { color: theme.text.tertiary }]}>Cor:</Text>
                <Text style={[styles.carInfoValue, { color: theme.text.secondary }]}>{carInfo.color}</Text>
              </View>
              <View style={styles.carInfoSection}>
                <Text style={[styles.carInfoLabel, { color: theme.text.tertiary }]}>Placa:</Text>
                <Text style={[styles.carInfoValue, { color: theme.text.secondary }]}>{carInfo.licensePlate}</Text>
              </View>
            </View>
          )}
        </View>
        
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
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 100, // Extra padding to ensure logout button is reachable
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverStatus: {
    fontWeight: 'bold',
  },
  carInfoCard: {
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
  },
  carInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  carInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  carInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  carInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  themeToggleContainer: {
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  signOutButton: {
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default ProfileScreen;
