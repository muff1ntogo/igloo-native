import { useState, useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "@hooks/use-auth";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = useCallback(async () => {
    const e = email.trim();
    if (!e || !/\S+@\S+\.\S+/.test(e)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(e);
      router.push({
        pathname: "/verify-otp",
        params: { flow: "recovery", email: encodeURIComponent(e) },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  }, [email, resetPassword, router]);

  return (
    <SafeAreaView className="flex-1 bg-background px-8 justify-center">
      {/* Back arrow */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 left-4 size-10 rounded-full bg-card items-center justify-center border border-border"
      >
        <ArrowLeft size={20} color="#123247" />
      </TouchableOpacity>
      <View className="items-center mb-8 mt-8">
        <Text className="font-serif text-2xl font-bold text-foreground">Forgot password?</Text>
        <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed">
          Enter your email and we'll send a code to reset your password.
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

        {error ? (
          <Text className="font-sans text-sm text-urgent">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSendCode}
          disabled={loading}
          className="h-14 rounded-2xl bg-primary items-center justify-center mt-2 shadow-md active:opacity-90"
        >
          <Text className="font-sans text-base font-bold text-primary-foreground">
            {loading ? "Sending…" : "Send reset code"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 items-center"
        >
          <Text className="font-sans text-sm text-primary">Back to Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
