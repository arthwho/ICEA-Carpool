import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

const CarInfoModal = ({ visible, onClose, onSave, loading, initialValues = null, isEditing = false }) => {
  const [carModel, setCarModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [carColor, setCarColor] = useState('');
  const { theme } = useTheme();

  // Load initial values when modal opens or when initialValues change
  useEffect(() => {
    if (initialValues) {
      setCarModel(initialValues.model || '');
      setLicensePlate(initialValues.licensePlate || '');
      setCarColor(initialValues.color || '');
    } else {
      // Reset form when no initial values (creating new)
      setCarModel('');
      setLicensePlate('');
      setCarColor('');
    }
  }, [initialValues, visible]);

  const handleSave = () => {
    if (!carModel.trim() || !licensePlate.trim() || !carColor.trim()) {
      return;
    }

    onSave({
      model: carModel.trim(),
      licensePlate: licensePlate.trim().toUpperCase(),
      color: carColor.trim(),
    });

    // Reset form
    setCarModel('');
    setLicensePlate('');
    setCarColor('');
  };

  const handleCancel = () => {
    // Reset form
    setCarModel('');
    setLicensePlate('');
    setCarColor('');
    onClose();
  };

  const getTitle = () => {
    return isEditing ? 'Editar Informações do Veículo' : 'Informações do Veículo';
  };

  const getSubtitle = () => {
    return isEditing 
      ? 'Atualize as informações do seu veículo'
      : 'Para oferecer caronas, precisamos das informações do seu veículo';
  };

  const getSaveButtonText = () => {
    return isEditing ? 'Atualizar' : 'Salvar';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={[styles.overlay, { backgroundColor: theme.shadow.primary + '80' }]}>
        <View style={[styles.modalContainer, { 
          backgroundColor: theme.background.modal,
          borderColor: theme.border.primary
        }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{getTitle()}</Text>
          <Text style={[styles.subtitle, { color: theme.text.tertiary }]}>
            {getSubtitle()}
          </Text>

          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface.primary,
              color: theme.text.primary,
              borderColor: theme.border.primary
            }]}
            placeholder="Modelo do Carro (Ex: Honda Civic)"
            placeholderTextColor={theme.text.tertiary}
            value={carModel}
            onChangeText={setCarModel}
            autoCapitalize="words"
          />

          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface.primary,
              color: theme.text.primary,
              borderColor: theme.border.primary
            }]}
            placeholder="Placa (Ex: ABC-1234)"
            placeholderTextColor={theme.text.tertiary}
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
            maxLength={7}
          />

          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.surface.primary,
              color: theme.text.primary,
              borderColor: theme.border.primary
            }]}
            placeholder="Cor do Carro"
            placeholderTextColor={theme.text.tertiary}
            value={carColor}
            onChangeText={setCarColor}
            autoCapitalize="words"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.interactive.button.secondary }]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text.tertiary }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.interactive.button.primary },
                (!carModel.trim() || !licensePlate.trim() || !carColor.trim()) && { backgroundColor: theme.surface.secondary }
              ]}
              onPress={handleSave}
              disabled={loading || !carModel.trim() || !licensePlate.trim() || !carColor.trim()}
            >
              {loading ? (
                <ActivityIndicator color={theme.text.inverse} size="small" />
              ) : (
                <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>{getSaveButtonText()}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CarInfoModal;
