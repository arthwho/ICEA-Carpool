import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Hook para animações sutis e microinterações
 * Seguindo princípios de Material Design e iOS Human Interface Guidelines
 */
export const useAnimations = () => {
  // Valores animados reutilizáveis
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  /**
   * Animação de fade in suave
   * @param {number} duration - Duração em ms
   * @param {number} delay - Delay antes de iniciar
   */
  const fadeIn = (duration = 300, delay = 0) => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    return fadeAnim;
  };

  /**
   * Animação de fade out suave
   * @param {number} duration - Duração em ms
   * @param {Function} onComplete - Callback ao completar
   */
  const fadeOut = (duration = 300, onComplete) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(onComplete);
    return fadeAnim;
  };

  /**
   * Animação de pressionar (press feedback)
   * Simula feedback tátil visual
   * @param {Function} onComplete - Callback ao completar
   */
  const pressAnimation = (onComplete) => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start(onComplete);
    return scaleAnim;
  };

  /**
   * Animação de slide in (deslizar para dentro)
   * @param {string} direction - 'left', 'right', 'up', 'down'
   * @param {number} distance - Distância do slide
   * @param {number} duration - Duração em ms
   */
  const slideIn = (direction = 'up', distance = 50, duration = 400) => {
    const initialValue = {
      left: -distance,
      right: distance,
      up: distance,
      down: -distance,
    }[direction];

    slideAnim.setValue(initialValue);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
    
    return slideAnim;
  };

  /**
   * Animação de bounce (quique sutil)
   * Para destacar elementos importantes
   * @param {number} intensity - Intensidade do bounce (0.1 - 0.3)
   */
  const bounceAnimation = (intensity = 0.15) => {
    bounceAnim.setValue(1);
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1 + intensity,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
    return bounceAnim;
  };

  /**
   * Animação de entrada escalonada para listas
   * Cria efeito de cascata suave
   * @param {number} itemCount - Número de itens
   * @param {number} stagger - Delay entre itens (ms)
   */
  const staggeredFadeIn = (itemCount, stagger = 100) => {
    const animations = [];
    
    for (let i = 0; i < itemCount; i++) {
      const anim = new Animated.Value(0);
      animations.push(anim);
      
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * stagger,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
    
    return animations;
  };

  /**
   * Animação de loading (pulso suave)
   * Para indicadores de carregamento
   */
  const pulseAnimation = () => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    
    pulse();
    return pulseAnim;
  };

  /**
   * Transição suave entre estados
   * @param {boolean} state - Estado atual
   * @param {number} duration - Duração da transição
   */
  const smoothTransition = (state, duration = 250) => {
    const transitionAnim = useRef(new Animated.Value(state ? 1 : 0)).current;
    
    useEffect(() => {
      Animated.timing(transitionAnim, {
        toValue: state ? 1 : 0,
        duration,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
    }, [state, duration, transitionAnim]);
    
    return transitionAnim;
  };

  /**
   * Shake animation (para erros ou feedback negativo)
   * @param {number} intensity - Intensidade do shake
   */
  const shakeAnimation = (intensity = 10) => {
    const shakeAnim = useRef(new Animated.Value(0)).current;
    
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    
    return shakeAnim;
  };

  return {
    // Valores animados
    fadeAnim,
    scaleAnim,
    slideAnim,
    bounceAnim,
    
    // Funções de animação
    fadeIn,
    fadeOut,
    pressAnimation,
    slideIn,
    bounceAnimation,
    staggeredFadeIn,
    pulseAnimation,
    smoothTransition,
    shakeAnimation,
  };
};

/**
 * Hook para animações de entrada automáticas
 * Ideal para componentes que precisam de animação ao montar
 */
export const useEntranceAnimation = (type = 'fadeIn', delay = 0) => {
  const { fadeIn, slideIn, bounceAnimation } = useAnimations();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      switch (type) {
        case 'fadeIn':
          fadeIn();
          break;
        case 'slideUp':
          slideIn('up');
          break;
        case 'bounce':
          bounceAnimation();
          break;
        default:
          fadeIn();
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);
  
  const animations = useAnimations();
  return animations;
};

export default useAnimations;