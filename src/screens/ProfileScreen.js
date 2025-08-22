import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { signOut as firebaseSignOut, getUserProfile } from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

const ProfileScreen = ({ setScreen, user, onSignOut }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
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
              showAlert('Erro', 'Não foi possível sair. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  // Use MobileContainer for mobile, ResponsiveContainer for web
  const Container = isMobile ? MobileContainer : ResponsiveContainer;

  if (loading) {
    return (
      <Container style={styles.container} user={user}>
        <ActivityIndicator size="large" color="#4299e1" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
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
      <View style={styles.profileCard}>
        
        <View style={styles.infoSection}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>
            {userProfile?.firstName || user?.email?.split('@')[0] || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Sobrenome:</Text>
          <Text style={styles.value}>
            {userProfile?.lastName || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Nome Completo:</Text>
          <Text style={styles.value}>
            {userProfile?.name || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.label}>ID do Usuário:</Text>
          <Text style={styles.value}>{user?.uid}</Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.status}>Ativo</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.signOutButton} 
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#4a5568',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#a0aec0',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  status: {
    fontSize: 16,
    color: '#48bb78',
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#fc8181',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;
