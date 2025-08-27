import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

const { width, height } = Dimensions.get('window');

/**
 * Componente de background com gradientes e padrões geométricos
 * Cria um fundo visualmente atrativo para as telas do app
 */
const BackgroundPattern = ({ 
  variant = 'default', 
  children, 
  style,
  showPattern = true 
}) => {
  const { theme, isDarkMode } = useTheme();

  // Configurações de gradiente baseadas no tema e variante
  const getGradientConfig = () => {
    const baseColors = isDarkMode 
      ? ['#1a202c', '#2d3748', '#4a5568'] 
      : ['#ffffff', '#f7fafc', '#edf2f7'];
    
    const accentColors = isDarkMode
      ? ['#4299e1', '#38b2ac', '#48bb78']
      : ['#4299e1', '#38b2ac', '#48bb78'];

    switch (variant) {
      case 'primary':
        return {
          colors: isDarkMode 
            ? ['#1a202c', '#2d3748', '#4299e1'] 
            : ['#ffffff', '#f0f8ff', '#e6f3ff'],
          locations: [0, 0.7, 1],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 }
        };
      case 'secondary':
        return {
          colors: isDarkMode 
            ? ['#1a202c', '#2d3748', '#38b2ac'] 
            : ['#ffffff', '#f0fffe', '#e6fffa'],
          locations: [0, 0.6, 1],
          start: { x: 1, y: 0 },
          end: { x: 0, y: 1 }
        };
      case 'success':
        return {
          colors: isDarkMode 
            ? ['#1a202c', '#2d3748', '#48bb78'] 
            : ['#ffffff', '#f0fff4', '#e6fffa'],
          locations: [0, 0.8, 1],
          start: { x: 0.5, y: 0 },
          end: { x: 0.5, y: 1 }
        };
      default:
        return {
          colors: baseColors,
          locations: [0, 0.5, 1],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 }
        };
    }
  };

  // Renderiza padrão geométrico sutil
  const renderPattern = () => {
    if (!showPattern) return null;

    return (
      <View style={styles.patternContainer}>
        {/* Círculos decorativos */}
        <View style={[
          styles.circle, 
          styles.circle1,
          { 
            backgroundColor: isDarkMode 
              ? 'rgba(66, 153, 225, 0.05)' 
              : 'rgba(66, 153, 225, 0.03)' 
          }
        ]} />
        <View style={[
          styles.circle, 
          styles.circle2,
          { 
            backgroundColor: isDarkMode 
              ? 'rgba(56, 178, 172, 0.04)' 
              : 'rgba(56, 178, 172, 0.02)' 
          }
        ]} />
        <View style={[
          styles.circle, 
          styles.circle3,
          { 
            backgroundColor: isDarkMode 
              ? 'rgba(72, 187, 120, 0.03)' 
              : 'rgba(72, 187, 120, 0.02)' 
          }
        ]} />
        
        {/* Grid pattern sutil */}
        <View style={[
          styles.gridPattern,
          {
            borderColor: isDarkMode 
              ? 'rgba(255, 255, 255, 0.02)' 
              : 'rgba(0, 0, 0, 0.01)'
          }
        ]} />
      </View>
    );
  };

  const gradientConfig = getGradientConfig();

  const renderChildrenSafely = (nodes) => {
    return React.Children.map(nodes, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return <Text>{child}</Text>;
      }
      return child;
    });
  };

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <LinearGradient
        colors={gradientConfig.colors}
        locations={gradientConfig.locations}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={styles.gradient}
        pointerEvents="none"
      />
      <View pointerEvents="none">{renderPattern()}</View>
      <View style={styles.content}>
        {renderChildrenSafely(children)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  
  // Círculos decorativos
  circle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.4,
    right: -width * 0.2,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: -width * 0.2,
    left: -width * 0.1,
  },
  circle3: {
    width: width * 0.4,
    height: width * 0.4,
    top: height * 0.3,
    right: -width * 0.1,
  },
  
  // Grid pattern
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    opacity: 0.1,
  },
});

export default BackgroundPattern;
