
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isAdmin, isSupabaseReady } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
