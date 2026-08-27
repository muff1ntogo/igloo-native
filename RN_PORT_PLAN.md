# Igloo → React Native Port: Build Plan

Written by Claude from a direct read of `muff1ntogo/igloo` (main branch) plus
current library research — not from a description of the app, the actual
source. Cline: treat this as ground truth over any assumptions about what a
typical Lovable/shadcn project looks like. Where this plan says "verified,"
it was read directly from a file in this repo; where it says "decided," it's
a call made for you, with reasoning, so Act mode shouldn't need to
re-litigate it; where it says "verify," it's a real open question for you to
resolve — with tool access, not a guess.

---

## 1. What the current app actually is (verified)

Not a plain Vite SPA — it's **TanStack Start** (`@tanstack/react-start` +
`@tanstack/react-router`), file-based routing, with `src/server.ts` /
`src/start.ts` for SSR plumbing. **None of the SSR/server layer has an RN
equivalent and none of it needs porting** — only the client component tree
and the plain-TypeScript logic in `src/lib/` matter here.

Full current stack: React 19.2, Tailwind CSS v4.2.1 (CSS-native `@theme`
config, not `tailwind.config.js`), shadcn/ui components on Radix primitives,
recharts, `@react-pdf/renderer` + `html2canvas` for the report feature,
`react-hook-form` + `zod`, `date-fns`, `vaul` (bottom sheets), `embla-carousel-react`
(the log's horizontal strip), `sonner` (toasts). No Supabase client installed
yet — the app still runs on in-memory mock data via React Context.

Route map: `index.tsx` (Dashboard), `log.tsx`, `family.tsx`, `profile.tsx`,
`metric.$metric.tsx` (one parameterized Metric Detail route — confirmed
built as a single reusable template, not four separate pages).

App-specific components, all in `src/components/igloo/`: `AddSheet.tsx`,
`TabBar.tsx`, `Toggle.tsx`, `Tortoise.tsx` (the mascot), `ReportDocument.tsx`
(react-pdf JSX), `report-chart.tsx`, `ui.tsx`. Everything else in
`src/components/ui/` is stock shadcn — not app-specific, doesn't need
line-by-line porting, just RN-equivalent primitives where actually used.

This repo has a Lovable sync connection (`AGENTS.md`) — if you're working in
a separate `igloo-native` folder as recommended below, that connection is
irrelevant to this work; don't touch or worry about it.

---

## 2. Design tokens (verified — read directly from `src/styles.css` and
`src/lib/igloo-report.ts`)

Two different color formats are in play, and this matters a lot for the
port:

**Already plain hex — use directly, no conversion:**
```
background   #EFF7F9      primary (brand)   #186787
foreground   #123247      primary-tint      #E3F1F5
card         #FFFFFF      brand-mid         #2087A8
border/input #DCEAEE      brand-light       #2FC1D3
muted-fg     #5C7E8C      sun (accent)      #FCD462
                          sun-tint          #FBEFC6
```

**Defined in oklch() in the CSS — React Native cannot parse oklch strings
at all, these need real hex.** The good news: hex equivalents for the core
color already exist, computed by whoever built the report feature, in
`src/lib/igloo-report.ts` (`METRIC_HEX`, `STATUS_HEX`) — reuse those
directly rather than re-deriving:
```
bp      #B14A62   good    #457A5C
hr      #C17A3B   watch   #B0813A
ox      #2C7A78   urgent  #B03D3D
glu     #6B5B95
```
**Verify during Act mode:** the seven *-tint variants (`bp-tint`, `hr-tint`,
`ox-tint`, `glu-tint`, `good-tint`, `watch-tint`, `urgent-tint`) only exist
as oklch in the CSS — no hex version exists anywhere in the codebase yet.
Convert them properly (e.g. with the `culori` package) rather than
eyeballing an approximation; these are icon-chip and log-block backgrounds,
visible everywhere.

**Fonts (verified):** `Manrope` (sans) and `Fraunces` (serif) are real
Google Fonts, not a system stack. Use `@expo-google-fonts/manrope` and
`@expo-google-fonts/fraunces` with `expo-font` so the RN version keeps the
same typographic identity rather than falling back to system fonts.

