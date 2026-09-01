import React, { useState, useCallback } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Clock } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Formats a JS Date as "HH:MM" (24-hour).
 */
function toTimeStr(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Formats a JS Date as "h:mm AM/PM" for display.
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type NativeTimePickerProps = {
  selectedTime?: string; // HH:MM
  onSelect: (time: string) => void;
};

export function NativeTimePicker({
  selectedTime,
  onSelect,
}: NativeTimePickerProps) {
  const [date, setDate] = useState<Date>(() => {
    if (selectedTime) {
      const now = new Date();
      const [h, m] = selectedTime.split(":").map(Number);
      now.setHours(h, m, 0, 0);
      return now;
    }
    return new Date();
  });
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = useCallback(
    (_event: unknown, selectedDate?: Date) => {
      if (selectedDate) {
        setDate(selectedDate);
        if (Platform.OS === "android") {
          setShowPicker(false);
          onSelect(toTimeStr(selectedDate));
        }
      }
    },
    [onSelect],
  );

  const handleOpen = useCallback(() => {
    if (Platform.OS === "android") {
      setShowPicker(true);
    } else {
      setShowPicker(true);
    }
  }, []);

  return (
    <View>
      {/* Display pill */}
      <TouchableOpacity
        onPress={handleOpen}
        className="h-14 rounded-2xl border border-border bg-card flex-row items-center px-4 mb-4"
      >
        <Clock size={20} color="#5C7E8C" className="mr-3" />
        <Text className="font-serif text-base font-semibold text-foreground flex-1">
          {formatTime(date)}
        </Text>
        <Text className="font-sans text-sm text-muted-foreground">▼</Text>
      </TouchableOpacity>

      {/* Native picker */}
      {showPicker && (
        <View className="rounded-xl border border-border bg-card overflow-hidden">
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleConfirm}
            textColor="#123247"
            themeVariant="light"
          />
          <View className="flex-row border-t border-border">
            <TouchableOpacity
              onPress={() => {
                setShowPicker(false);
                onSelect(toTimeStr(date));
              }}
              className="flex-1 py-3 items-center"
            >
              <Text className="font-sans text-sm font-bold text-primary">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export type { NativeTimePickerProps };