import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Check, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Workout, TrainingPlan } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Helper to format intensity with proper color
const getIntensityBadge = (intensity: string) => {
  switch (intensity.toLowerCase()) {
    case 'high':
      return <Badge className="bg-accent-500">High Intensity</Badge>;
    case 'medium':
      return <Badge className="bg-secondary-500">Medium Intensity</Badge>;
    case 'low':
      return <Badge className="bg-blue-500">Low Intensity</Badge>;
    default:
      return <Badge>{intensity}</Badge>;
  }
};

interface WorkoutItemProps {
  workout: Workout;
  onComplete: (id: number, isComplete: boolean) => void;
  isTomorrow?: boolean;
}

const WorkoutItem = ({ workout, onComplete, isTomorrow = false }: WorkoutItemProps) => {
  return (
    <div className={`border-t border-neutral-200 dark:border-neutral-700 py-4 ${
      isTomorrow ? 'bg-primary-50 dark:bg-primary-900/20 px-4 -mx-4 rounded-lg my-2 shadow-sm' : ''
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-medium text-neutral-800 dark:text-white">{workout.title}</h3>
            {isTomorrow && (
              <Badge className="ml-2 bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100 border-none">
                <Calendar className="w-3 h-3 mr-1" />
                Tomorrow
              </Badge>
            )}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">{workout.description}</p>
        </div>
        <div className="ml-2">
          {getIntensityBadge(workout.intensity)}
        </div>
      </div>
      <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        <ul className="list-disc list-inside space-y-1">
          {workout.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3 flex">
        <Button
          variant={isTomorrow ? "default" : "ghost"}
          size="sm"
          className={`${isTomorrow ? '' : 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'} 
            text-sm font-medium flex items-center
            rounded-full touch-manipulation active:scale-95 transition-colors py-2 px-4
            ${workout.isComplete ? (isTomorrow ? 'bg-primary-600 dark:bg-primary-700' : 'bg-primary-50 dark:bg-primary-900/30') : ''}`}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            minHeight: '44px' // iOS minimum touch target size
          }}
          onClick={() => onComplete(workout.id, !workout.isComplete)}
        >
          <Check className={`h-5 w-5 mr-2 ${
            workout.isComplete 
              ? (isTomorrow ? 'text-white dark:text-white' : 'text-primary-600 dark:text-primary-400') 
              : 'text-neutral-400 dark:text-neutral-500'
          }`} />
          <span className="font-medium">{workout.isComplete ? "Completed" : "Mark as Complete"}</span>
        </Button>
      </div>
    </div>
  );
};

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Define types for API responses
  interface WorkoutsResponse {
    workouts: Workout[];
  }
  
  interface TrainingPlanResponse {
    trainingPlan: TrainingPlan | null;
  }

  // Fetch workouts
  const { 
    data: workoutsData, 
    isLoading: isWorkoutsLoading 
  } = useQuery<WorkoutsResponse>({
    queryKey: ["/api/workouts"],
    enabled: !!user,
  });
  
  // Fetch training plan
  const { 
    data: planData, 
    isLoading: isPlanLoading 
  } = useQuery<TrainingPlanResponse>({
    queryKey: ["/api/training-plan"],
    enabled: !!user,
  });
  
  // Mark workout as complete/incomplete
  const completeMutation = useMutation({
    mutationFn: async ({ id, isComplete }: { id: number; isComplete: boolean }) => {
      const res = await apiRequest("PATCH", `/api/workouts/${id}/complete`, { isComplete });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout updated",
        description: "Your workout status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update workout status.",
        variant: "destructive",
      });
    },
  });
  
  const handleCompleteWorkout = (id: number, isComplete: boolean) => {
    completeMutation.mutate({ id, isComplete });
  };
  
  const allWorkouts = workoutsData?.workouts || [];
  const trainingPlan = planData?.trainingPlan;
  
  // Sort workouts to prioritize tomorrow's workout at the top
  const sortedWorkouts = React.useMemo(() => {
    if (allWorkouts.length === 0) return [];
    
    // Get day names
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const tomorrow = (today + 1) % 7; // Next day, wrapping to 0 if today is Saturday
    const tomorrowName = days[tomorrow];
    
    // Create a new array with tomorrow's workout first, then the rest in day order
    return [...allWorkouts].sort((a, b) => {
      // Get the day indices for comparison
      const dayA = days.findIndex(day => day.toLowerCase() === a.dayOfWeek.toLowerCase());
      const dayB = days.findIndex(day => day.toLowerCase() === b.dayOfWeek.toLowerCase());
      
      // If one is tomorrow, it should come first
      if (dayA === tomorrow && dayB !== tomorrow) return -1;
      if (dayB === tomorrow && dayA !== tomorrow) return 1;
      
      // Otherwise sort by days starting from tomorrow
      const adjustedDayA = (dayA - tomorrow + 7) % 7;
      const adjustedDayB = (dayB - tomorrow + 7) % 7;
      return adjustedDayA - adjustedDayB;
    });
  }, [allWorkouts]);
  
  // Use sorted workouts throughout the component
  const workouts = sortedWorkouts;
  
  // Calculate completed workouts
  const completedWorkoutsCount = workouts.filter((w: Workout) => w.isComplete).length;
  const totalDistance = 20.5; // This would ideally come from the backend
  
  // Navigate to chat
  const handleChatWithCoach = () => {
    navigate("/chat");
  };
  
  // Loading skeleton for workouts
  const WorkoutsSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col p-6 pt-16 md:pt-6 bg-neutral-50 dark:bg-neutral-900">
      <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6">Your Training Plan</h1>
      
      {/* Training Plan Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {isPlanLoading ? (
            <WorkoutsSkeleton />
          ) : trainingPlan ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{trainingPlan.title}</h2>
                <Badge variant="outline">Week {trainingPlan.currentWeek} of {trainingPlan.durationWeeks}</Badge>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">{trainingPlan.description}</p>
              
              {isWorkoutsLoading ? (
                <WorkoutsSkeleton />
              ) : workouts.length > 0 ? (
                workouts.map((workout: Workout, index: number) => {
                  // The first workout in our sorted array is tomorrow's workout
                  const isTomorrow = index === 0 && workouts.length > 1;
                  
                  return (
                    <WorkoutItem 
                      key={workout.id} 
                      workout={workout} 
                      onComplete={handleCompleteWorkout}
                      isTomorrow={isTomorrow}
                    />
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-600 dark:text-neutral-400">You don't have any workouts yet.</p>
                  <Button 
                    className="mt-4 rounded-full touch-manipulation active:scale-95 transition-colors" 
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      minHeight: '44px'
                    }}
                    onClick={handleChatWithCoach}
                  >
                    Ask Coach for Workouts
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600 dark:text-neutral-400">You don't have a training plan yet.</p>
              <Button 
                className="mt-4 rounded-full touch-manipulation active:scale-95 transition-colors" 
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: '44px'
                }}
                onClick={handleChatWithCoach}
              >
                Get a Training Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Weekly Progress Card */}
      {workouts.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Weekly Progress</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Workouts Completed</p>
                <div className="flex items-end mt-1">
                  <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{completedWorkoutsCount}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm ml-1">/{workouts.length}</span>
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Total Distance</p>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{totalDistance}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm ml-1">miles</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full flex items-center justify-center rounded-full touch-manipulation active:scale-95 transition-colors" 
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                minHeight: '48px'
              }}
              onClick={handleChatWithCoach}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat with Coach
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
