import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import {
  METRIC_ORDER,
  type MedLog,
  type MetricKey,
  type Reading,
  type Status,
} from "./igloo-data";

type TextSize = "small" | "medium" | "large";
type ReminderFrequency = "once" | "twice" | "three" | "four";
type DeviceConnectionStatus = "connected" | "not-connected" | "syncing";

type Store = {
  session: import("@supabase/supabase-js").Session | null;
  user: import("@supabase/supabase-js").User | null;
  authLoading: boolean;
  readings: Reading[];
  readingsLoading: boolean;
  addReading: (r: Omit<Reading, "id">) => Promise<void>;
  meds: MedLog[];
  medsLoading: boolean;
  addMed: (m: Omit<MedLog, "id">) => Promise<void>;
  simpleView: boolean;
  setSimpleView: (v: boolean) => void;
  shared: Record<MetricKey, boolean>;
  toggleShared: (m: MetricKey) => void;
  alertDismissed: boolean;
  dismissAlert: () => void;
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
  addSlot: { dayKey: string; hour: number } | null;
  openAdd: (slot?: { dayKey: string; hour: number }) => void;
  profile: { name: string; dob: string };
  setProfile: (p: { name: string; dob: string }) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  wantsHealthSync: boolean;
  signOut: () => Promise<void>;
  preferences: {
    textSize: TextSize;
    reminderFrequency: ReminderFrequency;
    wristMonitorStatus: DeviceConnectionStatus;
    healthAppStatus: DeviceConnectionStatus;
  };
  setPreferences: (patch: Partial<Store["preferences"]>) => void;
};

const IglooContext = createContext<Store | null>(null);

const STORAGE_KEY_SIMPLE_VIEW = "igloo-simple-view";
const STORAGE_KEY_PREFERENCES = "igloo-prefs";
const STORAGE_KEY_ONBOARDING = "igloo-onboarding-complete";

const DEFAULT_PREFERENCES: Store["preferences"] = {
  textSize: "large",
  reminderFrequency: "three",
  wristMonitorStatus: "connected",
  healthAppStatus: "syncing",
};

