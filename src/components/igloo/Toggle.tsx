import { Pressable, View, Text } from "react-native";
import { cn } from "@lib/utils";

interface IglooToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

/**
 * Large, high-contrast switch sized for older hands.
 * NativeWind className mapping of the web IglooToggle.
 */
export function IglooToggle({ checked, onChange, label }: IglooToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      className={cn(
        "relative h-[34px] w-[58px] shrink-0 rounded-full border transition-colors",
        checked ? "border-primary bg-primary" : "border-border bg-muted",
      )}
    >
      <View
        className={cn(
          "absolute top-1/2 size-[26px] -translate-y-1/2 rounded-full bg-card shadow-sm transition-all",
          checked ? "left-[28px]" : "left-[3px]",
        )}
      />
    </Pressable>
  );
}