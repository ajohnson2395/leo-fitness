import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

// Form schema
const assessmentSchema = z.object({
  experience: z.enum(["beginner", "intermediate", "advanced", "elite"], {
    required_error: "Please select your experience level",
  }),
  mileTimeMinutes: z.coerce.number().min(0).max(59),
  mileTimeSeconds: z.coerce.number().min(0).max(59),
  weeklyMileage: z.coerce.number().min(0, "Weekly mileage must be at least 0"),
  trainingGoal: z.enum(["general_fitness", "distance", "speed", "race"], {
    required_error: "Please select your training goal",
  }),
  raceType: z.enum(["5k", "10k", "half_marathon", "marathon", "ultra"]).optional(),
  strengthTraining: z.enum(["none", "bodyweight", "weights"], {
    required_error: "Please select your strength training preference",
  }),
  preferredRunTime: z.enum(["morning", "mid_day", "evening"], {
    required_error: "Please select your preferred time of day to run",
  }),
  restDays: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])).optional(),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

interface RunningAssessmentFormProps {
  onSubmit: (values: AssessmentFormValues) => void;
  isLoading: boolean;
}

export default function RunningAssessmentForm({ onSubmit, isLoading }: RunningAssessmentFormProps) {
  const [showRaceType, setShowRaceType] = useState(false);
  
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      experience: "beginner",
      mileTimeMinutes: 8,
      mileTimeSeconds: 0,
      weeklyMileage: 10,
      trainingGoal: "general_fitness",
      strengthTraining: "none",
      preferredRunTime: "morning",
      restDays: ["sunday"],
    },
  });

  const trainingGoal = form.watch("trainingGoal");

  // Update race type visibility when training goal changes
  if (trainingGoal === "race" && !showRaceType) {
    setShowRaceType(true);
  } else if (trainingGoal !== "race" && showRaceType) {
    setShowRaceType(false);
  }

  const handleSubmit = (values: AssessmentFormValues) => {
    // If not training for a race, remove raceType
    if (values.trainingGoal !== "race") {
      delete values.raceType;
    }
    onSubmit(values);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-12 md:px-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading text-neutral-900">Tell Us About Your Running</h1>
          <p className="text-neutral-600 text-sm">This helps us customize your coaching experience</p>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                          defaultValue={field.value}
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
                          defaultValue={field.value}
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
                        defaultValue={field.value}
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
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Start My Coaching"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
