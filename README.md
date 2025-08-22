# **CSI606-2025-01 - Remoto - Proposta de Trabalho Final**

## *Discente: Arthur Silva Ferreira Coelho*

<!-- Descrever um resumo sobre o trabalho. -->

### Resumo

O trabalho final tem como objetivo o desenvolvimento de um aplicativo móvel multiplataforma para facilitar o compartilhamento de caronas entre estudantes do ICEA (Instituto de Ciências Exatas e Aplicadas) da UFOP. O aplicativo "ICEA Caronas" permite que usuários ofereçam e solicitem caronas de forma segura e eficiente, promovendo a mobilidade sustentável e a integração da comunidade acadêmica.

O projeto foi desenvolvido utilizando React Native com Expo, oferecendo compatibilidade tanto para dispositivos móveis quanto para navegadores web. A aplicação integra autenticação Firebase, banco de dados Firestore em tempo real, e sistema de login com Google (Ainda a ser implementado).

<!-- Apresentar o tema. -->
### 1. Tema

O trabalho final tem como tema o desenvolvimento de um sistema de carona compartilhada para a comunidade acadêmica do ICEA/UFOP, abordando questões de mobilidade urbana, sustentabilidade e integração social através de uma solução tecnológica inovadora.

<!-- Descrever e limitar o escopo da aplicação. -->
### 2. Escopo

Este projeto terá as seguintes funcionalidades:

**Autenticação e Perfil de Usuário:**
- Sistema de registro e login com email/senha
- Integração com Google Sign-In*
- Perfil de usuário com nome, sobrenome e informações pessoais
- Persistência de sessão entre sessões

**Gestão de Caronas:**
- Interface para oferecer caronas com ponto de partida, horário e vagas disponíveis
- Visualização em tempo real de caronas disponíveis
- Sistema de solicitação de caronas (funcionalidade em desenvolvimento)
- Painel administrativo para gerenciamento de caronas

**Interface Responsiva:**
- Navegação por abas inferiores em dispositivos móveis
- Sidebar lateral para navegação web
- Layout adaptativo que se ajusta a diferentes tamanhos de tela
- Sistema de alertas cross-platform (mobile e web)

**Recursos Técnicos:**
- Integração completa com Firebase (Authentication e Firestore)
- Banco de dados em tempo real
- Compatibilidade total com Expo Go
- Design responsivo para diferentes dispositivos

<!-- Apresentar restrições de funcionalidades e de escopo. -->
### 3. Restrições

Neste trabalho não serão considerados:

- Sistema de pagamentos in-app
- Integração com mapas e GPS em tempo real
- Sistema de chat entre usuários
- Notificações push
- Sistema de avaliações e reviews
- Histórico detalhado de caronas
- Integração com redes sociais
- Sistema de gamificação
- Funcionalidades offline completas
- Integração com APIs de transporte público

<!-- Construir alguns protótipos para a aplicação, disponibilizá-los no Github e descrever o que foi considerado. //-->
### 4. Protótipo

Protótipos para as páginas foram elaborados e implementados, e podem ser encontrados no repositório GitHub: https://github.com/arthwho/ICEA-Carpool

**Páginas Implementadas:**
- **Tela de Autenticação**: Login e registro com validação de campos
- **Tela Principal (Caronas)**: Listagem de caronas disponíveis em tempo real
- **Tela de Oferecer Carona**: Formulário para publicação de novas caronas
- **Tela de Perfil**: Exibição e gerenciamento de informações do usuário
- **Navegação Responsiva**: Bottom navigation para mobile e sidebar para web

**Considerações do Protótipo:**
- Interface adaptativa para diferentes dispositivos
- Sistema de autenticação robusto com múltiplas opções
- Banco de dados em tempo real para atualizações instantâneas
- Design moderno e intuitivo seguindo padrões de UX/UI
- Compatibilidade cross-platform (mobile e web)

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI: `npm install -g @expo/cli`
- Git
- Expo Go (aplicativo móvel para testes)

### Configuração

1. **Clone o Repositório**
```bash
git clone https://github.com/arthwho/ICEA-Carpool.git
cd ICEA-Carpool
```

2. **Instale as Dependências**
```bash
npm install
```

3. **Configure as Variáveis de Ambiente**
Crie um arquivo `.env` na raiz do projeto:
```bash
# Firebase Configuration
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# Google OAuth Configuration
GOOGLE_CLIENT_ID=seu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_google_client_secret_aqui

# Admin Configuration
ADMIN_EMAIL=admin@example.com
```

4. **Configure o Firebase**
- Crie um projeto no [Firebase Console](https://console.firebase.google.com)
- Ative Authentication (Email/Password e Google)
- Crie um banco Firestore com regras de segurança adequadas
- Configure Google OAuth no Google Cloud Console

5. **Execute o Projeto**
```bash
npx expo start
```

### 5. Referências

REACT NATIVE. **Documentação oficial**. Disponível em: https://reactnative.dev/docs/getting-started. Acesso em: 2024.

EXPO. **Documentação oficial**. Disponível em: https://docs.expo.dev/. Acesso em: 2024.

FIREBASE. **Documentação oficial**. Disponível em: https://firebase.google.com/docs. Acesso em: 2024.

GOOGLE CLOUD. **Documentação oficial**. Disponível em: https://cloud.google.com/docs. Acesso em: 2024.