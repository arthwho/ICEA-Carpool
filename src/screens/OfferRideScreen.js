import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import CustomNumberInput from '../components/CustomNumberInput';
import CustomTimePicker from '../components/CustomTimePicker';
import { addRide, getUserProfile, updateUserToDriver, setDriverCarInfo, getDriverCarInfo } from '../services/firebase';
import { ResponsiveContainer, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useTheme } from '../hooks/useTheme';
import CustomAlert from '../components/CustomAlert';
import BackgroundPattern from '../components/BackgroundPattern';
import CarInfoModal from '../components/CarInfoModal';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorHandler';

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
  const [availableSeats, setAvailableSeats] = useState(1);
  const [price, setPrice] = useState('');
  
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

    // Validação específica para o número de vagas
    if (typeof availableSeats !== 'number' || availableSeats < 1 || availableSeats > 8) {
      showAlert('Erro', 'Por favor, insira um número válido de vagas (1-8).');
      return;
    }

    // Validação específica para o preço
    if (price === '') {
      showAlert('Erro', 'Por favor, insira um preço para a carona (use 0 para caronas gratuitas).');
      return;
    }
    
    const priceValue = parseFloat(price.replace(',', '.'));
    if (isNaN(priceValue) || priceValue < 0) {
      showAlert('Erro', 'Por favor, insira um preço válido (use 0 para caronas gratuitas).');
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
      const errorMessage = getFirebaseErrorMessage(error);
      showAlert('Erro', errorMessage, [
        { text: 'OK', style: 'default' }
      ]);
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
        availableSeats: availableSeats, // Número de vagas
        price: parseFloat(price.replace(',', '.')), // Preço da carona
        passengers: [],                // Lista de passageiros (vazia inicialmente)
        status: 'available',           // Status da carona
        carInfo: currentCarInfo,       // Informações do carro incluídas na carona
      });
      
      showAlert('Sucesso', 'Carona publicada com sucesso!');
      setScreen('Home'); // Navega para a tela principal
    } catch (err) {
      console.error('Error offering ride:', err);
      const errorMessage = getFirebaseErrorMessage(err);
      showAlert('Erro', errorMessage, [
        { text: 'OK', style: 'default' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================
  
  /**
   * Função para validar e formatar o preço da carona
   * Aceita apenas números e vírgula para decimais
   * @param {string} value - Valor digitado pelo usuário
   */
  const handlePriceChange = (value) => {
    // Remove caracteres não permitidos (apenas números e vírgula)
    const cleanValue = value.replace(/[^0-9,]/g, '');
    
    // Converte vírgula para ponto para validação
    const normalizedValue = cleanValue.replace(',', '.');
    
    // Valida se é um número válido
    const numValue = parseFloat(normalizedValue);
    
    if (cleanValue === '') {
      setPrice('');
    } else if (!isNaN(numValue) && numValue >= 0) {
      // Se é um número válido e não negativo, aceita
      setPrice(cleanValue);
    }
  };
  


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
      <BackgroundPattern variant="success">
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
        
        <CustomTimePicker
          value={departureTime}
          onChange={setDepartureTime}
          label="Horário de Saída"
          placeholder="Selecione o horário"
        />
        
        <CustomNumberInput
          value={availableSeats}
          onChange={setAvailableSeats}
          min={1}
          max={8}
          step={1}
          label="Número de vagas disponíveis"
        />
        
        <View style={[styles.priceInputContainer, { 
          backgroundColor: theme.surface.primary,
          borderColor: theme.border.primary
        }]}>
          <Text style={[styles.currencySymbol, { color: theme.text.primary }]}>R$</Text>
          <TextInput
            style={[styles.priceInput, { 
              color: theme.text.primary,
            }]}
            placeholder="0,00"
            placeholderTextColor={theme.text.tertiary}
            value={price}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
          />
        </View>
        
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
      justifyContent: 'center',
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: 350,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    height: 50,
  },
  button: {
    width: 350,
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
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    width: 350,
    height: 50,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  priceInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },

});

export default OfferRideScreen;
