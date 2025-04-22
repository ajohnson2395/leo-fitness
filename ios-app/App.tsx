import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import usePushNotifications from './hooks/usePushNotifications';

// Import screens
import LoginScreen from './screens/LoginScreen';
import ChatScreen from './screens/ChatScreen';



// Home Screen Component
function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>RunCoach AI</Text>
        <Text style={styles.subtitle}>Your AI-powered running companion</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.buttonText}>Chat with Coach</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Workouts')}
          >
            <Text style={styles.buttonText}>View Workouts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.buttonText}>Your Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Workouts Screen Component
function WorkoutsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Workouts</Text>
        <Text style={styles.paragraph}>Your workout schedule will appear here.</Text>
        <Text style={styles.paragraph}>We're integrating workouts from the backend API.</Text>
      </View>
    </SafeAreaView>
  );
}

// Profile Screen Component
function ProfileScreen({ navigation, route }) {
  const { sendLocalNotification, pushToken } = usePushNotifications(true);
  
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@auth_token');
              route.params.onLogout();
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleTestLocalNotification = () => {
    sendLocalNotification(
      'RunCoach AI Test',
      'This is a test notification from your running coach!',
      { type: 'test_notification' }
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.paragraph}>View and edit your running profile.</Text>
        
        {pushToken ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Push Notifications</Text>
            <Text style={styles.infoText}>
              Your device is registered for push notifications
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={handleTestLocalNotification}
            >
              <Text style={styles.buttonText}>Test Notification</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Push Notifications</Text>
            <Text style={styles.infoText}>
              Push notifications are not enabled on this device
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Setup push notifications using our custom hook
  const { pushToken } = usePushNotifications(isAuthenticated);

  // Check for existing auth token on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Handle login success
  const handleLoginSuccess = async (token) => {
    try {
      await AsyncStorage.setItem('@auth_token', token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>RunCoach AI</Text>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // Authenticated navigator
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4f46e5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'RunCoach AI' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Coach Chat' }} />
          <Stack.Screen name="Workouts" component={WorkoutsScreen} options={{ title: 'Workouts' }} />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            initialParams={{ onLogout: handleLogout }}
            options={{ title: 'Profile' }} 
          />
        </Stack.Navigator>
      ) : (
        // Auth navigator
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            initialParams={{ onLoginSuccess: handleLoginSuccess }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4f46e5',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    marginTop: 30,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4f46e5',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#059669',
    marginTop: 10,
  },
});

