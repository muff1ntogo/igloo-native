import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserPlus, Trash2 } from "lucide-react-native";
import { METRICS, METRIC_ORDER } from "@lib/igloo-data";
import { useIgloo } from "@lib/igloo-store";
import { SPACE } from "@lib/tokens";
import { Card, PageHeader, IglooToggle, MetricIcon } from "@components/igloo";

export default function FamilyScreen() {
  const { familyConnections, familyLoading, inviteFamily, removeFamily, shared, toggleShared, simpleView } = useIgloo();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelation, setInviteRelation] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    const relation = inviteRelation.trim();
    if (!email) { Alert.alert("Missing email", "Please enter an email address."); return; }
    if (!relation) { Alert.alert("Missing relation", "Please enter a relationship label (e.g. Daughter)."); return; }
    setInviting(true);
    const result = await inviteFamily(email, relation);
    setInviting(false);
    if (result.success) { setInviteEmail(""); setInviteRelation(""); Alert.alert("Invited!", "Family member invited successfully."); }
    else { Alert.alert("Invite failed", result.error ?? "Unknown error."); }
  };

  const handleRemove = (inviteeId: string, name: string) => {
    Alert.alert(`Remove ${name}?`, `They will no longer receive your health readings.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => { await removeFamily(inviteeId); } },
    ]);
  };  const emptyState = (
    <Card className="p-8 items-center justify-center">
      <Text className="text-4xl mb-2">👨‍👩‍👧</Text>
      <Text className="font-serif text-lg font-bold text-foreground text-center">No family members connected yet</Text>
      <Text className="mt-1 font-sans text-xs text-muted-foreground text-center">Invite someone to view your readings and stay informed.</Text>
    </Card>
  );

  const loadingState = (
    <Card className="p-8 items-center justify-center">
      <Text className="font-sans text-sm text-muted-foreground">Loading family…</Text>
    </Card>
  );

  const inviteForm = (
    <View className="gap-3">
      <TextInput className="rounded-xl bg-input p-3 font-sans text-sm text-foreground" placeholder="Email address" placeholderTextColor="rgb(113,128,150)" value={inviteEmail} onChangeText={setInviteEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput className="rounded-xl bg-input p-3 font-sans text-sm text-foreground" placeholder="Relationship (e.g. Daughter)" placeholderTextColor="rgb(113,128,150)" value={inviteRelation} onChangeText={setInviteRelation} />
      <TouchableOpacity onPress={handleInvite} disabled={inviting} className="rounded-2xl bg-sun p-card-pad flex-row items-center justify-center gap-2 active:opacity-90">
        <UserPlus size={18} color="#123247" />
        <Text className="font-sans text-sm font-bold text-foreground">{inviting ? "Sending…" : "Invite a family member"}</Text>
      </TouchableOpacity>
    </View>
  );
  const sharingCard = familyConnections.length > 0 ? (
    <Card className="p-card-pad">
      <Text className="font-sans text-sm font-bold text-foreground">What they can see</Text>
      <Text className="mt-0.5 font-sans text-xs text-muted-foreground mb-3">Turn off anything you&apos;d rather keep to yourself.</Text>
      <View className="divide-y divide-border/60">
        {METRIC_ORDER.map((m) => (
          <View key={m} className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-row-gap flex-1 mr-2">
              <MetricIcon metric={m} />
              <View className="flex-1">
                <Text className="font-sans text-sm font-bold text-foreground">{METRICS[m].label}</Text>
                <Text className="font-sans text-xs font-semibold text-muted-foreground">{shared[m] ? "Shared with family" : "Private to you"}</Text>
              </View>
            </View>
            <IglooToggle checked={shared[m] ?? false} onChange={() => toggleShared(m)} label={`Share ${METRICS[m].label}`} />
          </View>
        ))}
      </View>
    </Card>
  ) : null;
  const memberList = familyLoading ? loadingState : familyConnections.length === 0 ? emptyState : (
    <View className="space-y-island">
      {familyConnections.map((fc) => (
        <Card key={fc.inviteeId} className="p-card-pad">
          <View className="flex-row items-start gap-row-gap">
            <View className="size-12 rounded-full bg-primary-tint items-center justify-center">
              <Text className="font-serif text-base font-bold text-primary">{fc.inviteeInitials}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="font-sans text-sm font-bold text-foreground">{fc.inviteeName}</Text>
                  <Text className="font-sans text-xs font-semibold text-muted-foreground">{fc.relation}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemove(fc.inviteeId, fc.inviteeName)} accessibilityLabel={`Remove ${fc.inviteeName}`}>
                  <Trash2 size={16} color="rgb(113,128,150)" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
  const subtitle = familyLoading ? "Loading…" : familyConnections.length > 0 ? `Sharing with ${familyConnections.length} people` : "No family members yet";

  if (simpleView) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: SPACE.scrollBottom }} showsVerticalScrollIndicator={false}>
          <PageHeader title="Your family" subtitle={subtitle} />
          <View className="px-5 pt-3 space-y-island">{memberList}{inviteForm}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: SPACE.scrollBottom }} showsVerticalScrollIndicator={false}>
        <PageHeader title="Your family" subtitle={subtitle} />
        <View className="px-5 pt-3 space-y-island">{memberList}{inviteForm}{sharingCard}</View>
      </ScrollView>
    </SafeAreaView>
  );
}