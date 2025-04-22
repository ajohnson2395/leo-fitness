import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Message, Workout, TrainingPlan } from "@shared/schema";

interface SendMessageResponse {
  userMessage: Message;
  aiMessage: Message;
  workouts?: Workout[];
  trainingPlan?: TrainingPlan;
}

interface MessagesResponse {
  messages: Message[];
  shouldAutoGreet?: boolean;
}

export function useChat(userId: number | null) {
  const [messageInput, setMessageInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Initialize ref to track if we've fetched greeting
  const greetingFetchedRef = useRef(false);

  // Fetch chat messages
  const { 
    data: messagesData, 
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
    refetch: refetchMessages
  } = useQuery<MessagesResponse>({
    queryKey: ["/api/chat/messages"],
    enabled: !!userId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true // Refetch when reconnecting
  });
  
  // Fetch greeting if needed (only if no messages exist)
  const { 
    data: greetingData,
    isLoading: isGreetingLoading,
    refetch: refetchGreeting
  } = useQuery({
    queryKey: ["/api/chat/greeting"],
    queryFn: async () => {
      // Don't fetch if already fetched
      if (greetingFetchedRef.current) {
        return { needsGreeting: false };
      }
      
      const res = await apiRequest("GET", "/api/chat/greeting");
      greetingFetchedRef.current = true;
      return res.json();
    },
    enabled: !!userId && !isMessagesLoading,
    staleTime: Infinity, // Only fetch once per session
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
  
  // Send message mutation
  const { 
    mutate: sendMessage, 
    isPending: isSendingMessage
  } = useMutation({
    mutationFn: async (message: string): Promise<SendMessageResponse> => {
      const res = await apiRequest("POST", "/api/chat/messages", { message });
      return res.json();
    },
    onSuccess: (data) => {
      console.log("Message sent successfully, response:", data);
      console.log("User message received:", data.userMessage);
      console.log("AI message received:", data.aiMessage);
      
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      
      // If workouts were created/updated, invalidate workouts query
      if (data.workouts && data.workouts.length > 0) {
        console.log("Workouts created/updated:", data.workouts.length);
        console.log("Workout IDs:", data.workouts.map(w => w.id).join(', '));
        console.log("Workout days:", data.workouts.map(w => w.dayOfWeek).join(', '));
        // Force invalidate with a delay to ensure server has time to process
        setTimeout(() => {
          console.log("Invalidating workouts query after delay");
          queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
        }, 500);
      }
      
      // If training plan was created, invalidate training plan query
      if (data.trainingPlan) {
        console.log("Training plan created/updated:", data.trainingPlan.title);
        queryClient.invalidateQueries({ queryKey: ["/api/training-plan"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Message failed to send",
        description: error.message || "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Function to send an initial greeting to start the conversation
  const sendInitialGreeting = () => {
    if (!isSendingMessage && userId) {
      // This is an automatic message that will show up as if the user sent it
      // We send it to trigger the AI coach to provide a personalized greeting
      // The greeting message should be warm and welcoming without asking too many questions
      sendMessage("Hi, I'd like to start improving my running. Can you help me?");
    }
  };
  
  // Log message details after message fetch
  useEffect(() => {
    if (messagesData && !isSendingMessage) {
      console.log("Messages fetch success:", messagesData);
      if (messagesData.messages) {
        console.log("Message count:", messagesData.messages.length);
        console.log("Messages with isUserMessage=true:", 
          messagesData.messages.filter((m: Message) => m.isUserMessage).length);
        console.log("Messages with isUserMessage=false:", 
          messagesData.messages.filter((m: Message) => !m.isUserMessage).length);
      }
    }
  }, [messagesData, isSendingMessage]);
  
  // Check for empty messages and trigger greeting if needed
  const emptyMessageRef = useRef(false);
  
  useEffect(() => {
    // Only trigger once when messages become empty
    if (!isMessagesLoading && messagesData?.messages?.length === 0 && !emptyMessageRef.current) {
      console.log("Messages are empty, checking for greeting...");
      emptyMessageRef.current = true;
      
      // Reset the greeting fetch flag to force a new greeting check
      greetingFetchedRef.current = false;
      refetchGreeting();
    } else if (messagesData?.messages && messagesData.messages.length > 0) {
      // Reset when messages are present
      emptyMessageRef.current = false;
    }
  }, [isMessagesLoading, messagesData, refetchGreeting]);
  
  // Process greeting data when it's received
  useEffect(() => {
    if (greetingData && !isMessagesLoading) {
      console.log("Greeting data received:", greetingData);
      
      // If we have a greeting, process it
      if (greetingData.needsGreeting && greetingData.greeting) {
        console.log("Server provided greeting:", greetingData.greeting);
        
        // If workouts were created from the greeting, invalidate workouts query
        if (greetingData.workouts && greetingData.workouts.length > 0) {
          console.log("Workouts created from greeting:", greetingData.workouts.length);
          // Immediately invalidate cache
          console.log("Invalidating workouts query cache (from greeting)...");
          queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
          
          // Force a second invalidation with delay as a safety measure
          setTimeout(() => {
            console.log("Re-invalidating workouts query after delay (from greeting)");
            queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
            
            // Also perform a direct fetch to ensure data is updated
            fetch('/api/workouts', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              }
            })
            .then(res => res.json())
            .then(data => {
              console.log("Refetched workouts after greeting, count:", data.workouts.length);
              // Force another cache invalidation after we get data
              queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
            })
            .catch(err => {
              console.error("Error refetching workouts after greeting:", err);
            });
          }, 500);
        }
        
        // If training plan was created from the greeting, invalidate training plan query
        if (greetingData.trainingPlan) {
          console.log("Training plan created from greeting:", greetingData.trainingPlan.title);
          queryClient.invalidateQueries({ queryKey: ["/api/training-plan"] });
        }
      }
    }
  }, [greetingData, isMessagesLoading, queryClient]);

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    sendMessage(messageInput.trim());
  };

  return {
    messages: messagesData?.messages || [],
    messageInput,
    setMessageInput,
    handleSendMessage,
    isMessagesLoading: isMessagesLoading || isGreetingLoading,
    isMessagesError,
    messagesError,
    isSendingMessage,
    refetchMessages, // Expose refetch function
    isGreetingLoading,
    hasGreeting: !!greetingData?.needsGreeting,
    greeting: greetingData?.greeting
  };
}
