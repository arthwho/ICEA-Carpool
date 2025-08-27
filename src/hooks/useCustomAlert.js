import { useState } from 'react';
import { Alert } from 'react-native';
import { useResponsive } from './useResponsive';

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    onClose: null,
  });
  const { isWeb } = useResponsive();

  const showAlert = (title, message, buttons) => {
    if (isWeb) {
      // Use custom alert for web
      setAlertState({
        visible: true,
        title,
        message,
        buttons,
        onClose: () => setAlertState(prev => ({ ...prev, visible: false })),
      });
    } else {
      // Use native Alert for mobile
      // Convert buttons array to native Alert format
      let nativeButtons = null;
      if (buttons && buttons.length > 0) {
        nativeButtons = buttons.map(button => ({
          text: button.text,
          onPress: button.onPress,
          style: button.style === 'destructive' ? 'destructive' : 
                 button.style === 'cancel' ? 'cancel' : 'default'
        }));
      }
      Alert.alert(title, message, nativeButtons);
    }
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  return {
    showAlert,
    closeAlert,
    alertState,
  };
};
