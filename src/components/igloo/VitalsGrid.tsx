import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
  METRICS,
  METRIC_ORDER,
  STATUS_META,
  TRENDS,
  DELTAS,
  timeOf,
  type MetricKey,
  type Reading,
} from "@lib/igloo-data";
import { zoneLabelFor } from "@lib/igloo-metric-detail";
import { Card } from "./Card";
import { StatusBadge } from "./Badge";
import { BigNumber } from "./BigNumber";
import { MetricIcon } from "./MetricIcon";
import { Sparkline } from "./Sparkline";

interface VitalsGridProps {
  latest: Record<MetricKey, Reading | undefined>;
  mode: "delta" | "status";
}

export function VitalsGrid({ latest, mode }: VitalsGridProps) {
  const router = useRouter();

  return (
    <View className="gap-3">
      {METRIC_ORDER.map((m) => {
        const reading = latest[m];
        const meta = METRICS[m];
        const delta = DELTAS[m];
        const trend = TRENDS[m];

        return (
          <TouchableOpacity
            key={m}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/metric/[metric]",
                params: { metric: m },
              })
            }
          >
            <Card className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <MetricIcon metric={m} />
                  <View>
                    <Text className="font-sans text-sm font-bold text-foreground">
                      {meta.label}
                    </Text>
                    <Text className="font-sans text-xs text-muted-foreground">
                      {reading ? timeOf(reading.at) : "No reading"}
                    </Text>
                  </View>
                </View>
                {reading ? <StatusBadge status={reading.status} /> : null}
              </View>

              {reading ? (
                <View className="mt-3 flex-row items-end justify-between">
                  <View>
                    <BigNumber value={reading.value} unit={meta.unit} />
                    <Text className="mt-1 font-sans text-xs text-muted-foreground">
                      {mode === "delta"
                        ? delta
                        : zoneLabelFor(m, reading.value)}
                    </Text>
                  </View>
                  <View className="w-28 h-10 justify-end">
                    <Sparkline data={trend} metric={m} height={36} />
                  </View>
                </View>
              ) : null}
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
