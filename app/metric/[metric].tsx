import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  METRICS,
  METRIC_ORDER,
  STATUS_META,
  type MetricKey,
} from "@lib/igloo-data";
import { useIgloo, useLatest } from "@lib/igloo-store";
import {
  average,
  DOCTOR_NOTE,
  METRIC_DETAIL,
  numericValue,
  RANGE_LABEL,
  RANGES,
  rollingAverage,
  seriesFor,
  zoneFor,
  type RangeKey,
} from "@lib/igloo-metric-detail";
import {
  Card,
  StatusBadge,
  BigNumber,
  MetricIcon,
  Sparkline,
  Tortoise,
  ZoneGauge,
} from "@components/igloo";
import { STATUS_HEX, STATUS_TINT, METRIC_HEX, METRIC_TINT, SPACE } from "@lib/tokens";

export default function MetricDetailScreen() {
  const router = useRouter();
  const { metric } = useLocalSearchParams<{ metric: string }>();

  const m = (
    METRIC_ORDER.includes(metric as MetricKey) ? metric : "bp"
  ) as MetricKey;

  const meta = METRICS[m];
  const detail = METRIC_DETAIL[m];
  const latest = useLatest();
  const { simpleView } = useIgloo();
  const reading = latest[m];

  const current = numericValue(m, reading?.value);
  const zone = zoneFor(m, current);
  const status = reading?.status ?? "good";
  const [range, setRange] = useState<RangeKey>("1M");

  const series = useMemo(() => seriesFor(m, range, current), [m, range, current]);
  const periodAvg = average(series);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border/50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="size-10 rounded-full bg-card items-center justify-center border border-border"
        >
          <ArrowLeft size={20} color="#123247" />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="font-serif text-xl font-bold text-foreground">
            {meta.label}
          </Text>
          <Text className="font-sans text-xs text-muted-foreground font-semibold">
            {meta.unit} • Guidance & Trends
          </Text>
        </View>
        <MetricIcon metric={m} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: SPACE.scrollBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4 space-y-island">
          {/* Latest Reading Card */}
          <Card className="p-card-pad">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Latest Reading
              </Text>
              <StatusBadge status={status} />
            </View>

            <View className="mt-3 flex-row items-baseline justify-between">
              <BigNumber
                value={reading?.value ?? "--"}
                unit={meta.unit}
                valueClassName="text-4xl"
              />
              <Text className="font-sans text-xs font-bold text-foreground bg-primary-tint px-3 py-1.5 rounded-full">
                {zone.name}
              </Text>
            </View>
          </Card>

          {/* Reference-range gauge — zone bands + current-reading marker +
              outlined personal target band. Reads from existing zone/target
              data in igloo-metric-detail.ts. */}
          <ZoneGauge metric={m} current={current} />

          {/* Time Range Selector */}
          <View className="flex-row justify-between bg-card rounded-2xl p-1 border border-border">
            {RANGES.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRange(r)}
                className={`flex-1 py-2 items-center rounded-xl ${
                  range === r ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text
                  className={`font-sans text-xs font-bold ${
                    range === r ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trend Chart Card */}
          <Card className="p-card-pad">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-sans text-sm font-bold text-foreground">
                Trend ({RANGE_LABEL[range]})
              </Text>
              <Text className="font-sans text-xs font-semibold text-muted-foreground">
                Avg: {Math.round(periodAvg)} {meta.unit}
              </Text>
            </View>
            <View className="py-2">
              <Sparkline data={series} metric={m} height={120} variant="detailed" />
            </View>
          </Card>

          {/* About Metric */}
          <Card className="p-card-pad space-y-2">
            <Text className="font-sans text-sm font-bold text-foreground">
              About {meta.label}
            </Text>
            <Text className="font-sans text-xs text-muted-foreground leading-relaxed">
              {detail.about}
            </Text>
          </Card>

          {/* Guidance & Tips */}
          <Card className="p-card-pad space-y-3">
            <Text className="font-sans text-sm font-bold text-foreground">
              Tips for accurate readings
            </Text>
            {detail.tips.map((tip, idx) => (
              <View key={idx} className="flex-row items-start gap-2">
                <Text className="font-sans text-xs font-bold text-primary">
                  •
                </Text>
                <Text className="font-sans text-xs text-muted-foreground flex-1 leading-relaxed">
                  {tip}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
