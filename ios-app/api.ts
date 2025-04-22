import axios from 'axios';

// Your backend API URL - this will be your deployed Replit app
// Get the URL from environment variables, or from a constant
// After deploying on Replit, replace the fallback URL with your actual Replit app URL
// For example: 'https://runcoach-ai.your-username.replit.app'

// Try to get API URL from Expo Constants if available
let API_URL: string | undefined;
try {
  const Constants = require('expo-constants');
  API_URL = Constants.expoConfig?.extra?.apiUrl;
} catch (error) {
  console.log('Could not load Expo Constants, using fallback URL');
}

// Your actual deployed Replit URL - UPDATE THIS after deploying
// This is the URL of your Replit app after you deploy it
const DEPLOYED_URL = 'https://i-os-coach-ajohnson23.replit.app'; // Replace with your actual deployed URL

const API_BASE_URL = API_URL || DEPLOYED_URL;

// Store the auth token
let authToken: string | null = null;

// Create an axios instance for easier management
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token for all requests
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    authToken = response.data.token;
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Chat APIs
export const getMessages = async () => {
  try {
    const response = await api.get('/api/chat/messages');
    return response.data.messages;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

export const sendMessage = async (message: string) => {
  try {
    const response = await api.post('/api/chat/messages', { message });
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

// Workout APIs
export const getWorkouts = async () => {
  try {
    const response = await api.get('/api/workouts');
    return response.data.workouts;
  } catch (error) {
    console.error('Get workouts error:', error);
    throw error;
  }
};

export const getTrainingPlan = async () => {
  try {
    const response = await api.get('/api/training-plan');
    return response.data.trainingPlan;
  } catch (error) {
    console.error('Get training plan error:', error);
    throw error;
  }
};

export const markWorkoutComplete = async (workoutId: number, isComplete: boolean) => {
  try {
    const response = await api.patch(`/api/workouts/${workoutId}/complete`, { isComplete });
    return response.data;
  } catch (error) {
    console.error('Mark workout complete error:', error);
    throw error;
  }
};

// Push notification registration
export const registerPushToken = async (pushToken: string) => {
  try {
    const response = await api.post('/api/notifications/register', { pushToken });
    return response.data;
  } catch (error) {
    console.error('Push token registration error:', error);
    throw error;
  }
};

export default api;