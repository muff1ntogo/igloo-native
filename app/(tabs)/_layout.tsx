import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { IglooTabBar } from '@components/igloo/TabBar';

export default function TabLayout() {
  return (
    <View className="flex-1">
      <Tabs
        tabBar={() => <IglooTabBar />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="log" options={{ title: 'Log' }} />
        <Tabs.Screen name="family" options={{ title: 'Family' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </View>
  );
}
