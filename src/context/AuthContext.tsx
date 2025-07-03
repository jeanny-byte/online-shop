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

  // Helper function to check admin status safely
  // Check admin status using JWT
  const checkAdminStatus = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    try {
      const response = await fetch('/api/auth/check-admin', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) return false;
      const data = await response.json();
      setIsAdmin(!!data.is_admin);
      return !!data.is_admin;
    } catch {
      return false;
    }
  };


  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
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
      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { error: result.error || 'Failed to create account' };
      }
      // Optionally, auto-login after signup by calling signIn
      // Or redirect user to login page
      toast({
        title: "Account created",
        description: "Account created successfully",
      });
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
      console.log("Signing out...");
      setIsLoading(true);
      localStorage.removeItem('jwt_token');
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      toast({
        title: "Signed out",
        description: "You have been logged out successfully",
      });
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
