import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

const CustomAlert = ({ visible, title, message, buttons, onClose }) => {
  const { isWeb } = useResponsive();

  if (!visible) return null;

  // On mobile, use native Alert if available
  if (!isWeb) {
    // For mobile, we'll still use the native Alert
    // This component is mainly for web
    return null;
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'destructive' && styles.destructiveButton,
                  button.style === 'cancel' && styles.cancelButton,
                  buttons.length === 1 && styles.singleButton,
                ]}
                onPress={() => {
                  if (button.onPress) {
                    button.onPress();
                  }
                  onClose();
                }}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'destructive' && styles.destructiveButtonText,
                  button.style === 'cancel' && styles.cancelButtonText,
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  alertContainer: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4299e1',
    alignItems: 'center',
  },
  singleButton: {
    flex: 0,
    minWidth: 100,
  },
  destructiveButton: {
    backgroundColor: '#fc8181',
  },
  cancelButton: {
    backgroundColor: '#4a5568',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  destructiveButtonText: {
    color: '#fff',
  },
  cancelButtonText: {
    color: '#a0aec0',
  },
});

export default CustomAlert;
