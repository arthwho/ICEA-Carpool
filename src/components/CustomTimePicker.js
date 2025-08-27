import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * Custom Time Picker Component
 * Provides a standardized time input with hour and minute selection
 */
const CustomTimePicker = ({
  value,
  onChange,
  style,
  containerStyle,
  label,
  labelStyle,
  disabled = false,
  placeholder = "Selecione o horário",
}) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  
  // Parse current value or set default
  const parseTime = (timeString) => {
    if (!timeString) return { hours: 0, minutes: 0 };
    
    // Handle HH:MM format
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }
    
    return { hours: 0, minutes: 0 };
  };

  const [selectedTime, setSelectedTime] = useState(parseTime(value));

  // Generate time options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (hours, minutes) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleTimeSelect = (hours, minutes) => {
    const newTime = { hours, minutes };
    setSelectedTime(newTime);
    const formattedTime = formatTime(hours, minutes);
    onChange(formattedTime);
    setShowPicker(false);
  };

  const handleConfirm = () => {
    const formattedTime = formatTime(selectedTime.hours, selectedTime.minutes);
    onChange(formattedTime);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setSelectedTime(parseTime(value));
    setShowPicker(false);
  };

  const displayValue = value || placeholder;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text.primary }, labelStyle]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          { 
            backgroundColor: theme.surface.primary,
            borderColor: theme.border.primary
          },
          style,
          disabled && { backgroundColor: theme.surface.disabled }
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.inputText,
          { color: value ? theme.text.primary : theme.text.tertiary }
        ]}>
          {displayValue}
        </Text>
        <Text style={[styles.arrow, { color: theme.text.tertiary }]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[
                styles.modalContent, 
                { backgroundColor: theme.surface.primary }
              ]}>
                <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                  Selecione o Horário
                </Text>
                
                <View style={styles.pickerContainer}>
                  {/* Hours Picker */}
                  <View style={styles.pickerColumn}>
                    <Text style={[styles.pickerLabel, { color: theme.text.tertiary }]}>Hora</Text>
                    <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                      {hours.map((hour) => (
                        <TouchableOpacity
                          key={hour}
                          style={[
                            styles.pickerItem,
                            selectedTime.hours === hour && { backgroundColor: theme.interactive.button.primary }
                          ]}
                          onPress={() => setSelectedTime(prev => ({ ...prev, hours: hour }))}
                        >
                          <Text style={[
                            styles.pickerItemText,
                            { color: theme.text.primary },
                            selectedTime.hours === hour && { color: theme.text.inverse }
                          ]}>
                            {hour.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <Text style={[styles.timeSeparator, { color: theme.text.primary }]}>:</Text>

                  {/* Minutes Picker */}
                  <View style={styles.pickerColumn}>
                    <Text style={[styles.pickerLabel, { color: theme.text.tertiary }]}>Minuto</Text>
                    <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                      {minutes.map((minute) => (
                        <TouchableOpacity
                          key={minute}
                          style={[
                            styles.pickerItem,
                            selectedTime.minutes === minute && { backgroundColor: theme.interactive.button.primary }
                          ]}
                          onPress={() => setSelectedTime(prev => ({ ...prev, minutes: minute }))}
                        >
                          <Text style={[
                            styles.pickerItemText,
                            { color: theme.text.primary },
                            selectedTime.minutes === minute && { color: theme.text.inverse }
                          ]}>
                            {minute.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.surface.secondary }]}
                    onPress={handleCancel}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.text.primary }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.interactive.button.primary }]}
                    onPress={handleConfirm}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.text.inverse }]}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 350,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  pickerScroll: {
    height: 150,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginVertical: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomTimePicker;
