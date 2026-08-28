import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@lib/supabase";

export default function NotFoundScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"handling" | "error" | "success">("handling");
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    async function handle() {
      const url = await Linking.getInitialURL();
      if (!url) {
        // No deep link — navigate to splash
        router.replace("/splash");
        return;
      }

      const parsed = Linking.parse(url);
      const path = parsed?.path;

      // Intercept igloo://auth deep links from Supabase magic link / OAuth
      if (path === "/auth") {
        const code = parsed.queryParams?.code as string | undefined;
        const token = parsed.queryParams?.token as string | undefined;
        const tokenHash = parsed.queryParams?.token_hash as string | undefined;
        const type = parsed.queryParams?.type as string | undefined;
        const next = parsed.queryParams?.next as string | undefined;

        try {
          if (code) {
            // OAuth-style code exchange (Google / Apple)
            const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
            if (sessionError) throw sessionError;
          } else if (token || tokenHash || type) {
            // OTP magic link: Supabase sets the session server-side on redirect.
            // We just need to fetch the current session from Supabase.
            const { data, error: getError } = await supabase.auth.getSession();
            if (getError) throw getError;
            if (!data.session) throw new Error("No session found after magic link");
          } else {
            // Fallback: just try to get the session
            const { data } = await supabase.auth.getSession();
            if (!data.session) throw new Error("No session found");
          }

          // Session is established — navigate to target
          const targetPath = next
            ? next.replace("igloo://", "")
            : "/(tabs)";
          setPhase("success");
          router.replace(targetPath as any);
        } catch (e: unknown) {
          console.warn("[Igloo] Deep link auth error:", e);
          setError(e instanceof Error ? e.message : "Sign-in failed");
          setPhase("error");
        }
      } else {
        // Unknown path — go to splash
        router.replace("/splash");
      }
    }

    handle();
  }, [router]);

  return (
    <View className="flex-1 bg-background items-center justify-center p-8">
      {phase === "success" ? (
        <View className="items-center space-y-4">
          <Text className="font-sans text-base text-muted-foreground text-center">
            Signing you in…
          </Text>
          <ActivityIndicator size="large" color="#186787" />
        </View>
      ) : phase === "error" ? (
        <View className="items-center space-y-4">
          <Text className="font-sans text-base text-urgent text-center">{error}</Text>
          <Text className="font-sans text-sm text-muted-foreground text-center">
            You will be redirected to sign in.
          </Text>
          <ActivityIndicator size="large" color="#186787" className="mt-4" />
        </View>
      ) : (
        <View className="items-center space-y-4">
          <Text className="font-sans text-base text-muted-foreground text-center">
            Signing you in…
          </Text>
          <ActivityIndicator size="large" color="#186787" />
        </View>
      )}
    </View>
  );
}
