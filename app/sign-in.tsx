import { useState, useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "@hooks/use-auth";
import { KeyboardDismissView } from "@components/igloo";

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    const e = email.trim();
    const p = password;
    if (!e || !p) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithPassword(e, p);
      // Do NOT redirect here — let app/_layout.tsx decide the destination
      // based on session + onboardingComplete (same as every other auth state change).
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }, [email, password, signInWithPassword, router]);

  return (
    <KeyboardDismissView style={{ flex: 1 }}>
    <SafeAreaView className="flex-1 bg-background px-8 justify-center">
      {/* Back arrow */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 size-10 rounded-full bg-card items-center justify-center border border-border"
      >
        <ArrowLeft size={20} color="#123247" />
      </TouchableOpacity>
      <View className="items-center mb-8 mt-8">
        <Text className="font-serif text-3xl font-bold text-foreground">Welcome back</Text>
        <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed">
          Log in to continue to Igloo
        </Text>
      </View>

      <View className="w-full space-y-4">
        <View>
          <Text className="font-sans text-sm font-semibold text-foreground mb-2">Email</Text>
          <TextInput
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderTextColor="#A3B8C2"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
            className="h-14 rounded-2xl border border-border bg-card px-4 font-sans text-base text-foreground"
          />
        </View>

        <View>
          <Text className="font-sans text-sm font-semibold text-foreground mb-2">Password</Text>
          <TextInput
            secureTextEntry
            textContentType="none"
            autoCapitalize="none"
            placeholder="Your password"
            placeholderTextColor="#A3B8C2"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(null); }}
            returnKeyType="done"
            className="h-14 rounded-2xl border border-border bg-card px-4 font-sans text-base text-foreground"
          />
        </View>

        {error ? (
          <Text className="font-sans text-sm text-urgent">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          className="h-14 rounded-2xl bg-primary items-center justify-center mt-2 shadow-md active:opacity-90"
        >
          <Text className="font-sans text-base font-bold text-primary-foreground">
            {loading ? "Logging in…" : "Log In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          className="mt-2 items-center"
        >
          <Text className="font-sans text-sm text-primary">Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </KeyboardDismissView>
  );
}
