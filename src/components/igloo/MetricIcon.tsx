import { View } from "react-native";
import { Activity, HeartPulse, Wind, Droplet, LucideIcon } from "lucide-react-native";
import { METRICS, type MetricKey } from "@lib/igloo-data";
import { METRIC_HEX, METRIC_TINT } from "@lib/tokens";
import { cn } from "@lib/utils";

export const METRIC_ICONS: Record<MetricKey, LucideIcon> = {
  bp: Activity,
  hr: HeartPulse,
  ox: Wind,
  glu: Droplet,
};

interface MetricIconProps {
  metric: MetricKey;
  size?: "md" | "lg";
}

export function MetricIcon({ metric, size = "md" }: MetricIconProps) {
  const Icon = METRIC_ICONS[metric];
  const color = METRIC_HEX[metric];
  const backgroundColor = METRIC_TINT[metric];
  const isLg = size === "lg";

  return (
    <View
      style={{ backgroundColor }}
      className={cn(
        "items-center justify-center rounded-full",
        isLg ? "size-14" : "size-11",
      )}
    >
      <Icon size={isLg ? 28 : 20} color={color} />
    </View>
  );
}
