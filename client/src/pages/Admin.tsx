import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Shield, ArrowLeft, Bell, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import UserManagement from "@/components/admin/UserManagement";

export default function AdminPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { token, setToken } = useAuth();
  const [isLoading, setIsLoading] = useState({
    messages: false,
    workouts: false,
    trainingPlan: false,
    all: false,
    reminder: false
  });

  const handleClearMessages = async () => {
    try {
      setIsLoading({ ...isLoading, messages: true });
      const response = await apiRequest("DELETE", "/api/admin/messages");
      const data = await response.json();
      
      // Update token if it's returned by the server
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        
        // Force a page refresh to ensure all components use the new token
        setTimeout(() => {
          navigate("/");
          toast({
            title: "Token refreshed",
            description: "Your authentication has been updated. Try chatting now!",
          });
        }, 1000);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      
      toast({
        title: "Success",
        description: "All messages have been cleared.",
      });
    } catch (error) {
      console.error("Error clearing messages:", error);
      toast({
        title: "Error",
        description: "Failed to clear messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, messages: false });
    }
  };

  const handleClearWorkouts = async () => {
    try {
      setIsLoading({ ...isLoading, workouts: true });
      const response = await apiRequest("DELETE", "/api/admin/workouts");
      
      // Check if we got a response with JSON data
      try {
        const data = await response.json();
        // Update token if it's returned by the server
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('authToken', data.token);
          
          // Force a page refresh to ensure all components use the new token
          setTimeout(() => {
            navigate("/");
            toast({
              title: "Token refreshed",
              description: "Your authentication has been updated.",
            });
          }, 1000);
        }
      } catch (e) {
        // Not a JSON response, continue
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      
      toast({
        title: "Success",
        description: "All workouts have been cleared.",
      });
    } catch (error) {
      console.error("Error clearing workouts:", error);
      toast({
        title: "Error",
        description: "Failed to clear workouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, workouts: false });
    }
  };

  const handleClearTrainingPlan = async () => {
    try {
      setIsLoading({ ...isLoading, trainingPlan: true });
      const response = await apiRequest("DELETE", "/api/admin/training-plan");
      
      // Check if we got a response with JSON data
      try {
        const data = await response.json();
        // Update token if it's returned by the server
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('authToken', data.token);
          
          // Force a page refresh to ensure all components use the new token
          setTimeout(() => {
            navigate("/");
            toast({
              title: "Token refreshed",
              description: "Your authentication has been updated.",
            });
          }, 1000);
        }
      } catch (e) {
        // Not a JSON response, continue
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/training-plan"] });
      
      toast({
        title: "Success",
        description: "Training plan has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing training plan:", error);
      toast({
        title: "Error",
        description: "Failed to clear training plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, trainingPlan: false });
    }
  };

  const handleClearAll = async () => {
    try {
      setIsLoading({ ...isLoading, all: true });
      const response = await apiRequest("DELETE", "/api/admin/all");
      const data = await response.json();
      
      // Update token if it's returned by the server
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        
        // Force a page refresh to ensure all components use the new token
        setTimeout(() => {
          navigate("/");
          toast({
            title: "Token refreshed",
            description: "Your authentication has been updated. Try chatting now!",
          });
        }, 1000);
      }
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plan"] });
      
      toast({
        title: "Success",
        description: "All data has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing all data:", error);
      toast({
        title: "Error",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, all: false });
    }
  };
  
  const handleTestWorkoutReminder = async () => {
    try {
      setIsLoading({ ...isLoading, reminder: true });
      const response = await apiRequest("POST", "/api/test/workout-reminder");
      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.message || "Test workout reminder has been scheduled.",
      });
      
      // Invalidate messages query to show the new message when it arrives
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      }, 65000); // Invalidate a bit after the message should arrive
      
    } catch (error) {
      console.error("Error scheduling test reminder:", error);
      toast({
        title: "Error",
        description: "Failed to schedule test reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, reminder: false });
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-6 pt-16 md:pt-6 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white flex items-center">
          <Shield className="mr-2 h-6 w-6 text-primary-600" />
          Admin Panel
        </h1>
      </div>

      {/* User Management Section (Spans full width) */}
      <div className="mb-6">
        <UserManagement />
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white">Chat Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Clear all chat messages to reset conversations with the AI coach.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleClearMessages}
              disabled={isLoading.messages}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isLoading.messages ? "Clearing Messages..." : "Clear All Messages"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white">Workout Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Clear all workouts to reset your training schedule.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleClearWorkouts}
              disabled={isLoading.workouts}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isLoading.workouts ? "Clearing Workouts..." : "Clear All Workouts"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white">Training Plan Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Clear your current training plan.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleClearTrainingPlan}
              disabled={isLoading.trainingPlan}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isLoading.trainingPlan ? "Clearing Plan..." : "Clear Training Plan"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white">Reset Everything</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Clear all data including messages, workouts, and training plan.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleClearAll}
              disabled={isLoading.all}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isLoading.all ? "Clearing All Data..." : "Clear All Data"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white">Test Workout Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Schedule a test workout reminder message to appear in your chat in approximately 1 minute.
            </p>
            <Button 
              variant="default" 
              onClick={handleTestWorkoutReminder}
              disabled={isLoading.reminder}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading.reminder ? "Scheduling Reminder..." : "Test Workout Reminder"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}