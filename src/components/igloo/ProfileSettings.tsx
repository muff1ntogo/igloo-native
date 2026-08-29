import React, { useCallback } from "react";
import { Text, View } from "react-native";
import { Sheet, OptionRow, NativeDatePicker } from "./Sheet";
import { useIgloo } from "@lib/igloo-store";
import { useProfile } from "@hooks/use-auth";

interface ProfileSettingsProps {
  sheetKey: string | null;
  onClose: () => void;
}

export function ProfileSettings({ sheetKey, onClose }: ProfileSettingsProps) {
  const { preferences, setPreferences, profile, setProfile } = useIgloo();
  const { upsert } = useProfile();

  const textSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  const reminderOptions = [
    { value: "once", label: "Once a day" },
    { value: "twice", label: "Twice a day" },
    { value: "three", label: "3 times a day" },
    { value: "four", label: "4 times a day" },
  ];

  const wristOptions = [
    { value: "connected", label: "Connected" },
    { value: "not-connected", label: "Not connected" },
    { value: "syncing", label: "Syncing..." },
  ];

  const handleDobChange = useCallback(
    (date: string) => {
      setProfile({ ...profile, dob: date });
      void upsert({ dob: date });
    },
    [profile, setProfile, upsert],
  );

  return (
    <View>
      <Sheet visible={sheetKey === "dob"} onClose={onClose} title="Date of birth">
        <NativeDatePicker
          selectedDate={profile.dob}
          onSelect={handleDobChange}
        />
      </Sheet>

      <Sheet visible={sheetKey === "reminders"} onClose={onClose} title="Reminders">
        <OptionRow
          options={reminderOptions}
          selected={preferences.reminderFrequency}
          onSelect={(v) => setPreferences({ reminderFrequency: v as any })}
        />
      </Sheet>

      <Sheet visible={sheetKey === "text-size"} onClose={onClose} title="Text size">
        <OptionRow
          options={textSizeOptions}
          selected={preferences.textSize}
          onSelect={(v) => setPreferences({ textSize: v as any })}
        />
      </Sheet>

      <Sheet visible={sheetKey === "wrist-monitor"} onClose={onClose} title="Wrist monitor">
        <OptionRow
          options={wristOptions}
          selected={preferences.wristMonitorStatus}
          onSelect={(v) => setPreferences({ wristMonitorStatus: v as any })}
        />
      </Sheet>

      <Sheet visible={sheetKey === "health-app"} onClose={onClose} title="Health app">
        <View className="py-4">
          <Text className="font-sans text-sm text-foreground leading-relaxed mb-3">
            Connect with Apple Health to automatically pull in your heart rate,
            weight, and other vitals. Permissions are requested on first launch.
          </Text>
          <Text className="font-sans text-xs text-muted-foreground leading-relaxed">
            In Expo Go the native HealthKit module is unavailable. Build a
            custom dev client (EAS or Xcode) to enable real integration.
          </Text>
        </View>
      </Sheet>

      <Sheet visible={sheetKey === "help-center"} onClose={onClose} title="Help centre">
        <View className="py-4">
          <Text className="font-sans text-sm text-foreground leading-relaxed">
            Browse our help articles or contact support.
          </Text>
        </View>
      </Sheet>

      <Sheet visible={sheetKey === "talk-person"} onClose={onClose} title="Talk to a person">
        <View className="py-4">
          <Text className="font-sans text-sm text-foreground leading-relaxed">
            Reach our care team by phone or in-app chat.
          </Text>
        </View>
      </Sheet>
    </View>
  );
}