**Radius/shadow system (verified):** a systematic radius scale
(`--radius: 1.25rem` with sm/md/lg/xl/2xl/3xl/4xl derived from it) and two
named shadows — `shadow-soft` (cards) and `shadow-lift` (a brand-blue-tinted
shadow, specifically on the elevated "+" tab button). Port both as plain JS
constants; RN has no `calc()`, so pre-compute the radius scale once.

---

## 3. Data model (verified — `src/lib/igloo-data.ts`,
`igloo-metric-detail.ts`)

- Metric keys are **`bp` / `hr` / `ox` / `glu`** — not `spo2`/`glucose`.
  Use these exact keys everywhere for consistency with the existing repo
  (and with the Supabase schema, which should match).
- `Reading.value` is a **plain string**, e.g. `"132/86"` for blood pressure,
  `"78"` for everything else. A `numericValue(metric, value)` helper
  already parses this (takes the number before `/` for bp). **Decision:**
  the Supabase `readings` table should still store real numeric columns
  (`systolic`, `diastolic` nullable, `value` for single-value metrics)
  rather than carrying the string-parsing forward into the database layer
  — parse once on write, not on every read. Keep `numericValue` in the RN
  codebase anyway for anything still reading legacy-shaped data.
- `Reading.at` / `MedLog.at` are **local time strings without timezone**,
  format `YYYY-MM-DDTHH:mm` — not full ISO, no `Z`, no offset. The
  Supabase schema should use a real `timestamptz` and stop carrying this
  format forward — this is a caregiving app with family members who may be
  in different timezones; naive local strings will misrepresent "when"
  something happened to anyone not in the patient's timezone.
- Reference ranges, zones, and personal targets are fully modeled per
  metric in `METRIC_DETAIL` (`igloo-metric-detail.ts`) — `zones[]` with
  `name`/`from`/`to`/`status`, plus an optional `target`. This is real,
  already-written business logic, not something to redesign.
- All app state currently lives in **one React Context** (`IglooProvider` /
  `useIgloo` in `igloo-store.tsx`) — readings, meds, `simpleView` (persisted
  to `localStorage`), per-metric `shared` booleans, `addOpen`/`addSlot`,
  and `profile` (`name`, `dob` — already added). The shape of this store is
  a good reference for what the RN data layer needs to expose, even though
  the implementation underneath is changing (see §5).

---

## 4. Stack decisions for the RN port

**Expo, managed workflow to start** — TypeScript throughout, Expo Router
(maps directly onto the existing route file names above), moving to a
custom dev client only once a feature actually requires it (camera,
HealthKit/Health Connect later).

**NativeWind v4 paired with Tailwind CSS v3 — not v4.** This is a real
incompatibility, not a preference: the web app is on Tailwind v4's
CSS-native `@theme` config, but the current production-stable NativeWind
(v4) is built for Tailwind v3's JS-config architecture. Mixing them
silently drops all styling rather than erroring loudly. A NativeWind v5
preview aligns with Tailwind v4 but isn't the recommended default yet.
Port the token *values* above into a `tailwind.config.js`
`theme.extend.colors` block (flat hex, matching the names in §2), not an
attempt to reuse the web app's CSS file directly.

**React Native Reusables** for component primitives — chosen specifically
because it mirrors shadcn/ui's naming and composition pattern, which is
what the web app's `src/components/ui/` already uses; this keeps component
names recognizable across both codebases.

**lucide-react-native** for icons — direct RN equivalent of the
`lucide-react` set already in use, same icon names.

**Victory Native** for charts (not recharts, which is web-only; not
react-native-chart-kit, which is a lighter SVG option but the weaker
long-term pick). Victory Native renders via React Native Skia, GPU-accelerated,
under active development, and is the consistent recommendation across
current sources for anything beyond the simplest static chart — this app
needs multi-series charts (systolic/diastolic together) and value-labeled
points, which is exactly what it's built for. It pulls in three peer
dependencies — `react-native-skia`, `react-native-reanimated`,
`react-native-gesture-handler` — all Expo-installable without a custom dev
client.

**Supabase + TanStack Query for the data layer, from the start — not mock
data carried forward and swapped later.** `@tanstack/react-query` is
already a dependency in the current web app, works identically in RN, and
the Supabase schema for this app is already designed (`profiles`,
`readings`, `medications`, `family_connections`, `sharing_permissions`,
with RLS gating caregiver reads by the permissions table). Porting the
mock-data Context first and swapping it for Supabase later is double work
for no benefit here — go straight to the real data layer. Keep a small
Context (or Zustand, either is fine) only for pure UI state that has no
business being in a database: `simpleView`, `addOpen`/`addSlot`,
`alertDismissed`.

