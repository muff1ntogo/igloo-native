import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  dayKeyOf,
  dayLabel,
  localISO,
  todayKey,
  type MedLog,
  type Reading,
} from "@lib/igloo-data";
import { useIgloo } from "@lib/igloo-store";
import { SPACE } from "@lib/tokens";
import { Card, PageHeader } from "@components/igloo";
import { EntryItem, type Entry } from "@components/igloo/EntryItem";

function startOfWeek(d: Date) {
  const out = new Date(d);
  out.setHours(12, 0, 0, 0);
  out.setDate(out.getDate() - out.getDay());
  return out;
}

function buildWeeks() {
  const base = startOfWeek(new Date());
  const weeks: { key: string; letter: string; num: number }[][] = [];
  for (let w = 4; w >= 0; w--) {
    const days: { key: string; letter: string; num: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - w * 7 + i);
      days.push({
        key: localISO(d).slice(0, 10),
        letter: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        num: d.getDate(),
      });
    }
    weeks.push(days);
  }
  return weeks;
}

export default function LogScreen() {
  const { readings, meds } = useIgloo();
  const weeks = useMemo(buildWeeks, []);
  const today = todayKey();
  const [selected, setSelected] = useState(today);
  const [weekIdx, setWeekIdx] = useState(weeks.length - 1);

  const dayEntries = useMemo(() => {
    const list: Entry[] = [
      ...readings
        .filter((r) => dayKeyOf(r.at) === selected)
        .map((r) => ({ kind: "measurement" as const, item: r })),
      ...meds
        .filter((m) => dayKeyOf(m.at) === selected)
        .map((m) => ({ kind: "medication" as const, item: m })),
    ];
    return list.sort((a, b) => a.item.at.localeCompare(b.item.at));
  }, [readings, meds, selected]);

  const currentWeekDays = weeks[weekIdx] ?? weeks[weeks.length - 1]!;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: SPACE.scrollBottom }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Your log" subtitle={dayLabel(selected)} />

        <View className="px-5 pt-3 space-y-island">
          {/* Week Selector Strip */}
          <Card className="p-3">
            <View className="flex-row items-center justify-between mb-2 px-1">
              <TouchableOpacity
                disabled={weekIdx === 0}
                onPress={() => setWeekIdx((i) => Math.max(0, i - 1))}
                className="p-1"
              >
                <ChevronLeft
                  size={20}
                  color={weekIdx === 0 ? "#A3B8C2" : "#123247"}
                />
              </TouchableOpacity>
              <Text className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {selected === today ? "This Week" : dayLabel(selected)}
              </Text>
              <TouchableOpacity
                disabled={weekIdx === weeks.length - 1}
                onPress={() => setWeekIdx((i) => Math.min(weeks.length - 1, i + 1))}
                className="p-1"
              >
                <ChevronRight
                  size={20}
                  color={weekIdx === weeks.length - 1 ? "#A3B8C2" : "#123247"}
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center">
              {currentWeekDays.map(({ key, letter, num }) => {
                const isSel = key === selected;
                const isToday = key === today;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelected(key)}
                    className={`items-center py-2 px-2.5 rounded-2xl ${
                      isSel ? "bg-primary" : isToday ? "bg-primary-tint" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-sans text-xs font-bold ${
                        isSel ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {letter}
                    </Text>
                    <Text
                      className={`font-serif text-base font-bold mt-1 ${
                        isSel ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Log Entries Timeline */}
          {readings.length === 0 && meds.length === 0 ? (
            <Card className="p-8 items-center justify-center">
              <Text className="text-4xl mb-2">📝</Text>
              <Text className="font-serif text-lg font-bold text-foreground text-center">
                No readings logged yet
              </Text>
              <Text className="mt-1 font-sans text-xs text-muted-foreground text-center">
                Start by logging your first reading or medication.
              </Text>
            </Card>
          ) : (
            <View className="space-y-island">
              {dayEntries.map((e) => (
                <EntryItem key={e.item.id} entry={e} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
