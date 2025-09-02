import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * Modal para avaliação de motoristas e passageiros
 * @param {boolean} visible - Se o modal está visível
 * @param {Object} ratingRequest - Dados da solicitação de avaliação
 * @param {Function} onSubmit - Função chamada ao submeter avaliação
 * @param {Function} onClose - Função para fechar o modal
 * @param {boolean} loading - Estado de carregamento
 */
const RatingModal = ({ visible, ratingRequest, onSubmit, onClose, loading = false }) => {
  const { theme } = useTheme();
  
  // Estados do componente
  const [rating, setRating] = useState(5);
  const [categories, setCategories] = useState({
    punctuality: 5,
    communication: 5,
    cleanliness: 5,
    behavior: 5
  });
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Reset do formulário quando o modal abre
  React.useEffect(() => {
    if (visible) {
      setRating(5);
      setCategories({
        punctuality: 5,
        communication: 5,
        cleanliness: 5,
        behavior: 5
      });
      setComment('');
      setIsAnonymous(false);
    }
  }, [visible]);

  if (!ratingRequest) return null;

  const isDriverRating = ratingRequest.toUserRole === 'driver';

  // Componente de estrelas
  const StarRating = ({ value, onPress, size = 24 }) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress(star)}
          style={styles.star}
        >
          <Text style={[
            styles.starText,
            { 
              fontSize: size,
              color: star <= value ? theme.interactive.active : theme.text.tertiary
            }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Atualiza categoria específica
  const updateCategory = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Submete a avaliação
  const handleSubmit = () => {
    const ratingData = {
      requestId: ratingRequest.id,
      rideId: ratingRequest.rideId,
      fromUserId: ratingRequest.fromUserId,
      toUserId: ratingRequest.toUserId,
      fromUserRole: ratingRequest.fromUserRole,
      toUserRole: ratingRequest.toUserRole,
      rating,
      categories: isDriverRating ? categories : {
        punctuality: categories.punctuality,
        communication: categories.communication,
        behavior: categories.behavior
      },
      comment: comment.trim(),
      isAnonymous
    };

    onSubmit(ratingData);
  };

  const categoryLabels = {
    punctuality: 'Pontualidade',
    communication: 'Comunicação',
    cleanliness: 'Limpeza do Veículo',
    behavior: 'Comportamento'
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface.primary }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text.primary }]}>
                Avaliar {isDriverRating ? 'Motorista' : 'Passageiro'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                {ratingRequest.toUserName}
              </Text>
            </View>

            {/* Informações da carona */}
            <View style={[styles.rideInfo, { backgroundColor: theme.surface.secondary }]}>
              <Text style={[styles.rideInfoText, { color: theme.text.primary }]}>
                {ratingRequest.rideInfo.origin} → {ratingRequest.rideInfo.destination}
              </Text>
              <Text style={[styles.rideInfoDate, { color: theme.text.tertiary }]}>
                {new Date(ratingRequest.rideInfo.departureTime).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            {/* Avaliação geral */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Avaliação Geral
              </Text>
              <StarRating
                value={rating}
                onPress={setRating}
                size={32}
              />
              <Text style={[styles.ratingText, { color: theme.text.secondary }]}>
                {rating} de 5 estrelas
              </Text>
            </View>

            {/* Categorias específicas */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Avalie por Categoria
              </Text>
              
              {Object.entries(categories).map(([key, value]) => {
                // Só mostra limpeza para motoristas
                if (key === 'cleanliness' && !isDriverRating) return null;
                
                return (
                  <View key={key} style={styles.categoryRow}>
                    <Text style={[styles.categoryLabel, { color: theme.text.primary }]}>
                      {categoryLabels[key]}
                    </Text>
                    <StarRating
                      value={value}
                      onPress={(newValue) => updateCategory(key, newValue)}
                      size={20}
                    />
                  </View>
                );
              })}
            </View>

            {/* Comentário */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Comentário (Opcional)
              </Text>
              <TextInput
                style={[styles.commentInput, { 
                  backgroundColor: theme.surface.secondary,
                  color: theme.text.primary,
                  borderColor: theme.border.primary
                }]}
                placeholder="Deixe um comentário sobre a experiência..."
                placeholderTextColor={theme.text.tertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={[styles.characterCount, { color: theme.text.tertiary }]}>
                {comment.length}/500
              </Text>
            </View>

            {/* Opção anônima */}
            <TouchableOpacity
              style={styles.anonymousRow}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={[
                styles.checkbox,
                { 
                  backgroundColor: isAnonymous ? theme.interactive.active : 'transparent',
                  borderColor: theme.border.primary
                }
              ]}>
                {isAnonymous && (
                  <Text style={[styles.checkmark, { color: theme.text.inverse }]}>✓</Text>
                )}
              </View>
              <Text style={[styles.anonymousText, { color: theme.text.primary }]}>
                Tornar avaliação anônima
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.border.primary }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text.secondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: theme.interactive.active }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.text.inverse} />
              ) : (
                <Text style={[styles.submitButtonText, { color: theme.text.inverse }]}>
                  Enviar Avaliação
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rideInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  rideInfoText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rideInfoDate: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  star: {
    paddingHorizontal: 4,
  },
  starText: {
    fontWeight: 'bold',
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  anonymousText: {
    fontSize: 16,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default RatingModal;