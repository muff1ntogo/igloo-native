import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { METRICS, METRIC_ORDER, type MetricKey } from "@lib/igloo-data";
import { MetricIcon } from "./MetricIcon";

interface AddMeasurementFormProps {
  metric: MetricKey;
  setMetric: (m: MetricKey) => void;
  value: string;
  setValue: (v: string) => void;
  onSave: () => void;
}

export function AddMeasurementForm({
  metric,
  setMetric,
  value,
  setValue,
  onSave,
}: AddMeasurementFormProps) {
  return (
    <View className="space-y-4">
      {/* Metric Selection */}
      <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Select Metric
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {METRIC_ORDER.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMetric(m)}
            className={`flex-row items-center gap-2 p-3 rounded-2xl border flex-1 min-w-[45%] ${
              metric === m
                ? "border-primary bg-primary-tint"
                : "border-border bg-card"
            }`}
          >
            <MetricIcon metric={m} size="md" />
            <Text className="font-sans text-xs font-bold text-foreground">
              {METRICS[m].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Value Input */}
      <View className="mt-2">
        <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Value ({METRICS[metric].unit})
        </Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={`e.g. ${METRICS[metric].placeholder}`}
          placeholderTextColor="#A3B8C2"
          keyboardType="numeric"
          className="h-14 rounded-2xl border border-border bg-background px-4 font-serif text-xl text-foreground"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={onSave}
        className="h-14 rounded-2xl bg-primary items-center justify-center mt-4 shadow-md"
      >
        <Text className="font-sans text-base font-bold text-primary-foreground">
          Save Reading
        </Text>
      </TouchableOpacity>
    </View>
  );
}
