
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // Add console logs to debug authentication flow
  useEffect(() => {
    console.log("ProtectedRoute state:", { 
      user: user?.email, 
      isLoading, 
      isAdmin, 
      path: location.pathname 
    });
  }, [user, isLoading, isAdmin, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin privileges
  if (!isAdmin) {
    console.log("ProtectedRoute: Not an admin user, access denied");
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
