<div align="center">
<img src="assets/adaptive-icon.png" alt="Simbora logo" style="width: 25%;">

<strong>Simbora</strong>

[![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=fff)](#)
[![React Native](https://img.shields.io/badge/React_Native-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?logo=Firebase&logoColor=white)](#)
[![Android](https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
[![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=fff)](#)
</div>

---

Simbora is a comprehensive mobile and web application designed for managing and participating in carpool sharing within the ICEA (Instituto de Ciências Exatas e Aplicadas) community at UFOP. Built with React Native and Expo, it provides a seamless experience for drivers and passengers alike.

<table>
<tr>
<td width="20%" valign="top">
<img src="assets\Screenshot_1757102240.png">
<td width="20%" valign="top">
<img src="assets\Screenshot_1757102244.png">
<td width="60%" valign="bottom">
<img src="assets\Captura de tela 2025-09-05 165704.png">
</table>

---

## Features
### Core Functionality
- **Ride Management**: Create, edit, and manage carpool rides
- **User Authentication**: Secure email/password and Google Sign-In integration
- **Real-time Updates**: Live ride information and notifications
- **Driver Profiles**: Vehicle information and driver verification system
- **Ride Filtering**: Organize rides by time, price, and availability

### Technical Features
- **Cross-platform**: Built with React Native and Expo for mobile and web
- **Cloud Backend**: Firebase Firestore for real-time data
- **Responsive Design**: Adaptive layout for various screen sizes
- **Theme System**: Light/dark mode with system preference detection
- **Offline Support**: Basic functionality without internet connection

---

## Technology Stack

- **Frontend**: React Native & JavaScript
- **Backend**: Firebase (Firestore, Authentication, Cloud Messaging)
- **State Management**: React's built-in state management
- **UI/UX**: Custom responsive design with theme system
- **Authentication**: Email/Password and Google Sign-In
- **Notifications**: Firebase Cloud Messaging
- **Development**: Expo CLI and Expo Go

---

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
├── hooks/              # Custom React hooks
├── services/           # Business logic and API calls
├── utils/              # Utility functions and helpers
├── config/             # Configuration files
└── navigation/         # Navigation setup
```

---

## Setup Guide

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Git
- Expo Go (mobile app for testing)

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/arthwho/ICEA-Carpool.git
cd ICEA-Carpool
```

2. **Install Dependencies**

```bash
npm install
```

3. **Environment Configuration**
   Create a `.env` file in the project root:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Admin Configuration
ADMIN_EMAIL=admin@example.com
```

4. **Firebase Setup**

- Create a project in [Firebase Console](https://console.firebase.google.com)
- Enable Authentication (Email/Password and Google)
- Create a Firestore database with appropriate security rules
- Configure Google OAuth in Google Cloud Console

5. **Run the Project**

```bash
npx expo start
```

---

## Additional Documentation

### Responsive Layout System

For detailed information about the responsive layout system, see the `RESPONSIVE_LAYOUT.md` file which includes:

- Complete tutorial in Portuguese
- Practical usage examples
- Best practices
- Available components

### Key Components

- **ResponsiveLayout.js**: Responsive layout system
- **ThemeToggle.js**: Theme toggle component
- **CustomAlert.js**: Custom alert dialogs
- **CarInfoModal.js**: Vehicle information modal
- **RideCard.js**: Ride display component
- **RideFilters.js**: Ride filtering system

### Custom Hooks

- **useTheme.js**: Theme management hook
- **useResponsive.js**: Responsiveness hook
- **useCustomAlert.js**: Alert management hook
- **useAnimations.js**: Animation utilities