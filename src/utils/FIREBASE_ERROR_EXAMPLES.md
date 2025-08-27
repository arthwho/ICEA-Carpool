# Firebase Error Handler - Exemplos de Uso

Este documento mostra como o sistema de tratamento de erros do Firebase funciona e como usar em diferentes cenários.

## 🔧 **Como Funciona**

O `firebaseErrorHandler.js` converte erros técnicos do Firebase em mensagens amigáveis em português.

### **Exemplos de Conversão:**

| Erro Original | Mensagem Amigável |
|---------------|-------------------|
| `Firebase: Error (auth/invalid-email).` | `O formato do email é inválido. Por favor, verifique e tente novamente.` |
| `Firebase: Error (auth/wrong-password).` | `Senha incorreta. Verifique sua senha e tente novamente.` |
| `Firebase: Error (auth/user-not-found).` | `Não existe uma conta com este email. Verifique o email ou crie uma nova conta.` |
| `Firebase: Error (auth/email-already-in-use).` | `Este email já está sendo usado por outra conta. Tente fazer login ou use outro email.` |
| `Firebase: Error (auth/weak-password).` | `A senha é muito fraca. Use pelo menos 6 caracteres.` |
| `Firebase: Error (auth/network-request-failed).` | `Erro de conexão. Verifique sua internet e tente novamente.` |

## 📝 **Como Usar**

### **1. Importar o Handler:**

```javascript
import { getFirebaseErrorMessage, isValidationError, isNetworkError } from '../utils/firebaseErrorHandler';
```

### **2. Usar em Try-Catch:**

```javascript
try {
  // Operação do Firebase
  await signIn(email, password);
} catch (error) {
  // Converte o erro em mensagem amigável
  const errorMessage = getFirebaseErrorMessage(error);
  
  // Mostra o alerta
  showAlert('Erro', errorMessage, [
    { text: 'OK', style: 'default' }
  ]);
}
```

### **3. Detectar Tipos de Erro:**

```javascript
try {
  await signIn(email, password);
} catch (error) {
  const errorMessage = getFirebaseErrorMessage(error);
  
  // Define título baseado no tipo de erro
  let errorTitle = 'Erro';
  if (isValidationError(error)) {
    errorTitle = 'Dados Inválidos';
  } else if (isNetworkError(error)) {
    errorTitle = 'Erro de Conexão';
  }
  
  showAlert(errorTitle, errorMessage, [
    { text: 'OK', style: 'default' }
  ]);
}
```

## 🎯 **Cenários de Teste**

### **Teste 1: Email Inválido**
```javascript
// Tente fazer login com: "email-invalido"
// Resultado: "O formato do email é inválido. Por favor, verifique e tente novamente."
```

### **Teste 2: Senha Incorreta**
```javascript
// Tente fazer login com senha errada
// Resultado: "Senha incorreta. Verifique sua senha e tente novamente."
```

### **Teste 3: Usuário Não Encontrado**
```javascript
// Tente fazer login com email que não existe
// Resultado: "Não existe uma conta com este email. Verifique o email ou crie uma nova conta."
```

### **Teste 4: Email Já em Uso**
```javascript
// Tente criar conta com email já existente
// Resultado: "Este email já está sendo usado por outra conta. Tente fazer login ou use outro email."
```

### **Teste 5: Senha Fraca**
```javascript
// Tente criar conta com senha "123"
// Resultado: "A senha é muito fraca. Use pelo menos 6 caracteres."
```

### **Teste 6: Erro de Rede**
```javascript
// Desconecte a internet e tente fazer login
// Resultado: "Erro de conexão. Verifique sua internet e tente novamente."
```

## 🔍 **Funções Disponíveis**

### **getFirebaseErrorMessage(error)**
Converte qualquer erro do Firebase em mensagem amigável.

### **isValidationError(error)**
Retorna `true` se o erro pode ser corrigido pelo usuário (email inválido, senha fraca, etc.).

### **isNetworkError(error)**
Retorna `true` se o erro é relacionado à conexão de internet.

### **isConfigError(error)**
Retorna `true` se o erro é relacionado à configuração do Firebase.

## 🚀 **Implementação Atual**

✅ **AuthScreen** - Login e registro com tratamento de erros  
✅ **OfferRideScreen** - Publicação de caronas com tratamento de erros  
⏳ **Outras telas** - Pode ser implementado conforme necessário  

## 💡 **Dicas**

1. **Sempre use** `getFirebaseErrorMessage()` em vez de mostrar `error.message` diretamente
2. **Log o erro original** para debug: `console.error('Firebase error:', error)`
3. **Use títulos específicos** baseados no tipo de erro para melhor UX
4. **Teste diferentes cenários** para garantir que todas as mensagens estão corretas
