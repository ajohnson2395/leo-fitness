import { createContext, useContext, useState, useEffect, ReactNode, createElement } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, RunningProfile } from "@shared/schema";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  runningProfile: RunningProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean; // New property to check if the user is an admin
  hasRole: (role: string) => boolean; // Utility function to check user's role
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  saveRunningProfile: (profileData: Omit<RunningProfile, "id" | "userId" | "createdAt">) => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [runningProfile, setRunningProfile] = useState<RunningProfile | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load token from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch current user whenever token changes
  const userQuery = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!token
  });
  
  // Handle user query results
  const { isLoading: isUserLoading } = userQuery;
  
  // Effect to handle user data changes
  useEffect(() => {
    if (userQuery.data && typeof userQuery.data === 'object' && 'user' in userQuery.data) {
      setUser(userQuery.data.user as AuthUser);
    }
  }, [userQuery.data]);
  
  // Effect to handle user query errors
  useEffect(() => {
    if (userQuery.error) {
      // Clear invalid token
      setToken(null);
      setUser(null);
      localStorage.removeItem("authToken");
    }
  }, [userQuery.error]);

  // Fetch running profile when user is authenticated
  const profileQuery = useQuery({
    queryKey: ["/api/profile/running"],
    enabled: !!user
  });
  
  // Handle profile query results
  const { isLoading: isProfileLoading } = profileQuery;
  
  // Effect to handle profile data changes
  useEffect(() => {
    if (profileQuery.data && typeof profileQuery.data === 'object' && 'profile' in profileQuery.data) {
      setRunningProfile(profileQuery.data.profile as RunningProfile);
    }
  }, [profileQuery.data]);
  
  // Effect to handle profile query errors
  useEffect(() => {
    if (profileQuery.error) {
      // Profile might not exist yet, which is okay
      setRunningProfile(null);
    }
  }, [profileQuery.error]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; password: string; confirmPassword: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return res.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      
      toast({
        title: "Account created",
        description: "Your account has been successfully created.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return res.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save running profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: Omit<RunningProfile, "id" | "userId" | "createdAt">) => {
      // If profile exists, use PATCH to update it, otherwise use POST to create it
      const method = runningProfile ? "PATCH" : "POST";
      const res = await apiRequest(method, "/api/profile/running", profileData);
      return res.json();
    },
    onSuccess: (data) => {
      setRunningProfile(data.profile);
      
      toast({
        title: "Profile saved",
        description: "Your running profile has been saved successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/profile/running"] });
      
      // Handle the initial AI messages if they exist
      if (data.initialMessages && data.initialMessages.length > 0) {
        // Update chat messages in the query cache
        queryClient.setQueryData(["/api/chat/messages"], { 
          messages: data.initialMessages 
        });
      }
      
      // Handle any workouts created as part of the assessment
      if (data.workouts && data.workouts.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      }
      
      // Handle training plan if created
      if (data.trainingPlan) {
        queryClient.invalidateQueries({ queryKey: ["/api/training-plan"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error saving profile",
        description: error.message || "Could not save your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    await registerMutation.mutateAsync({ name, email, password, confirmPassword });
  };

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRunningProfile(null);
    localStorage.removeItem("authToken");
    queryClient.clear();
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const saveRunningProfile = async (profileData: Omit<RunningProfile, "id" | "userId" | "createdAt">) => {
    await saveProfileMutation.mutateAsync(profileData);
  };

  const isLoading = isUserLoading || isProfileLoading || registerMutation.isPending || loginMutation.isPending;
  const isAuthenticated = !!user && !!token;
  
  // Role-based authorization utilities
  const isAdmin = !!user && user.role === 'admin';
  const hasRole = (role: string) => !!user && user.role === role;

  const value = {
    user,
    token,
    runningProfile,
    isLoading,
    isAuthenticated,
    isAdmin,
    hasRole,
    register,
    login,
    logout,
    saveRunningProfile,
    setToken,
  };

  // Use React.createElement instead of JSX
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
