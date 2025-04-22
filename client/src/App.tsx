import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Workouts from "@/pages/Workouts";
import AdminPage from "@/pages/Admin";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ProtectedRoute } from "./lib/protected-route";

// Wrapper functions to fix TypeScript errors with null returns
const HomeWrapper = () => <Home />;
const ChatWrapper = () => <Chat />;
const ProfileWrapper = () => <Profile />;
const WorkoutsWrapper = () => <Workouts />;
const AdminWrapper = () => <AdminPage />;

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomeWrapper} requireRunningProfile={false} />
      <ProtectedRoute path="/chat" component={ChatWrapper} />
      <ProtectedRoute path="/profile" component={ProfileWrapper} />
      <ProtectedRoute path="/workouts" component={WorkoutsWrapper} />
      <ProtectedRoute path="/admin" component={AdminWrapper} requireRunningProfile={false} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light">
        <Router />
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
