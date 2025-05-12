
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

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
    // Only attempt to fetch session if Supabase is properly configured
    if (!isSupabaseReady) {
      setIsLoading(false);
      return;
    }

    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error(error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin
          const { data } = await supabase
            .from('admin_users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
          
          setIsAdmin(!!data?.is_admin);
        }
      } catch (error) {
        console.error("Error setting up auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setData();

    // Only set up auth state change listener if Supabase is configured
    if (isSupabaseReady) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Check admin status
        if (session?.user) {
          supabase
            .from('admin_users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              setIsAdmin(!!data?.is_admin);
            });
        } else {
          setIsAdmin(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isSupabaseReady]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseReady) {
      return { error: new Error('Supabase is not configured') };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseReady) {
      return { error: new Error('Supabase is not configured') };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (isSupabaseReady) {
      await supabase.auth.signOut();
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
