"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../../lib/supabase/client";
import { getSupabaseEnvStatus } from "../../lib/supabase/env";

type AuthContextValue = {
  user: User | null;
  displayName: string | null;
  loading: boolean;
  configured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signInWithMagicLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = getSupabaseEnvStatus().configured;
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(configured);

  const refreshProfile = useCallback(async () => {
    // Sprint 2: Auth / bi_members ยังไม่ทำ — ใช้ชื่อจากอีเมล
    if (!user) {
      setDisplayName(null);
      return;
    }
    setDisplayName(user.email?.split("@")[0] ?? "สมาชิก");
  }, [user]);

  /* eslint-disable react-hooks/set-state-in-effect -- auth session hydrate */
  useEffect(() => {
    if (!configured) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    const client = createClient();
    if (!client) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const client = createClient();
      if (!client) return "ยังไม่ได้ตั้งค่า Supabase";
      const { error } = await client.auth.signInWithPassword({ email, password });
      return error?.message ?? null;
    },
    []
  );

  const signInWithMagicLink = useCallback(async (email: string) => {
    const client = createClient();
    if (!client) return "ยังไม่ได้ตั้งค่า Supabase";
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    const client = createClient();
    await client?.auth.signOut();
    setDisplayName(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      displayName,
      loading,
      configured,
      signInWithPassword,
      signInWithMagicLink,
      signOut,
      refreshProfile,
    }),
    [
      user,
      displayName,
      loading,
      configured,
      signInWithPassword,
      signInWithMagicLink,
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
