import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../hooks/useTheme';

const CustomAlert = ({ visible, title, message, buttons, onClose }) => {
  const { isWeb } = useResponsive();
  const { theme } = useTheme();

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
      <View style={[styles.overlay, { backgroundColor: theme.shadow.primary + '80' }]}>
        <View style={[styles.alertContainer, { 
          backgroundColor: theme.background.modal,
          borderColor: theme.border.primary
        }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  { backgroundColor: theme.interactive.button.primary },
                  button.style === 'destructive' && { backgroundColor: theme.interactive.button.danger },
                  button.style === 'cancel' && { backgroundColor: theme.interactive.button.secondary },
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
                  { color: theme.text.inverse },
                  button.style === 'cancel' && { color: theme.text.tertiary },
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  alertContainer: {
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
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
    alignItems: 'center',
  },
  singleButton: {
    flex: 0,
    minWidth: 100,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomAlert;
