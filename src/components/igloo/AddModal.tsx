import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import { X } from "lucide-react-native";
import {
  localISO,
  METRICS,
  todayKey,
  type MetricKey,
  type Status,
} from "@lib/igloo-data";
import { useIgloo } from "@lib/igloo-store";
import { AddMeasurementForm } from "./AddMeasurementForm";
import { AddMedicationForm } from "./AddMedicationForm";

type Category = "measurement" | "medication";

function statusFor(metric: MetricKey, value: string): Status {
  const n = Number(value.split("/")[0]);
  if (Number.isNaN(n)) return "good";
  if (metric === "bp") return n >= 140 ? "urgent" : n >= 130 ? "watch" : "good";
  if (metric === "hr") return n >= 110 || n < 45 ? "urgent" : n >= 95 ? "watch" : "good";
  if (metric === "ox") return n < 92 ? "urgent" : n < 96 ? "watch" : "good";
  return n >= 180 ? "urgent" : n >= 140 ? "watch" : "good";
}

export function AddModal() {
  const { addOpen, setAddOpen, addReading, addMed } = useIgloo();
  const [cat, setCat] = useState<Category>("measurement");
  const [metric, setMetric] = useState<MetricKey>("bp");
  const [value, setValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [dayKey, setDayKey] = useState(todayKey());
  const [time, setTime] = useState("08:00");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!addOpen) return;
    setCat("measurement");
    setMetric("bp");
    setValue("");
    setSystolic("");
    setDiastolic("");
    setMedName("");
    setMedDose("");
    const now = new Date();
    setDayKey(todayKey());
    setTime(localISO(now).slice(11, 16));
  }, [addOpen]);

  // Track real keyboard height to offset the sheet manually.
  // KeyboardAvoidingView is unreliable inside a native Modal on iOS.
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const saveMeasurement = () => {
    let v = value.trim();
    if (metric === "bp") {
      const s = systolic.trim();
      const d = diastolic.trim();
      if (!s || !d) {
        Alert.alert("Missing value", "Please enter both systolic and diastolic.");
        return;
      }
      v = `${s}/${d}`;
    }
    if (!v) {
      Alert.alert("Missing value", "Please enter a reading value.");
      return;
    }
    const at = `${dayKey}T${time}`;
    addReading({
      metric,
      value: v,
      method: "Manual",
      status: statusFor(metric, v),
      at,
    });
    setAddOpen(false);
    Alert.alert("Saved", `${METRICS[metric].label} logged successfully.`);
  };

  const saveMedication = () => {
    const n = medName.trim();
    if (!n) {
      Alert.alert("Missing name", "Please enter medication name.");
      return;
    }
    const at = `${dayKey}T${time}`;
    addMed({
      name: n,
      dose: medDose.trim() || "1 dose",
      method: "Logged",
      at,
    });
    setAddOpen(false);
    Alert.alert("Saved", `${n} logged successfully.`);
  };

  return (
    <Modal
      visible={addOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAddOpen(false)}
    >
      <View
        className="flex-1 justify-end bg-black/50"
        style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 8 : 0 }}
      >
        <View
          className="bg-card rounded-t-[32px] p-6 max-h-[85%] border-t border-border shadow-2xl"
          style={{ marginBottom: keyboardHeight > 0 ? keyboardHeight + 8 : 0 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-border/60">
            <Text className="font-serif text-xl font-bold text-foreground">
              Log an entry
            </Text>
            <TouchableOpacity
              onPress={() => setAddOpen(false)}
              className="p-1 rounded-full bg-muted/40"
            >
              <X size={20} color="#5C7E8C" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 400 }}
          >
            {/* Category Switcher */}
            <View className="flex-row rounded-2xl bg-muted/30 p-1 mb-5">
              <TouchableOpacity
                onPress={() => setCat("measurement")}
                className={`flex-1 py-2.5 items-center rounded-xl ${
                  cat === "measurement" ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text
                  className={`font-sans text-xs font-bold ${
                    cat === "measurement"
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Measurement
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCat("medication")}
                className={`flex-1 py-2.5 items-center rounded-xl ${
                  cat === "medication" ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text
                  className={`font-sans text-xs font-bold ${
                    cat === "medication"
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Medication
                </Text>
              </TouchableOpacity>
            </View>

            {cat === "measurement" ? (
              <AddMeasurementForm
                metric={metric}
                setMetric={setMetric}
                value={value}
                setValue={setValue}
                systolic={systolic}
                setSystolic={setSystolic}
                diastolic={diastolic}
                setDiastolic={setDiastolic}
                onSave={saveMeasurement}
              />
            ) : (
              <AddMedicationForm
                medName={medName}
                setMedName={setMedName}
                medDose={medDose}
                setMedDose={setMedDose}
                onSave={saveMedication}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
