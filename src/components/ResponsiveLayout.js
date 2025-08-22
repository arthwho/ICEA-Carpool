import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive Layout Component
const ResponsiveLayout = ({ children, mobileLayout, webLayout, style }) => {
  const isWeb = Platform.OS === 'web';
  
  // Use different layouts based on platform
  const layoutStyle = isWeb ? webLayout : mobileLayout;
  
  return (
    <View style={[styles.container, layoutStyle, style]}>
      {children}
    </View>
  );
};

// Responsive Container Component
export const ResponsiveContainer = ({ children, style, user }) => {
  const isWeb = Platform.OS === 'web';
  
  return (
    <View style={[
      styles.container,
      isWeb ? styles.webContainer : styles.mobileContainer,
      isWeb && user && styles.webContainerWithSidebar,
      style
    ]}>
      {children}
    </View>
  );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ children, columns = 1, style }) => {
  const isWeb = Platform.OS === 'web';
  const webColumns = Math.max(2, columns); // Web gets at least 2 columns
  
  return (
    <View style={[
      styles.grid,
      {
        flexDirection: isWeb ? 'row' : 'column',
        flexWrap: isWeb ? 'wrap' : 'nowrap',
      },
      style
    ]}>
      {React.Children.map(children, (child, index) => (
        <View style={[
          styles.gridItem,
          isWeb && {
            width: `${100 / webColumns}%`,
            paddingHorizontal: 10,
          }
        ]}>
          {child}
        </View>
      ))}
    </View>
  );
};

// Responsive Card Component
export const ResponsiveCard = ({ children, style }) => {
  const isWeb = Platform.OS === 'web';
  
  return (
    <View style={[
      styles.card,
      isWeb ? styles.webCard : styles.mobileCard,
      style
    ]}>
      {children}
    </View>
  );
};

// Mobile-specific container with bottom navigation spacing
export const MobileContainer = ({ children, style }) => {
  const isWeb = Platform.OS === 'web';
  
  if (isWeb) {
    return <ResponsiveContainer style={style}>{children}</ResponsiveContainer>;
  }
  
  return (
    <View style={[styles.container, styles.mobileContainer, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mobileContainer: {
    padding: 20,
    backgroundColor: '#2d3748',
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  webContainer: {
    padding: 40,
    backgroundColor: '#2d3748',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    minHeight: '100vh',
    marginTop: 76, // Account for fixed header height (24px padding * 2 + 28px font height)
  },
  webContainerWithSidebar: {
    marginLeft: 250, // Account for sidebar width
  },
  grid: {
    flex: 1,
  },
  gridItem: {
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#4a5568',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  mobileCard: {
    width: '100%',
  },
  webCard: {
    width: '100%',
    maxWidth: 400,
    marginHorizontal: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
});

export default ResponsiveLayout;
