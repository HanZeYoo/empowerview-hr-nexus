
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

type AdminRouteProps = {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      // Provide a clear message when a user is logged in but not an admin
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have administrator privileges. Please contact an admin if you need access."
      });
      console.log("Admin access denied for user:", user.email);
    }
  }, [isLoading, user, isAdmin]);

  // If still loading auth state, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="ml-2">Checking admin privileges...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If not admin, redirect to dashboard
  if (!isAdmin) {
    console.log("User authenticated but not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and admin, show the protected content
  console.log("Admin access granted for user:", user.email);
  return <>{children}</>;
};

export default AdminRoute;
