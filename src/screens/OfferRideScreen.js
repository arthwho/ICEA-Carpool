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

  // Presets e sugestões minimalistas
  const ORIGIN_PRESETS = ['Novo Horizonte', 'Carneirinhos', 'Lourdes', 'Loanda', 'Cruzeiro Celeste'];
  const TIME_PRESETS = ['07:30', '12:00', '18:00', '21:00'];
  const PRICE_PRESETS = ['0,00', '3,00', '5,00', '7,00'];

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
    // Mantém apenas dígitos
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      setPrice('');
      return;
    }
    // Converte para centavos e formata X,YY
    const cents = parseInt(digits, 10);
    const reais = Math.floor(cents / 100);
    const centavos = (cents % 100).toString().padStart(2, '0');
    setPrice(`${reais},${centavos}`);
  };

  const setFreePrice = () => setPrice('0,00');

  const isValidOrigin = origin.trim().length > 0;
  const isValidTime = /^\d{2}:\d{2}$/.test(departureTime);
  const isValidSeats = typeof availableSeats === 'number' && availableSeats >= 1 && availableSeats <= 8;
  const isValidPrice = price !== '' && !isNaN(parseFloat(price.replace(',', '.'))) && parseFloat(price.replace(',', '.')) >= 0;
  const isFormValid = isValidOrigin && isValidTime && isValidSeats && isValidPrice;
  


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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.formContainer]}> 
            {/* Resumo do veículo */}
            <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}> 
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Veículo</Text>
                <TouchableOpacity onPress={() => setShowCarModal(true)}>
                  <Text style={[styles.link, { color: theme.interactive.link }]}>{carInfo ? 'Editar' : 'Cadastrar'}</Text>
                </TouchableOpacity>
              </View>
              {carInfo ? (
                <Text style={[styles.vehicleText, { color: theme.text.secondary }]}>
                  {carInfo.model} • {carInfo.color} • {carInfo.licensePlate}
                </Text>
              ) : (
                <Text style={[styles.helperText, { color: theme.text.tertiary }]}>Cadastre seu veículo para publicar caronas.</Text>
              )}
            </View>

            {/* Origem */}
            <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}> 
              <Text style={[styles.label, { color: theme.text.primary }]}>Origem</Text>
              <View style={styles.chipsRow}>
                {ORIGIN_PRESETS.map((item) => (
                  <TouchableOpacity key={item} style={[styles.chip, { borderColor: theme.border.primary }]} onPress={() => setOrigin(item)}>
                    <Text style={[styles.chipText, { color: theme.text.primary }]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface.primary, color: theme.text.primary, borderColor: theme.border.primary }]}
                placeholder="Ex.: Centro"
                placeholderTextColor={theme.text.tertiary}
                value={origin}
                onChangeText={setOrigin}
              />
              {!isValidOrigin && (
                <Text style={[styles.errorText, { color: theme.interactive.button.danger }]}>Informe a origem.</Text>
              )}
            </View>

            {/* Horário */}
            <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}> 
              <Text style={[styles.label, { color: theme.text.primary }]}>Horário</Text>
              <View style={styles.chipsRow}>
                {TIME_PRESETS.map((t) => (
                  <TouchableOpacity key={t} style={[styles.chip, { borderColor: theme.border.primary }]} onPress={() => setDepartureTime(t)}>
                    <Text style={[styles.chipText, { color: theme.text.primary }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <CustomTimePicker
                value={departureTime}
                onChange={setDepartureTime}
                placeholder="Selecione o horário"
              />
              {!isValidTime && departureTime !== '' && (
                <Text style={[styles.errorText, { color: theme.interactive.button.danger }]}>Horário inválido.</Text>
              )}
            </View>

            {/* Vagas */}
            <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}> 
              <CustomNumberInput
                value={availableSeats}
                onChange={setAvailableSeats}
                min={1}
                max={8}
                step={1}
                label="Número de vagas (1–8)"
              />
              {!isValidSeats && (
                <Text style={[styles.errorText, { color: theme.interactive.button.danger }]}>Vagas devem estar entre 1 e 8.</Text>
              )}
            </View>

            {/* Preço */}
            <View style={[styles.card, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}> 
              <Text style={[styles.label, { color: theme.text.primary }]}>Preço</Text>
              <View style={styles.chipsRow}>
                <TouchableOpacity style={[styles.chip, { borderColor: theme.border.primary }]} onPress={setFreePrice}>
                  <Text style={[styles.chipText, { color: theme.text.primary }]}>Gratuito</Text>
                </TouchableOpacity>
                {PRICE_PRESETS.filter((p)=>p!=='0,00').map((p) => (
                  <TouchableOpacity key={p} style={[styles.chip, { borderColor: theme.border.primary }]} onPress={() => setPrice(p)}>
                    <Text style={[styles.chipText, { color: theme.text.primary }]}>R$ {p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.priceInputContainer, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}>
                <Text style={[styles.currencySymbol, { color: theme.text.primary }]}>R$</Text>
                <TextInput
                  style={[styles.priceInput, { color: theme.text.primary }]}
                  placeholder="0,00"
                  placeholderTextColor={theme.text.tertiary}
                  value={price}
                  onChangeText={handlePriceChange}
                  keyboardType="numeric"
                />
              </View>
              {!isValidPrice && price !== '' && (
                <Text style={[styles.errorText, { color: theme.interactive.button.danger }]}>Preço inválido.</Text>
              )}
            </View>

            {/* CTA inline (mobile) */}
            {isMobile && (
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: isFormValid ? theme.interactive.button.primary : theme.surface.secondary, borderColor: theme.border.primary }]}
                onPress={handleOfferRide}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <ActivityIndicator color={theme.text.inverse} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: isFormValid ? theme.text.inverse : theme.text.tertiary }]}>
                    {userProfile?.isDriver ? 'Publicar Carona' : 'Tornar-se Motorista e Publicar'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* CTA sticky (web) */}
        {!isMobile && (
          <View style={[styles.stickyBar, { backgroundColor: theme.surface.primary, borderTopColor: theme.border.primary }]}> 
            <View style={styles.stickyContent}>
              <Text style={[styles.stickySummary, { color: theme.text.secondary }]}>
                {origin || 'Origem'} • {departureTime || '--:--'} • {availableSeats} vagas • {price ? `R$ ${price}` : 'Preço'}
              </Text>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: isFormValid ? theme.interactive.button.primary : theme.surface.secondary, borderColor: theme.border.primary }]}
                onPress={handleOfferRide}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <ActivityIndicator color={theme.text.inverse} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: isFormValid ? theme.text.inverse : theme.text.tertiary }]}>
                    {userProfile?.isDriver ? 'Publicar Carona' : 'Tornar-se Motorista e Publicar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    padding: 20,
    paddingBottom: 140, // garante espaço para bottom nav / CTA
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingBottom: 160, // mais espaço por causa do sticky bar
    }),
  },
  formContainer: {
    width: '100%',
    maxWidth: 640,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 13,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    width: '100%',
    height: 50,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  priceInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 8,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stickyBar: {
    position: 'fixed',
    bottom: 0,
    left: 250, // sidebar width em web
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 12,
    zIndex: 1500,
  },
  stickyContent: {
    width: '100%',
    maxWidth: 900,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'space-between',
  },
  stickySummary: {
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },

});

export default OfferRideScreen;
