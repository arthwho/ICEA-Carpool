import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * Card moderno e minimalista para exibir caronas
 * Segue princípios de design system e hierarquia visual
 */
const RideCard = ({ 
  ride, 
  onPress, 
  userStatus, 
  isRequesting, 
  showAdminActions = false,
  onAdminAction 
}) => {
  const { theme } = useTheme();

  // Determina a cor do status baseado no estado da carona
  const getStatusColor = () => {
    const availableSeats = ride.availableSeats - (ride.passengers?.length || 0);
    
    if (availableSeats === 0) return theme.status.warning;
    if (availableSeats <= 2) return theme.status.warning;
    return theme.status.available;
  };

  // Renderiza badge do preço
  const renderPriceBadge = () => {
    const isFree = !ride.price || ride.price === 0;
    
    return (
      <View style={[
        styles.priceBadge, 
        { 
          backgroundColor: 'transparent',
          borderColor: isFree ? theme.status.available : theme.interactive.active,
          borderWidth: 1,
        }
      ]}>
        <Text style={[styles.priceText, { 
          color: isFree ? theme.status.available : theme.interactive.active 
        }]}>
          {isFree ? 'Gratuito' : `R$ ${Number(ride.price).toFixed(2).replace('.', ',')}`}
        </Text>
      </View>
    );
  };

  // Renderiza indicador de vagas
  const renderSeatsIndicator = () => {
    const availableSeats = ride.availableSeats - (ride.passengers?.length || 0);
    const totalSeats = ride.availableSeats;
    
    return (
      <View style={styles.seatsContainer}>
        <View style={styles.seatsRow}>
          {Array.from({ length: totalSeats }).map((_, index) => (
            <View
              key={index}
                              style={[
                styles.seatIcon,
                {
                  backgroundColor: index < totalSeats - availableSeats 
                    ? theme.status.unavailable 
                    : theme.surface.secondary,
                  borderColor: theme.border.primary,
                }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.seatsText, { color: theme.text.secondary }]}>
          {availableSeats} de {totalSeats} vagas
        </Text>
      </View>
    );
  };

  // Renderiza botões de ação para admin (Excluir e Solicitar)
  const renderAdminButtons = () => {
    // Se for a própria carona do admin, só mostra excluir
    if (userStatus === 'own') {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.adminDeleteButton, { backgroundColor: theme.interactive.button.danger }]}
          onPress={() => onAdminAction?.(ride.id)}
        >
          <Text style={[styles.actionButtonText, { color: theme.text.inverse }]}>
            🗑️ Excluir Minha Carona
          </Text>
        </TouchableOpacity>
      );
    }

    // Para caronas de outros usuários, mostra ambos os botões
    const getRequestButtonConfig = () => {
      switch (userStatus) {
        case 'confirmed':
          return {
            text: '✅ Confirmado',
            disabled: true,
            color: theme.status.available
          };
        case 'pending':
          return {
            text: '⏳ Aguardando',
            disabled: true,
            color: theme.interactive.active
          };
        case 'waiting':
          return {
            text: '📋 Na Fila',
            disabled: true,
            color: theme.status.warning
          };
        default:
          return {
            text: ride.availableSeats - (ride.passengers?.length || 0) > 0 ? 'Solicitar' : '📋 Entrar na Fila',
            disabled: false,
            color: theme.interactive.active
          };
      }
    };

    const requestConfig = getRequestButtonConfig();

    return (
      <View style={styles.adminButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.adminDeleteButton, { backgroundColor: theme.interactive.button.danger }]}
          onPress={() => onAdminAction?.(ride.id)}
        >
          <Text style={[styles.actionButtonText, { color: theme.text.inverse }]}>
            🗑️ Excluir
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.adminRequestButton, { backgroundColor: requestConfig.color }]}
          onPress={onPress}
          disabled={requestConfig.disabled || isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator size="small" color={theme.text.inverse} />
          ) : (
            <Text style={[styles.actionButtonText, { color: theme.text.inverse }]}>
              {requestConfig.text}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Renderiza botão de ação baseado no status do usuário
  const renderActionButton = () => {
    if (showAdminActions) {
      return renderAdminButtons();
    }

    const buttonConfig = {
      own: {
        text: '👤 Sua Carona',
        style: [styles.actionButton, styles.ownButton, { 
          backgroundColor: theme.surface.secondary,
          borderColor: theme.border.primary,
          borderWidth: 1
        }],
        textStyle: { color: theme.text.tertiary },
        disabled: true
      },
      confirmed: {
        text: '✅ Confirmado',
        style: [styles.actionButton, styles.confirmedButton, { backgroundColor: theme.status.available }],
        textStyle: { color: theme.text.inverse },
        disabled: true
      },
      pending: {
        text: '⏳ Aguardando',
        style: [styles.actionButton, styles.pendingButton, { backgroundColor: theme.interactive.active }],
        textStyle: { color: theme.text.inverse },
        disabled: true
      },
      waiting: {
        text: '📋 Na Fila',
        style: [styles.actionButton, styles.waitingButton, { backgroundColor: theme.status.warning }],
        textStyle: { color: theme.text.inverse },
        disabled: true
      },
      available: {
        text: ride.availableSeats - (ride.passengers?.length || 0) > 0 ? 'Solicitar' : '📋 Entrar na Fila',
        style: [styles.actionButton, styles.requestButton, { backgroundColor: theme.interactive.active }],
        textStyle: { color: theme.text.inverse },
        disabled: false
      }
    };

    const config = buttonConfig[userStatus] || buttonConfig.available;

    return (
      <TouchableOpacity
        style={config.style}
        onPress={onPress}
        disabled={config.disabled || isRequesting}
      >
        {isRequesting ? (
          <ActivityIndicator size="small" color={config.textStyle.color} />
        ) : (
          <Text style={[styles.actionButtonText, config.textStyle]}>
            {config.text}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.primary }]}>
      {/* Header com rota e preço */}
      <View style={styles.header}>
        <View style={styles.routeContainer}>
          <Text style={[styles.routeText, { color: theme.text.primary }]}>
            {ride.origin}
          </Text>
          <View style={[styles.routeArrow, { backgroundColor: theme.text.tertiary }]} />
          <Text style={[styles.destinationText, { color: theme.text.secondary }]}>
            ICEA
          </Text>
        </View>
        {renderPriceBadge()}
      </View>

      {/* Informações principais */}
      <View style={styles.mainInfo}>
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.interactive.active + '20' }]}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.text.primary }]}>
            {ride.driverName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.status.available + '20' }]}>
            <Text style={styles.iconText}>🕐</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.text.primary }]}>
            {ride.departureTime}
          </Text>
        </View>

        {/* Informações do veículo (se disponível) */}
        {ride.carInfo && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.interactive.button.danger + '20', borderRadius: 8}]}>
              <Text style={styles.iconText}>🚗</Text>
            </View>
            <Text style={[styles.infoText, { color: theme.text.secondary }]}>
              {ride.carInfo.model} • {ride.carInfo.color}
            </Text>
          </View>
        )}
      </View>

      {/* Indicador de vagas */}
      {renderSeatsIndicator()}

      {/* Status adicional (pedidos pendentes, lista de espera) */}
      {(ride.pendingRequests?.length > 0 || ride.waitingList?.length > 0) && (
        <View style={styles.statusRow}>
          {ride.pendingRequests?.length > 0 && (
            <View style={[styles.statusBadge, { backgroundColor: theme.interactive.active + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: theme.interactive.active }]}>
                {ride.pendingRequests.length} pendente{ride.pendingRequests.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {ride.waitingList?.length > 0 && (
            <View style={[styles.statusBadge, { backgroundColor: theme.status.warning + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: theme.status.warning }]}>
                {ride.waitingList.length} na fila
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Botão de ação */}
      <View style={styles.actionContainer}>
        {renderActionButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  routeArrow: {
    width: 20,
    height: 2,
    marginHorizontal: 12,
  },
  destinationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mainInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '500',
  },
  seatsContainer: {
    marginBottom: 16,
  },
  seatsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  seatIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
  },
  seatsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 'auto',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  adminButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  adminDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
  },
  adminRequestButton: {
    flex: 1,
    backgroundColor: '#22c55e',
  },
  ownButton: {
    backgroundColor: 'transparent',
  },
  confirmedButton: {
    backgroundColor: '#22c55e',
  },
  pendingButton: {
    backgroundColor: '#3b82f6',
  },
  waitingButton: {
    backgroundColor: '#f59e0b',
  },
  requestButton: {
    backgroundColor: '#22c55e',
  },
});

export default RideCard;