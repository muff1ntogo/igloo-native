import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X } from "lucide-react-native";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sheet({ visible, onClose, title, children, footer }: SheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-card rounded-t-[32px] px-6 pt-5 pb-8 max-h-[85%] border-t border-border shadow-2xl">
          <View className="w-10 h-1 rounded-full bg-muted-foreground/20 self-center mb-4" />
          <View className="flex-row items-center justify-between pb-4 border-b border-border/60">
            <Text className="font-serif text-xl font-bold text-foreground">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-muted/40">
              <X size={20} color="#5C7E8C" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} className="py-4">{children}</ScrollView>
          {footer}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface RadioOption {
  value: string;
  label: string;
}

interface OptionRowProps {
  options: RadioOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function OptionRow({ options, selected, onSelect }: OptionRowProps) {
  return (
    <View className="space-y-2">
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          className="flex-row items-center justify-between py-3 px-4 rounded-xl bg-muted/30 mb-2"
        >
          <Text className="font-sans text-sm font-semibold text-foreground flex-1">{opt.label}</Text>
          <View
            className={
              "size-5 rounded-full border-2 items-center justify-center " +
              (selected === opt.value ? "border-primary bg-primary" : "border-border bg-transparent")
            }
          >
            {selected === opt.value && <View className="size-2 rounded-full bg-primary-foreground" />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

interface DateSelectorProps {
  selected: string;
  onSelect: (date: string) => void;
}

export function DateSelector({ selected }: DateSelectorProps) {
  const [month, setMonth] = useState(2);
  const [day, setDay] = useState(15);
  const [year, setYear] = useState(1952);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    const m = selected.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (m) {
      const mi = months.indexOf(m[1]);
      if (mi >= 0) { setMonth(mi); setDay(Number(m[2])); setYear(Number(m[3])); }
    }
  }, [selected]);

  const formatDisplay = () => `${months[month]} ${day}, ${year}`;

  return (
    <View>
      <View className="flex-row items-center justify-center gap-3 py-4">
        <TouchableOpacity onPress={() => setMonth((m) => (m - 1 + 12) % 12)} className="p-2 rounded-full bg-muted/40">
          <X size={16} color="#5C7E8C" />
        </TouchableOpacity>
        <View className="bg-primary-tint/60 rounded-xl px-4 py-3 items-center min-w-[80px]">
          <Text className="font-sans text-xs text-muted-foreground font-semibold uppercase tracking-wider">Month</Text>
          <Text className="font-serif text-lg font-bold text-foreground">{months[month]}</Text>
        </View>
        <TouchableOpacity onPress={() => setMonth((m) => (m + 1) % 12)} className="p-2 rounded-full bg-muted/40">
          <Text className="font-serif text-lg font-bold text-primary">›</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-center gap-3 py-2">
        <TouchableOpacity onPress={() => setDay((d) => Math.max(1, d - 1))} className="p-2 rounded-full bg-muted/40">
          <X size={16} color="#5C7E8C" />
        </TouchableOpacity>
        <View className="bg-primary-tint/60 rounded-xl px-4 py-3 items-center min-w-[60px]">
          <Text className="font-sans text-xs text-muted-foreground font-semibold uppercase tracking-wider">Day</Text>
          <Text className="font-serif text-lg font-bold text-foreground">{day}</Text>
        </View>
        <TouchableOpacity onPress={() => setDay((d) => Math.min(31, d + 1))} className="p-2 rounded-full bg-muted/40">
          <Text className="font-serif text-lg font-bold text-primary">›</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-center gap-3 py-2">
        <TouchableOpacity onPress={() => setYear((y) => y - 1)} className="p-2 rounded-full bg-muted/40">
          <X size={16} color="#5C7E8C" />
        </TouchableOpacity>
        <View className="bg-primary-tint/60 rounded-xl px-4 py-3 items-center min-w-[90px]">
          <Text className="font-sans text-xs text-muted-foreground font-semibold uppercase tracking-wider">Year</Text>
          <Text className="font-serif text-lg font-bold text-foreground">{year}</Text>
        </View>
        <TouchableOpacity onPress={() => setYear((y) => y + 1)} className="p-2 rounded-full bg-muted/40">
          <Text className="font-serif text-lg font-bold text-primary">›</Text>
        </TouchableOpacity>
      </View>
      <View className="mt-4 px-4 py-3 bg-primary/10 rounded-xl items-center">
        <Text className="font-sans text-sm font-semibold text-primary">{formatDisplay()}</Text>
      </View>
    </View>
  );
}

export type { SheetProps, RadioOption, OptionRowProps, DateSelectorProps };

