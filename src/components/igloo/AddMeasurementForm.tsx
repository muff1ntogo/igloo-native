import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { METRICS, METRIC_ORDER, type MetricKey } from "@lib/igloo-data";
import { MetricIcon } from "./MetricIcon";

const BP_MIN_SYSTOLIC = 50;
const BP_MAX_SYSTOLIC = 250;
const BP_MIN_DIASTOLIC = 30;
const BP_MAX_DIASTOLIC = 150;
const HR_MIN = 30;
const HR_MAX = 220;
const OX_MIN = 50;
const OX_MAX = 100;
const GLU_MIN = 20;
const GLU_MAX = 600;

interface AddMeasurementFormProps {
  metric: MetricKey;
  setMetric: (m: MetricKey) => void;
  value: string;
  setValue: (v: string) => void;
  systolic?: string;
  setSystolic?: (v: string) => void;
  diastolic?: string;
  setDiastolic?: (v: string) => void;
  onSave: () => void;
}

export function AddMeasurementForm({
  metric,
  setMetric,
  value,
  setValue,
  systolic,
  setSystolic,
  diastolic,
  setDiastolic,
  onSave,
}: AddMeasurementFormProps) {
  // Validation helper
  const isValid = (() => {
    if (metric === "bp") {
      const s = Number(systolic);
      const d = Number(diastolic);
      return !isNaN(s) && !isNaN(d) && s >= BP_MIN_SYSTOLIC && s <= BP_MAX_SYSTOLIC && d >= BP_MIN_DIASTOLIC && d <= BP_MAX_DIASTOLIC;
    }
    const n = Number(value);
    if (metric === "hr") return !isNaN(n) && n >= HR_MIN && n <= HR_MAX;
    if (metric === "ox") return !isNaN(n) && n >= OX_MIN && n <= OX_MAX;
    if (metric === "glu") return !isNaN(n) && n >= GLU_MIN && n <= GLU_MAX;
    return false;
  })();

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

      {/* Value Input - BP gets two fields, others get one */}
      {metric === "bp" ? (
        <View className="mt-2 flex-row gap-3">
          <View className="flex-1">
            <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Systolic
            </Text>
            <TextInput
              value={systolic}
              onChangeText={setSystolic}
              placeholder="e.g. 130"
              placeholderTextColor="#A3B8C2"
              keyboardType="number-pad"
              className="h-14 rounded-2xl border border-border bg-background px-4 font-serif text-xl text-foreground"
            />
          </View>
          <View className="flex-1">
            <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Diastolic
            </Text>
            <TextInput
              value={diastolic}
              onChangeText={setDiastolic}
              placeholder="e.g. 82"
              placeholderTextColor="#A3B8C2"
              keyboardType="number-pad"
              className="h-14 rounded-2xl border border-border bg-background px-4 font-serif text-xl text-foreground"
            />
          </View>
        </View>
      ) : (
        <View className="mt-2">
          <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Value ({METRICS[metric].unit})
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={`e.g. ${METRICS[metric].placeholder}`}
            placeholderTextColor="#A3B8C2"
            keyboardType="number-pad"
            className="h-14 rounded-2xl border border-border bg-background px-4 font-serif text-xl text-foreground"
          />
        </View>
      )}

      {/* Submit Button - disabled until valid */}
      <TouchableOpacity
        onPress={onSave}
        disabled={!isValid}
        className={`h-14 rounded-2xl items-center justify-center mt-4 shadow-md ${
          isValid ? "bg-primary" : "bg-primary/40"
        }`}
      >
        <Text className="font-sans text-base font-bold text-primary-foreground">
          Save Reading
        </Text>
      </TouchableOpacity>
    </View>
  );
}

