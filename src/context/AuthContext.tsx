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
import { getConnection } from '../lib/db';
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
  const checkAdminStatus = async (userId: string) => {
    try {
      const connection = await getConnection();
      const [rows] = await connection.execute(
        'SELECT is_admin FROM admin_users WHERE id = ?',
        [userId]
      );
      console.log("checkAdminStatus - SQL Result:", rows);
      connection.release();

      if (!Array.isArray(rows) || rows.length === 0) {
        console.log("User not found or admin status not set");
        return false;
      }

      const user = rows[0] as any;
      const isUserAdmin = !!user?.is_admin;
      console.log("Admin status check:", { userId, isAdmin: isUserAdmin });
      return isUserAdmin;
    } catch (error) {
      console.error("Exception checking admin status:", error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const connection = await getConnection();
      const [rows] = await connection.execute(
        'SELECT id, email, password, is_admin FROM admin_users WHERE email = ?',
        [email]
      );
      console.log("signIn - SQL Result:", rows);
      connection.release();

      if (!Array.isArray(rows) || rows.length === 0) {
        console.error("Invalid credentials");
        return { error: 'Invalid credentials' };
      }

      const user = rows[0] as any;

      if (!user || user.password !== password) {
        console.error("Invalid credentials");
        return { error: 'Invalid credentials' };
      }

      setUser({
        id: user.id,
        email: user.email,
        app_metadata: {
          provider: 'local',
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      });
      setIsAdmin(user.is_admin);
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected error during sign in:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const connection = await getConnection();
      await connection.execute(
        'INSERT INTO admin_users (email, password, id) VALUES (?, ?, UUID())',
        [email, password]
      );
      console.log("signUp - User created with email:", email);
      connection.release();

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
      
      // First update our local state
      // This ensures UI reflects logout immediately
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
