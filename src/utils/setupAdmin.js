import { 
  getUserProfile, 
  setUserProfile, 
  USER_ROLES, 
  getDefaultPermissions 
} from '../services/firebase';
import { adminConfig } from '../config/firebase-config';

/**
 * Configura o primeiro administrador do sistema
 * Esta função deve ser chamada apenas uma vez, durante a configuração inicial
 * 
 * @param {Object} userAuth - Dados de autenticação do usuário Firebase
 * @returns {Promise<boolean>} Se o usuário foi configurado como admin
 */
export const setupFirstAdmin = async (userAuth) => {
  try {
    // Verifica se é o email configurado como admin
    if (!adminConfig.adminEmail || userAuth.email !== adminConfig.adminEmail) {
      return false;
    }

    // Verifica se o usuário já existe no sistema
    let userProfile = await getUserProfile(userAuth.uid);
    
    // Se o usuário não existe, cria o perfil
    if (!userProfile) {
      const adminData = {
        email: userAuth.email,
        name: userAuth.displayName || 'Administrador',
        firstName: userAuth.displayName?.split(' ')[0] || 'Admin',
        lastName: userAuth.displayName?.split(' ').slice(1).join(' ') || 'Sistema',
        role: USER_ROLES.ADMIN,
        permissions: getDefaultPermissions(USER_ROLES.ADMIN),
        isDriver: false,
        setupAsFirstAdmin: true,
        firstAdminSetupAt: new Date()
      };

      await setUserProfile(userAuth.uid, adminData);
      
      console.log('✅ Primeiro administrador configurado:', userAuth.email);
      return true;
    }
    
    // Se o usuário existe mas não é admin, promove para admin
    if (userProfile.role !== USER_ROLES.ADMIN) {
      // Atualiza o perfil existente para admin
      const updatedData = {
        ...userProfile,
        role: USER_ROLES.ADMIN,
        permissions: getDefaultPermissions(USER_ROLES.ADMIN),
        promotedToFirstAdmin: true,
        firstAdminPromotionAt: new Date(),
        updatedAt: new Date()
      };

      await setUserProfile(userAuth.uid, updatedData);
      
      console.log('✅ Usuário existente promovido a primeiro administrador:', userAuth.email);
      return true;
    }

    // Se já é admin, apenas confirma
    console.log('ℹ️ Usuário já é administrador:', userAuth.email);
    return true;

  } catch (error) {
    console.error('❌ Erro ao configurar primeiro administrador:', error);
    throw new Error('Não foi possível configurar o administrador: ' + error.message);
  }
};

/**
 * Verifica se o sistema já tem administradores configurados
 * Esta função pode ser usada para determinar se é necessário mostrar
 * um setup inicial ou não
 * 
 * @param {Object} userAuth - Dados de autenticação do usuário atual
 * @returns {Promise<boolean>} Se o sistema precisa de configuração inicial
 */
export const needsAdminSetup = async (userAuth) => {
  try {
    // Se não há email de admin configurado, não precisa de setup
    if (!adminConfig.adminEmail) {
      return false;
    }

    // Se o usuário atual não é o email configurado como admin
    if (userAuth.email !== adminConfig.adminEmail) {
      return false;
    }

    // Verifica se o usuário já está configurado como admin
    const userProfile = await getUserProfile(userAuth.uid);
    
    return !userProfile || userProfile.role !== USER_ROLES.ADMIN;
  } catch (error) {
    console.error('Erro ao verificar necessidade de setup admin:', error);
    return false;
  }
};

/**
 * Inicialização automática do primeiro admin durante o login
 * Esta função deve ser chamada no processo de autenticação
 * 
 * @param {Object} userAuth - Dados de autenticação do usuário
 * @returns {Promise<Object>} Perfil do usuário (atualizado se necessário)
 */
export const autoSetupAdminOnLogin = async (userAuth) => {
  try {
    // Tenta configurar como admin se necessário
    const wasSetupAsAdmin = await setupFirstAdmin(userAuth);
    
    // Retorna o perfil atual (pode ter sido atualizado)
    const userProfile = await getUserProfile(userAuth.uid);
    
    if (wasSetupAsAdmin) {
      console.log('🔐 Administrador configurado automaticamente durante login');
    }
    
    return userProfile;
  } catch (error) {
    console.error('Erro durante auto-setup de admin:', error);
    // Em caso de erro, ainda tenta retornar o perfil
    try {
      return await getUserProfile(userAuth.uid);
    } catch {
      return null;
    }
  }
};

export default {
  setupFirstAdmin,
  needsAdminSetup,
  autoSetupAdminOnLogin
};