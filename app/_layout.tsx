import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useFonts } from 'expo-font';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Fraunces_400Regular, Fraunces_500Medium, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { IglooProvider, useIgloo } from '@lib/igloo-store';
import { AddModal } from '@components/igloo/AddModal';
import '../global.css';
import { useEffect } from 'react';

function AppContent() {
  const { authLoading, profileReady, profileLoading, user, onboardingComplete } = useIgloo();
  const router = useRouter();

  // Only route once BOTH auth AND profile queries have resolved.
  // Without profileReady, we'd route on the first auth tick before we know
  // whether the user has a profile → wrong page.
  // Without profileLoading, we might route before the real onboarding state (dob) is known.
  useEffect(() => {
    if (authLoading || !profileReady || profileLoading) return;
    if (!user) {
      router.replace('/splash');
    } else if (!onboardingComplete) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }, [user, onboardingComplete, authLoading, profileReady, profileLoading, router]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#186787" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="forgot-password/new-password" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-Medium': Manrope_500Medium,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold': Manrope_700Bold,
    'Fraunces-Regular': Fraunces_400Regular,
    'Fraunces-Medium': Fraunces_500Medium,
    'Fraunces-SemiBold': Fraunces_600SemiBold,
    'Fraunces-Bold': Fraunces_700Bold,
  });

  const { colorScheme, setColorScheme } = useColorScheme();

  // Force light mode to match the web app design — run once on mount.
  useEffect(() => {
    if (colorScheme !== 'light') {
      setColorScheme('light');
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#186787" />
      </View>
    );
  }

  return (
    <IglooProvider>
      <AppContent />
      <AddModal />
    </IglooProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF7F9',
  },
});