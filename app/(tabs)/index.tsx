import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TriangleAlert, X } from "lucide-react-native";
import {
  dayKeyOf,
  fullDateToday,
  localISO,
  METRICS,
  METRIC_ORDER,
  type MetricKey,
} from "@lib/igloo-data";
import { useIgloo, useLatest, worstStatus } from "@lib/igloo-store";
import { PageHeader } from "@components/igloo";
import { STATUS_HEX, STATUS_TINT, SPACE } from "@lib/tokens";
import { DashboardSimple } from "@components/igloo/DashboardSimple";
import { StatusHeroCard } from "@components/igloo/StatusHeroCard";
import { VitalsGrid } from "@components/igloo/VitalsGrid";
import { ConsistencyCard } from "@components/igloo/ConsistencyCard";
import { DoctorReportBanner } from "@components/igloo/DoctorReportBanner";
import { exportDoctorReport } from "@lib/igloo-pdf";

export default function DashboardScreen() {
  const { simpleView, alertDismissed, dismissAlert, readings, meds, openAdd, profile } =
    useIgloo();
  const latest = useLatest();
  const [mode, setMode] = useState<"delta" | "status">("status");

  const greeting = profile.name
    ? `Good morning, ${profile.name.split(" ")[0]}`
    : "Good morning";

  const overall = worstStatus(METRIC_ORDER.map((m) => latest[m]?.status));
  const flagged = METRIC_ORDER.filter((m) => latest[m]?.status !== "good");

  const week = useMemo(() => {
    const days: { key: string; letter: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        key: localISO(d).slice(0, 10),
        letter: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      });
    }
    return days;
  }, []);

  const measurementDays = useMemo(
    () => new Set(readings.map((r) => dayKeyOf(r.at))),
    [readings],
  );

  const handleExportReport = () => {
    exportDoctorReport(readings, meds);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: SPACE.scrollBottom }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title={greeting} subtitle={fullDateToday()} />

        {readings.length === 0 && meds.length === 0 ? (
          <View className="px-5 pt-3">
            <View className="items-center py-12 space-y-4">
              <View className="size-20 rounded-full bg-primary-tint items-center justify-center">
                <Text className="font-serif text-4xl">{"\uD83D\uDE0A"}</Text>
              </View>
              <Text className="font-serif text-xl font-bold text-foreground text-center">
                {profile.name
                  ? `Welcome, ${profile.name.split(" ")[0]}!`
                  : "Welcome to Igloo!"}
              </Text>
              <Text className="font-sans text-sm text-muted-foreground text-center leading-relaxed px-8">
                Start by logging your first reading or medication.
                {"\n"}Your health journey begins here.
              </Text>
              <TouchableOpacity
                onPress={() => openAdd()}
                className="rounded-[22px] bg-primary px-8 py-4 flex-row items-center justify-center gap-3 shadow-md mt-4"
              >
                <Text className="font-sans text-lg font-bold text-primary-foreground">
                  Log your first reading
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : simpleView ? (
          <DashboardSimple
            overall={overall}
            flagged={flagged}
            alertDismissed={alertDismissed}
            dismissAlert={dismissAlert}
            readings={readings}
            openAdd={openAdd}
          />
        ) : (
          <View className="px-5 pt-3 space-y-island">
            {flagged.length > 0 && !alertDismissed ? (
              <View
                style={{ backgroundColor: STATUS_TINT.watch }}
                className="flex-row items-start rounded-[22px] border border-border p-card-pad"
              >
                <TriangleAlert size={20} color={STATUS_HEX.watch} className="mt-0.5" />
                <View className="ml-3 flex-1">
                  <Text className="font-sans text-sm font-bold text-foreground">
                    {METRICS[flagged[0] as MetricKey].label} is worth a look
                  </Text>
                  <Text className="mt-1 font-sans text-xs text-muted-foreground">
                    It came in a little higher than usual. Rest a few minutes and take it again.
                  </Text>
                </View>
                <TouchableOpacity onPress={dismissAlert} className="p-1">
                  <X size={18} color="#5C7E8C" />
                </TouchableOpacity>
              </View>
            ) : null}

            <StatusHeroCard overall={overall} mode={mode} setMode={setMode} />
            <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mt-island">
              Vitals at a glance
            </Text>
            <VitalsGrid latest={latest} mode={mode} />
            <ConsistencyCard week={week} measurementDays={measurementDays} />
            <DoctorReportBanner onPress={handleExportReport} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
