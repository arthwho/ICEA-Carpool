import { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({ width, height });
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const updateDimensions = ({ window }) => {
      setDimensions(window);
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    };

    // Use the modern Dimensions API
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    
    return () => {
      // Modern API returns a subscription object with remove method
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const isTablet = isMobile && (dimensions.width >= BREAKPOINTS.tablet || dimensions.height >= BREAKPOINTS.tablet);
  const isDesktop = isWeb && dimensions.width >= BREAKPOINTS.desktop;
  const isLandscape = orientation === 'landscape';

  // Responsive utilities
  const getResponsiveValue = (mobile, tablet, desktop) => {
    if (isDesktop) return desktop;
    if (isTablet) return tablet;
    return mobile;
  };

  const getResponsiveStyle = (mobileStyle, webStyle) => {
    return isWeb ? { ...mobileStyle, ...webStyle } : mobileStyle;
  };

  // Grid utilities
  const getGridColumns = (mobileCols = 1, tabletCols = 2, desktopCols = 3) => {
    return getResponsiveValue(mobileCols, tabletCols, desktopCols);
  };

  const getGridGap = (mobileGap = 10, tabletGap = 20, desktopGap = 30) => {
    return getResponsiveValue(mobileGap, tabletGap, desktopGap);
  };

  return {
    // Platform detection
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    
    // Dimensions
    width: dimensions.width,
    height: dimensions.height,
    
    // Responsive utilities
    getResponsiveValue,
    getResponsiveStyle,
    getGridColumns,
    getGridGap,
    
    // Breakpoints
    breakpoints: BREAKPOINTS,
  };
};
