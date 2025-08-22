import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { addRide, getUserProfile } from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

const OfferRideScreen = ({ setScreen, user }) => {
  const [origin, setOrigin] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [loading, setLoading] = useState(false);
  const { isMobile } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();

  const handleOfferRide = async () => {
    if (!origin || !departureTime || !availableSeats) {
      showAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    try {
      // Get user profile to get the driver name
      const userProfile = await getUserProfile(user?.uid);
      const driverName = userProfile?.name || 
                        `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 
                        user?.email || 
                        'Usuário';
      
      // Add ride to Firestore
      await addRide({
        driverId: user?.uid,
        driverName,
        origin: origin.trim(),
        destination: 'ICEA - UFVJM',
        departureTime: departureTime.trim(),
        availableSeats: parseInt(availableSeats, 10),
        passengers: [],
        status: 'available',
      });
      
      showAlert('Sucesso', 'Carona publicada com sucesso!');
      setScreen('Home');
    } catch (err) {
      console.error('Error offering ride:', err);
      showAlert('Erro', 'Não foi possível oferecer a carona. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Use MobileContainer for mobile, ResponsiveContainer for web
  const Container = isMobile ? MobileContainer : ResponsiveContainer;

  return (
    <Container style={styles.container} user={user}>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={closeAlert}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TextInput
          style={styles.input}
          placeholder="Ponto de Partida (Ex: Centro)"
          placeholderTextColor="#a0aec0"
          value={origin}
          onChangeText={setOrigin}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Horário de Saída (Ex: 07:30)"
          placeholderTextColor="#a0aec0"
          value={departureTime}
          onChangeText={setDepartureTime}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Vagas Disponíveis"
          placeholderTextColor="#a0aec0"
          value={availableSeats}
          onChangeText={setAvailableSeats}
          keyboardType="numeric"
        />
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleOfferRide}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Publicar Carona</Text>
          )}
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#4a5568',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 0,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: '#4299e1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OfferRideScreen;
