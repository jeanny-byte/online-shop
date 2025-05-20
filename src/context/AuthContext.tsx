import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
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
  isSupabaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupabaseReady] = useState(isSupabaseConfigured());
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to check admin status safely
  const checkAdminStatus = async (userId: string) => {
    try {
      // Check if user is admin from admin_users table with error handling
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      const isUserAdmin = !!data?.is_admin;
      console.log("Admin status check:", { userId, isAdmin: isUserAdmin });
      return isUserAdmin;
    } catch (error) {
      console.error("Exception checking admin status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Setup auth state change listener
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          toast({
            title: "Authentication Error",
            description: "Failed to initialize authentication session",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const isUserAdmin = await checkAdminStatus(session.user.id);
            setIsAdmin(isUserAdmin);
          } catch (error) {
            console.error("Error setting admin status:", error);
            setIsAdmin(false);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error in auth setup:", error);
        setIsLoading(false);
      }
    };

    // Get initial session
    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      // Important: Update state before any navigation
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check admin status when auth state changes
        try {
          const isUserAdmin = await checkAdminStatus(session.user.id);
          setIsAdmin(isUserAdmin);
          console.log("Auth state changed: Admin status:", { userId: session.user.id, isAdmin: isUserAdmin });
          
          // Navigate based on admin status and current event
          if (event === 'SIGNED_IN') {
            // Always navigate to homepage first after successful sign in
            navigate('/');
          }
        } catch (error) {
          console.error("Failed to check admin status:", error);
          setIsAdmin(false);
        }
      } else {
        // Important: Set isAdmin to false when user is not logged in
        setIsAdmin(false);
        
        // Only navigate on explicit SIGNED_OUT events from Supabase
        // This prevents unwanted navigation on initial page load
        if (event === 'SIGNED_OUT') {
          console.log("Auth state changed: User signed out, navigating to homepage");
          navigate('/');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("SignIn error:", error.message);
        return { error };
      }
      
      // We'll navigate in the auth state change event
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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error("SignUp error:", error.message);
        return { error };
      }
      
      toast({
        title: "Account created",
        description: "Please check your email for verification instructions",
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
      // This ensures UI reflects logout immediately even if Supabase is slow
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Then perform the actual signout on Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        // Restore previous state if signout failed
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        toast({
          title: "Error",
          description: "Failed to sign out: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log("Signed out successfully");
        
        toast({
          title: "Signed out",
          description: "You have been logged out successfully",
        });
        
        // Navigation to home page is handled in the auth state change event
      }
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
      isSupabaseReady,
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
