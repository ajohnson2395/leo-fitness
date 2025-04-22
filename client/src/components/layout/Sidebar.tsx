import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Calendar, User, Shield } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const userInitials = user ? getInitials(user.name) : "RU";
  
  // Base navigation items for all users
  const baseNavItems = [
    {
      name: "Chat",
      path: "/chat",
      icon: <MessageSquare className="mr-3 h-5 w-5" />,
    },
    {
      name: "Workouts",
      path: "/workouts",
      icon: <Calendar className="mr-3 h-5 w-5" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="mr-3 h-5 w-5" />,
    },
  ];
  
  // Admin-only item
  const adminNavItem = {
    name: "Admin",
    path: "/admin",
    icon: <Shield className="mr-3 h-5 w-5" />,
  };
  
  // Combine items based on user role
  const navItems = isAdmin 
    ? [...baseNavItems, adminNavItem] 
    : baseNavItems;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold font-heading text-neutral-900 dark:text-white">RunCoach AI</h1>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  location === item.path
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white",
                  "group flex items-center px-3 py-3 text-sm font-medium rounded-md"
                )}
                aria-current={location === item.path ? "page" : undefined}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center">
            <Avatar>
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                {user?.name || "Runner"}
              </p>
              <Button
                variant="link"
                className="text-xs font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 p-0"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
