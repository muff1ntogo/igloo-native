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
import { STATUS_HEX, STATUS_TINT } from "@lib/tokens";
import { DashboardSimple } from "@components/igloo/DashboardSimple";
import { StatusHeroCard } from "@components/igloo/StatusHeroCard";
import { VitalsGrid } from "@components/igloo/VitalsGrid";
import { ConsistencyCard } from "@components/igloo/ConsistencyCard";
import { DoctorReportBanner } from "@components/igloo/DoctorReportBanner";
import { exportDoctorReport } from "@lib/igloo-pdf";

export default function DashboardScreen() {
  const { simpleView, alertDismissed, dismissAlert, readings, meds, openAdd } =
    useIgloo();
  const latest = useLatest();
  const [mode, setMode] = useState<"delta" | "status">("status");

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
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Good morning, Rosemary" subtitle={fullDateToday()} />

        {simpleView ? (
          <DashboardSimple
            overall={overall}
            flagged={flagged}
            alertDismissed={alertDismissed}
            dismissAlert={dismissAlert}
            readings={readings}
            openAdd={openAdd}
          />
        ) : (
          <View className="px-5 pt-2 space-y-4">
            {/* Alert banner if flagged reading */}
            {flagged.length > 0 && !alertDismissed ? (
              <View
                style={{ backgroundColor: STATUS_TINT.watch }}
                className="flex-row items-start rounded-[22px] border border-border p-4"
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

            {/* Status Hero Card */}
            <StatusHeroCard overall={overall} mode={mode} setMode={setMode} />

            {/* Metric Cards Grid */}
            <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">
              Vitals at a glance
            </Text>
            <VitalsGrid latest={latest} mode={mode} />

            {/* Weekly Consistency */}
            <ConsistencyCard week={week} measurementDays={measurementDays} />

            {/* Doctor Report CTA Banner */}
            <DoctorReportBanner onPress={handleExportReport} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