export function IglooProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [readingsLoading, setReadingsLoading] = useState(false);
  const [meds, setMeds] = useState<MedLog[]>([]);
  const [medsLoading, setMedsLoading] = useState(false);
  const [simpleView, setSimpleView] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addSlot, setAddSlot] = useState<{ dayKey: string; hour: number } | null>(null);
  const [shared, setShared] = useState<Record<MetricKey, boolean>>({
    bp: true,
    hr: true,
    ox: false,
    glu: true,
  });
  const [profile, setProfile] = useState<{ name: string; dob: string }>({
    name: "",
    dob: "",
  });
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [wantsHealthSync, setWantsHealthSync] = useState(false);
  const [preferences, setPreferences] =
    useState<Store["preferences"]>(DEFAULT_PREFERENCES);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_SIMPLE_VIEW).then((s) => {
      if (s !== null) setSimpleView(s === "true");
    });
    AsyncStorage.getItem(STORAGE_KEY_PREFERENCES).then((s) => {
      if (s !== null) {
        try { setPreferences(JSON.parse(s)); } catch { /* ignore */ }
      }
    });
    AsyncStorage.getItem(STORAGE_KEY_ONBOARDING).then((s) => {
      if (s === "true") setOnboardingComplete(true);
    });
    AsyncStorage.getItem("igloo-wants-health-sync").then((s) => {
      if (s === "true") setWantsHealthSync(true);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY_SIMPLE_VIEW, String(simpleView));
  }, [simpleView]);
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(preferences));
  }, [preferences]);
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY_ONBOARDING, String(onboardingComplete));
  }, [onboardingComplete]);
  useEffect(() => {
    AsyncStorage.setItem("igloo-wants-health-sync", String(wantsHealthSync));
  }, [wantsHealthSync]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        setAuthLoading(false);
      });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) { setProfile({ name: "", dob: "" }); return; }
    supabase
      .from("profiles")
      .select("name, dob")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) { console.warn("[Igloo] Load profile error:", error.message); return; }
        if (data) {
          setProfile(data);
          if (!data.dob) setOnboardingComplete(false);
          else setOnboardingComplete(true);
        }
      });
  }, [user?.id]);

  const loadReadings = useCallback(async (userId: string) => {
    setReadingsLoading(true);
    const { data, error } = await supabase
      .from("readings")
      .select("*")
      .eq("user_id", userId)
      .order("at", { ascending: false });
    setReadingsLoading(false);
    if (error) { console.warn("[Igloo] Load readings error:", error.message); return; }
    setReadings((data ?? []).map((r) => ({
      id: r.id, metric: r.metric as MetricKey, value: r.value,
      status: r.status as Status, method: r.method as import("./igloo-data").Method, at: r.at,
    })));
  }, []);

  const loadMeds = useCallback(async (userId: string) => {
    setMedsLoading(true);
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .order("at", { ascending: false });
    setMedsLoading(false);
    if (error) { console.warn("[Igloo] Load meds error:", error.message); return; }
    setMeds((data ?? []).map((m) => ({
      id: m.id, name: m.name, dose: m.dose,
      method: m.method as import("./igloo-data").MedMethod, at: m.at, photo: m.photo ?? false,
    })));
  }, []);

  useEffect(() => {
    if (!user?.id) { setReadings([]); setMeds([]); return; }
    loadReadings(user.id);
    loadMeds(user.id);
  }, [user?.id, loadReadings, loadMeds]);

  const addReading = useCallback(async (r: Omit<Reading, "id">) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("readings")
      .insert({ user_id: user.id, metric: r.metric, value: r.value, status: r.status, method: r.method, at: r.at })
      .select()
      .single();
    if (error) {
      console.warn("[Igloo] Add reading error:", error.message);
      setReadings((prev) => [{ ...r, id: `r-${Date.now()}` }, ...prev]);
      return;
    }
    if (data) setReadings((prev) => [{ id: data.id, metric: data.metric as MetricKey, value: data.value, status: data.status as Status, method: data.method as import("./igloo-data").Method, at: data.at }, ...prev]);
  }, [user?.id]);

  const addMed = useCallback(async (m: Omit<MedLog, "id">) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("medications")
      .insert({ user_id: user.id, name: m.name, dose: m.dose, method: m.method, at: m.at, photo: m.photo ?? false })
      .select()
      .single();
    if (error) {
      console.warn("[Igloo] Add med error:", error.message);
      setMeds((prev) => [{ ...m, id: `m-${Date.now()}` }, ...prev]);
      return;
    }
    if (data) setMeds((prev) => [{ id: data.id, name: data.name, dose: data.dose, method: data.method as import("./igloo-data").MedMethod, at: data.at, photo: data.photo ?? false }, ...prev]);
  }, [user?.id]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<Store>(() => ({
    session, user, authLoading,
    readings, readingsLoading, addReading,
    meds, medsLoading, addMed,
    simpleView, setSimpleView,
    shared, toggleShared: (m) => setShared((p) => ({ ...p, [m]: !p[m] })),
    alertDismissed, dismissAlert: () => setAlertDismissed(true),
    addOpen, setAddOpen: (v) => { if (!v) setAddSlot(null); setAddOpen(v); },
    addSlot, openAdd: (slot) => { setAddSlot(slot ?? null); setAddOpen(true); },
    profile, setProfile,
    onboardingComplete, setOnboardingComplete,
    wantsHealthSync,
    signOut,
    preferences, setPreferences: (patch) => setPreferences((p) => ({ ...p, ...patch })),
  }), [session, user, authLoading, readings, readingsLoading, addReading, meds, medsLoading, addMed, simpleView, shared, alertDismissed, addOpen, addSlot, profile, onboardingComplete, wantsHealthSync, signOut, preferences]);

  return <IglooContext.Provider value={value}>{children}</IglooContext.Provider>;
}

export function useIgloo() {
  const ctx = useContext(IglooContext);
  if (!ctx) throw new Error("useIgloo must be used inside IglooProvider");
  return ctx;
}

export function useLatest() {
  const { readings } = useIgloo();
  return useMemo(() => {
    const out = {} as Record<MetricKey, Reading | undefined>;
    for (const m of METRIC_ORDER) out[m] = readings.find((r) => r.metric === m);
    return out;
  }, [readings]);
}

export function worstStatus(list: (Status | undefined)[]): Status {
  if (list.includes("urgent")) return "urgent";
  if (list.includes("watch")) return "watch";
  return "good";
}
