import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { Message } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ChatMessageProps {
  message: Message;
}

const UserMessage = ({ message }: ChatMessageProps) => (
  <div className="message-bubble user-message" style={{ WebkitTapHighlightColor: 'transparent' }}>
    <p style={{ 
      wordWrap: 'break-word', 
      overflowWrap: 'break-word',
      WebkitUserSelect: 'text',
      userSelect: 'text',
      WebkitTouchCallout: 'default' // Allow text selection on long-press
    }}>{message.content || "..."}</p>
  </div>
);

const AIMessage = ({ message }: ChatMessageProps) => {
  const [displayedContent, setDisplayedContent] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Convert message content to HTML with proper formatting
  const formatMessage = (content: string | undefined) => {
    // If content is undefined or empty, return a friendly message
    if (!content) {
      return "Sorry, your previous message didn't come through. Would you mind resending?";
    }
    
    // Step 1: Format bold text with asterisks
    let formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Step 2: Format bold text with single asterisks
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // Step 3: Convert basic markdown-style lists to HTML
    formattedContent = formattedContent.replace(/^- (.*?)$/gm, '<li>$1</li>');
    formattedContent = formattedContent.replace(/^\* (.*?)$/gm, '<li>$1</li>');
    
    // Step 4: Add newlines for paragraphs
    formattedContent = formattedContent.replace(/\n{2,}/g, '</p><p>');
    
    // Step 5: Wrap lists in ul tags - process line by line to avoid /s flag issues
    let lines = formattedContent.split('\n');
    formattedContent = '';
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<li>')) {
        if (!inList) {
          formattedContent += '<ul>';
          inList = true;
        }
        formattedContent += lines[i];
      } else {
        if (inList) {
          formattedContent += '</ul>';
          inList = false;
        }
        formattedContent += lines[i];
      }
      
      if (i < lines.length - 1) {
        formattedContent += '\n';
      }
    }
    
    if (inList) {
      formattedContent += '</ul>';
    }
    
    // Step 6: Handle workout sections with colons
    lines = formattedContent.split('\n');
    formattedContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      // Check if the line ends with a colon (indicating a section header)
      if (lines[i].match(/^(.*?):\s*$/)) {
        const headerText = lines[i].replace(/:\s*$/, '');
        formattedContent += `<h4 class="font-semibold mt-2">${headerText}:</h4>`;
      } else {
        formattedContent += lines[i];
      }
      
      if (i < lines.length - 1) {
        formattedContent += '\n';
      }
    }
    
    return formattedContent;
  };
  
  // Track if this is a new message that just arrived
  const [isNewMessage, setIsNewMessage] = useState<boolean>(false);
  
  // Store current message ID to detect changes
  const messageIdRef = useRef<number | null>(null);
  
  // Keep track of initial render state for skipping animation on first load
  const initialRenderRef = useRef(true);
  
  useEffect(() => {
    const currentContent = message.content || "Sorry, your previous message didn't come through. Would you mind resending?";
    const formattedFullContent = formatMessage(message.content);
    
    // Check if this is a new message
    if (message.id !== messageIdRef.current) {
      // New message detected - this is either initial load or a new message
      messageIdRef.current = message.id;
      
      // For first render of existing messages, don't show animation
      if (initialRenderRef.current) {
        initialRenderRef.current = false;
        setIsNewMessage(false);
        setDisplayedContent(formattedFullContent);
        setIsTyping(false);
        return;
      }
      
      // For new messages that appear while user is on the screen, show animation
      if (document.hasFocus()) {
        setIsNewMessage(true);
      } else {
        // No animation when returning from another screen
        setIsNewMessage(false);
        setDisplayedContent(formattedFullContent);
        setIsTyping(false);
        return;
      }
    }
    
    // If content is same as current displayed content, no need to retype
    if (formattedFullContent === displayedContent) {
      return;
    }
    
    // Only show typing animation for new messages
    if (isNewMessage) {
      // Reset for new typing simulation - start with empty content and typing indicator
      setIsTyping(true);
      setDisplayedContent("");
      
      // Calculate a realistic typing delay based on message length
      // Typically users see typing indicators for 1-3 seconds
      const messageLength = currentContent.replace(/<[^>]*>/g, '').length;
      const typingDelay = Math.min(Math.max(messageLength * 15, 1000), 3000); // Between 1-3 seconds
      
      // Set a timeout to display the full message after the typing delay
      const typingTimeout = setTimeout(() => {
        setDisplayedContent(formattedFullContent);
        setIsTyping(false);
      }, typingDelay);
      
      // Clean up timeout on unmount or when message changes
      return () => clearTimeout(typingTimeout);
    } else {
      // For existing messages when returning to the chat, show immediately
      setDisplayedContent(formattedFullContent);
      setIsTyping(false);
    }
  }, [message.content, message.id]);
  
  return (
    <div 
      className="message-bubble ai-message"
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'default' // Allow text selection on long-press
      }}
    >
      {isTyping ? (
        // Show only the typing indicator dots while typing
        <div className="typing-indicator p-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
      ) : (
        // Show full content when typing is complete
        <div 
          className="workout-content"
          style={{
            WebkitUserSelect: 'text',
            userSelect: 'text'
          }}
          dangerouslySetInnerHTML={{ __html: `<p>${displayedContent || "..."}</p>` }} 
        />
      )}
    </div>
  );
};

