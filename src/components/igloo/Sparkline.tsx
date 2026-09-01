import { View } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import type { MetricKey } from "@lib/igloo-data";
import { METRIC_HEX } from "@lib/tokens";
import { cn } from "@lib/utils";

interface SparklineProps {
  data: number[];
  metric: MetricKey;
  className?: string;
  height?: number;
  /**
   * "minimal" (default) — thin ~2px line, tiny dot, very faint fill.
   *                Used for the small inline charts on the Dashboard cards.
   * "detailed"     — same thin line in the metric's own colour, plus light,
   *                  minimal horizontal gridlines. Used for the Metric
   *                  Detail trend chart. No heavy area fill, no bold dots.
   */
  variant?: "minimal" | "detailed";
  secondaryData?: number[]; // e.g. diastolic — same length/alignment as `data`
  showAllPoints?: boolean;  // marker at every point, not just the last
}

export function Sparkline({
  data,
  metric,
  className,
  height = 56,
  variant = "minimal",
  secondaryData,
  showAllPoints,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const color = METRIC_HEX[metric];
  const allVals = secondaryData ? [...data, ...secondaryData] : data;
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const span = max - min || 1;

  // Plot within the viewBox vertically, leaving a little headroom top/bottom.
  const topPad = 3;
  const bottomPad = 3;
  const plotH = 30 - topPad - bottomPad;

  if (data.length === 1) {
    // A single reading can't show a trend — render one centered dot instead
    // of a degenerate line/area path.
    const y = topPad + (1 - (data[0] - min) / span) * plotH;
    return (
      <View className={cn("w-full justify-center", className)} style={{ height }}>
        <Svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: "100%", height }} aria-hidden={true}>
          <Circle cx={50} cy={y} r={variant === "detailed" ? 1.2 : 1.6} fill={color} />
          {secondaryData && secondaryData.length === 1 ? (
            <Circle
              cx={50}
              cy={topPad + (1 - (secondaryData[0] - min) / span) * plotH}
              r={1.0}
              fill={color}
              stroke={color}
              strokeWidth={0.5}
            />
          ) : null}
        </Svg>
      </View>
    );
  }

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = topPad + (1 - (v - min) / span) * plotH;
    return [x, y] as const;
  });

  const secondaryPts = secondaryData
    ? secondaryData.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = topPad + (1 - (v - min) / span) * plotH;
        return [x, y] as const;
      })
    : null;

  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const area = `${line} L100 30 L0 30 Z`;
  const last = pts[pts.length - 1] ?? ([0, 0] as const);
  const secondaryLine = secondaryPts
    ? secondaryPts
        .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
        .join(" ")
    : null;

  const isDetailed = variant === "detailed";
  // Thin stroke for both variants; minimal dot in the detailed view.
  const strokeWidth = 2;
  const gridlines = [0.25, 0.5, 0.75];

  return (
    <View className={cn("w-full justify-center", className)} style={{ height }}>
      <Svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        style={{ width: "100%", height }}
        aria-hidden={true}
      >
        {/* Light, minimal horizontal gridlines — only in the detailed view */}
        {isDetailed
          ? gridlines.map((g) => (
              <Line
                key={g}
                x1="0"
                y1={(topPad + g * plotH).toFixed(2)}
                x2="100"
                y2={(topPad + g * plotH).toFixed(2)}
                stroke="#DCEAEE"
                strokeWidth="0.4"
                strokeDasharray="2 2"
              />
            ))
          : null}

        {/* Very faint area fill (kept subtle per the minimal spec) */}
        <Path d={area} fill={color} fillOpacity={isDetailed ? 0.05 : 0.08} />

        {/* Thin line in the metric's own colour */}
        <Path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {secondaryLine ? (
          <Path
            d={secondaryLine}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {showAllPoints
          ? pts.map(([x, y], i) => (
              <Circle
                key={i}
                cx={x}
                cy={y}
                r={i === pts.length - 1 ? (isDetailed ? 1.4 : 1.8) : 0.8}
                fill={color}
              />
            ))
          : null}
        {secondaryPts && showAllPoints
          ? secondaryPts.map(([x, y], i) => (
              <Circle
                key={`s-${i}`}
                cx={x}
                cy={y}
                r={i === secondaryPts.length - 1 ? 1.4 : 0.8}
                fill={color}
              />
            ))
          : null}

        {/* Small subtle end dot — smaller in the detailed view */}
        {!showAllPoints && (
          <Circle cx={last[0]} cy={last[1]} r={isDetailed ? 1.2 : 1.6} fill={color} />
        )}
      </Svg>
    </View>
  );
}
