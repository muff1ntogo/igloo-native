import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight, FileText } from "lucide-react-native";
import { METRIC_HEX } from "@lib/tokens";
import { Card } from "./Card";

export function DoctorReportBanner({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card className="p-4 bg-primary-tint border-primary/20 flex-row items-center justify-between mt-1">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="size-10 rounded-full bg-primary/10 items-center justify-center">
            <FileText size={20} color={METRIC_HEX.bp} />
          </View>
          <View className="flex-1">
            <Text className="font-sans text-sm font-bold text-foreground">
              Doctor's Summary Report
            </Text>
            <Text className="font-sans text-xs text-muted-foreground">
              Share a clean 30-day vitals PDF with your provider.
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#5C7E8C" />
      </Card>
    </TouchableOpacity>
  );
}
