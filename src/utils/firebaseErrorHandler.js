/**
 * Firebase Error Handler
 * Converte erros do Firebase em mensagens amigáveis em português
 */

// Mapeamento de códigos de erro do Firebase para mensagens em português
const FIREBASE_ERROR_MESSAGES = {
  // Erros de autenticação
  'auth/invalid-email': 'O formato do email é inválido. Por favor, verifique e tente novamente.',
  'auth/user-disabled': 'Esta conta foi desabilitada. Entre em contato com o suporte.',
  'auth/user-not-found': 'Não existe uma conta com este email. Verifique o email ou crie uma nova conta.',
  'auth/wrong-password': 'Senha incorreta. Verifique sua senha e tente novamente.',
  'auth/email-already-in-use': 'Este email já está sendo usado por outra conta. Tente fazer login ou use outro email.',
  'auth/weak-password': 'A senha é muito fraca. Use pelo menos 6 caracteres.',
  'auth/operation-not-allowed': 'Esta operação não é permitida. Entre em contato com o suporte.',
  'auth/too-many-requests': 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'auth/invalid-credential': 'Credenciais inválidas. Verifique email e senha.',
  'auth/account-exists-with-different-credential': 'Já existe uma conta com este email usando outro método de login.',
  'auth/requires-recent-login': 'Por segurança, faça login novamente.',
  'auth/invalid-verification-code': 'Código de verificação inválido.',
  'auth/invalid-verification-id': 'ID de verificação inválido.',
  'auth/missing-verification-code': 'Código de verificação não fornecido.',
  'auth/missing-verification-id': 'ID de verificação não fornecido.',
  'auth/quota-exceeded': 'Limite de tentativas excedido. Tente novamente mais tarde.',
  'auth/cancelled-popup-request': 'Login cancelado pelo usuário.',
  'auth/popup-blocked': 'Popup bloqueado pelo navegador. Permita popups para este site.',
  'auth/popup-closed-by-user': 'Janela de login fechada pelo usuário.',
  'auth/unauthorized-domain': 'Este domínio não está autorizado para login.',
  'auth/app-not-authorized': 'Aplicação não autorizada.',
  'auth/argument-error': 'Argumento inválido fornecido.',
  'auth/invalid-app-credential': 'Credencial da aplicação inválida.',
  'auth/invalid-app-id': 'ID da aplicação inválido.',
  'auth/invalid-user-token': 'Token do usuário inválido.',
  'auth/invalid-tenant-id': 'ID do tenant inválido.',
  'auth/tenant-id-mismatch': 'Incompatibilidade de ID do tenant.',
  'auth/unsupported-persistence-type': 'Tipo de persistência não suportado.',
  'auth/user-token-expired': 'Token do usuário expirado.',
  'auth/web-storage-unsupported': 'Armazenamento web não suportado.',
  'auth/expired-action-code': 'Código de ação expirado.',
  'auth/invalid-action-code': 'Código de ação inválido.',
  'auth/missing-action-code': 'Código de ação não fornecido.',
  'auth/invalid-continue-uri': 'URI de continuação inválido.',
  'auth/missing-continue-uri': 'URI de continuação não fornecido.',
  'auth/unauthorized-continue-uri': 'URI de continuação não autorizado.',
  'auth/invalid-dynamic-link-domain': 'Domínio de link dinâmico inválido.',
  'auth/argument-error': 'Erro de argumento.',
  'auth/invalid-api-key': 'Chave da API inválida.',
  'auth/invalid-app-credential': 'Credencial da aplicação inválida.',
  'auth/invalid-app-id': 'ID da aplicação inválido.',
  'auth/invalid-user-token': 'Token do usuário inválido.',
  'auth/invalid-tenant-id': 'ID do tenant inválido.',
  'auth/tenant-id-mismatch': 'Incompatibilidade de ID do tenant.',
  'auth/unsupported-persistence-type': 'Tipo de persistência não suportado.',
  'auth/user-token-expired': 'Token do usuário expirado.',
  'auth/web-storage-unsupported': 'Armazenamento web não suportado.',
  'auth/expired-action-code': 'Código de ação expirado.',
  'auth/invalid-action-code': 'Código de ação inválido.',
  'auth/missing-action-code': 'Código de ação não fornecido.',
  'auth/invalid-continue-uri': 'URI de continuação inválido.',
  'auth/missing-continue-uri': 'URI de continuação não fornecido.',
  'auth/unauthorized-continue-uri': 'URI de continuação não autorizado.',
  'auth/invalid-dynamic-link-domain': 'Domínio de link dinâmico inválido.',
  
  // Erros do Firestore
  'firestore/permission-denied': 'Permissão negada para acessar os dados.',
  'firestore/unavailable': 'Serviço temporariamente indisponível.',
  'firestore/deadline-exceeded': 'Tempo limite excedido na operação.',
  'firestore/resource-exhausted': 'Recursos esgotados.',
  'firestore/failed-precondition': 'Condição prévia não atendida.',
  'firestore/aborted': 'Operação abortada.',
  'firestore/out-of-range': 'Valor fora do intervalo permitido.',
  'firestore/unimplemented': 'Operação não implementada.',
  'firestore/internal': 'Erro interno do servidor.',
  'firestore/data-loss': 'Perda de dados.',
  'firestore/unauthenticated': 'Usuário não autenticado.',
  
  // Erros gerais
  'auth/unknown': 'Erro desconhecido. Tente novamente.',
  'firestore/unknown': 'Erro desconhecido no banco de dados.',
};

