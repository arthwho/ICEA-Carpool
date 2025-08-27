import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { 
  getAllUsers,
  promoteToAdmin,
  demoteUser,
  banUser,
  unbanUser,
  getAdminLogs,
  isAdmin,
  isModerator,
  hasPermission,
  USER_ROLES
} from '../services/firebase';
import { useTheme } from '../hooks/useTheme';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from './CustomAlert';

/**
 * Painel administrativo para gerenciar usuários e sistema
 * Apenas administradores e moderadores têm acesso
 * @param {Object} user - Dados do usuário logado (deve ser admin/moderador)
 */
const AdminPanel = ({ user }) => {
  // ========================================
  // ESTADOS DO COMPONENTE
  // ========================================
  
  const [users, setUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' ou 'logs'
  const [processingUserId, setProcessingUserId] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [showBanModal, setShowBanModal] = useState(null);
  
  // ========================================
  // HOOKS PARA TEMA E ALERTAS
  // ========================================
  
  const { theme } = useTheme();
  const { showAlert, alertState, closeAlert } = useCustomAlert();

  // ========================================
  // CARREGAMENTO INICIAL DE DADOS
  // ========================================
  
  useEffect(() => {
    loadData();
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      
      // Carrega lista de usuários
      const usersData = await getAllUsers(user.uid);
      setUsers(usersData);
      
      // Carrega logs administrativos (apenas para admins)
      if (isAdmin(user)) {
        const logsData = await getAdminLogs(user.uid, 100);
        setAdminLogs(logsData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      showAlert('Erro', error.message || 'Erro ao carregar dados administrativos');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS
  // ========================================
  
  /**
   * Promove um usuário para administrador
   */
  const handlePromoteUser = async (targetUserId) => {
    if (!isAdmin(user)) {
      showAlert('Erro', 'Apenas administradores podem promover outros usuários');
      return;
    }

    showAlert(
      'Confirmar Promoção',
      'Tem certeza que deseja promover este usuário para administrador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Promover',
          style: 'default',
          onPress: async () => {
            setProcessingUserId(targetUserId);
            try {
              await promoteToAdmin(user.uid, targetUserId);
              showAlert('Sucesso', 'Usuário promovido para administrador');
              await loadData(); // Recarrega dados
            } catch (error) {
              console.error('Error promoting user:', error);
              showAlert('Erro', error.message || 'Erro ao promover usuário');
            } finally {
              setProcessingUserId(null);
            }
          }
        }
      ]
    );
  };

  /**
   * Remove privilégios administrativos
   */
  const handleDemoteUser = async (targetUserId) => {
    if (!isAdmin(user)) {
      showAlert('Erro', 'Apenas administradores podem remover privilégios');
      return;
    }

    showAlert(
      'Confirmar Remoção',
      'Tem certeza que deseja remover os privilégios administrativos deste usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setProcessingUserId(targetUserId);
            try {
              await demoteUser(user.uid, targetUserId);
              showAlert('Sucesso', 'Privilégios administrativos removidos');
              await loadData();
            } catch (error) {
              console.error('Error demoting user:', error);
              showAlert('Erro', error.message || 'Erro ao remover privilégios');
            } finally {
              setProcessingUserId(null);
            }
          }
        }
      ]
    );
  };

  /**
   * Bane um usuário
   */
  const handleBanUser = async (targetUserId) => {
    if (!hasPermission(user, 'users:ban')) {
      showAlert('Erro', 'Você não tem permissão para banir usuários');
      return;
    }

    if (!banReason.trim()) {
      showAlert('Erro', 'Por favor, informe o motivo do banimento');
      return;
    }

    setProcessingUserId(targetUserId);
    try {
      await banUser(user.uid, targetUserId, banReason.trim());
      showAlert('Sucesso', 'Usuário banido com sucesso');
      setShowBanModal(null);
      setBanReason('');
      await loadData();
    } catch (error) {
      console.error('Error banning user:', error);
      showAlert('Erro', error.message || 'Erro ao banir usuário');
    } finally {
      setProcessingUserId(null);
    }
  };

  /**
   * Remove banimento
   */
  const handleUnbanUser = async (targetUserId) => {
    if (!hasPermission(user, 'users:ban')) {
      showAlert('Erro', 'Você não tem permissão para desbanir usuários');
      return;
    }

    setProcessingUserId(targetUserId);
    try {
      await unbanUser(user.uid, targetUserId);
      showAlert('Sucesso', 'Banimento removido com sucesso');
      await loadData();
    } catch (error) {
      console.error('Error unbanning user:', error);
      showAlert('Erro', error.message || 'Erro ao remover banimento');
    } finally {
      setProcessingUserId(null);
    }
  };

  // ========================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ========================================
  
  /**
   * Renderiza um card de usuário
   */
  const renderUserCard = (userData) => (
    <View
      key={userData.id}
      style={[styles.userCard, { 
        backgroundColor: theme.surface.elevated,
        borderLeftColor: userData.banned ? theme.interactive.button.danger : 
                         userData.role === USER_ROLES.ADMIN ? theme.status.available : 
                         theme.interactive.active
      }]}
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text.primary }]}>
            {userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Usuário sem nome'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.text.secondary }]}>
            {userData.email || 'Email não disponível'}
          </Text>
          <View style={styles.userTags}>
            <View style={[
              styles.roleTag,
              {
                backgroundColor: userData.role === USER_ROLES.ADMIN ? theme.status.available + '20' : 
                               userData.role === USER_ROLES.MODERATOR ? theme.interactive.active + '20' : 
                               theme.text.tertiary + '20'
              }
            ]}>
              <Text style={[
                styles.roleText,
                {
                  color: userData.role === USER_ROLES.ADMIN ? theme.status.available : 
                         userData.role === USER_ROLES.MODERATOR ? theme.interactive.active : 
                         theme.text.tertiary
                }
              ]}>
                {userData.role === USER_ROLES.ADMIN ? 'ADMIN' : 
                 userData.role === USER_ROLES.MODERATOR ? 'MODERADOR' : 
                 'USUÁRIO'}
              </Text>
            </View>
            {userData.isDriver && (
              <View style={[styles.driverTag, { backgroundColor: theme.interactive.active + '20' }]}>
                <Text style={[styles.tagText, { color: theme.interactive.active }]}>MOTORISTA</Text>
              </View>
            )}
            {userData.banned && (
              <View style={[styles.bannedTag, { backgroundColor: theme.interactive.button.danger + '20' }]}>
                <Text style={[styles.tagText, { color: theme.interactive.button.danger }]}>BANIDO</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Ações administrativas */}
      <View style={styles.actionButtons}>
        {isAdmin(user) && userData.role !== USER_ROLES.ADMIN && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.status.available }]}
            onPress={() => handlePromoteUser(userData.id)}
            disabled={processingUserId === userData.id}
          >
            {processingUserId === userData.id ? (
              <ActivityIndicator size="small" color={theme.text.inverse} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Promover</Text>
            )}
          </TouchableOpacity>
        )}

        {isAdmin(user) && userData.role === USER_ROLES.ADMIN && userData.id !== user.uid && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.interactive.button.danger }]}
            onPress={() => handleDemoteUser(userData.id)}
            disabled={processingUserId === userData.id}
          >
            {processingUserId === userData.id ? (
              <ActivityIndicator size="small" color={theme.text.inverse} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Remover Admin</Text>
            )}
          </TouchableOpacity>
        )}

        {!userData.banned ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.interactive.button.danger }]}
            onPress={() => setShowBanModal(userData.id)}
            disabled={processingUserId === userData.id}
          >
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Banir</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.status.available }]}
            onPress={() => handleUnbanUser(userData.id)}
            disabled={processingUserId === userData.id}
          >
            {processingUserId === userData.id ? (
              <ActivityIndicator size="small" color={theme.text.inverse} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Desbanir</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {userData.banned && userData.banReason && (
        <View style={[styles.banInfo, { backgroundColor: theme.interactive.button.danger + '10' }]}>
          <Text style={[styles.banReason, { color: theme.text.secondary }]}>
            Motivo: {userData.banReason}
          </Text>
        </View>
      )}
    </View>
  );

  /**
   * Renderiza um log administrativo
   */
  const renderLogItem = (log) => (
    <View
      key={log.id}
      style={[styles.logCard, { backgroundColor: theme.surface.elevated }]}
    >
      <Text style={[styles.logAction, { color: theme.text.primary }]}>
        {getActionLabel(log.action)}
      </Text>
      <Text style={[styles.logDetails, { color: theme.text.secondary }]}>
        {new Date(log.timestamp?.seconds * 1000).toLocaleString()}
      </Text>
      {log.details && (
        <Text style={[styles.logExtra, { color: theme.text.tertiary }]}>
          {JSON.stringify(log.details, null, 2)}
        </Text>
      )}
    </View>
  );

  /**
   * Traduz ações para labels legíveis
   */
  const getActionLabel = (action) => {
    const labels = {
      'PROMOTE_USER': 'Usuário promovido',
      'DEMOTE_USER': 'Privilégios removidos',
      'BAN_USER': 'Usuário banido',
      'UNBAN_USER': 'Banimento removido'
    };
    return labels[action] || action;
  };

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  // Verifica se o usuário tem permissão para acessar o painel
  if (!user || (!isAdmin(user) && !isModerator(user))) {
    return (
      <View style={styles.accessDenied}>
        <Text style={[styles.accessDeniedText, { color: theme.text.primary }]}>
          Acesso negado. Apenas administradores e moderadores podem acessar este painel.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.interactive.active} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          Carregando painel administrativo...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={closeAlert}
      />

      {/* Modal de banimento */}
      {showBanModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface.elevated }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Banir Usuário
            </Text>
            <Text style={[styles.modalText, { color: theme.text.secondary }]}>
              Informe o motivo do banimento:
            </Text>
            <TextInput
              style={[styles.reasonInput, { 
                backgroundColor: theme.surface.primary,
                color: theme.text.primary,
                borderColor: theme.border.primary
              }]}
              placeholder="Motivo do banimento..."
              placeholderTextColor={theme.text.tertiary}
              value={banReason}
              onChangeText={setBanReason}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.text.secondary }]}
                onPress={() => {
                  setShowBanModal(null);
                  setBanReason('');
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.interactive.button.danger }]}
                onPress={() => handleBanUser(showBanModal)}
                disabled={!banReason.trim() || processingUserId === showBanModal}
              >
                {processingUserId === showBanModal ? (
                  <ActivityIndicator size="small" color={theme.text.inverse} />
                ) : (
                  <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Banir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Abas de navegação */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            { 
              backgroundColor: activeTab === 'users' ? theme.interactive.active : theme.surface.elevated 
            }
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'users' ? theme.text.inverse : theme.text.primary 
            }
          ]}>
            Usuários ({users.length})
          </Text>
        </TouchableOpacity>

        {isAdmin(user) && (
          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'logs' ? theme.interactive.active : theme.surface.elevated 
              }
            ]}
            onPress={() => setActiveTab('logs')}
          >
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'logs' ? theme.text.inverse : theme.text.primary 
              }
            ]}>
              Logs ({adminLogs.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Conteúdo das abas */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'users' ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Gerenciamento de Usuários
            </Text>
            {users.map(renderUserCard)}
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Logs Administrativos
            </Text>
            {adminLogs.map(renderLogItem)}
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ========================================
// ESTILOS DO COMPONENTE
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  userHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  driverTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bannedTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  banInfo: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  banReason: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  logCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logAction: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logDetails: {
    fontSize: 12,
    marginBottom: 4,
  },
  logExtra: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default AdminPanel;