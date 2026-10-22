"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase/client";

export interface UserSession {
  id: string;
  email: string;
  display_name: string;
  role: "user" | "admin";
  token: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  loginDemo: (role?: "user" | "admin") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    const saved = localStorage.getItem("realestateiq_session");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("realestateiq_session");
      }
    }
    setLoading(false);
  }, []);

  const loginDemo = (role: "user" | "admin" = "user") => {
    const demoUser: UserSession = {
      id: role === "admin" ? "99999999-9999-9999-9999-999999999999" : "11111111-1111-1111-1111-111111111111",
      email: `${role}@realestateiq.dev`,
      display_name: role === "admin" ? "System Administrator" : "Demo Property Investor",
      role,
      token: `test-token-${role}:${role === "admin" ? "99999999-9999-9999-9999-999999999999" : "11111111-1111-1111-1111-111111111111"}:${role}`,
    };
    setUser(demoUser);
    localStorage.setItem("realestateiq_session", JSON.stringify(demoUser));
  };

  const login = async (email: string, password?: string) => {
    // If Supabase URL is configured, attempt Supabase Auth
    const isSupabaseConfigured =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("example-project");

    if (isSupabaseConfigured && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session && data.user) {
        const sessionUser: UserSession = {
          id: data.user.id,
          email: data.user.email || email,
          display_name: data.user.user_metadata?.full_name || email.split("@")[0],
          role: (data.user.app_metadata?.role as "user" | "admin") || "user",
          token: data.session.access_token,
        };
        setUser(sessionUser);
        localStorage.setItem("realestateiq_session", JSON.stringify(sessionUser));
        return;
      }
    }

    // Default development fallback
    const role: "user" | "admin" = email.includes("admin") ? "admin" : "user";
    loginDemo(role);
  };

  const register = async (name: string, email: string, password?: string) => {
    const isSupabaseConfigured =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("example-project");

    if (isSupabaseConfigured && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;
      if (data.session && data.user) {
        const sessionUser: UserSession = {
          id: data.user.id,
          email: data.user.email || email,
          display_name: name || data.user.user_metadata?.full_name || email.split("@")[0],
          role: "user",
          token: data.session.access_token,
        };
        setUser(sessionUser);
        localStorage.setItem("realestateiq_session", JSON.stringify(sessionUser));
        return;
      }
    }

    // Local / development session creation
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `usr-${Date.now()}`;
    const role: "user" | "admin" = email.includes("admin") ? "admin" : "user";
    const sessionUser: UserSession = {
      id: newId,
      email,
      display_name: name.trim() || email.split("@")[0],
      role,
      token: `token-${role}:${newId}:${role}`,
    };
    setUser(sessionUser);
    localStorage.setItem("realestateiq_session", JSON.stringify(sessionUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("realestateiq_session");
    supabase.auth.signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
