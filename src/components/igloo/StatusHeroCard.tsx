import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { STATUS_META, type Status } from "@lib/igloo-data";
import { STATUS_TINT } from "@lib/tokens";
import { Card } from "./Card";
import { StatusBadge } from "./Badge";
import { Tortoise } from "./Tortoise";

interface StatusHeroCardProps {
  overall: Status;
  mode: "delta" | "status";
  setMode: (m: "delta" | "status") => void;
}

const STATUS_TEXTS: Record<Status, { title: string; description: string }> = {
  good: {
    title: "Everything looks steady",
    description: "All vitals are within your target range today.",
  },
  watch: {
    title: "A reading worth watching",
    description: "One of your vitals is slightly elevated. Rest and re-check later.",
  },
  urgent: {
    title: "Attention needed",
    description: "Please check your latest reading and consult your care guide if needed.",
  },
};

export function StatusHeroCard({ overall, mode, setMode }: StatusHeroCardProps) {
  const meta = STATUS_TEXTS[overall];

  return (
    <Card style={{ backgroundColor: STATUS_TINT[overall] }} className="p-card-pad">
      <View className="flex-row items-center gap-row-gap">
        <Tortoise status={overall} size="md" />
        <View className="flex-1">
          <StatusBadge status={overall} />
          <Text className="mt-2 font-serif text-lg font-bold text-foreground leading-snug">
            {meta.title}
          </Text>
          <Text className="mt-1 font-sans text-xs text-muted-foreground leading-relaxed">
            {meta.description}
          </Text>
        </View>
      </View>

      {/* Mode Switcher */}
      <View className="mt-4 flex-row items-center justify-between border-t border-border/50 pt-island">
        <Text className="font-sans text-xs font-semibold text-muted-foreground">
          Card details
        </Text>
        <View className="flex-row rounded-full bg-card/80 p-0.5 border border-border/60">
          <TouchableOpacity
            onPress={() => setMode("status")}
            className={`rounded-full px-3 py-1 ${
              mode === "status" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`font-sans text-xs font-bold ${
                mode === "status"
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Zones
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("delta")}
            className={`rounded-full px-3 py-1 ${
              mode === "delta" ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text
              className={`font-sans text-xs font-bold ${
                mode === "delta"
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              vs 7d Avg
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