/**
 * Converte um erro do Firebase em uma mensagem amigável em português
 * @param {Error} error - Objeto de erro do Firebase
 * @returns {string} Mensagem amigável em português
 */
export const getFirebaseErrorMessage = (error) => {
  // Se não há erro, retorna mensagem padrão
  if (!error) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  // Extrai o código do erro
  let errorCode = '';
  
  // Verifica diferentes formatos de erro do Firebase
  if (error.code) {
    errorCode = error.code;
  } else if (error.message && error.message.includes('auth/')) {
    // Extrai código de mensagens como "Firebase: Error (auth/invalid-email)."
    const match = error.message.match(/\(([^)]+)\)/);
    if (match) {
      errorCode = match[1];
    }
  } else if (typeof error === 'string' && error.includes('auth/')) {
    // Se o erro é uma string contendo o código
    const match = error.match(/(auth\/[^\s)]+)/);
    if (match) {
      errorCode = match[1];
    }
  }

  // Se encontrou um código de erro conhecido, retorna a mensagem correspondente
  if (errorCode && FIREBASE_ERROR_MESSAGES[errorCode]) {
    return FIREBASE_ERROR_MESSAGES[errorCode];
  }

  // Se é um erro de rede ou conexão
  if (error.message && (
    error.message.includes('network') ||
    error.message.includes('connection') ||
    error.message.includes('fetch') ||
    error.message.includes('timeout')
  )) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Se é um erro de configuração do Firebase
  if (error.message && (
    error.message.includes('config') ||
    error.message.includes('initialize') ||
    error.message.includes('API key')
  )) {
    return 'Erro de configuração. Entre em contato com o suporte.';
  }

  // Se é um erro de Google Sign-In
  if (error.message && error.message.includes('Google sign-in was cancelled')) {
    return 'Login com Google cancelado.';
  }

  // Se é um erro de OAuth
  if (error.message && (
    error.message.includes('OAuth') ||
    error.message.includes('redirect')
  )) {
    return 'Erro no login com Google. Tente novamente.';
  }

  // Log do erro original para debug
  console.error('Firebase error not mapped:', {
    code: errorCode,
    message: error.message,
    error: error
  });

  // Retorna mensagem genérica se não encontrou um código específico
  return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
};

/**
 * Verifica se o erro é um erro de validação (que pode ser corrigido pelo usuário)
 * @param {Error} error - Objeto de erro do Firebase
 * @returns {boolean} True se é um erro de validação
 */
export const isValidationError = (error) => {
  if (!error) return false;
  
  const validationErrorCodes = [
    'auth/invalid-email',
    'auth/wrong-password',
    'auth/weak-password',
    'auth/user-not-found',
    'auth/email-already-in-use'
  ];

  let errorCode = '';
  if (error.code) {
    errorCode = error.code;
  } else if (error.message && error.message.includes('auth/')) {
    const match = error.message.match(/\(([^)]+)\)/);
    if (match) {
      errorCode = match[1];
    }
  }

  return validationErrorCodes.includes(errorCode);
};

/**
 * Verifica se o erro é um erro de rede/conexão
 * @param {Error} error - Objeto de erro do Firebase
 * @returns {boolean} True se é um erro de rede
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  return error.message && (
    error.message.includes('network') ||
    error.message.includes('connection') ||
    error.message.includes('fetch') ||
    error.message.includes('timeout') ||
    error.code === 'auth/network-request-failed'
  );
};

/**
 * Verifica se o erro é um erro de configuração
 * @param {Error} error - Objeto de erro do Firebase
 * @returns {boolean} True se é um erro de configuração
 */
export const isConfigError = (error) => {
  if (!error) return false;
  
  return error.message && (
    error.message.includes('config') ||
    error.message.includes('initialize') ||
    error.message.includes('API key') ||
    error.code === 'auth/invalid-api-key'
  );
};

/**
 * Função de teste para verificar se o error handler está funcionando
 * @param {Function} showAlert - Função para mostrar alerta
 */
export const testFirebaseErrorHandler = (showAlert) => {
  console.log('Testing Firebase Error Handler...');
  
  // Teste com erro de email inválido
  const testError = {
    code: 'auth/invalid-email',
    message: 'Firebase: Error (auth/invalid-email).'
  };
  
  const errorMessage = getFirebaseErrorMessage(testError);
  console.log('Test error message:', errorMessage);
  
  if (showAlert) {
    showAlert('Teste', `Error Handler Test:\n${errorMessage}`, [
      { text: 'OK', style: 'default' }
    ]);
  }
  
  return errorMessage;
};
