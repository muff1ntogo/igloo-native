import { View, Text, TextStyle, ViewStyle } from "react-native";
import { cn } from "@lib/utils";
import { STATUS_META, type Status } from "@lib/igloo-data";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 rounded-full px-2.5 py-1",
        meta.badge,
        className,
      )}
    >
      <View className={cn("size-1.5 rounded-full", meta.dot)} />
      <Text className="text-xs font-bold">{meta.label}</Text>
    </View>
  );
}