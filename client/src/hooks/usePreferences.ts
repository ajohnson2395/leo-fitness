import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface CoachingPreferences {
  notificationsEnabled: boolean;
  dataSharing: boolean;
  prefersDarkMode: boolean;
  metricUnits: boolean; // true for metric (km), false for imperial (miles)
  language: string;
  userId: number;
}

const defaultPreferences: Omit<CoachingPreferences, "userId"> = {
  notificationsEnabled: true,
  dataSharing: true,
  prefersDarkMode: false,
  metricUnits: false, // default to miles
  language: "en",
};

export function usePreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CoachingPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences when user changes
  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        // First try to get from server
        const storedPrefs = localStorage.getItem(`coaching_preferences_${user.id}`);
        
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        } else {
          // If not found, set to default
          const newPrefs = { 
            ...defaultPreferences,
            userId: user.id 
          };
          setPreferences(newPrefs);
          localStorage.setItem(`coaching_preferences_${user.id}`, JSON.stringify(newPrefs));
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast({
          title: "Error loading preferences",
          description: "Your preferences could not be loaded. Default settings will be used.",
          variant: "destructive",
        });
        
        // Set to defaults on error
        const newPrefs = { 
          ...defaultPreferences,
          userId: user.id 
        };
        setPreferences(newPrefs);
        localStorage.setItem(`coaching_preferences_${user.id}`, JSON.stringify(newPrefs));
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user, toast]);

  // Update a specific preference
  const updatePreference = async <K extends keyof CoachingPreferences>(
    key: K, 
    value: CoachingPreferences[K]
  ) => {
    if (!preferences || !user) return;

    try {
      const updatedPreferences = {
        ...preferences,
        [key]: value,
      };
      
      setPreferences(updatedPreferences);
      localStorage.setItem(`coaching_preferences_${user.id}`, JSON.stringify(updatedPreferences));
      
      toast({
        title: "Preferences updated",
        description: "Your coaching preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating preference:", error);
      toast({
        title: "Error saving preferences",
        description: "Your preferences could not be saved. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update multiple preferences at once
  const updatePreferences = async (updates: Partial<CoachingPreferences>) => {
    if (!preferences || !user) return;

    try {
      const updatedPreferences = {
        ...preferences,
        ...updates,
      };
      
      setPreferences(updatedPreferences);
      localStorage.setItem(`coaching_preferences_${user.id}`, JSON.stringify(updatedPreferences));
      
      toast({
        title: "Preferences updated",
        description: "Your coaching preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error saving preferences",
        description: "Your preferences could not be saved. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    preferences,
    isLoading,
    updatePreference,
    updatePreferences,
  };
}