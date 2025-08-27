import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';

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
  const { theme } = useTheme();
  
  return (
    <View style={[
      styles.container,
      isWeb ? styles.webContainer : styles.mobileContainer,
      isWeb && user && styles.webContainerWithSidebar,
      { backgroundColor: theme.background.secondary },
      style
    ]}>
      {children}
    </View>
  );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ children, columns = 1, style }) => {
  const isWeb = Platform.OS === 'web';
  const { theme } = useTheme();
  const webColumns = Math.max(2, columns); // Web gets at least 2 columns
  
  return (
    <View style={[
      styles.grid,
      isWeb && {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        width: '100%',
        padding: '0 10px', // Add some padding to prevent cards from touching edges
      },
      !isWeb && {
        flexDirection: 'column',
      },
      style
    ]}>
      {React.Children.map(children, (child, index) => (
        <View style={[
          styles.gridItem,
          !isWeb && styles.mobileGridItem,
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
  const { theme } = useTheme();
  
  return (
    <View 
      style={[
        styles.card,
        isWeb ? styles.webCard : styles.mobileCard,
        { 
          backgroundColor: theme.surface.primary,
          ...(isWeb && {
            boxShadow: `0 4px 6px ${theme.shadow.primaryWithOpacity}`,
          })
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

// Mobile-specific container with bottom navigation spacing
export const MobileContainer = ({ children, style }) => {
  const isWeb = Platform.OS === 'web';
  const { theme } = useTheme();
  
  if (isWeb) {
    return <ResponsiveContainer style={style}>{children}</ResponsiveContainer>;
  }
  
  return (
    <View style={[styles.container, styles.mobileContainer, { backgroundColor: theme.background.secondary }, style]}>
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
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  webContainer: {
    padding: 20, // Equal padding on all sides
    width: '100vw',
    minHeight: '100vh',
    marginTop: 76, // Account for fixed header height (24px padding * 2 + 28px font height)
  },
  webContainerWithSidebar: {
    marginLeft: 250, // Account for sidebar width
    padding: 20, // Equal padding on all sides when sidebar is present
    width: 'calc(100vw - 250px)', // Subtract sidebar width from viewport width
  },
  grid: {
    flex: 1,
  },
  gridItem: {
    marginBottom: 15,
  },
  mobileGridItem: {
    width: '100%',
  },
  card: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  mobileCard: {
    width: '100%',
  },
  webCard: {
    width: '100%',
    height: '100%',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },
});

export default ResponsiveLayout;
