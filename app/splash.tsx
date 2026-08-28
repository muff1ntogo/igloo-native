import { useState, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  const handleLogIn = useCallback(() => {
    router.push("/sign-in");
  }, [router]);

  const handleGetStarted = useCallback(() => {
    router.push("/sign-up");
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
      <View className="items-center">
        <View className="size-24 rounded-full bg-primary items-center justify-center mb-6">
          <Text className="font-serif text-5xl">🧊</Text>
        </View>
        <Text className="font-serif text-3xl font-bold text-foreground">Igloo</Text>
        <Text className="mt-2 font-sans text-sm text-muted-foreground text-center leading-relaxed">
          Your personal health companion
        </Text>
      </View>

      <View className="w-full space-y-4 mt-16">
        <TouchableOpacity
          onPress={handleLogIn}
          className="h-14 rounded-2xl bg-primary items-center justify-center shadow-md active:opacity-90 mb-4"
        >
          <Text className="font-sans text-base font-bold text-primary-foreground">
            Log In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGetStarted}
          className="h-14 rounded-2xl border-2 border-primary items-center justify-center active:opacity-90"
        >
          <Text className="font-sans text-base font-bold text-primary">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
