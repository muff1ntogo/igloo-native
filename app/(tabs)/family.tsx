import React from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserPlus } from "lucide-react-native";
import { FAMILY, METRICS, METRIC_ORDER } from "@lib/igloo-data";
import { useIgloo } from "@lib/igloo-store";
import { Card, PageHeader, StatusBadge, IglooToggle, MetricIcon } from "@components/igloo";

export default function FamilyScreen() {
  const { shared, toggleShared, simpleView } = useIgloo();

  const handleInvite = () => {
    Alert.alert("Invite Link Copied", "Invitation link copied — send it to your family.");
  };

  if (simpleView) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          <PageHeader title="Your family" subtitle="Sharing with 3 people" />
          <View className="px-5 pt-2 space-y-4">
            {FAMILY.map((f) => (
              <Card key={f.id} className="p-6">
                <View className="flex-row items-start gap-4">
                  <View className="size-16 rounded-full bg-primary-tint items-center justify-center">
                    <Text className="font-serif text-xl font-bold text-primary">
                      {f.initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-serif text-xl font-bold text-foreground">
                      {f.name}
                    </Text>
                    <Text className="mt-1 font-sans text-base text-foreground">
                      {f.status === "good"
                        ? `${f.name.split(" ")[0]} is doing fine today`
                        : `${f.name.split(" ")[0]} has a question about your readings`}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Your family" subtitle="Sharing with 3 people" />

        <View className="px-5 pt-2 space-y-4">
          <View className="space-y-3">
            {FAMILY.map((f) => (
              <Card key={f.id} className="p-4">
                <View className="flex-row items-start gap-3">
                  <View className="size-12 rounded-full bg-primary-tint items-center justify-center">
                    <Text className="font-serif text-base font-bold text-primary">
                      {f.initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                      <View>
                        <Text className="font-sans text-sm font-bold text-foreground">
                          {f.name}
                        </Text>
                        <Text className="font-sans text-xs font-semibold text-muted-foreground">
                          {f.relation}
                        </Text>
                      </View>
                      <StatusBadge status={f.status} />
                    </View>
                    <Text className="mt-2 font-sans text-xs text-muted-foreground leading-relaxed">
                      {f.note}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleInvite}
            className="rounded-2xl bg-sun p-4 flex-row items-center justify-center gap-2 active:opacity-90"
          >
            <UserPlus size={18} color="#123247" />
            <Text className="font-sans text-sm font-bold text-foreground">
              Invite a family member
            </Text>
          </TouchableOpacity>

          <Card className="p-4">
            <Text className="font-sans text-sm font-bold text-foreground">
              What they can see
            </Text>
            <Text className="mt-0.5 font-sans text-xs text-muted-foreground mb-3">
              Turn off anything you'd rather keep to yourself.
            </Text>

            <View className="divide-y divide-border/60">
              {METRIC_ORDER.map((m) => (
                <View
                  key={m}
                  className="flex-row items-center justify-between py-3"
                >
                  <View className="flex-row items-center gap-3 flex-1 mr-2">
                    <MetricIcon metric={m} />
                    <View className="flex-1">
                      <Text className="font-sans text-sm font-bold text-foreground">
                        {METRICS[m].label}
                      </Text>
                      <Text className="font-sans text-xs font-semibold text-muted-foreground">
                        {shared[m] ? "Shared with family" : "Private to you"}
                      </Text>
                    </View>
                  </View>
                  <IglooToggle
                    checked={shared[m] ?? false}
                    onChange={() => toggleShared(m)}
                    label={`Share ${METRICS[m].label}`}
                  />
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
