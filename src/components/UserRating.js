import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * Componente para exibir avaliações do usuário
 * @param {Object} userData - Dados do usuário com ratings
 * @param {string} role - Role para exibir (driver ou passenger)
 * @param {boolean} compact - Se deve usar layout compacto
 * @param {Function} onPress - Função chamada ao pressionar
 * @param {boolean} showBadge - Se deve exibir badge especial
 */
const UserRating = ({ userData, role, compact = false, onPress, showBadge = false }) => {
  const { theme } = useTheme();

  if (!userData || !userData.ratings) {
    return null;
  }

  const roleKey = role === 'driver' ? 'asDriver' : 'asPassenger';
  const ratings = userData.ratings[roleKey];

  if (!ratings || ratings.count === 0) {
    return null;
  }

  const { average, count, breakdown } = ratings;

  // Renderiza estrelas baseado na média
  const renderStars = (rating, size = 16) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.starsContainer}>
        {Array(fullStars).fill().map((_, i) => (
          <Text key={`full-${i}`} style={[styles.star, { fontSize: size, color: theme.interactive.active }]}>
            ★
          </Text>
        ))}
        {hasHalfStar && (
          <Text style={[styles.star, { fontSize: size, color: theme.interactive.active }]}>
            ☆
          </Text>
        )}
        {Array(emptyStars).fill().map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.star, { fontSize: size, color: theme.text.tertiary }]}>
            ☆
          </Text>
        ))}
      </View>
    );
  };

  // Determina o badge baseado na avaliação
  const getBadge = () => {
    if (!showBadge) return null;
    
    if (average >= 4.8 && count >= 10) {
      return {
        text: role === 'driver' ? '🏆 Motorista Premium' : '🌟 Passageiro Premium',
        color: theme.status.success
      };
    } else if (average >= 4.5 && count >= 5) {
      return {
        text: role === 'driver' ? '⭐ Motorista Top' : '⭐ Passageiro Top',
        color: theme.interactive.active
      };
    } else if (average >= 4.0) {
      return {
        text: role === 'driver' ? '✓ Motorista Confiável' : '✓ Passageiro Confiável',
        color: theme.status.available
      };
    }
    return null;
  };

  const badge = getBadge();

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: theme.surface.secondary }]}
        onPress={onPress}
        disabled={!onPress}
      >
        {renderStars(average, 14)}
        <Text style={[styles.compactRating, { color: theme.text.primary }]}>
          {average.toFixed(1)}
        </Text>
        <Text style={[styles.compactCount, { color: theme.text.tertiary }]}>
          ({count})
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.surface.primary }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {role === 'driver' ? '🚗 Como Motorista' : '👤 Como Passageiro'}
          </Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>
                {badge.text}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.overallRating}>
          <Text style={[styles.ratingNumber, { color: theme.interactive.active }]}>
            {average.toFixed(1)}
          </Text>
          {renderStars(average, 18)}
          <Text style={[styles.reviewCount, { color: theme.text.tertiary }]}>
            {count} {count === 1 ? 'avaliação' : 'avaliações'}
          </Text>
        </View>
      </View>

      {/* Breakdown por categoria */}
      {breakdown && (
        <View style={styles.breakdownContainer}>
          <Text style={[styles.breakdownTitle, { color: theme.text.primary }]}>
            Avaliação por Categoria
          </Text>
          
          <View style={styles.categoryList}>
            {Object.entries(breakdown).map(([category, value]) => {
              if (value === undefined || value === null) return null;
              
              const categoryLabels = {
                punctuality: 'Pontualidade',
                communication: 'Comunicação',
                cleanliness: 'Limpeza',
                behavior: 'Comportamento'
              };

              return (
                <View key={category} style={styles.categoryRow}>
                  <Text style={[styles.categoryLabel, { color: theme.text.secondary }]}>
                    {categoryLabels[category]}
                  </Text>
                  <View style={styles.categoryRating}>
                    {renderStars(Number(value), 14)}
                    <Text style={[styles.categoryValue, { color: theme.text.tertiary }]}>
                      {Number(value).toFixed(1)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Indicador de mais detalhes */}
      {onPress && (
        <View style={styles.moreIndicator}>
          <Text style={[styles.moreText, { color: theme.interactive.active }]}>
            Ver todas as avaliações
          </Text>
          <Text style={[styles.moreArrow, { color: theme.interactive.active }]}>
            →
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  overallRating: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  star: {
    marginHorizontal: 1,
  },
  reviewCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  compactRating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  compactCount: {
    fontSize: 12,
    marginLeft: 2,
  },
  breakdownContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryList: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  categoryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
  moreIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  moreText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  moreArrow: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default UserRating;