import { useCallback, useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

type Phase = "idle" | "loading" | "sent" | "error";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

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

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "igloo://dashboard",
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, session, loading, signIn, signOut };
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name: string; dob: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, dob")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        setProfile(data ?? null);
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

  return { profile, loading: loading || !user, upsert, user };
}

export { type Phase };
