import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, ClipPath, Defs, G } from "react-native-svg";
import type { MetricKey, Status } from "@lib/igloo-data";
import {
  METRIC_DETAIL,
  type Zone,
  zoneFor,
} from "@lib/igloo-metric-detail";
import { STATUS_HEX } from "@lib/tokens";
import { Card } from "./Card";

interface ZoneGaugeProps {
  metric: MetricKey;
  /** Numeric value of the current reading (systolic for blood pressure). */
  current: number;
}

/** Horizontal gauge of colored reference-range bands + a current-reading marker. */
export function ZoneGauge({ metric, current }: ZoneGaugeProps) {
  const detail = METRIC_DETAIL[metric];
  const { min, max, zones, target } = detail;
  const span = max - min || 1;

  // Clamp the marker inside the gauge domain.
  const clamped = Math.max(min, Math.min(max, current));
  const markerPct = ((clamped - min) / span) * 100;

  const currentZone = zoneFor(metric, current);
  const markerColor = STATUS_HEX[currentZone.status];

  // SVG geometry — viewBox is 100 wide x 22 tall (band area).
  const VB_W = 100;
  const VB_H = 22;
  const bandY = 4;
  const bandH = 14;

  const pct = (v: number) => ((v - min) / span) * 100;

  // Semantic color mapping by clinical status — exact HEX, no opacity blends.
  // "good"  = optimal/normal → Green
  // "watch" = borderline/ elevated → Yellow
  // "urgent" = critical/high → Red
  const STATUS_COLOR: Record<Status, string> = {
    good: "#16C47F",
    watch: "#FFD65A",
    urgent: "#F93827",
  };
  const zoneFill = (z: Zone) => STATUS_COLOR[z.status];
  const zoneStroke = (z: Zone) => STATUS_COLOR[z.status];

  return (
    <Card className="p-card-pad">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-sans text-sm font-bold text-foreground">
          Reference range
        </Text>
        <Text className="font-sans text-xs font-semibold text-muted-foreground">
          {min}–{max}
        </Text>
      </View>

      {/* Gauge wrapper — tall enough for the SVG bands + floating marker */}
      <View className="w-full" style={{ height: VB_H * 2.2 }}>
        {/* SVG bands with ClipPath for seamless continuous bar */}
        <Svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: VB_H }}
          aria-hidden={true}
        >
          <Defs>
            <ClipPath id="gaugeClip">
              <Rect x="0" y={bandY} width={VB_W} height={bandH} rx={2} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#gaugeClip)">
            {/* Colored zone bands — flat internal edges, no stroke */}
            {zones.map((z: Zone) => {
              const x = pct(z.from);
              const w = pct(z.to) - pct(z.from);
              return (
                <Rect
                  key={z.name}
                  x={x.toFixed(2)}
                  y={bandY}
                  width={w.toFixed(2)}
                  height={bandH}
                  fill={zoneFill(z)}
                />
              );
            })}
          </G>

          {/* Outlined personal-target band (if a target is set) */}
          {target ? (
            <Rect
              x={pct(target.from).toFixed(2)}
              y={bandY - 1}
              width={(pct(target.to) - pct(target.from)).toFixed(2)}
              height={bandH + 2}
              fill="none"
              stroke="#186787"
              strokeWidth={0.9}
              rx={2}
            />
          ) : null}
        </Svg>

        {/* Floating marker — outside SVG, sized in fixed pixels so it
            cannot be distorted by the SVG's non-uniform scale. */}
        <View
          style={{
            position: "absolute",
            left: `${markerPct}%`,
            top: bandY + bandH / 2 - 6,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: markerColor,
            borderWidth: 2,
            borderColor: "#FFFFFF",
            transform: [{ translateX: -6 }],
          }}
        />
      </View>

      {/* Zone legend */}
      <View className="flex-row flex-wrap mt-3 gap-x-4 gap-y-1.5">
        {zones.map((z) => {
          const isCurrent = z.name === currentZone.name;
          return (
            <View
              key={z.name}
              className="flex-row items-center gap-1.5"
              style={{ opacity: isCurrent ? 1 : 0.6 }}
            >
              <View
                style={{
                  backgroundColor: zoneFill(z),
                  borderColor: zoneStroke(z),
                }}
                className="size-2.5 rounded-full border"
              />
              <Text
                className={`font-sans text-xs ${
                  isCurrent ? "font-bold text-foreground" : "font-semibold text-muted-foreground"
                }`}
              >
                {z.name} · {z.from}–{z.to}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Personal target note */}
      {target ? (
        <View className="mt-3 pt-3 border-t border-border/50 flex-row items-center justify-between">
          <Text className="font-sans text-xs font-semibold text-muted-foreground">
            Your target
          </Text>
          <View className="flex-row items-center gap-1.5">
            <View className="size-2.5 rounded-full border-2 border-primary" />
            <Text className="font-sans text-xs font-bold text-primary">
              {target.from}–{target.to}
            </Text>
          </View>
        </View>
      ) : null}
    </Card>
  );
}
