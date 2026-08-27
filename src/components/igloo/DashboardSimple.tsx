import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertCircle, X, MessageSquare } from "lucide-react-native";
import { METRICS, dayKeyOf, type MetricKey, type Reading } from "@lib/igloo-data";
import { STATUS_HEX } from "@lib/tokens";
import { Card } from "./Card";
import { Tortoise } from "./Tortoise";

interface SimpleDashboardProps {
  overall: "good" | "watch" | "urgent";
  flagged: string[];
  alertDismissed: boolean;
  dismissAlert: () => void;
  readings: Reading[];
  openAdd: () => void;
}

export function DashboardSimple({
  overall,
  flagged,
  alertDismissed,
  dismissAlert,
  readings,
  openAdd,
}: SimpleDashboardProps) {
  const daysLogged = useMemo(() => {
    const set = new Set(readings.map((r) => dayKeyOf(r.at)));
    return set.size;
  }, [readings]);

  let statusSentence = "";
  if (overall === "good") {
    statusSentence = "Everything looks good today";
  } else if (flagged.length === 1 && flagged[0]) {
    const metricLabel = METRICS[flagged[0] as MetricKey].label.toLowerCase();
    statusSentence = `Your ${metricLabel} was a bit high`;
  } else {
    statusSentence = "A few readings need attention";
  }

  return (
    <View className="px-5 pt-2 space-y-6">
      {flagged.length > 0 && !alertDismissed ? (
        <Card className="p-5 bg-watch-tint border-watch/30">
          <View className="flex-row items-start gap-3">
            <AlertCircle size={24} color={STATUS_HEX.watch} className="mt-0.5" />
            <View className="flex-1">
              <Text className="font-sans text-lg font-bold text-foreground">
                {METRICS[flagged[0] as MetricKey].label} needs attention
              </Text>
              <Text className="mt-1 font-sans text-base text-foreground leading-relaxed">
                It came in higher than usual. Rest a few minutes and re-take.
              </Text>
            </View>
            <TouchableOpacity onPress={dismissAlert} className="p-2">
              <X size={24} color="#5C7E8C" />
            </TouchableOpacity>
          </View>
        </Card>
      ) : null}

      <View className="items-center py-4 space-y-3">
        <Tortoise status={overall} size="lg" />
        <Text className="font-serif text-2xl font-bold text-foreground text-center">
          Good morning, Rosemary
        </Text>
      </View>

      <Card className="p-6 bg-primary-tint border-primary/20 items-center">
        <Text className="font-sans text-xl font-bold text-foreground text-center leading-snug">
          {statusSentence}
        </Text>
      </Card>

      <TouchableOpacity
        onPress={() => openAdd()}
        className="rounded-[22px] bg-primary p-5 flex-row items-center justify-center gap-3 shadow-md"
      >
        <MessageSquare size={24} color="#FFFFFF" />
        <Text className="font-sans text-xl font-bold text-primary-foreground">
          Log a Reading
        </Text>
      </TouchableOpacity>

      <Card className="p-5 items-center">
        <Text className="font-sans text-lg font-semibold text-foreground text-center">
          You've logged {daysLogged} of the last 7 days
        </Text>
      </Card>
    </View>
  );
}
