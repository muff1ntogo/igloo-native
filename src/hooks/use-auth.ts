import { useCallback, useEffect, useRef, useState } from "react";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { parse } from "expo-linking";
import { supabase, SUPABASE_URL, setupAppStateListener } from "@lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

const REDIRECT_URI = makeRedirectUri({ scheme: "igloo" });

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Start auto-refresh on app active, stop when backgrounded
    const cleanupAppState = setupAppStateListener();

    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      cleanupAppState();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // NOTE: For OTP codes to be sent instead of a confirmation magic link,
    // the Supabase dashboard must have "Confirm email" disabled and OTP enabled
    // under Authentication → Providers → Email. The API call itself cannot
    // override the project-level email confirmation setting.
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "igloo://auth",
    });
    if (error) throw error;
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string, type: "signup" | "recovery") => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: REDIRECT_URI,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("Google sign-in: no auth URL returned");

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);

    if (result.type === "success") {
      const parsed = parse(result.url);
      const code = parsed.queryParams?.code as string | undefined;
      if (code) {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) throw sessionError;
      } else {
        throw new Error("Google sign-in: no authorization code received");
      }
    } else {
      throw new Error("Google sign-in was cancelled");
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: REDIRECT_URI,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("Apple sign-in: no auth URL returned");

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);

    if (result.type === "success") {
      const parsed = parse(result.url);
      const code = parsed.queryParams?.code as string | undefined;
      if (code) {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) throw sessionError;
      } else {
        throw new Error("Apple sign-in: no authorization code received");
      }
    } else {
      throw new Error("Apple sign-in was cancelled");
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    session,
    loading,
    signUp,
    signInWithPassword,
    resetPassword,
    verifyOtp,
    updatePassword,
    signInWithGoogle,
    signInWithApple,
    signOut,
  };
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name: string; dob: string } | null>(null);
  const [wantsHealthSync, setWantsHealthSync] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setWantsHealthSync(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, dob, wants_health_sync")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        setProfile(data?.name ? data : null);
        setWantsHealthSync(data?.wants_health_sync ?? false);
      } catch (e) {
        console.warn("[Igloo] Load profile error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const upsert = useCallback(
    async (patch: { name?: string; dob?: string }) => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...patch }, { onConflict: "id" })
        .single();
      if (error) throw error;
      setProfile((prev) => ({
        name: patch.name ?? prev?.name ?? "",
        dob: patch.dob ?? prev?.dob ?? "",
      }));
    },
    [user?.id],
  );

  const setHealthSync = useCallback(
    async (value: boolean) => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, wants_health_sync: value }, { onConflict: "id" });
      if (error) throw error;
      setWantsHealthSync(value);
    },
    [user?.id],
  );

  return { profile, loading: loading || !user, upsert, setHealthSync, wantsHealthSync, user };
}
