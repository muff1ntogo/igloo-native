import React from "react";
import { View, Text } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { Card } from "./Card";

interface ConsistencyCardProps {
  week: { key: string; letter: string }[];
  measurementDays: Set<string>;
}

export function ConsistencyCard({ week, measurementDays }: ConsistencyCardProps) {
  return (
    <Card className="p-4 mt-2">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-sans text-sm font-bold text-foreground">
          Logging Consistency
        </Text>
        <Text className="font-sans text-xs text-muted-foreground font-semibold">
          Last 7 days
        </Text>
      </View>
      <View className="flex-row justify-between items-center">
        {week.map(({ key, letter }) => {
          const loggedVitals = measurementDays.has(key);
          return (
            <View key={key} className="items-center gap-1.5">
              <Text className="font-sans text-xs font-bold text-muted-foreground">
                {letter}
              </Text>
              <View
                className={`size-8 rounded-full items-center justify-center border ${
                  loggedVitals
                    ? "bg-primary border-primary"
                    : "bg-muted/40 border-border"
                }`}
              >
                {loggedVitals ? (
                  <CheckCircle2 size={16} color="#FFFFFF" />
                ) : (
                  <View className="size-2 rounded-full bg-border" />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
