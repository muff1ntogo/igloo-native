import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Home, ListOrdered, Plus, Users, User, LucideIcon } from "lucide-react-native";
import { cn } from "@lib/utils";
import { COLORS } from "@lib/tokens";
import { useIgloo } from "@lib/igloo-store";

type TabItem = {
  route: "/" | "/log" | "/family" | "/profile";
  label: string;
  icon: LucideIcon;
};

const TABS: readonly TabItem[] = [
  { route: "/", label: "Home", icon: Home },
  { route: "/log", label: "Log", icon: ListOrdered },
  { route: "/family", label: "Family", icon: Users },
  { route: "/profile", label: "Profile", icon: User },
] as const;

export function IglooTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { openAdd } = useIgloo();

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 pb-6 pt-2 px-4 shadow-lg">
      <View className="flex-row items-center justify-around">
        {/* Tab 1: Home */}
        <TabButton
          item={TABS[0]}
          isActive={pathname === "/" || pathname === "/index"}
          onPress={() => router.replace("/")}
        />
        
        {/* Tab 2: Log */}
        <TabButton
          item={TABS[1]}
          isActive={pathname === "/log"}
          onPress={() => router.replace("/log")}
        />

        {/* Center FAB: Add */}
        <Pressable
          onPress={() => openAdd()}
          accessibilityLabel="Add a reading"
          className={cn(
            "-mt-7 flex size-14 items-center justify-center rounded-full",
            "bg-primary shadow-lg border-4 border-card",
            "active:scale-95",
          )}
        >
          <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        {/* Tab 3: Family */}
        <TabButton
          item={TABS[2]}
          isActive={pathname === "/family"}
          onPress={() => router.replace("/family")}
        />

        {/* Tab 4: Profile */}
        <TabButton
          item={TABS[3]}
          isActive={pathname === "/profile"}
          onPress={() => router.replace("/profile")}
        />
      </View>
    </View>
  );
}

function TabButton({
  item,
  isActive,
  onPress,
}: {
  item: TabItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const Icon = item.icon;
  const color = isActive ? COLORS.primary : COLORS.mutedForeground;

  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center py-1 px-3"
    >
      <Icon size={22} color={color} strokeWidth={isActive ? 2.5 : 2} />
      <Text
        style={{ color }}
        className={cn(
          "text-[11px] mt-1 font-sans",
          isActive ? "font-bold" : "font-medium",
        )}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}
