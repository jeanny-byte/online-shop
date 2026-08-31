import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface DriverRouteProps {
  children: React.ReactNode;
}

const DriverRoute: React.FC<DriverRouteProps> = ({ children }) => {
  const { user, isLoading, isDriver } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("DriverRoute state:", { 
      user: user?.email, 
      isLoading, 
      isDriver, 
      path: location.pathname 
    });
  }, [user, isLoading, isDriver, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    console.log("DriverRoute: No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isDriver) {
    console.log("DriverRoute: Not a driver, access denied");
    return (
      <div className="min-h-screen flex items-center justify-center flex-col max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Access Denied</h2>
        <p className="text-center mb-4">
          Your account does not have driver privileges. Please contact the site administrator if you believe this is an error.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return <>{children}</>;
};

export default DriverRoute;