export default function ChatInterface() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    messages, 
    messageInput, 
    setMessageInput, 
    handleSendMessage: handleSendMessageHook,
    isMessagesLoading,
    isSendingMessage,
    refetchMessages,
    isGreetingLoading,
    hasGreeting,
    greeting
  } = useChat(user?.id || null);
  
  // Add a local state to store messages including pending ones
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const initialLoadRef = useRef(true);

  // Refetch messages when component mounts
  useEffect(() => {
    console.log("Component mounted, refetching messages");
    refetchMessages();
  }, [refetchMessages]);

  // Initialize or update local messages whenever server messages change or greeting is received
  useEffect(() => {
    if (messages.length > 0) {
      console.log("Updating local messages from server, count:", messages.length);
      setLocalMessages(messages);
      // Don't set initialLoadRef to false here so we always sync with server data
    } else if (greeting && hasGreeting && messages.length === 0) {
      // If we have a greeting from the API but no messages yet, show the greeting
      console.log("Adding greeting to empty chat:", greeting);
      setLocalMessages([greeting]);
    }
  }, [messages, greeting, hasGreeting]);

  // Scroll to bottom when local messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: initialLoad ? 'auto' : 'smooth' });
      if (initialLoad && localMessages.length > 0) {
        setInitialLoad(false);
      }
    }
  }, [localMessages, initialLoad]);

  // Create a custom send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSendingMessage) return;
    
    // Create a temporary local message with a random id
    const userMessage = {
      id: Math.floor(Math.random() * -1000), // Using negative random ID to avoid conflicts
      userId: user?.id || 0,
      content: messageInput,
      isUserMessage: true,
      createdAt: new Date()
    } as Message;
    
    // Add to local messages immediately
    setLocalMessages(currentMessages => [...currentMessages, userMessage]);
    
    // Clear input
    setMessageInput('');
    
    // Send to server using the hook's handler
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ message: messageInput })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Message sent successfully, response:", data);
        
        // Add AI response to local messages
        if (data.aiMessage) {
          const aiMessage = data.aiMessage as Message;
          setLocalMessages(currentMessages => [...currentMessages.filter(m => m.id !== userMessage.id), 
                                              {
                                                id: data.userMessage.id,
                                                userId: data.userMessage.userId,
                                                content: data.userMessage.content,
                                                isUserMessage: true,
                                                createdAt: new Date(data.userMessage.createdAt)
                                              } as Message, 
                                              aiMessage]);
          
          // Log the received messages
          console.log("User message received:", data.userMessage);
          console.log("AI message received:", data.aiMessage);
          
          // Log workouts and training plan if received
          if (data.workouts && data.workouts.length) {
            console.log("Workouts created/updated:", data.workouts.length);
            console.log("Workout IDs:", data.workouts.map((w: any) => w.id).join(', '));
            console.log("Workout days:", data.workouts.map((w: any) => w.dayOfWeek).join(', '));
            
            // Force invalidate workouts query to update UI across the app
            console.log("Invalidating workouts query cache...");
            queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
            
            // Additional force refetch just to be extra sure - double safety mechanism
            setTimeout(() => {
              fetch('/api/workouts', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
              })
              .then(res => res.json())
              .then(data => {
                console.log("Refetched workouts after update, count:", data.workouts.length);
                // Force another cache invalidation after we get data
                queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
              })
              .catch(err => {
                console.error("Error refetching workouts:", err);
              });
            }, 500);
          }
          if (data.trainingPlan) {
            console.log("Training plan created/updated:", data.trainingPlan.title);
          }
        }
      } else {
        // Handle error response
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error("Error response:", response.status, errorData);
        
        if (response.status === 401 || response.status === 403) {
          // Token issue - attempt to redirect user to re-authenticate
          toast({
            title: "Session expired",
            description: "Please login again to continue chatting.",
            variant: "destructive"
          });
          
          // Wait a moment before redirecting
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
        } else {
          // For other errors, just show a toast
          toast({
            title: "Error sending message",
            description: errorData.message || "Please try again later",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Show a toast for network errors
      toast({
        title: "Network error",
        description: "Could not connect to the server. Please check your connection.",
        variant: "destructive"
      });
    }
  };
  
  // Debug messages with additional visibility on isUserMessage flag
  console.log("ChatInterface messages:", messages.map((msg: Message) => ({
    id: msg.id,
    content: msg.content ? (msg.content.substring(0, 30) + "...") : "No content",
    isUserMessage: msg.isUserMessage
  })));
  console.log("Local messages:", localMessages.map((msg: Message) => ({
    id: msg.id || 'temp',
    content: msg.content ? (msg.content.substring(0, 30) + "...") : "No content",
    isUserMessage: msg.isUserMessage
  })));

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages - add safe-area-top for iOS spacing and padding for mobile nav */}
      <div className="flex-1 overflow-y-auto p-4 pt-16 md:pt-4 bg-neutral-50 dark:bg-neutral-900 safe-area-top safe-area-left safe-area-right">
        <div className="flex flex-col space-y-4">
          {isMessagesLoading || isGreetingLoading ? (
            // Loading skeleton
            <>
              <Skeleton className="h-16 w-3/4 self-start rounded-lg" />
              <Skeleton className="h-10 w-1/2 self-end rounded-lg" />
              <Skeleton className="h-24 w-3/4 self-start rounded-lg" />
            </>
          ) : localMessages.length === 0 && !hasGreeting ? (
            // Default welcome message when no messages and no greeting available
            <div className="message-bubble ai-message">
              <p style={{ WebkitUserSelect: 'text', userSelect: 'text', WebkitTouchCallout: 'default' }}>
                Welcome to RunCoach AI! I'm your personal running coach. How can I help you today?
              </p>
            </div>
          ) : (
            // Actual messages - use localMessages instead of server messages
            localMessages.map((message: Message) => (
              message.isUserMessage ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AIMessage key={message.id} message={message} />
              )
            ))
          )}
          {/* Add loading indicator when sending a message */}
          {isSendingMessage && (
            <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 animate-pulse pl-2">
              <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>
      
      {/* Chat input - add safe-area-bottom for iOS spacing */}
      <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 safe-area-bottom safe-area-left safe-area-right">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <textarea 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 rounded-3xl px-4 py-2 resize-none h-[44px] max-h-[120px] overflow-auto border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Type a message..."
            disabled={isSendingMessage}
            rows={1}
            style={{ 
              minHeight: '44px', // iOS standard touch target
              WebkitTapHighlightColor: 'transparent',
              WebkitAppearance: 'none',
              borderRadius: '24px', // explicit rounded corners for iOS
              fontSize: '16px' // prevent iOS zoom on focus
            }}
            onInput={(e) => {
              // Auto-resize textarea based on content
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              const newHeight = Math.min(target.scrollHeight, 120); // Max height of 120px
              target.style.height = `${newHeight}px`;
            }}
            onKeyDown={(e) => {
              // Submit form on Enter, but allow Shift+Enter for new line
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (messageInput.trim()) {
                  handleSendMessage(e as unknown as React.FormEvent);
                }
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon"
            className="ml-2 rounded-full touch-manipulation active:scale-95 transition-all h-11 w-11" 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              minHeight: '44px', // iOS standard touch target
              minWidth: '44px'   // iOS standard touch target
            }}
            disabled={!messageInput.trim() || isSendingMessage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}