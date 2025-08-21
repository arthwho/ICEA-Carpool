# 🔒 Security Configuration

This document explains how to securely configure the ICEACarpool application with Firebase and Google OAuth credentials.

## 🚨 Important Security Notes

- **Never commit sensitive credentials to version control**
- **Keep your Google OAuth client secret secure**
- **Use environment variables for all sensitive data**
- **Regularly rotate your credentials**

## 📁 Protected Files

The following files are protected by `.gitignore` and will not be committed:

- `.env` - Environment variables with sensitive data
- `google-services.json` - Firebase configuration for Android
- `GoogleService-Info.plist` - Firebase configuration for iOS
- `src/config/secrets.js` - Any additional secret files
- `credentials/` - Directory for credential files

## 🔧 Setup Instructions

### 1. Create Environment File

Copy the example file and fill in your actual credentials:

```bash
cp env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your actual credentials:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_actual_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Admin Configuration
ADMIN_EMAIL=admin@example.com
```

### 3. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **General**
4. Scroll down to **"Your apps"** section
5. Click **"Add app"** → **"Web"**
6. Copy the configuration values

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID for **Web application**
7. Add redirect URI: `https://auth.expo.io/@your-username/ICEACarpool`
8. Copy Client ID and Client Secret

### 5. Test Configuration

The app will validate your configuration on startup and show warnings if any required credentials are missing.

## 🔍 Validation

The app includes automatic validation that checks for required environment variables:

- `FIREBASE_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 🛡️ Security Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Git Ignore**: Never commit `.env` files or credential files
3. **Rotation**: Regularly rotate your OAuth client secrets
4. **Scopes**: Use minimal required OAuth scopes
5. **Validation**: The app validates configuration on startup
6. **Logging**: Avoid logging sensitive data in production

## 🚨 Emergency Procedures

If credentials are accidentally exposed:

1. **Immediately revoke** the exposed credentials
2. **Generate new credentials** in Google Cloud Console
3. **Update your `.env` file** with new credentials
4. **Check git history** and remove any committed credentials
5. **Notify team members** to update their local `.env` files

## 📞 Support

If you encounter security issues:

1. Check the console logs for validation warnings
2. Verify all environment variables are set correctly
3. Ensure `.env` file is in the project root
4. Restart the development server after making changes

## 🔄 Updates

When updating credentials:

1. Update your `.env` file
2. Restart the development server
3. Test the authentication flow
4. Update team members if needed
