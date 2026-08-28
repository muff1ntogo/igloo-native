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
import { useProfile } from "@hooks/use-auth";

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { profile, upsert, loading: profileLoading } = useProfile();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If profile already exists (user returned after signing in), skip
  if (profile?.name && profile.dob) {
    useCallback(() => onComplete(), [onComplete]);
    return null;
  }

  const handleContinue = useCallback(async () => {
    const n = name.trim();
    const d = dob.trim();
    if (!n) {
      setError("Please enter your name.");
      return;
    }
    if (!d) {
      setError("Please enter your date of birth.");
      return;
    }
    // Basic date check: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setError("Please use the format YYYY-MM-DD (e.g. 1952-03-15).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await upsert({ name: n, dob: d });
      onComplete();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }, [name, dob, upsert, onComplete]);

  if (profileLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#186787" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-8 justify-center">
      <View className="items-center mb-8">
        <Text className="font-serif text-2xl font-bold text-foreground">
          Let's set up your profile
        </Text>
        <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed">
          This helps us personalise your experience.
        </Text>
      </View>

      <View className="w-full space-y-4">
        <View>
          <Text className="font-sans text-sm font-semibold text-foreground mb-2">
            Your name
          </Text>
          <TextInput
            autoCapitalize="words"
            placeholder="e.g. Rosemary Whitfield"
            placeholderTextColor="#A3B8C2"
            value={name}
            onChangeText={(v) => { setName(v); setError(null); }}
            className="h-14 rounded-2xl border border-border bg-card px-4 font-sans text-base text-foreground"
          />
        </View>

        <View>
          <Text className="font-sans text-sm font-semibold text-foreground mb-2">
            Date of birth
          </Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="numeric"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A3B8C2"
            value={dob}
            onChangeText={(v) => { setDob(v); setError(null); }}
            className="h-14 rounded-2xl border border-border bg-card px-4 font-sans text-base text-foreground"
          />
          <Text className="mt-1.5 font-sans text-xs text-muted-foreground">
            Format: YYYY-MM-DD (e.g. 1952-03-15)
          </Text>
        </View>

        {error ? (
          <Text className="font-sans text-sm text-urgent">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleContinue}
          disabled={saving}
          className="h-14 rounded-2xl bg-primary items-center justify-center mt-2 shadow-md active:opacity-90"
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-sans text-base font-bold text-primary-foreground">
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
