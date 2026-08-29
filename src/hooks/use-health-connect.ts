import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HealthKit from "react-native-health";

type ConnectionStatus = "connected" | "not-connected" | "syncing";

const READ_PERMISSIONS = [
  HealthKit.Constants.Permissions.HeartRate,
  HealthKit.Constants.Permissions.Weight,
  HealthKit.Constants.Permissions.Height,
  HealthKit.Constants.Permissions.StepCount,
  HealthKit.Constants.Permissions.BloodPressureSystolic,
  HealthKit.Constants.Permissions.BloodPressureDiastolic,
  HealthKit.Constants.Permissions.OxygenSaturation,
  HealthKit.Constants.Permissions.BloodGlucose,
];

export function useHealthConnect(): {
  status: ConnectionStatus;
  connect: () => Promise<void>;
} {
  const [status, setStatus] = useState<ConnectionStatus>("syncing");

  useEffect(() => {
    if (Platform.OS !== "ios") {
      setStatus("not-connected");
      return;
    }
    AsyncStorage.getItem("igloo-health-conn-status").then((stored) => {
      if (stored === "connected" || stored === "not-connected") {
        setStatus(stored as ConnectionStatus);
      }
    });
  }, []);

  const connect = useCallback(async () => {
    if (Platform.OS !== "ios") {
      setStatus("not-connected");
      return;
    }

    const stored = await AsyncStorage.getItem("igloo-health-conn-status");
    if (stored === "connected" || stored === "not-connected") {
      setStatus(stored as ConnectionStatus);
      return;
    }

    setStatus("syncing");

    let available = true;
    try {
      await new Promise<void>((resolve) => {
        HealthKit.isAvailable((_err: unknown, result: boolean) => resolve());
      });
    } catch {
      available = false;
    }

    if (!available) {
      setStatus("not-connected");
      await AsyncStorage.setItem("igloo-health-conn-status", "not-connected");
      return;
    }

    await new Promise<void>((resolve) => {
      HealthKit.initHealthKit(
        { permissions: { read: READ_PERMISSIONS as any, write: [] as any } },
        (error: string | null) => {
          if (error) {
            console.warn("[Igloo] HealthKit init error:", error);
            AsyncStorage.setItem("igloo-health-conn-status", "not-connected").then(resolve);
          } else {
            AsyncStorage.setItem("igloo-health-conn-status", "connected").then(resolve);
          }
          if (error) {
            setStatus("not-connected");
          } else {
            setStatus("connected");
          }
        },
      );
    });
  }, []);

  return { status, connect };
}