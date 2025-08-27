import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * Custom Number Input Component
 * Provides increment/decrement buttons and number validation
 */
const CustomNumberInput = ({
  value,
  onChange,
  min = 1,
  max = 8,
  step = 1,
  style,
  containerStyle,
  label,
  labelStyle,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(value - step);
    }
  };

  const handleTextChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '') {
      onChange(min);
    } else {
      const numValue = parseInt(numericValue, 10);
      if (numValue >= min && numValue <= max) {
        onChange(numValue);
      } else if (numValue > max) {
        onChange(max);
      }
    }
  };

  const isDecrementDisabled = disabled || value <= min;
  const isIncrementDisabled = disabled || value >= max;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text.primary }, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: theme.surface.primary,
          borderColor: theme.border.primary
        },
        style
      ]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.interactive.button.secondary },
            isDecrementDisabled && { backgroundColor: theme.surface.disabled }
          ]}
          onPress={handleDecrement}
          disabled={isDecrementDisabled}
        >
          <Text style={[
            styles.buttonText,
            { color: theme.text.primary },
            isDecrementDisabled && { color: theme.text.disabled }
          ]}>
            -
          </Text>
        </TouchableOpacity>
        
        <TextInput
          style={[
            styles.textInput,
            { 
              color: theme.text.primary,
              backgroundColor: theme.surface.primary
            }
          ]}
          value={value.toString()}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          textAlign="center"
          editable={!disabled}
          placeholderTextColor={theme.text.tertiary}
        />
        
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.interactive.button.secondary },
            isIncrementDisabled && { backgroundColor: theme.surface.disabled }
          ]}
          onPress={handleIncrement}
          disabled={isIncrementDisabled}
        >
          <Text style={[
            styles.buttonText,
            { color: theme.text.primary },
            isIncrementDisabled && { color: theme.text.disabled }
          ]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 350,
    marginBottom: 15,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    height: 50,
  },
  button: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 18,
    fontWeight: '500',
    paddingHorizontal: 15,
  },
});

export default CustomNumberInput;
