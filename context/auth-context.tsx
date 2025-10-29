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
    let mounted = true;

    const initAuth = async () => {
      // 1️⃣ Tunggu Supabase siap membaca localStorage
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const username = await getUserProfile(session.user.id);
        if (mounted) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            username,
          });
        }
      }

      // 2️⃣ Jangan matikan loading sampai 1 tick berikutnya
      // supaya Supabase sempat trigger onAuthStateChange jika perlu
      setTimeout(() => {
        if (mounted) setIsLoading(false);
      }, 300);
    };

    initAuth();

    // 3️⃣ Listener untuk perubahan session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUserProfile(session.user.id).then((username) => {
          if (mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email ?? "",
              username,
            });
          }
        });
      } else {
        if (mounted) setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("🔄 Checking session...");
    supabase.auth.getSession().then(({ data }) => {
      console.log("Session fetched:", data.session);
    });
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
