interface User {
  id: string;
  email: string;
  name: string;
  is_driver?: boolean;
  app_metadata: {
    provider: string;
  };
  aud: string;
  created_at: string;
}

interface Session {
  user: User | null;
}

import React, { createContext, useContext, useEffect, useState } from 'react';

// Use API URL from .env
const API_URL = import.meta.env.VITE_API_URL;
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkDriverStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Checks JWT token in localStorage and validates admin status with backend.
   * Updates user and isAdmin state accordingly.
   */
  const checkAdminStatus = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setIsAdmin(false);
      setUser(null);
      return false;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/check-admin`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        setIsAdmin(false);
        setUser(null);
        return false;
      }
      const data = await response.json();
      setIsAdmin(!!data.is_admin);
      return !!data.is_admin;
    } catch {
      setIsAdmin(false);
      setUser(null);
      return false;
    }
  };

  const checkDriverStatus = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setIsDriver(false);
      return false;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/is-driver`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        setIsDriver(false);
        return false;
      }
      const data = await response.json();
      const driverStatus = !!data.is_driver;
      setIsDriver(driverStatus);
      
      // Update user object with driver status
      setUser(prev => prev ? { ...prev, is_driver: driverStatus } : null);
      
      return driverStatus;
    } catch {
      setIsDriver(false);
      return false;
    }
  };

  // On mount, check for JWT and validate roles
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      await Promise.all([
        checkAdminStatus(),
        checkDriverStatus()
      ]);
      setIsLoading(false);
    })();
    // eslint-disable-next-line
  }, []);


  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setUser(null);
        setIsAdmin(false);
        setIsDriver(false);
        localStorage.removeItem('jwt_token');
        return { error: result.error || 'Invalid credentials' };
      }
      
      const userData = {
        id: result.user.id,
        name: result.user.name || result.user.email.split('@')[0], // Use name if available, otherwise use first part of email
        email: result.user.email,
        is_driver: result.user.is_driver || false,
        app_metadata: { provider: 'local' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      
      setUser(userData);
      setIsAdmin(!!result.user.is_admin);
      setIsDriver(!!result.user.is_driver);
      
      if (result.token) {
        localStorage.setItem('jwt_token', result.token);
      }
      
      // Refresh roles after login
      await Promise.all([
        checkAdminStatus(),
        checkDriverStatus()
      ]);
      
      return { error: null };
    } catch (error: any) {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('jwt_token');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { error: result.error || 'Failed to create account' };
      }
      toast({
        title: "Account created",
        description: "Account created successfully",
      });
      // Optionally, auto-login after signup by calling signIn
      // await signIn(email, password);
      // Or redirect user to login page
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected error during sign up:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };



  const signOut = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('jwt_token');
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsDriver(false);
      toast({
        title: "Signed out",
        description: "You have been logged out successfully",
      });
      // Optionally, redirect to login or home page
      // navigate('/login');
    } catch (error) {
      console.error("Unexpected error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAdmin,
      isDriver,
      signIn,
      signUp,
      signOut,
      checkDriverStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
