import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { subscribeAvailableRides, deleteRide as dbDeleteRide, adminConfig } from '../services/firebase';
import { ResponsiveContainer, MobileContainer, ResponsiveGrid, ResponsiveCard } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useTheme } from '../hooks/useTheme';
import CustomAlert from '../components/CustomAlert';

/**
 * Tela para encontrar e visualizar caronas disponíveis
 * Utiliza listener em tempo real para atualizações automáticas
 * @param {Function} setScreen - Função para navegar entre telas
 * @param {Object} user - Dados do usuário logado
 */
const FindRideScreen = ({ setScreen, user }) => {
  // ========================================
  // ESTADOS DA TELA
  // ========================================
  
  // Lista de caronas disponíveis (atualizada em tempo real)
  const [rides, setRides] = useState([]);
  
  // Estado de carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // ========================================
  // HOOKS PARA RESPONSIVIDADE E TEMA
  // ========================================
  
  const { isMobile } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();
  const { theme } = useTheme();

  // ========================================
  // VERIFICAÇÃO DE ADMINISTRADOR
  // ========================================
  
  // Verifica se o usuário atual é administrador
  // Administradores podem excluir caronas
  const isAdmin = user && user.email === adminConfig.email;

  // ========================================
  // LISTENER EM TEMPO REAL PARA CARONAS
  // ========================================
  
  /**
   * Configura um listener em tempo real para caronas disponíveis
   * Este listener é executado sempre que há mudanças na coleção 'rides'
   * Não precisa recarregar manualmente - atualiza automaticamente
   */
  useEffect(() => {
    // Configura o listener do Firestore
    // subscribeAvailableRides retorna uma função para cancelar o listener
    const unsubscribe = subscribeAvailableRides((fetchedRides) => {
      // Esta função é chamada sempre que os dados mudam no Firestore
      setRides(fetchedRides); // Atualiza a lista de caronas
      setLoading(false);      // Finaliza o carregamento
    });

    // Função de limpeza - remove o listener quando o componente é desmontado
    // Isso evita vazamentos de memória e listeners desnecessários
    return () => unsubscribe();
  }, []);

  // ========================================
  // FUNÇÃO DE EXCLUSÃO DE CARONAS
  // ========================================
  
  /**
   * Função para excluir uma carona (apenas para administradores)
   * Remove a carona do Firestore, que automaticamente atualiza a lista
   * @param {string} rideId - ID da carona a ser excluída
   */
  const handleDeleteRide = (rideId) => {
    // Mostra um alerta de confirmação antes de excluir
    showAlert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta carona?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('Exclusão cancelada'),
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove a carona do Firestore
              await dbDeleteRide(rideId);
              
              // Como o listener está ativo, a lista será atualizada automaticamente
              // Não precisamos atualizar o estado manualmente
              showAlert('Sucesso', 'Carona excluída com sucesso!');
            } catch (error) {
              console.error('Error deleting ride:', error);
              showAlert('Erro', 'Não foi possível excluir a carona.');
            }
          },
        },
      ]
    );
  };

  // ========================================
  // RENDERIZAÇÃO
  // ========================================
  
  // Escolhe o container baseado na plataforma (mobile ou web)
  const Container = isMobile ? MobileContainer : ResponsiveContainer;

  // Tela de carregamento enquanto os dados estão sendo buscados
  if (loading) {
    const LoadingContainer = isMobile ? MobileContainer : ResponsiveContainer;
    return (
      <LoadingContainer style={styles.loadingContainer} user={user}>
        <ActivityIndicator size="large" color={theme.interactive.active} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>Buscando caronas...</Text>
      </LoadingContainer>
    );
  }

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
      
      {/* Lista de caronas */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rides.length > 0 ? (
          // Grid responsivo para exibir as caronas
          <ResponsiveGrid>
            {rides.map((item) => (
              <ResponsiveCard key={item.id} style={[styles.rideCard, { backgroundColor: theme.surface.elevated }]}>
                {/* Informações da carona */}
                <Text style={[styles.rideTitle, { color: theme.text.primary }]}>{item.origin} para {item.destination}</Text>
                <Text style={[styles.rideDetail, { color: theme.text.tertiary }]}>
                  <Text style={[styles.bold, { color: theme.text.primary }]}>Motorista:</Text> {item.driverName}
                </Text>
                <Text style={[styles.rideDetail, { color: theme.text.tertiary }]}>
                  <Text style={[styles.bold, { color: theme.text.primary }]}>Horário:</Text> {item.departureTime}
                </Text>
                <Text style={[styles.rideDetail, { color: theme.text.tertiary }]}>
                  <Text style={[styles.bold, { color: theme.text.primary }]}>Vagas:</Text> {item.availableSeats}
                </Text>
                <Text style={[styles.rideDetail, { color: theme.text.tertiary }]}>
                  <Text style={[styles.bold, { color: theme.text.primary }]}>Preço:</Text> 
                  {!item.price || item.price === 0 ? (
                    <Text style={[styles.freeRide, { color: theme.status.available }]}> Gratuito</Text>
                  ) : (
                    <Text style={[styles.priceText, { color: theme.text.primary }]}> R$ {Number(item.price).toFixed(2).replace('.', ',')}</Text>
                  )}
                </Text>
                
                {/* Display car information if available */}
                {item.carInfo && (
                  <View style={[styles.carInfoSection, { 
                    backgroundColor: theme.interactive.active + '1A',
                    borderLeftColor: theme.interactive.active 
                  }]}>
                    <Text style={[styles.carInfoTitle, { color: theme.interactive.active }]}>Veículo:</Text>
                    <Text style={[styles.carInfoText, { color: theme.text.secondary }]}>
                      {item.carInfo.model} - {item.carInfo.color}
                    </Text>
                    <Text style={[styles.carInfoText, { color: theme.text.secondary }]}>
                      Placa: {item.carInfo.licensePlate}
                    </Text>
                  </View>
                )}
                
                {isAdmin ? (
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: theme.interactive.button.danger }]}
                    onPress={() => handleDeleteRide(item.id)}
                  >
                    <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Excluir Carona</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.bookButton, { backgroundColor: theme.status.available }]}>
                    <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Reservar Vaga</Text>
                  </TouchableOpacity>
                )}
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        ) : (
          <Text style={[styles.noRidesText, { color: theme.text.tertiary }]}>Nenhuma carona disponível no momento.</Text>
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  rideCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
  },
  rideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rideDetail: {
    fontSize: 16,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  freeRide: {
    fontWeight: 'bold',
  },
  priceText: {
    fontWeight: 'bold',
  },
  carInfoSection: {
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  carInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  carInfoText: {
    fontSize: 14,
    marginBottom: 2,
  },
  bookButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noRidesText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default FindRideScreen;
