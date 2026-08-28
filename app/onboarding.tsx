import { useState, useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useProfile } from "@hooks/use-auth";
import { useIgloo } from "@lib/igloo-store";

type Step = "personal" | "health" | "done";

export default function OnboardingScreen() {
  const router = useRouter();
  const { upsert, setHealthSync } = useProfile();
  const { setOnboardingComplete } = useIgloo();
  const [step, setStep] = useState<Step>("personal");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [wantsHealth, setWantsHealth] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonalNext = useCallback(() => {
    const n = name.trim();
    const d = dob.trim();
    if (!n) { setError("Please enter your name."); return; }
    if (!d) { setError("Please enter your date of birth."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setError("Please use the format YYYY-MM-DD (e.g. 1952-03-15).");
      return;
    }
    setError(null);
    setStep("health");
  }, [name, dob]);

  const handleHealthNext = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await upsert({ name: name.trim(), dob: dob.trim() });
      // TODO: Wire up real HealthKit (iOS) / Health Connect (Android) permission call here.
      //       This requires a custom dev client with the appropriate entitlements/plist entries.
      await setHealthSync(wantsHealth);
      setOnboardingComplete(true);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }, [name, dob, wantsHealth, upsert, setHealthSync, setOnboardingComplete]);

  const handleDashboard = useCallback(() => {
    router.replace("/(tabs)");
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-background px-8 justify-center">
      {step === "personal" && (
        <View>
          <View className="items-center mb-8">
            <Text className="font-serif text-2xl font-bold text-foreground">
              Lets set up your profile
            </Text>
            <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed">
              This helps us personalise your experience.
            </Text>
          </View>
          <View className="w-full space-y-4">
            <View>
              <Text className="font-sans text-sm font-semibold text-foreground mb-2">Your name</Text>
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
              <Text className="font-sans text-sm font-semibold text-foreground mb-2">Date of birth</Text>
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
              onPress={handlePersonalNext}
              className="h-14 rounded-2xl bg-primary items-center justify-center mt-2 shadow-md active:opacity-90"
            >
              <Text className="font-sans text-base font-bold text-primary-foreground">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {step === "health" && (
        <View>
          <View className="items-center mb-8">
            <Text className="font-serif text-2xl font-bold text-foreground">
              Connect your health data
            </Text>
            <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed px-4">
              We can automatically pull data from health apps and devices you already use,
              so you do not have to enter everything manually.
            </Text>
          </View>
          <View className="w-full space-y-4">
            <TouchableOpacity
              onPress={() => setWantsHealth((v) => !v)}
              className="flex-row items-center h-14 rounded-2xl border border-border bg-card px-4"
            >
              <View
                className={["w-6 h-6 rounded-full border-2 items-center justify-center mr-3", wantsHealth ? "border-primary bg-primary" : "border-border bg-transparent"].join(" ")}
              >
                {wantsHealth ? (
                  <Text className="text-primary-foreground text-xs font-bold">✓</Text>
                ) : null}
              </View>
              <Text className="flex-1 font-sans text-base text-foreground">
                Connect Health App
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleHealthNext}
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
            <TouchableOpacity
              onPress={() => setStep("personal")}
              className="mt-4 items-center"
            >
              <Text className="font-sans text-sm text-primary">Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {step === "done" && (
        <View className="items-center justify-center flex-1">
          <View className="size-20 rounded-full bg-primary-tint items-center justify-center mb-6">
            <Text className="font-serif text-4xl">{"😀"}</Text>
          </View>
          <Text className="font-serif text-2xl font-bold text-foreground text-center">
            You are all set!
          </Text>
          <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed px-8">
            Welcome to Igloo, {name.split(" ")[0]}! Your health journey begins now.
          </Text>
          <TouchableOpacity
            onPress={handleDashboard}
            className="h-14 rounded-2xl bg-primary items-center justify-center mt-8 shadow-md active:opacity-90 w-64"
          >
            <Text className="font-sans text-base font-bold text-primary-foreground">
              Go to Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}