"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single(); 
    if (error) return null;
    return data?.username ?? null;
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (sessionUser) {
        const username = await getUserProfile(sessionUser.id);
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? "",
          username,
        });
      }
      setIsLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const username = await getUserProfile(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          username,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true); 
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        const username = await getUserProfile(data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          username,
        });
      }
    } finally {
      setIsLoading(false); 
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      setIsLoading(true); 
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: data.user.id, username }]);
        if (profileError) throw profileError;

        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          username,
        });
      }
    } finally {
      setIsLoading(false); 
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
