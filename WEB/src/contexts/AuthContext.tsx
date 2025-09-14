import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useAdminStore } from "../store/adminStore";
import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkIsAdminStatus: (currentUser: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  logout: async () => {},
  checkIsAdminStatus: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { session, user, isAuthenticated } = useAdminStore();

  const checkIsAdminStatus = async (currentUser: User | null) => {
    setIsLoading(true);
    if (currentUser) {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("super_role")
          .eq("id", currentUser.id)
          .single();

        setIsAdmin(!error && profile?.super_role === "admin");
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      useAdminStore.setState({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
      });
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Reset the admin store state
      useAdminStore.setState({
        session: null,
        user: null,
        isAuthenticated: false,
      });
      setIsAdmin(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const value = {
    session,
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    logout,
    checkIsAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
