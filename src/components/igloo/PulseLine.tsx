import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { cn } from "@lib/utils";
import { COLORS } from "@lib/tokens";

interface PulseLineProps {
  className?: string;
  color?: string;
}

/**
 * Signature motif: thin rule with a single ECG blip.
 * Uses react-native-svg so the path scales cleanly at any width.
 */
export function PulseLine({ className, color = COLORS.primary }: PulseLineProps) {
  return (
    <View className={cn("h-4 w-full justify-center", className)}>
      <Svg
        viewBox="0 0 240 18"
        preserveAspectRatio="none"
        style={{ width: "100%", height: 18 }}
        aria-hidden={true}
      >
        <Path
          d="M0 12 H92 L98 12 L103 4 L108 16 L113 9 L118 12 H240"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}