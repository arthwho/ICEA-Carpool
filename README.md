# ICEACarpool - React Native App

A carpooling application for the ICEA (Instituto de Ciências Exatas e Aplicadas) community at UFVJM, built with React Native and Expo.

## Features

- **User Authentication**: Login/signup with email or Google account
- **Find Rides**: Browse available carpool offers from other users
- **Offer Rides**: Post carpool opportunities for others to join
- **User Profiles**: Manage account settings and preferences
- **Admin Controls**: Special privileges for administrators

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # App header component
│   ├── LoadingScreen.js # Loading screen component
│   └── index.js        # Component exports
├── screens/            # App screens/pages
│   ├── AuthScreen.js   # Authentication screen
│   ├── HomeScreen.js   # Main home screen
│   ├── FindRideScreen.js # Browse available rides
│   ├── OfferRideScreen.js # Create new ride offers
│   ├── ProfileScreen.js # User profile management
│   └── index.js        # Screen exports
├── services/           # Business logic and external services
│   ├── mockAuth.js     # Mock authentication service
│   ├── mockFirestore.js # Mock database service
│   └── index.js        # Service exports
└── App.js              # Main app component
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- Android Studio (for Android development)
- Expo Go app on your device

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ICEACarpool
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Scan the QR code with Expo Go app or press 'a' for Android emulator

## Development Notes

### Current Implementation
- **Mock Services**: The app currently uses mock authentication and database services for development
- **React Native Components**: All web-specific components have been converted to React Native equivalents
- **Expo Compatibility**: Built specifically for Expo Go compatibility

### Future Enhancements
- Replace mock services with real Firebase integration
- Add push notifications for ride updates
- Implement real-time chat between drivers and passengers
- Add location services and maps integration
- Implement payment processing

### Testing
- Use any email with password "password" for login
- Admin access: arthwho@gmail.com
- Mock data includes sample rides for testing

## Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **JavaScript**: ES6+ features
- **StyleSheet**: React Native styling system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of an IHC (Human-Computer Interaction) course at UFVJM.

## Support

For questions or support, please contact the development team or refer to the course materials.
