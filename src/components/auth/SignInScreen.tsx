import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@hooks/use-auth";

export function SignInScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await signIn(trimmed);
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }, [email, signIn]);

  return (
    <SafeAreaView className="flex-1 bg-background justify-center px-8">
      <View className="items-center mb-8">
        <View className="size-20 rounded-full bg-primary items-center justify-center mb-4">
          <Text className="font-serif text-4xl font-bold text-primary-foreground">i</Text>
        </View>
        <Text className="font-serif text-3xl font-bold text-foreground text-center">
          Welcome to Igloo
        </Text>
        <Text className="mt-2 font-sans text-base text-muted-foreground text-center leading-relaxed">
          Track your health vitals and medications.
          {"\n"}We'll send a secure link to your email.
        </Text>
      </View>

      <View className="w-full space-y-4">
        <View>
          <Text className="font-sans text-sm font-semibold text-foreground mb-2">
            Email address
          </Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="your@email.com"
            placeholderTextColor="#A3B8C2"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
            className="h-14 rounded-2xl border border-border bg-card px-4 font-sans text-base text-foreground"
          />
        </View>

        {error ? (
          <Text className="font-sans text-sm text-urgent">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !email.trim()}
          className="h-14 rounded-2xl bg-primary items-center justify-center mt-2 shadow-md active:opacity-90"
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : sent ? (
            <Text className="font-sans text-base font-bold text-primary-foreground">
              Check your email
            </Text>
          ) : (
            <Text className="font-sans text-base font-bold text-primary-foreground">
              Send sign-in link
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {sent ? (
        <View className="mt-8 items-center">
          <View className="w-12 h-0.5 bg-border rounded-full mb-4" />
          <Text className="font-sans text-sm text-muted-foreground text-center">
            We've sent a magic link to
            {"\n"}
            <Text className="font-sans text-sm font-semibold text-foreground">
              {email.trim()}
            </Text>
          </Text>
          <Text className="mt-3 font-sans text-xs text-muted-foreground text-center leading-relaxed">
            Tap the link in your email to sign in securely.
            {"\n"}You'll be automatically signed in on this device afterward.
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View className="absolute inset-0 bg-background/80 items-center justify-center">
          <ActivityIndicator size="large" color="#186787" />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
