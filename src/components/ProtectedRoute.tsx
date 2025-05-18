
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isAdmin, isSupabaseReady } = useAuth();

  // Add console logs to debug authentication flow
  console.log("ProtectedRoute state:", { user, isLoading, isAdmin, isSupabaseReady });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading authentication...</p>
      </div>
    );
  }

  // If Supabase is not configured correctly, show a helpful message
  if (!isSupabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Supabase Configuration Required</h2>
        <p className="text-center mb-4">
          This feature requires Supabase to be properly configured. Please make sure you've connected 
          your application to Supabase and set the required environment variables.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Restore the admin check
  if (!isAdmin) {
    console.log("Not an admin user, access denied");
    return (
      <div className="min-h-screen flex items-center justify-center flex-col max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Access Denied</h2>
        <p className="text-center mb-4">
          Your account does not have admin privileges. Please contact the site administrator if you believe this is an error.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
