
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If true, only admin users can access this route
   * @default false
   */
  adminOnly?: boolean;
  /**
   * If true, only authenticated users can access this route
   * @default true
   */
  requireAuth?: boolean;
  /**
   * If provided, users will be redirected to this path if they don't have access
   * @default "/"
   */
  redirectTo?: string;
  /**
   * Custom message to show when access is denied
   */
  accessDeniedMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  requireAuth = true,
  redirectTo = "/",
  accessDeniedMessage = "You don't have permission to access this page."
}) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute state:", { 
      user: user?.email, 
      isLoading, 
      isAdmin,
      adminOnly,
      requireAuth,
      path: location.pathname 
    });
  }, [user, isLoading, isAdmin, adminOnly, requireAuth, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading authentication...</p>
      </div>
    );
  }

  // If authentication is required but no user is logged in
  if (requireAuth && !user) {
    console.log("ProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin access is required but user is not an admin
  if (adminOnly && !isAdmin) {
    console.log("ProtectedRoute: Admin access required");
    return (
      <div className="min-h-screen flex items-center justify-center flex-col max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Access Denied</h2>
        <p className="text-center mb-4">
          {accessDeniedMessage}
        </p>
        <Navigate to={redirectTo} replace />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
