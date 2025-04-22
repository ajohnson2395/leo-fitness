# RunCoach AI - Mobile App

This directory contains the React Native/Expo mobile application for RunCoach AI. The app is configured for your Expo account (username: ajohnson23) and ready to build.

## Building Your Standalone App with EAS

These instructions will help you build a standalone app that you can install directly on your device without using Expo Go.

### Prerequisites

1. **An Expo account** (You already have this: ajohnson23)
2. **Node.js and npm** installed on your local computer
3. **Git** to clone this repository

### Step 1: Clone the Repository

First, clone this repository to your local machine:

```bash
git clone https://github.com/yourusername/runcoach-ai.git
cd runcoach-ai
```

### Step 2: Install EAS CLI

Install the Expo Application Services CLI globally:

```bash
npm install -g eas-cli
```

### Step 3: Login to Expo

Login to your Expo account (the one you provided: ajohnson23):

```bash
eas login
```

### Step 4: Navigate to the iOS App Directory

```bash
cd ios-app
```

### Step 5: Install Dependencies

Install the project dependencies:

```bash
npm install
```

### Step 6: Configure the Build

This step creates or updates the eas.json file (we've already created it for you):

```bash
eas build:configure
```

### Step 7: Build for Your Platform

#### For iOS (requires Apple Developer account):

```bash
eas build --platform ios
```

#### For Android:

```bash
eas build --platform android
```

#### For both platforms:

```bash
eas build --platform all
```

### Step 8: Follow the Prompts

- For iOS, you'll need to provide your Apple Developer account credentials
- For Android, EAS can generate and manage a keystore for you

### Step 9: Wait for the Build

The build process takes place on Expo's servers and may take 10-30 minutes. You'll receive a URL where you can monitor the build progress.

### Step 10: Install on Your Device

Once the build is complete:

- **iOS**: You'll receive a link to download the IPA file or a TestFlight invitation
- **Android**: You'll receive a link to download the APK file directly

## Configuration Details

Your app is already configured with:

- Expo Project ID: 115a5d85-9c6e-42ba-af76-03a87abd8ee4
- Owner: ajohnson23
- Bundle Identifier: com.ajohnson23.runcoach
- API URL: https://i-os-coach-ajohnson23.replit.app

## Troubleshooting

1. **If you get permission errors**: Make sure you're logged in with the correct Expo account
2. **If the build fails**: Check the logs for specific errors
3. **If the app can't connect to the server**: Verify that your Replit app is running and accessible

## Next Steps

After successfully installing the app:

1. **Log in with your credentials** (use the same ones you use on the web version)
2. **Check that notifications work**
3. **Test all app functionality**

For additional help, consult the [Expo documentation](https://docs.expo.dev/distribution/building-standalone-apps/).