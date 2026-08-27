import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";

interface AddMedicationFormProps {
  medName: string;
  setMedName: (v: string) => void;
  medDose: string;
  setMedDose: (v: string) => void;
  onSave: () => void;
}

export function AddMedicationForm({
  medName,
  setMedName,
  medDose,
  setMedDose,
  onSave,
}: AddMedicationFormProps) {
  return (
    <View className="space-y-4">
      {/* Medication Name */}
      <View>
        <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Medication Name
        </Text>
        <TextInput
          value={medName}
          onChangeText={setMedName}
          placeholder="e.g. Metformin"
          placeholderTextColor="#A3B8C2"
          className="h-14 rounded-2xl border border-border bg-background px-4 font-sans text-base text-foreground"
        />
      </View>

      {/* Dose */}
      <View>
        <Text className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Dose
        </Text>
        <TextInput
          value={medDose}
          onChangeText={setMedDose}
          placeholder="e.g. 500mg"
          placeholderTextColor="#A3B8C2"
          className="h-14 rounded-2xl border border-border bg-background px-4 font-sans text-base text-foreground"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={onSave}
        className="h-14 rounded-2xl bg-primary items-center justify-center mt-4 shadow-md"
      >
        <Text className="font-sans text-base font-bold text-primary-foreground">
          Save Medication
        </Text>
      </TouchableOpacity>
    </View>
  );
}
