import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { subscribeAvailableRides, deleteRide as dbDeleteRide, updateRide as dbUpdateRide, adminConfig } from '../services/firebase';

const FindRideScreen = ({ setScreen, user }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === adminConfig.email;

  useEffect(() => {
    const unsubscribe = subscribeAvailableRides((data) => {
      setRides(data);
      setLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleBookRide = (rideId) => {
    Alert.alert('Sucesso', `Reserva para a carona ${rideId} solicitada! (Funcionalidade a ser implementada)`);
  };

  const handleDeleteRide = (rideId) => {
    Alert.alert(
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
              Alert.alert('Sucesso', 'Carona excluída com sucesso!');
            } catch (error) {
              console.error('Error deleting ride:', error);
              Alert.alert('Erro', 'Não foi possível excluir a carona.');
            }
          },
        },
      ]
    );
  };

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
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
            onPress={() => Alert.alert('Editar', 'Funcionalidade de edição a ser implementada')}
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
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4299e1" />
        <Text style={styles.loadingText}>Buscando caronas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caronas Disponíveis</Text>
      
      {rides.length > 0 ? (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id}
          style={styles.ridesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhuma carona disponível no momento.</Text>
      )}
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setScreen('Home')}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  rideItem: {
    backgroundColor: '#4a5568',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
  backButton: {
    position: 'absolute',
    bottom: 20,
    padding: 15,
  },
  backButtonText: {
    color: '#63b3ed',
    fontSize: 16,
  },
});

export default FindRideScreen;
