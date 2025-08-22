import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard } from './ResponsiveLayout';
import { useResponsive } from '../hooks/useResponsive';

// Example component showing different layouts for mobile and web
const ResponsiveExample = () => {
  const { isWeb, isMobile, isTablet, isDesktop, getResponsiveValue } = useResponsive();

  // Different content based on platform
  const getPlatformSpecificContent = () => {
    if (isWeb) {
      return {
        title: 'Web Experience',
        subtitle: 'Optimized for desktop and tablet',
        layout: 'grid',
        columns: getResponsiveValue(2, 3, 4),
      };
    } else {
      return {
        title: 'Mobile Experience',
        subtitle: 'Optimized for touch and small screens',
        layout: 'list',
        columns: 1,
      };
    }
  };

  const content = getPlatformSpecificContent();

  // Different styles based on platform
  const getResponsiveStyles = () => {
    const baseStyles = {
      container: {
        flex: 1,
        backgroundColor: '#2d3748',
      },
      title: {
        fontSize: getResponsiveValue(24, 28, 32),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
      },
      subtitle: {
        fontSize: getResponsiveValue(14, 16, 18),
        color: '#a0aec0',
        textAlign: 'center',
        marginBottom: 30,
      },
    };

    // Platform-specific overrides
    if (isWeb) {
      return {
        ...baseStyles,
        container: {
          ...baseStyles.container,
          maxWidth: 1200,
          alignSelf: 'center',
          padding: 40,
        },
        title: {
          ...baseStyles.title,
          fontSize: 36,
        },
      };
    }

    return baseStyles;
  };

  const styles = getResponsiveStyles();

  const items = [
    { id: 1, title: 'Feature 1', description: 'Description for feature 1' },
    { id: 2, title: 'Feature 2', description: 'Description for feature 2' },
    { id: 3, title: 'Feature 3', description: 'Description for feature 3' },
    { id: 4, title: 'Feature 4', description: 'Description for feature 4' },
  ];

  const renderItem = (item) => (
    <ResponsiveCard key={item.id} style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <TouchableOpacity style={styles.cardButton}>
        <Text style={styles.cardButtonText}>Learn More</Text>
      </TouchableOpacity>
    </ResponsiveCard>
  );

  return (
    <ResponsiveContainer style={styles.container}>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>
      
      {/* Platform-specific layout */}
      {content.layout === 'grid' ? (
        <ResponsiveGrid columns={content.columns} style={styles.grid}>
          {items.map(renderItem)}
        </ResponsiveGrid>
      ) : (
        <View style={styles.list}>
          {items.map(renderItem)}
        </View>
      )}

      {/* Platform-specific footer */}
      {isWeb && (
        <View style={styles.webFooter}>
          <Text style={styles.footerText}>
            Web-optimized layout with {content.columns} columns
          </Text>
        </View>
      )}
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: '#4299e1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: {
    width: '100%',
  },
  list: {
    width: '100%',
  },
  webFooter: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#4a5568',
    borderRadius: 8,
    alignItems: 'center',
  },
  footerText: {
    color: '#a0aec0',
    fontSize: 14,
  },
});

export default ResponsiveExample;
