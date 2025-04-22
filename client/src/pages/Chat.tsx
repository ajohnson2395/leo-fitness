import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import ChatInterface from "@/components/chat/ChatInterface";
import Sidebar from "@/components/layout/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const { user, runningProfile } = useAuth();
  const [, navigate] = useLocation();
  
  if (!user || !runningProfile) {
    return null;
  }
  
  const userInitials = getInitials(user.name);

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar (visible on desktop) */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none md:ml-64">
        {/* Chat header (mobile only) */}
        <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between md:hidden">
          <Button variant="ghost" size="icon" className="text-neutral-500" onClick={() => navigate("/profile")}>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
          
          <h1 className="text-lg font-bold font-heading text-neutral-900">RunCoach AI</h1>
          
          <Button variant="ghost" size="icon" className="text-neutral-500" onClick={() => navigate("/workouts")}>
            <FileClock className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Chat Interface */}
        <ChatInterface />
      </main>
      
      {/* Mobile navigation */}
      <MobileNavigation />
    </div>
  );
}
