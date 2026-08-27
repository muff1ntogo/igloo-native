import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import type { MetricKey } from "@lib/igloo-data";
import { METRIC_HEX } from "@lib/tokens";
import { cn } from "@lib/utils";

interface SparklineProps {
  data: number[];
  metric: MetricKey;
  className?: string;
  height?: number;
}

export function Sparkline({
  data,
  metric,
  className,
  height = 56,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const color = METRIC_HEX[metric];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 30 - ((v - min) / span) * 24 - 3;
    return [x, y] as const;
  });

  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const area = `${line} L100 30 L0 30 Z`;
  const last = pts[pts.length - 1] ?? ([0, 0] as const);

  return (
    <View className={cn("w-full justify-center", className)} style={{ height }}>
      <Svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        style={{ width: "100%", height }}
        aria-hidden={true}
      >
        <Path d={area} fill={color} fillOpacity={0.12} />
        <Path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={last[0]} cy={last[1]} r="2" fill={color} />
      </Svg>
    </View>
  );
}
