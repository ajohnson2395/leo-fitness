import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface WelcomeScreenProps {
  onShowSignUp: () => void;
  onShowLogin: () => void;
}

export default function WelcomeScreen({ onShowSignUp, onShowLogin }: WelcomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-12 md:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <Zap className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-neutral-900 mb-2">RunCoach AI</h1>
          <p className="text-neutral-600">Your AI-powered personal running coach</p>
        </div>
        
        <Card>
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-bold font-heading text-center text-neutral-800">Welcome!</h2>
            <p className="text-center text-neutral-600">Join thousands of runners improving their performance with personalized AI coaching.</p>
            
            <div className="space-y-3 pt-2">
              <Button 
                className="w-full py-6" 
                onClick={onShowSignUp}
              >
                Create an Account
              </Button>
              <Button 
                className="w-full py-6" 
                variant="outline" 
                onClick={onShowLogin}
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-neutral-500 text-sm mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
