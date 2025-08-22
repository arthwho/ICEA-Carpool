import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { subscribeAvailableRides, deleteRide as dbDeleteRide, updateRide as dbUpdateRide, adminConfig } from '../services/firebase';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard, MobileContainer } from '../components/ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

const FindRideScreen = ({ setScreen, user }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isWeb, isMobile, getResponsiveValue } = useResponsive();
  const { showAlert, alertState, closeAlert } = useCustomAlert();

  const isAdmin = user?.email === adminConfig.email;

  useEffect(() => {
    const unsubscribe = subscribeAvailableRides((data) => {
      setRides(data);
      setLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleBookRide = (rideId) => {
    showAlert('Sucesso', `Reserva para a carona ${rideId} solicitada! (Funcionalidade a ser implementada)`);
  };

  const handleDeleteRide = (rideId) => {
    showAlert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta carona?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await dbDeleteRide(rideId);
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

  const renderRideItem = ({ item }) => (
    <ResponsiveCard style={styles.rideItem}>
      <Text style={styles.rideText}>
        <Text style={styles.bold}>Motorista:</Text> {item.driverName}
      </Text>
      <Text style={styles.rideText}>
        <Text style={styles.bold}>Saída:</Text> {item.origin}
      </Text>
      <Text style={styles.rideText}>
        <Text style={styles.bold}>Horário:</Text> {item.departureTime}
      </Text>
      <Text style={styles.rideText}>
        <Text style={styles.bold}>Vagas:</Text> {item.availableSeats}
      </Text>
      
      {isAdmin ? (
        <View style={styles.adminControls}>
          <TouchableOpacity 
            style={[styles.adminButton, styles.editButton]}
            onPress={() => showAlert('Editar', 'Funcionalidade de edição a ser implementada')}
          >
            <Text style={styles.adminButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.adminButton, styles.deleteButton]}
            onPress={() => handleDeleteRide(item.id)}
          >
            <Text style={styles.adminButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => handleBookRide(item.id)}
        >
          <Text style={styles.bookButtonText}>Pedir Carona</Text>
        </TouchableOpacity>
      )}
    </ResponsiveCard>
  );

  if (loading) {
    const LoadingContainer = isMobile ? MobileContainer : ResponsiveContainer;
    return (
      <LoadingContainer style={styles.loadingContainer} user={user}>
        <ActivityIndicator size="large" color="#4299e1" />
        <Text style={styles.loadingText}>Buscando caronas...</Text>
      </LoadingContainer>
    );
  }

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
      
      {rides.length > 0 ? (
        isWeb ? (
          <ResponsiveGrid 
            columns={getResponsiveValue(1, 2, 3)} 
            style={styles.ridesGrid}
          >
            {rides.map((ride, index) => (
              <View key={ride.id} style={styles.rideWrapper}>
                {renderRideItem({ item: ride })}
              </View>
            ))}
          </ResponsiveGrid>
        ) : (
          <FlatList
            data={rides}
            renderItem={renderRideItem}
            keyExtractor={(item) => item.id}
            style={styles.ridesList}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <Text style={styles.emptyText}>Nenhuma carona disponível no momento.</Text>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  ridesList: {
    width: '100%',
    flex: 1,
  },
  ridesGrid: {
    width: '100%',
    flex: 1,
  },
  rideWrapper: {
    width: '100%',
  },
  rideItem: {
    width: '100%',
  },
  rideText: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#38b2ac',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#a0aec0',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  adminControls: {
    flexDirection: 'row',
    marginTop: 10,
  },
  adminButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  editButton: {
    backgroundColor: '#ed8936',
  },
  deleteButton: {
    backgroundColor: '#fc8181',
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FindRideScreen;
