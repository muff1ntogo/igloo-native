import React from "react";
import { View, Text } from "react-native";
import Svg, { Rect, Line, Circle } from "react-native-svg";
import type { MetricKey } from "@lib/igloo-data";
import {
  METRIC_DETAIL,
  type Zone,
  zoneFor,
} from "@lib/igloo-metric-detail";
import { STATUS_HEX, STATUS_TINT } from "@lib/tokens";
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

  // SVG geometry — viewBox is 100 wide x 22 tall (band area) + room for labels.
  const VB_W = 100;
  const VB_H = 22;
  const bandY = 4;
  const bandH = 14;

  const pct = (v: number) => ((v - min) / span) * 100;

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

      {/* Gauge */}
      <View className="w-full" style={{ height: VB_H * 2 }}>
        <Svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: VB_H }}
          aria-hidden={true}
        >
          {/* Colored zone bands */}
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
                fill={STATUS_TINT[z.status]}
                stroke={STATUS_HEX[z.status]}
                strokeOpacity={0.25}
                strokeWidth={0.5}
                rx={2}
              />
            );
          })}

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
              strokeDasharray="2 1.5"
              rx={2}
            />
          ) : null}

          {/* Current-reading marker */}
          <Line
            x1={markerPct.toFixed(2)}
            y1={bandY - 2}
            x2={markerPct.toFixed(2)}
            y2={bandY + bandH + 2}
            stroke={markerColor}
            strokeWidth={1.1}
          />
          <Circle
            cx={markerPct.toFixed(2)}
            cy={bandY + bandH / 2}
            r={2.4}
            fill={markerColor}
            stroke="#FFFFFF"
            strokeWidth={0.8}
          />
        </Svg>
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
                  backgroundColor: STATUS_TINT[z.status],
                  borderColor: STATUS_HEX[z.status],
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