**Reports: `expo-print` + `expo-sharing`, not a port of
`@react-pdf/renderer`.** These are architecturally different approaches,
not just different libraries — react-pdf builds a PDF from React
components; expo-print takes an HTML string and hands it to the platform's
native print engine. The actual porting work is: keep `igloo-report.ts`
almost as-is (it's pure data-shaping logic, no React or DOM dependency,
already framework-agnostic), and rewrite `ReportDocument.tsx` as a function
that returns an HTML string (template literal + inline `<style>`) instead
of JSX. For chart images, `react-native-view-shot`'s `captureRef()` is the
direct analog of the web version's `html2canvas` — snapshot the rendered
Victory Native chart to an image URI. **Verify:** on iOS, `expo-print`
can't load local image file URIs into the HTML (a WKWebView limitation) —
images have to be inlined as base64 data URIs. Confirm this is handled
before considering the report feature done; it's the kind of thing that
works fine on Android and silently shows a blank chart on iOS if missed.

---

## 5. What ports directly vs. what gets rewritten

**Copy over with little to no change** (pure TypeScript, zero DOM/React-web
dependency, verified by direct read):
- `src/lib/igloo-data.ts` — types and constants (not the mock arrays,
  which get replaced by real Supabase data)
- `src/lib/igloo-metric-detail.ts` — zones, targets, `numericValue`,
  `zoneFor`, `rollingAverage`, all of it
- `src/lib/igloo-report.ts` — the data-shaping logic (not the rendering)
- Any `zod` validation schemas used with the Add-sheet forms

**Needs a full rewrite, not a port** (every `.tsx` file under
`src/components/` and `src/routes/` — Tailwind-for-web JSX doesn't run in
RN regardless of how similar it looks):
- All six screens, `AddSheet.tsx`, `TabBar.tsx`, `Toggle.tsx`,
  `Tortoise.tsx`, `report-chart.tsx`, `ReportDocument.tsx`

**Needs a different library entirely, not a like-for-like swap:**
| Web (current)          | RN equivalent                          |
|-------------------------|-----------------------------------------|
| `vaul` (bottom sheet)   | `@gorhom/bottom-sheet`                  |
| `embla-carousel-react`  | native `ScrollView`/`FlatList` paging, or `react-native-reanimated-carousel` |
| `sonner` (toasts)       | any RN toast lib (e.g. `react-native-toast-message`) |
| `html2canvas`           | `react-native-view-shot`                |
| `@react-pdf/renderer`   | `expo-print` (HTML string) — see §4     |
| recharts                | Victory Native — see §4                 |

---

## 6. Staged build order

1. **Scaffold** — Expo + TS + Router + NativeWind v4/Tailwind v3 config,
   tokens from §2 ported into `tailwind.config.js`, fonts loaded via
   `expo-font`.
2. **Primitives** — Card, Badge, Toggle, TabBar, PulseLine, Tortoise
   (three states), matching the existing component names in
   `src/components/igloo/` where they exist.
3. **Navigation shell** — tab layout matching the five routes in §1.
4. **Data layer** — Supabase client + TanStack Query hooks against the
   real schema; small Context for the UI-only state listed in §4.
5. **Screens**, in order: Dashboard, Log (the week-strip + hour-anchored
   timeline is the most structurally complex piece — budget the most time
   here), Family, Profile, Metric Detail.
6. **Add flow** — Medication/Measurement toggle, Scan (camera + vision-API
   OCR call) and Manual paths, confirm-before-save step.
7. **Simple Mode** — across all six screens, per the existing web spec.
8. **Reports** — `igloo-report.ts` logic + new HTML-template renderer +
   `expo-print`, per §4.
9. **HealthKit / Health Connect** — flag clearly that this requires the
   custom dev client, not Expo Go; last, since it's the one piece that
   changes the whole project's tooling.

Stop after each stage and report back rather than chaining through
multiple stages unprompted — that mapping to Plan/Act mode turns is up to
whoever is running you, not fixed here.
