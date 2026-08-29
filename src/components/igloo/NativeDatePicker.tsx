import React, { useState, useCallback } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Formats a JS Date as "Month DD, YYYY" (e.g. "March 15, 1952").
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a JS Date as "YYYY-MM-DD".
 */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultMinYear() {
  return new Date().getFullYear() - 100;
}

type NativeDatePickerProps = {
  selectedDate?: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  minYear?: number;
  maxYear?: number;
};

export function NativeDatePicker({
  selectedDate,
  onSelect,
  minYear = defaultMinYear(),
  maxYear = new Date().getFullYear(),
}: NativeDatePickerProps) {
  const [date, setDate] = useState<Date>(() => {
    if (selectedDate) {
      const d = new Date(selectedDate + "T00:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });
  const [mode, setMode] = useState<"date" | "compact">("date");
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = useCallback(
    (_event: unknown, selectedDate?: Date) => {
      if (selectedDate) {
        setDate(selectedDate);
        // On Android the native picker has its own confirm button, so we
        // commit immediately. On iOS we keep the picker open until Done.
        if (Platform.OS === "android") {
          setShowPicker(false);
          onSelect(toISODate(selectedDate));
        }
      }
    },
    [onSelect]
  );

  const handleOpen = useCallback(() => {
    if (Platform.OS === "android") {
      setShowPicker(true);
    } else {
      setMode("date");
      setShowPicker(true);
    }
  }, []);

  const minDate = new Date(minYear, 0, 1);
  const maxDate = new Date(maxYear, 11, 31);

  return (
    <View>
      {/* Display pill */}
      <TouchableOpacity
        onPress={handleOpen}
        className="h-14 rounded-2xl border border-border bg-card flex-row items-center px-4 mb-4"
      >
        <Calendar size={20} color="#5C7E8C" className="mr-3" />
        <Text className="font-serif text-base font-semibold text-foreground flex-1">
          {formatDate(date)}
        </Text>
        <Text className="font-sans text-sm text-muted-foreground">▼</Text>
      </TouchableOpacity>

      {/* iOS native picker */}
      {Platform.OS === "ios" && showPicker && (
        <View className="rounded-xl border border-border bg-card overflow-hidden">
          <DateTimePicker
            value={date}
            minimumDate={minDate}
            maximumDate={maxDate}
            mode="date"
            display="spinner"
            onChange={handleConfirm}
            textColor="#123247"
            themeVariant="light"
          />
          <View className="flex-row border-t border-border">
            <TouchableOpacity
              onPress={() => {
                setShowPicker(false);
                onSelect(toISODate(date));
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

export type { NativeDatePickerProps };
