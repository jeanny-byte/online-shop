
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

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
            // Check if user is admin from admin_users table
            const { data, error: adminError } = await supabase
              .from('admin_users')
              .select('is_admin')
              .eq('id', session.user.id)
              .single();
              
            if (adminError) {
              console.error("Error checking admin status:", adminError);
              setIsAdmin(false);
            } else {
              setIsAdmin(!!data?.is_admin);
              console.log("Admin status check:", { userId: session.user.id, isAdmin: !!data?.is_admin });
            }
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
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check admin status when auth state changes
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          } else {
            setIsAdmin(!!data?.is_admin);
            console.log("Auth state changed: Admin status:", { userId: session.user.id, isAdmin: !!data?.is_admin });
          }
        } catch (error) {
          console.error("Failed to check admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("SignIn error:", error.message);
        return { error };
      }
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected error during sign in:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
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
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Error",
          description: "Failed to sign out: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log("Signed out successfully");
        // Clear local state after signout
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        
        toast({
          title: "Signed out",
          description: "You have been logged out successfully",
        });
      }
    } catch (error) {
      console.error("Unexpected error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
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
