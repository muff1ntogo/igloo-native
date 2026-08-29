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
import { NativeDatePicker } from "./NativeDatePicker";

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

export function DateSelector({ selected, onSelect }: DateSelectorProps) {
  return (
    <NativeDatePicker
      selectedDate={selected}
      onSelect={onSelect}
    />
  );
}

export type { SheetProps, RadioOption, OptionRowProps, DateSelectorProps };
export { NativeDatePicker };

