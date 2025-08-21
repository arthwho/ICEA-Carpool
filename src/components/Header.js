import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const Header = ({ title }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#1a202c',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#4a5568',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
});

export default Header;
