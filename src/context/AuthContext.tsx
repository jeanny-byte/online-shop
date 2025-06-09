import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// API endpoints
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
}

interface Session {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAdminStatus = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/status/${userId}`, {
        headers: {
          Authorization: `Bearer ${session?.token}`
        }
      });
      const isUserAdmin = response.data.isAdmin;
      console.log("Admin status check:", { userId, isAdmin: isUserAdmin });
      return isUserAdmin;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Not in admin_users table = not admin
        return false;
      }
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Verify token
        try {
          const response = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const userData = response.data;
          setUser(userData.user);
          setSession({ user: userData.user, token });
          setIsAdmin(await checkAdminStatus(userData.user.id));
        } catch (error) {
          console.error('Invalid session:', error);
          // Clear invalid token
          localStorage.removeItem('authToken');
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Update state
      setUser(user);
      setSession({ user, token });
      setIsAdmin(await checkAdminStatus(user.id));
      
      // Navigate to home
      navigate('/');
      
      return { error: null };
    } catch (error: any) {
      console.error("SignIn error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to sign in",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Update state
      setUser(user);
      setSession({ user, token });
      setIsAdmin(await checkAdminStatus(user.id));
      
      // Navigate to home
      navigate('/');
      
      return { error: null };
    } catch (error: any) {
      console.error("SignUp error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create account",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      setIsLoading(true);
      
      // First update our local state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      localStorage.removeItem('authToken');
      
      // Navigate to home
      navigate('/');
      
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
