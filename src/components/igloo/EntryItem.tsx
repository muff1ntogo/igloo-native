import React from "react";
import { View, Text } from "react-native";
import { Pill } from "lucide-react-native";
import { METRICS, timeOf, type MedLog, type Reading } from "@lib/igloo-data";
import { STATUS_HEX } from "@lib/tokens";
import { Card } from "./Card";
import { MetricIcon } from "./MetricIcon";

export type Entry =
  | { kind: "measurement"; item: Reading }
  | { kind: "medication"; item: MedLog };

export function EntryItem({ entry }: { entry: Entry }) {
  if (entry.kind === "medication") {
    const m = entry.item;
    return (
      <View className="flex-row items-center rounded-card bg-primary p-4 shadow-sm">
        <View className="size-10 rounded-full bg-white/20 items-center justify-center mr-3">
          <Pill size={20} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="font-sans text-sm font-bold text-primary-foreground">
            {m.name}
          </Text>
          <Text className="font-sans text-xs text-primary-foreground/80 font-medium">
            {m.dose} • {m.method}
          </Text>
        </View>
        <Text className="font-sans text-xs font-bold text-primary-foreground/90">
          {timeOf(m.at)}
        </Text>
      </View>
    );
  }

  const r = entry.item;
  const meta = METRICS[r.metric];

  return (
    <Card className="p-4 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3 flex-1">
        <MetricIcon metric={r.metric} />
        <View className="flex-1">
          <Text className="font-sans text-sm font-bold text-foreground">
            {meta.label}
          </Text>
          <View className="flex-row items-baseline gap-1 mt-0.5">
            <Text className="font-serif text-xl font-bold text-foreground">
              {r.value}
            </Text>
            <Text className="font-sans text-xs font-semibold text-muted-foreground">
              {meta.unit}
            </Text>
          </View>
        </View>
      </View>

      <View className="items-end gap-1">
        <View
          style={{ backgroundColor: STATUS_HEX[r.status] }}
          className="size-3 rounded-full"
        />
        <Text className="font-sans text-xs font-bold text-muted-foreground">
          {timeOf(r.at)}
        </Text>
      </View>
    </Card>
  );
}
