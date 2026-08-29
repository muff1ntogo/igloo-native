import React, { useRef, useCallback, useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 64) / 3;
const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(m: number, y: number) {
  return new Date(y, m + 1, 0).getDate();
}

type WheelDatePickerProps = {
  selectedDate?: string;
  onSelect: (date: string) => void;
  maxYear?: number;
  minYear?: number;
};

function scrollTo(ref: React.RefObject<ScrollView | null>, index: number) {
  ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
}

export function WheelDatePicker({
  selectedDate,
  onSelect,
  maxYear = new Date().getFullYear(),
  minYear = 1900,
}: WheelDatePickerProps) {
  const monthRef = useRef<ScrollView>(null);
  const dayRef = useRef<ScrollView>(null);
  const yearRef = useRef<ScrollView>(null);

  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(1);
  const [year, setYear] = useState(maxYear);

  useEffect(() => {
    if (selectedDate) {
      const m = selectedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        const mi = parseInt(m[2], 10) - 1;
        const di = parseInt(m[3], 10);
        const yi = parseInt(m[1], 10);
        setMonth(mi);
        setDay(di);
        setYear(yi);
        setTimeout(() => {
          scrollTo(monthRef, mi);
          scrollTo(dayRef, di - 1);
          scrollTo(yearRef, maxYear - yi);
        }, 50);
      }
    }
  }, [selectedDate, maxYear]);

  const dayCount = useMemo(() => daysInMonth(month, year), [month, year]);
  const yearRange = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [maxYear, minYear]
  );

  const notify = useCallback((m: number, d: number, y: number) => {
    const safeDay = Math.min(d, daysInMonth(m, y));
    const str = `${y}-${String(m + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
    onSelect(str);
  }, [onSelect]);

  const handleMonthEnd = useCallback((i: number) => {
    setMonth(i);
    const newDays = daysInMonth(i, year);
    if (day > newDays) { setDay(newDays); scrollTo(dayRef, newDays - 1); }
    notify(i, day, year);
  }, [year, day, notify]);

  const handleDayEnd = useCallback((i: number) => {
    setDay(i + 1);
    notify(month, i + 1, year);
  }, [month, year, notify]);

  const handleYearEnd = useCallback((i: number) => {
    const y = yearRange[i];
    setYear(y);
    const newDays = daysInMonth(month, y);
    if (day > newDays) { setDay(newDays); scrollTo(dayRef, newDays - 1); }
    notify(month, day, y);
  }, [month, day, yearRange, notify]);

  const renderCol = (
    items: string[],
    idx: number,
    onEnd: (i: number) => void,
    ref: React.RefObject<ScrollView | null>
  ) => (
    <View style={{ width: COLUMN_WIDTH }}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.scroll}
        onScrollEndDrag={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          onEnd(Math.max(0, Math.min(i, items.length - 1)));
        }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          onEnd(Math.max(0, Math.min(i, items.length - 1)));
        }}
      >
        <View style={stylesSpacer.top} />
        {items.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text className={[
              "font-sans text-center",
              i === idx ? "text-foreground font-bold text-base" : "text-muted-foreground text-sm",
            ].join(" ")}>{item}</Text>
          </View>
        ))}
        <View style={stylesSpacer.bottom} />
      </ScrollView>
      <View style={styles.highlight} pointerEvents="none" />
    </View>
  );

  return (
    <View>
      <View className="bg-primary-tint/60 rounded-xl px-4 py-3 items-center mb-5">
        <Text className="font-serif text-base font-semibold text-foreground">
          {MONTHS[month]} {day}, {year}
        </Text>
      </View>
      <View className="flex-row justify-center">
        {renderCol(MONTHS, month, handleMonthEnd, monthRef)}
        {renderCol(
          Array.from({ length: dayCount }, (_, i) => String(i + 1)),
          day - 1,
          handleDayEnd,
          dayRef
        )}
        {renderCol(
          yearRange.map(String),
          maxYear - year,
          handleYearEnd,
          yearRef
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { height: ITEM_HEIGHT * VISIBLE_ITEMS },
  item: { height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" },
  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(227,241,245,0.7)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#DCEAEE",
  },
});

const stylesSpacer = StyleSheet.create({
  top: { height: ITEM_HEIGHT * 2 },
  bottom: { height: ITEM_HEIGHT * 2 },
});

export type { WheelDatePickerProps };
