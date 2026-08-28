import React from "react";
import { Text, View } from "react-native";
import { Sheet, OptionRow, DateSelector } from "./Sheet";
import { useIgloo } from "@lib/igloo-store";

interface ProfileSettingsProps {
  sheetKey: string | null;
  onClose: () => void;
}

export function ProfileSettings({ sheetKey, onClose }: ProfileSettingsProps) {
  const { preferences, setPreferences, profile, setProfile } = useIgloo();

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

  return (
    <View>
      <Sheet visible={sheetKey === "dob"} onClose={onClose} title="Date of birth">
        <DateSelector
          selected={profile.dob}
          onSelect={(date) => setProfile({ ...profile, dob: date })}
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
