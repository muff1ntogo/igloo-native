import type { MetricKey, Status } from "./igloo-data";

/** Pre-computed radius scale from web `--radius: 1.25rem` (20px). RN has no calc(). */
export const RADIUS = {
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  "2xl": 28,
  "3xl": 32,
  "4xl": 36,
  card: 22,
} as const;

/** Named shadows from the web design system. */
export const SHADOW = {
  soft: {
    shadowColor: "#123247",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  lift: {
    shadowColor: "#186787",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

/**
 * Flat hex tokens. oklch tints converted with culori (formatHex).
 * Core metric/status hexes match `igloo-report.ts`.
 */
export const COLORS = {
  background: "#EFF7F9",
  foreground: "#123247",
  card: "#FFFFFF",
  border: "#DCEAEE",
  input: "#DCEAEE",
  muted: "#E3F1F5",
  mutedForeground: "#5C7E8C",
  primary: "#186787",
  primaryForeground: "#FFFFFF",
  primaryTint: "#E3F1F5",
  brandMid: "#2087A8",
  brandLight: "#2FC1D3",
  sun: "#FCD462",
  sunTint: "#FBEFC6",
  destructive: "#B03D3D",
  bp: "#B14A62",
  bpTint: "#FEE8EB",
  hr: "#C17A3B",
  hrTint: "#FDECDE",
  ox: "#2C7A78",
  oxTint: "#DFF3F2",
  glu: "#6B5B95",
  gluTint: "#EFECFC",
  good: "#457A5C",
  goodTint: "#E3F3E9",
  watch: "#B0813A",
  watchTint: "#FBEEDD",
  urgent: "#B03D3D",
  urgentTint: "#FFE8E5",
} as const;

export const METRIC_HEX: Record<MetricKey, string> = {
  bp: COLORS.bp,
  hr: COLORS.hr,
  ox: COLORS.ox,
  glu: COLORS.glu,
};

export const METRIC_TINT: Record<MetricKey, string> = {
  bp: COLORS.bpTint,
  hr: COLORS.hrTint,
  ox: COLORS.oxTint,
  glu: COLORS.gluTint,
};

export const STATUS_HEX: Record<Status, string> = {
  good: COLORS.good,
  watch: COLORS.watch,
  urgent: COLORS.urgent,
};

export const STATUS_TINT: Record<Status, string> = {
  good: COLORS.goodTint,
  watch: COLORS.watchTint,
  urgent: COLORS.urgentTint,
};
