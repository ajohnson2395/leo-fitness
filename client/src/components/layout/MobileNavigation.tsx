import { Link, useLocation } from "wouter";
import { MessageSquare, Calendar, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { isAdmin } = useAuth();
  
  // Base navigation items for all users
  const baseNavItems = [
    {
      name: "Chat",
      path: "/chat",
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      name: "Workouts",
      path: "/workouts",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-6 w-6" />,
    },
  ];
  
  // Admin-only item
  const adminNavItem = {
    name: "Admin",
    path: "/admin",
    icon: <Shield className="h-6 w-6" />,
  };
  
  // Combine items based on user role
  const navItems = isAdmin 
    ? [...baseNavItems, adminNavItem] 
    : baseNavItems;

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 safe-area-top z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-5 w-full",
              "touch-manipulation active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors",
              location === item.path
                ? "text-primary-600 dark:text-primary-400"
                : "text-neutral-600 dark:text-neutral-400"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-current={location === item.path ? "page" : undefined}
          >
            <div className="h-7 w-7 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-xs font-medium mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
