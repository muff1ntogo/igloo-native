import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Calendar,
  ChevronRight,
  HeartHandshake,
  LifeBuoy,
  LogOut,
  Smartphone,
  Sun,
  Watch,
  LucideIcon,
} from "lucide-react-native";
import { useIgloo } from "@lib/igloo-store";
import { Card, PageHeader, IglooToggle, ProfileSettings } from "@components/igloo";
import { SPACE } from "@lib/tokens";
import { useState } from "react";

type RowItem = {
  icon: LucideIcon;
  label: string;
  hint: string;
  sheetKey: string;
};

type Group = {
  title: string;
  rows: RowItem[];
};

const GROUPS: Group[] = [
  {
    title: "Personal details",
    rows: [{ icon: Calendar, label: "Date of birth", hint: "March 15, 1952", sheetKey: "dob" }],
  },
  {
    title: "Preferences",
    rows: [
      { icon: Bell, label: "Reminders", hint: "3 a day", sheetKey: "reminders" },
      { icon: Sun, label: "Text size", hint: "Large", sheetKey: "text-size" },
    ],
  },
  {
    title: "Connected apps",
    rows: [
      { icon: Watch, label: "Wrist monitor", hint: "Connected", sheetKey: "wrist-monitor" },
      { icon: Smartphone, label: "Health app", hint: "Syncing", sheetKey: "health-app" },
    ],
  },
  {
    title: "Support",
    rows: [
      { icon: LifeBuoy, label: "Help centre", hint: "", sheetKey: "help-center" },
      { icon: HeartHandshake, label: "Talk to a person", hint: "", sheetKey: "talk-person" },
    ],
  },
];

export default function ProfileScreen() {
  const { simpleView, setSimpleView, profile, signOut } = useIgloo();
  const [sheetKey, setSheetKey] = useState<string | null>(null);
  const openSheet = (key: string) => setSheetKey(key);
  const closeSheet = () => setSheetKey(null);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: SPACE.scrollBottom }} showsVerticalScrollIndicator={false}>
        <PageHeader title="Profile" subtitle="Your Igloo settings" />
        <View className="px-5 pt-3 space-y-island">
          <Card className="p-5 flex-row items-center gap-4">
            <View className="size-16 rounded-full bg-primary-tint items-center justify-center"><Text className="font-serif text-2xl font-bold text-primary">RW</Text></View>
            <View className="flex-1"><Text className="font-serif text-xl font-bold text-foreground">{profile.name}</Text><Text className="font-sans text-xs font-semibold text-muted-foreground mt-0.5">rosemary.w@email.com</Text></View>
          </Card>
          <Card className="p-4 bg-primary-tint/50 border-primary/20">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3"><Text className="font-sans text-sm font-bold text-foreground">Simple view</Text><Text className="font-sans text-xs text-muted-foreground mt-0.5 leading-snug">Larger text, simpler layout, and fewer details.</Text></View>
              <IglooToggle checked={simpleView} onChange={setSimpleView} label="Toggle Simple view" />
            </View>
          </Card>
          {GROUPS.map((g) => (
            <View key={g.title} className="space-y-2 mt-2">
              <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{g.title}</Text>
              <Card className="divide-y divide-border/60">
                {g.rows.map((r) => {
                  const Icon = r.icon;
                  return (
                    <TouchableOpacity key={r.label} onPress={() => openSheet(r.sheetKey)} className="flex-row items-center justify-between p-4 active:bg-muted/40">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="size-9 rounded-full bg-primary-tint items-center justify-center"><Icon size={18} color="#186787" /></View>
                        <Text className="font-sans text-sm font-semibold text-foreground">{r.label}</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        {r.hint ? <Text className="font-sans text-xs font-semibold text-muted-foreground">{r.hint}</Text> : null}
                        <ChevronRight size={18} color="#5C7E8C" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Card>
            </View>
          ))}
          <TouchableOpacity
            onPress={async () => {
              await signOut();
            }}
          >
            <Card className="p-4 flex-row items-center gap-3 border-urgent/30 bg-urgent-tint/30">
              <View className="size-9 rounded-full bg-urgent-tint items-center justify-center"><LogOut size={18} color="#D9383A" /></View>
              <Text className="font-sans text-sm font-bold text-urgent">Sign out</Text>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ProfileSettings sheetKey={sheetKey} onClose={closeSheet} />
    </SafeAreaView>
  );
}