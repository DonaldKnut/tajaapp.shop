# Taja.Shop Mobile App

A React Native mobile application for Nigeria's trusted e-commerce marketplace built with Expo.

## Features

- 🔐 **Authentication**: Secure login/register with JWT tokens
- 🏪 **Marketplace**: Browse and search products from verified sellers
- 💬 **Chat**: In-app messaging between buyers and sellers
- 🛒 **Shopping**: Add to cart, checkout, and order tracking
- 🔍 **Discovery**: Featured products, popular shops, and categories
- 📱 **Native Experience**: Optimized for iOS and Android

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack & Tab)
- **State Management**: Context API
- **Storage**: Expo SecureStore
- **Icons**: Expo Vector Icons (@expo/vector-icons)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Install dependencies:

```bash
cd mobile
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on simulator/device:

```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## Project Structure

```
mobile/
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── src/
│   ├── context/           # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/        # Navigation configuration
│   │   ├── AuthNavigator.tsx
│   │   └── AppNavigator.tsx
│   ├── screens/           # App screens
│   │   ├── auth/          # Authentication screens
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   └── app/           # Main app screens
│   │       ├── HomeScreen.tsx
│   │       ├── MarketplaceScreen.tsx
│   │       ├── ChatScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── services/          # API services
│   │   └── api.ts
│   └── components/        # Reusable components
└── assets/               # Static assets (images, fonts)
```

## Configuration

The app is configured to connect to the Taja.Shop backend API. Update the API URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend-url.com/api",
      "socketUrl": "https://your-backend-url.com"
    }
  }
}
```

## Features Implementation

### Authentication

- Secure token storage with Expo SecureStore
- Automatic token refresh and logout on expiry
- Role-based access (buyer/seller)

### Navigation

- Stack navigation for screen flows
- Tab navigation for main app sections
- Conditional navigation based on auth state

### API Integration

- RESTful API calls with Axios
- Automatic token attachment to requests
- Error handling and retry logic

### UI/UX

- Clean, modern design following Material Design principles
- Responsive layout for different screen sizes
- Loading states and error handling
- Pull-to-refresh functionality

## Development

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add to appropriate navigator in `src/navigation/`
3. Update TypeScript types if needed

### API Integration

1. Add new API methods to `src/services/api.ts`
2. Use in screens with proper error handling
3. Update loading and error states

### Styling

- Use StyleSheet.create() for performance
- Follow consistent spacing and color scheme
- Use responsive dimensions where needed

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

### App Store Deployment

1. Generate production builds
2. Upload to respective app stores
3. Configure app store listings

## Environment Variables

Set these in your Expo environment:

- `API_URL`: Backend API endpoint
- `SOCKET_URL`: Socket.io server URL

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is part of the Taja.Shop ecosystem.



