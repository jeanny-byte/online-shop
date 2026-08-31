import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface User {
  id: string | number;
  email: string;
  name: string;
  display_name?: string;
  phone?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  avatar_url?: string;
  is_driver?: boolean;
  is_admin?: boolean;
  role?: string;
  app_metadata?: {
    provider: string;
  };
  aud?: string;
  created_at?: string;
}

interface Session {
  user: User | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkDriverStatus: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  /**
   * Fetches current authenticated user data from backend via /api/auth/me
   */
  const refreshUser = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsDriver(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        // Token invalid or expired
        localStorage.removeItem('jwt_token');
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setIsDriver(false);
        return;
      }

      const userData: User = await response.json();
      const admin = !!(userData.is_admin || userData.role === 'admin');
      const driver = !!(userData.is_driver || userData.role === 'driver');

      setUser(userData);
      setSession({ user: userData });
      setIsAdmin(admin);
      setIsDriver(driver);
    } catch (error) {
      console.error('Error hydrating user session:', error);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsDriver(false);
    }
  };

  const checkDriverStatus = async (): Promise<boolean> => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setIsDriver(false);
      return false;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/is-driver`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        setIsDriver(false);
        return false;
      }
      const data = await response.json();
      const driverStatus = !!data.isDriver;
      setIsDriver(driverStatus);
      setUser(prev => (prev ? { ...prev, is_driver: driverStatus } : null));
      return driverStatus;
    } catch {
      setIsDriver(false);
      return false;
    }
  };

  // On mount, hydrate user session from token
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setUser(null);
        setIsAdmin(false);
        setIsDriver(false);
        localStorage.removeItem('jwt_token');
        return { error: result.message || result.error || 'Invalid credentials' };
      }

      const token = result.access_token || result.token;
      if (token) {
        localStorage.setItem('jwt_token', token);
      }

      const userData: User = result.user;
      const admin = !!(userData.is_admin || userData.role === 'admin');
      const driver = !!(userData.is_driver || userData.role === 'driver');

      setUser(userData);
      setSession({ user: userData });
      setIsAdmin(admin);
      setIsDriver(driver);

      return { error: null };
    } catch (error: any) {
      setUser(null);
      setIsAdmin(false);
      setIsDriver(false);
      localStorage.removeItem('jwt_token');
      return { error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { error: result.message || result.error || 'Failed to create account' };
      }

      const token = result.access_token || result.token;
      if (token) {
        localStorage.setItem('jwt_token', token);
        const userData: User = result.user;
        setUser(userData);
        setSession({ user: userData });
        setIsAdmin(!!(userData.is_admin || userData.role === 'admin'));
        setIsDriver(!!(userData.is_driver || userData.role === 'driver'));
      }

      toast({
        title: 'Account created',
        description: 'Your account has been created successfully.',
      });

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during sign up:', error);
      return { error: error.message || 'Sign up failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('jwt_token');
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }).catch(() => {});
      }
      localStorage.removeItem('jwt_token');
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsDriver(false);
      toast({
        title: 'Signed out',
        description: 'You have been logged out successfully',
      });
    } catch (error) {
      console.error('Unexpected error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        isDriver,
        signIn,
        signUp,
        signOut,
        checkDriverStatus,
        refreshUser,
      }}
    >
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
