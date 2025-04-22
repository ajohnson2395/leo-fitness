import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Edit, Heart, CircleUser } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RunningProfile } from "@shared/schema";
import { usePreferences } from "@/hooks/usePreferences";

const profileSchema = z.object({
  experience: z.enum(["beginner", "intermediate", "advanced", "elite"]),
  mileTimeMinutes: z.coerce.number().min(0).max(59),
  mileTimeSeconds: z.coerce.number().min(0).max(59),
  weeklyMileage: z.coerce.number().min(0),
  trainingGoal: z.enum(["general_fitness", "distance", "speed", "race"]),
  raceType: z.enum(["5k", "10k", "half_marathon", "marathon", "ultra"]).nullable(),
  strengthTraining: z.enum(["none", "bodyweight", "weights"]).nullable(),
  preferredRunTime: z.enum(["morning", "mid_day", "evening"]).nullable(),
  restDays: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])).nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const { user, runningProfile, saveRunningProfile } = useAuth();
  const { preferences, isLoading: isPreferencesLoading, updatePreference } = usePreferences();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showRaceType, setShowRaceType] = useState(
    runningProfile?.trainingGoal === "race"
  );
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      experience: runningProfile?.experience as any || "beginner",
      mileTimeMinutes: runningProfile?.mileTimeMinutes || 8,
      mileTimeSeconds: runningProfile?.mileTimeSeconds || 0,
      weeklyMileage: runningProfile?.weeklyMileage || 10,
      trainingGoal: runningProfile?.trainingGoal as any || "general_fitness",
      raceType: runningProfile?.raceType as any || null,
      strengthTraining: runningProfile?.strengthTraining as any || null,
      preferredRunTime: runningProfile?.preferredRunTime as any || null,
      restDays: runningProfile?.restDays as any || ["sunday"],
    },
  });

  const trainingGoal = form.watch("trainingGoal");

  // Update race type visibility when training goal changes
  if (trainingGoal === "race" && !showRaceType) {
    setShowRaceType(true);
  } else if (trainingGoal !== "race" && showRaceType) {
    setShowRaceType(false);
  }

  const handleEditProfile = async (values: ProfileFormValues) => {
    try {
      // Create a copy of the values to avoid modifying the form values directly
      const profileData = { ...values } as any;  // Use type assertion to handle nullable types
      
      // Ensure proper handling of race type - null if not race goal (matching database schema)
      if (profileData.trainingGoal !== "race") {
        profileData.raceType = null;
      } else if (!profileData.raceType) {
        // Set default if training goal is race but no race type selected
        profileData.raceType = "5k";
      }
      
      // Ensure other nullable fields are properly handled
      if (!profileData.preferredRunTime) profileData.preferredRunTime = null;
      if (!profileData.strengthTraining) profileData.strengthTraining = null;
      if (!profileData.restDays || profileData.restDays.length === 0) profileData.restDays = null;
      
      await saveRunningProfile(profileData);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Format mile time to display as MM:SS
  const formatMileTime = () => {
    if (!runningProfile) return "N/A";
    
    const minutes = runningProfile.mileTimeMinutes;
    const seconds = runningProfile.mileTimeSeconds.toString().padStart(2, "0");
    
    return `${minutes}:${seconds}`;
  };

  // Convert experience enum to readable text
  const formatExperience = () => {
    if (!runningProfile) return "N/A";
    
    const experienceMap: Record<string, string> = {
      beginner: "Beginner (0-1 years)",
      intermediate: "Intermediate (1-3 years)",
      advanced: "Advanced (3+ years)",
      elite: "Elite/Competitive",
    };
    
    return experienceMap[runningProfile.experience] || runningProfile.experience;
  };

  // Convert training goal enum to readable text
  const formatTrainingGoal = () => {
    if (!runningProfile) return "N/A";
    
    const goalMap: Record<string, string> = {
      general_fitness: "General Fitness & Health",
      distance: "Increase Distance",
      speed: "Improve Speed",
      race: `Train for a ${formatRaceType()}`,
    };
    
    return goalMap[runningProfile.trainingGoal] || runningProfile.trainingGoal;
  };

  // Convert race type enum to readable text
  const formatRaceType = () => {
    if (!runningProfile || !runningProfile.raceType) return "Race";
    
    const raceMap: Record<string, string> = {
      "5k": "5K",
      "10k": "10K",
      half_marathon: "Half Marathon",
      marathon: "Marathon",
      ultra: "Ultra Marathon",
    };
    
    return raceMap[runningProfile.raceType] || runningProfile.raceType;
  };

  // Format strength training preference
  const formatStrengthTraining = () => {
    if (!runningProfile || !runningProfile.strengthTraining) return "None";
    
    const strengthMap: Record<string, string> = {
      none: "None",
      bodyweight: "Bodyweight Exercises",
      weights: "Weight Training",
    };
    
    return strengthMap[runningProfile.strengthTraining] || runningProfile.strengthTraining;
  };

  // Format preferred run time
  const formatPreferredRunTime = () => {
    if (!runningProfile || !runningProfile.preferredRunTime) return "Flexible";
    
    const timeMap: Record<string, string> = {
      morning: "Morning",
      mid_day: "Mid-day",
      evening: "Evening",
    };
    
    return timeMap[runningProfile.preferredRunTime] || runningProfile.preferredRunTime;
  };

  // Format rest days
  const formatRestDays = () => {
    if (!runningProfile || !runningProfile.restDays || runningProfile.restDays.length === 0) {
      return "None";
    }
    
    return runningProfile.restDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(", ");
  };

  return (
    <div className="h-full w-full flex flex-col p-6 pt-16 md:pt-6 pb-6 bg-neutral-50 dark:bg-neutral-900 safe-area-top safe-area-left safe-area-right">
      <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6">Your Profile</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 sm:mb-0">
              <CircleUser className="h-10 w-10" />
            </div>
            <div className="ml-0 sm:ml-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{user?.name || "Runner"}</h2>
              <p className="text-neutral-500 dark:text-neutral-400">{user?.email || "runner@example.com"}</p>
              {user?.role === 'admin' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 mt-1">
                  Admin
                </span>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="touch-manipulation active:scale-95 transition-colors mt-4 sm:mt-0 sm:ml-auto rounded-full" 
              style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px' }}
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          
          {runningProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Running Experience</h3>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">{formatExperience()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Current Mile Time</h3>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">{formatMileTime()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Weekly Mileage</h3>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">{runningProfile.weeklyMileage} miles</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Training Goal</h3>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">{formatTrainingGoal()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Strength Training</h3>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">{formatStrengthTraining()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Preferred Run Time</h3>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">{formatPreferredRunTime()}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Rest Days</h3>
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">{formatRestDays()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-600">You haven't created a running profile yet.</p>
              <Button 
                variant="default" 
                className="mt-4"
                onClick={() => setIsEditDialogOpen(true)}
              >
                Create Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Account Settings</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Manage your account preferences and personal information.</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border dark:border-neutral-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Receive workout reminders and coaching updates</p>
              </div>
              <Switch 
                id="notifications" 
                checked={preferences?.notificationsEnabled ?? true}
                onCheckedChange={(checked) => {
                  if (preferences) {
                    updatePreference("notificationsEnabled", checked);
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border dark:border-neutral-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white">Data Sharing</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Allow anonymous data to improve AI coaching</p>
              </div>
              <Switch 
                id="data-sharing" 
                checked={preferences?.dataSharing ?? true}
                onCheckedChange={(checked) => {
                  if (preferences) {
                    updatePreference("dataSharing", checked);
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border dark:border-neutral-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white">Distance Units</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{preferences?.metricUnits ? "Using kilometers (km)" : "Using miles (mi)"}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!preferences?.metricUnits ? 'font-medium text-primary dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}`}>Miles</span>
                <Switch 
                  id="metric-units" 
                  checked={preferences?.metricUnits ?? false}
                  onCheckedChange={(checked) => {
                    if (preferences) {
                      updatePreference("metricUnits", checked);
                    }
                  }}
                />
                <span className={`text-sm ${preferences?.metricUnits ? 'font-medium text-primary dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}`}>Kilometers</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border dark:border-neutral-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Switch between light and dark theme</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!preferences?.prefersDarkMode ? 'font-medium text-primary dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}`}>Light</span>
                <Switch 
                  id="dark-mode" 
                  checked={preferences?.prefersDarkMode ?? false}
                  onCheckedChange={(checked) => {
                    if (preferences) {
                      updatePreference("prefersDarkMode", checked);
                      // Theme will be updated by the ThemeProvider through preferences
                    }
                  }}
                />
                <span className={`text-sm ${preferences?.prefersDarkMode ? 'font-medium text-primary dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}`}>Dark</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border dark:border-neutral-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 dark:text-white">Change Password</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Update your account password</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-primary dark:text-primary-400 active:scale-95 transition-colors touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px' }}
              >
                Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Connect Your Devices</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Link your fitness trackers to enhance your coaching experience.</p>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="flex items-center w-full justify-start h-auto p-4 touch-manipulation active:scale-95 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px' }}
            >
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-2 mr-3">
                <Heart className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-neutral-900 dark:text-white">Connect Strava</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Import your activities and routes</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center w-full justify-start h-auto p-4 touch-manipulation active:scale-95 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px' }}
            >
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2 mr-3">
                <Heart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-neutral-900 dark:text-white">Connect Garmin</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Sync your heart rate and activity data</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center w-full justify-start h-auto p-4 touch-manipulation active:scale-95 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px' }}
            >
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2 mr-3">
                <Heart className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-neutral-900 dark:text-white">Connect Whoop</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Track your recovery and strain</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto safe-area-top safe-area-left safe-area-right safe-area-bottom">
          <DialogHeader>
            <DialogTitle>Edit Running Profile</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditProfile)} className="space-y-4">
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Running Experience</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                        <SelectItem value="elite">Elite/Competitive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem className="space-y-2">
                <FormLabel>Current Fastest Mile Time</FormLabel>
                <div className="flex items-center">
                  <FormField
                    control={form.control}
                    name="mileTimeMinutes"
                    render={({ field }) => (
                      <FormItem className="w-20">
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            max={59} 
                            placeholder="Min" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="mx-2 text-neutral-500">:</span>
                  <FormField
                    control={form.control}
                    name="mileTimeSeconds"
                    render={({ field }) => (
                      <FormItem className="w-20">
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            max={59} 
                            placeholder="Sec" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>
              
              <FormField
                control={form.control}
                name="weeklyMileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Weekly Mileage</FormLabel>
                    <div className="flex">
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          placeholder="e.g., 15" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <span className="flex items-center ml-2 text-neutral-500">miles</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trainingGoal"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Primary Training Goal</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="general_fitness" />
                          </FormControl>
                          <FormLabel className="font-normal">General Fitness & Health</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="distance" />
                          </FormControl>
                          <FormLabel className="font-normal">Increase Distance</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="speed" />
                          </FormControl>
                          <FormLabel className="font-normal">Improve Speed</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="race" />
                          </FormControl>
                          <FormLabel className="font-normal">Train for a Race</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {showRaceType && (
                <FormField
                  control={form.control}
                  name="raceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Race Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select race type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5k">5K</SelectItem>
                          <SelectItem value="10k">10K</SelectItem>
                          <SelectItem value="half_marathon">Half Marathon</SelectItem>
                          <SelectItem value="marathon">Marathon</SelectItem>
                          <SelectItem value="ultra">Ultra Marathon</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="strengthTraining"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Strength Training Preference</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value === null ? undefined : field.value}
                        className="space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="none" />
                          </FormControl>
                          <FormLabel className="font-normal">None</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="bodyweight" />
                          </FormControl>
                          <FormLabel className="font-normal">Bodyweight Exercises</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="weights" />
                          </FormControl>
                          <FormLabel className="font-normal">Weight Training</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredRunTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time of Day to Run</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value === null ? undefined : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred run time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="mid_day">Mid-day</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="restDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Rest Days</FormLabel>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`rest-day-${day}`}
                              checked={field.value?.includes(day)}
                              onCheckedChange={(checked: boolean | "indeterminate") => {
                                const currentValue = field.value || [];
                                if (checked === true) {
                                  field.onChange([...currentValue, day]);
                                } else {
                                  field.onChange(currentValue.filter(d => d !== day));
                                }
                              }}
                            />
                            <label
                              htmlFor={`rest-day-${day}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                            >
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
