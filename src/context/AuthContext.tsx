interface User {
  id: string;
  email: string;
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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
      // Optionally, fetch user info from token or backend if needed
      return !!data.is_admin;
    } catch {
      setIsAdmin(false);
      setUser(null);
      return false;
    }
  };

  // On mount, check for JWT and validate admin status
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      await checkAdminStatus();
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
        localStorage.removeItem('jwt_token');
        return { error: result.error || 'Invalid credentials' };
      }
      setUser({
        id: result.user.id,
        email: result.user.email,
        app_metadata: { provider: 'local' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      });
      setIsAdmin(result.user.is_admin);
      if (result.token) {
        localStorage.setItem('jwt_token', result.token);
      }
      // Refresh admin status after login
      await checkAdminStatus();
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
      signIn,
      signUp,
      signOut,
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
