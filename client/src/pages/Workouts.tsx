import { useAuth } from "@/hooks/useAuth";
import WorkoutsScreen from "@/components/workout/WorkoutsScreen";
import Sidebar from "@/components/layout/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation";

export default function Workouts() {
  const { runningProfile } = useAuth();
  
  if (!runningProfile) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar (visible on desktop) */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto md:ml-64 pb-16 md:pb-0">
        <WorkoutsScreen />
      </main>
      
      {/* Mobile navigation */}
      <MobileNavigation />
    </div>
  );
}
