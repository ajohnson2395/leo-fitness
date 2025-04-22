import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import WelcomeScreen from "@/components/auth/WelcomeScreen";
import SignUpForm from "@/components/auth/SignUpForm";
import LoginForm from "@/components/auth/LoginForm";
import RunningAssessmentForm from "@/components/auth/RunningAssessmentForm";
import { useLocation } from "wouter";

enum AuthScreen {
  WELCOME = "welcome",
  SIGNUP = "signup",
  LOGIN = "login",
  ASSESSMENT = "assessment",
}

export default function Home() {
  const { user, isAuthenticated, register, login, saveRunningProfile, isLoading, runningProfile } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(AuthScreen.WELCOME);
  const [, navigate] = useLocation();
  
  // Handle navigation and screen changes
  useEffect(() => {
    if (isAuthenticated) {
      if (runningProfile) {
        navigate("/chat");
      } else if (currentScreen !== AuthScreen.ASSESSMENT) {
        setCurrentScreen(AuthScreen.ASSESSMENT);
      }
    }
  }, [isAuthenticated, runningProfile, currentScreen, navigate]);
  
  // Handle sign up form submission
  const handleSignUp = async (values: { name: string; email: string; password: string; confirmPassword: string }) => {
    try {
      await register(values.name, values.email, values.password, values.confirmPassword);
      setCurrentScreen(AuthScreen.ASSESSMENT);
    } catch (error) {
      console.error("Signup error:", error);
    }
  };
  
  // Handle login form submission
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  // Handle assessment form submission
  const handleAssessment = async (values: any) => {
    try {
      await saveRunningProfile(values);
      navigate("/chat");
    } catch (error) {
      console.error("Assessment error:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {currentScreen === AuthScreen.WELCOME && (
        <WelcomeScreen 
          onShowSignUp={() => setCurrentScreen(AuthScreen.SIGNUP)} 
          onShowLogin={() => setCurrentScreen(AuthScreen.LOGIN)} 
        />
      )}
      
      {currentScreen === AuthScreen.SIGNUP && (
        <SignUpForm 
          onBack={() => setCurrentScreen(AuthScreen.WELCOME)} 
          onSubmit={handleSignUp}
          isLoading={isLoading}
        />
      )}
      
      {currentScreen === AuthScreen.LOGIN && (
        <LoginForm 
          onBack={() => setCurrentScreen(AuthScreen.WELCOME)} 
          onSubmit={handleLogin}
          onShowSignUp={() => setCurrentScreen(AuthScreen.SIGNUP)}
          isLoading={isLoading}
        />
      )}
      
      {currentScreen === AuthScreen.ASSESSMENT && isAuthenticated && (
        <RunningAssessmentForm 
          onSubmit={handleAssessment} 
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
