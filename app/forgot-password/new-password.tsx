import { useState, useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "@hooks/use-auth";

export default function NewPasswordScreen() {
  const router = useRouter();
  const { updatePassword, signInWithPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = useCallback(async () => {
    const p = password;
    const c = confirmPassword;
    if (!p || !c) {
      setError("Please fill in both fields.");
      return;
    }
    if (p !== c) {
      setError("Passwords do not match.");
      return;
    }
    if (p.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updatePassword(p);
      // Auto-sign in with the new password so the session is established
      // (updateUser doesn't automatically refresh the session in some cases)
      router.replace("/(tabs)");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password update failed.");
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, updatePassword, router]);

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
        <Text className="font-serif text-2xl font-bold text-foreground">New password</Text>
        <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed">
          Enter a new password for your account.
        </Text>
      </View>

      <View className="w-full space-y-4">
        <View>
          <Text className="font-sans text-sm font-semibold text-foreground mb-2">New password</Text>
          <TextInput
            secureTextEntry
            textContentType="newPassword"
            autoCapitalize="none"
            placeholder="At least 6 characters"
            placeholderTextColor="#A3B8C2"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(null); }}
            returnKeyType="next"
            className="h-14 rounded-2xl border border-border bg-card px-4 font-sans text-base text-foreground"
          />
        </View>

        <View>
          <Text className="font-sans text-sm font-semibold text-foreground mb-2">Confirm password</Text>
          <TextInput
            secureTextEntry
            textContentType="newPassword"
            autoCapitalize="none"
            placeholder="Re-enter your new password"
            placeholderTextColor="#A3B8C2"
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setError(null); }}
            returnKeyType="done"
            className="h-14 rounded-2xl border border-border bg-card px-4 font-sans text-base text-foreground"
          />
        </View>

        {error ? (
          <Text className="font-sans text-sm text-urgent">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          className="h-14 rounded-2xl bg-primary items-center justify-center mt-2 shadow-md active:opacity-90"
        >
          <Text className="font-sans text-base font-bold text-primary-foreground">
            {loading ? "Saving…" : "Save password"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
