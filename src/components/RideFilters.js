import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * Componente de filtros avançados para caronas
 * Interface minimalista e profissional
 */
const RideFilters = ({ 
  onFiltersChange, 
  initialFilters = {},
  ridesCount = 0 
}) => {
  const { theme } = useTheme();
  
  const [filters, setFilters] = useState({
    search: '',
    priceRange: 'all', // 'free', 'paid', 'all'
    availableSeats: 'all', // '1', '2+', '3+', 'all'
    timeRange: 'all', // 'morning', 'afternoon', 'evening', 'all'
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange?.(updated);
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      priceRange: 'all',
      availableSeats: 'all',
      timeRange: 'all',
    };
    setFilters(cleared);
    onFiltersChange?.(cleared);
  };

  const hasActiveFilters = () => {
    return filters.search !== '' || 
           filters.priceRange !== 'all' || 
           filters.availableSeats !== 'all' || 
           filters.timeRange !== 'all';
  };

  const renderFilterChip = (label, value, currentValue, onPress) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: currentValue === value ? theme.interactive.active : theme.surface.secondary,
          borderColor: currentValue === value ? theme.interactive.active : theme.border.primary,
        }
      ]}
      onPress={() => onPress(value)}
    >
      <Text style={[
        styles.filterChipText,
        {
          color: currentValue === value ? theme.text.inverse : theme.text.primary
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary }]}>
      {/* Header com busca e toggle de filtros */}
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: theme.surface.primary, borderColor: theme.border.primary, borderWidth: 1 }]}>
          <Text style={[styles.searchIcon, { color: theme.text.tertiary }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder="Buscar por origem..."
            placeholderTextColor={theme.text.tertiary}
            value={filters.search}
            onChangeText={(text) => updateFilters({ search: text })}
          />
          {filters.search !== '' && (
            <TouchableOpacity
              style={styles.clearSearch}
              onPress={() => updateFilters({ search: '' })}
            >
              <Text style={[styles.clearSearchText, { color: theme.text.tertiary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterToggle,
            {
              backgroundColor: hasActiveFilters() ? theme.interactive.active : theme.surface.secondary,
            }
          ]}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={[
            styles.filterToggleText,
            {
              color: hasActiveFilters() ? theme.text.inverse : theme.text.primary
            }
          ]}>
            {hasActiveFilters() ? `${getActiveFiltersCount()}` : '☰'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resultados count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: theme.text.secondary }]}>
          {ridesCount} carona{ridesCount !== 1 ? 's' : ''} {ridesCount !== 1 ? 'disponíveis' : 'disponível'}
        </Text>
        {hasActiveFilters() && (
          <TouchableOpacity style={styles.clearFilters} onPress={clearFilters}>
            <Text style={[styles.clearFiltersText, { color: theme.interactive.active }]}>
              Limpar filtros
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros expandidos */}
      {isExpanded && (
        <View style={styles.filtersExpanded}>
          {/* Filtro de preço */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.text.primary }]}>
              Preço
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {renderFilterChip('Todos', 'all', filters.priceRange, (value) => updateFilters({ priceRange: value }))}
              {renderFilterChip('Gratuito', 'free', filters.priceRange, (value) => updateFilters({ priceRange: value }))}
              {renderFilterChip('Pago', 'paid', filters.priceRange, (value) => updateFilters({ priceRange: value }))}
            </ScrollView>
          </View>

          {/* Filtro de vagas */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.text.primary }]}>
              Vagas disponíveis
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {renderFilterChip('Todas', 'all', filters.availableSeats, (value) => updateFilters({ availableSeats: value }))}
              {renderFilterChip('1+', '1', filters.availableSeats, (value) => updateFilters({ availableSeats: value }))}
              {renderFilterChip('2+', '2', filters.availableSeats, (value) => updateFilters({ availableSeats: value }))}
              {renderFilterChip('3+', '3', filters.availableSeats, (value) => updateFilters({ availableSeats: value }))}
            </ScrollView>
          </View>

          {/* Filtro de horário */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.text.primary }]}>
              Período
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {renderFilterChip('Todos', 'all', filters.timeRange, (value) => updateFilters({ timeRange: value }))}
              {renderFilterChip('Manhã', 'morning', filters.timeRange, (value) => updateFilters({ timeRange: value }))}
              {renderFilterChip('Tarde', 'afternoon', filters.timeRange, (value) => updateFilters({ timeRange: value }))}
              {renderFilterChip('Noite', 'evening', filters.timeRange, (value) => updateFilters({ timeRange: value }))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );

  function getActiveFiltersCount() {
    let count = 0;
    if (filters.search !== '') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.availableSeats !== 'all') count++;
    if (filters.timeRange !== 'all') count++;
    return count;
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  clearSearch: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterToggle: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearFilters: {
    paddingVertical: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ffffff10',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default RideFilters;