import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { addRide, getUserProfile, updateUserToDriver, setDriverCarInfo, getDriverCarInfo } from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useTheme } from '../hooks/useTheme';
import CustomAlert from '../components/CustomAlert';
import CarInfoModal from '../components/CarInfoModal';

/**
 * Tela para oferecer caronas
 * Permite que usuários publiquem caronas e se tornem motoristas
 * @param {Function} setScreen - Função para navegar entre telas
 * @param {Object} user - Dados do usuário logado
 */
const OfferRideScreen = ({ setScreen, user }) => {
  // ========================================
  // ESTADOS DO FORMULÁRIO DE CARONA
  // ========================================
  
  // Campos do formulário de carona
  const [origin, setOrigin] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  
  // Estados de controle da interface
  const [loading, setLoading] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);
  
  // Dados do usuário carregados do Firestore
  const [userProfile, setUserProfile] = useState(null);
  const [carInfo, setCarInfo] = useState(null);
  
  // ========================================
  // HOOKS PARA RESPONSIVIDADE E TEMA
  // ========================================
  
  const { isMobile } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();
  const { theme } = useTheme();

  // ========================================
  // CARREGAMENTO INICIAL DE DADOS
  // ========================================
  
  /**
   * Carrega os dados do usuário e informações do carro ao montar o componente
   * Verifica se o usuário já é motorista e tem informações do carro salvas
   */
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          // Busca o perfil do usuário no Firestore
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Se o usuário é motorista, busca as informações do carro
          if (profile?.isDriver) {
            const car = await getDriverCarInfo(user.uid);
            setCarInfo(car);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user]);

  // ========================================
  // FUNÇÃO PRINCIPAL DE OFERTA DE CARONA
  // ========================================
  
  /**
   * Função principal que gerencia a publicação de caronas
   * Verifica se o usuário é motorista e salva dados no Firestore
   */
  const handleOfferRide = async () => {
    // Validação dos campos obrigatórios
    if (!origin || !departureTime || !availableSeats) {
      showAlert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Se o usuário não é motorista, abre o modal para cadastrar informações do carro
    if (!userProfile?.isDriver) {
      setShowCarModal(true);
      return;
    }

    // Se já é motorista, publica a carona diretamente
    await publishRide();
  };

  // ========================================
  // SALVAMENTO DE INFORMAÇÕES DO CARRO
  // ========================================
  
  /**
   * Função chamada quando o usuário salva as informações do carro
   * Este é o momento onde os dados do carro são salvos no Firestore
   * @param {Object} carData - Dados do carro (modelo, placa, cor)
   */
  const handleCarInfoSave = async (carData) => {
    setLoading(true);
    try {
      // Atualiza o usuário para motorista no Firestore
      // Salva na coleção 'users' com campo isDriver = true
      await updateUserToDriver(user.uid);
      
      // Salva as informações do carro na subcoleção 'car/info'
      // Este é o momento onde os dados são salvos em users/{userId}/car/info
      await setDriverCarInfo(user.uid, carData);
      
      // Atualiza o estado local
      setUserProfile(prev => ({ ...prev, isDriver: true }));
      setCarInfo(carData);
      setShowCarModal(false);
      
      // Após salvar as informações do carro, publica a carona
      await publishRide();
    } catch (error) {
      console.error('Error saving car info:', error);
      showAlert('Erro', 'Não foi possível salvar as informações do veículo.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // PUBLICAÇÃO DA CARONA NO FIRESTORE
  // ========================================
  
  /**
   * Função que salva a carona no Firestore
   * Este é o momento onde a carona é salva na coleção 'rides'
   */
  const publishRide = async () => {
    setLoading(true);
    try {
      // Busca o perfil atualizado do usuário para obter o nome do motorista
      const currentProfile = await getUserProfile(user?.uid);
      const driverName = currentProfile?.name || 
                        `${currentProfile?.firstName || ''} ${currentProfile?.lastName || ''}`.trim() || 
                        user?.email || 
                        'Usuário';
      
      // Busca as informações do carro se não estiverem no estado local
      let currentCarInfo = carInfo;
      if (!currentCarInfo && currentProfile?.isDriver) {
        currentCarInfo = await getDriverCarInfo(user.uid);
      }
      
      // Salva a carona no Firestore
      // Este é o momento onde os dados são salvos na coleção 'rides'
      await addRide({
        driverId: user?.uid,           // ID do motorista
        driverName,                    // Nome do motorista
        origin: origin.trim(),         // Ponto de partida
        destination: 'ICEA - UFOP',    // Destino fixo
        departureTime: departureTime.trim(), // Horário de saída
        availableSeats: parseInt(availableSeats, 10), // Número de vagas
        passengers: [],                // Lista de passageiros (vazia inicialmente)
        status: 'available',           // Status da carona
        carInfo: currentCarInfo,       // Informações do carro incluídas na carona
      });
      
      showAlert('Sucesso', 'Carona publicada com sucesso!');
      setScreen('Home'); // Navega para a tela principal
    } catch (err) {
      console.error('Error offering ride:', err);
      showAlert('Erro', 'Não foi possível oferecer a carona. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================
  
  /**
   * Fecha o modal de informações do carro
   */
  const handleCarModalClose = () => {
    setShowCarModal(false);
  };

  // ========================================
  // RENDERIZAÇÃO
  // ========================================
  
  // Escolhe o container baseado na plataforma (mobile ou web)
  const Container = isMobile ? MobileContainer : ResponsiveContainer;

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
      
      {/* Modal para cadastrar informações do carro */}
      <CarInfoModal
        visible={showCarModal}
        onClose={handleCarModalClose}
        onSave={handleCarInfoSave}
        loading={loading}
      />

      {/* Formulário de carona */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.surface.primary,
            color: theme.text.primary,
            borderColor: theme.border.primary
          }]}
          placeholder="Ponto de Partida (Ex: Centro)"
          placeholderTextColor={theme.text.tertiary}
          value={origin}
          onChangeText={setOrigin}
        />
        
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.surface.primary,
            color: theme.text.primary,
            borderColor: theme.border.primary
          }]}
          placeholder="Horário de Saída (Ex: 07:30)"
          placeholderTextColor={theme.text.tertiary}
          value={departureTime}
          onChangeText={setDepartureTime}
        />
        
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.surface.primary,
            color: theme.text.primary,
            borderColor: theme.border.primary
          }]}
          placeholder="Vagas Disponíveis"
          placeholderTextColor={theme.text.tertiary}
          value={availableSeats}
          onChangeText={setAvailableSeats}
          keyboardType="numeric"
        />
        
        {/* Botão para publicar carona */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.interactive.button.primary }]} 
          onPress={handleOfferRide}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.text.inverse} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
              {userProfile?.isDriver ? 'Publicar Carona' : 'Tornar-se Motorista e Publicar'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OfferRideScreen;
