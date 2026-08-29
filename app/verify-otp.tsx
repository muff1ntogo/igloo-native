import { useState, useCallback } from "react";
import { TextInput, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "@hooks/use-auth";
import { KeyboardDismissView } from "@components/igloo";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { verifyOtp } = useAuth();
  const { flow: flowParam, email: emailParam } = useLocalSearchParams<{ flow: "signup" | "recovery"; email: string }>();
  const flow = flowParam ?? "signup";
  const email = decodeURIComponent(emailParam ?? "");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    const code = token.trim();
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError("Please enter a 6-digit code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, code, flow);
      if (flow === "recovery") {
        router.replace({ pathname: "/forgot-password/new-password" });
      } else {
        router.replace("/onboarding");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }, [token, email, flow, verifyOtp, router]);

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
        <Text className="font-serif text-2xl font-bold text-foreground">
          Check your email
        </Text>
        <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed">
          We've sent a 6-digit code to {email}
        </Text>
      </View>

      <View className="w-full space-y-4">
        <View>
          <Text className="font-sans text-sm font-semibold text-foreground mb-2">
            Verification code
          </Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="number-pad"
            placeholder="6-digit code"
            placeholderTextColor="#A3B8C2"
            value={token}
            maxLength={6}
            onChangeText={(v) => { setToken(v.replace(/\D/g, "")); setError(null); }}
            className="h-14 rounded-2xl border border-border bg-card px-4 font-sans text-xl text-center tracking-widest text-foreground"
          />
        </View>

        {error ? (
          <Text className="font-sans text-sm text-urgent">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading || token.length !== 6}
          className="h-14 rounded-2xl bg-primary items-center justify-center mt-2 shadow-md active:opacity-90"
        >
          {loading ? (
            <Text className="font-sans text-base font-bold text-primary-foreground">
              Verifying…
            </Text>
          ) : (
            <Text className="font-sans text-base font-bold text-primary-foreground">
              Continue
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 items-center"
        >
          <Text className="font-sans text-sm text-primary">Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </KeyboardDismissView>
  );
}
