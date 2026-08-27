import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { cn } from "@lib/utils";
import type { Status } from "@lib/igloo-data";
import { COLORS } from "@lib/tokens";

/**
 * Igloo's mascot: a small round-shelled tortoise with a brand-blue shell.
 * Three calm expression states. Reusable anywhere a status needs a friendly face.
 * A soft yellow glow appears behind the tortoise when status is "good".
 */
export function Tortoise({
  status,
  size = "md",
  className,
}: {
  status: Status;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(false);
    const t = setTimeout(() => setShown(true), 20);
    return () => clearTimeout(t);
  }, [status]);

  const dims = size === "lg" ? 96 : size === "sm" ? 44 : 64;
  const px = size === "lg" ? "size-24" : size === "sm" ? "size-11" : "size-16";

  return (
    <View
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-all duration-300 ease-out",
        shown ? "scale-100 opacity-100" : "scale-90 opacity-0",
        className,
      )}
    >
      {/* Yellow glow behind tortoise when status is good */}
      {status === "good" && (
        <View
          className={cn(
            "absolute rounded-full bg-sun-tint opacity-60",
            size === "lg" ? "-inset-3" : size === "sm" ? "-inset-1" : "-inset-2",
          )}
          aria-hidden={true}
        />
      )}

      <Svg
        viewBox="0 0 96 80"
        width={dims}
        height={dims}
        className={cn(px, "transition-transform duration-300")}
        role="img"
        aria-label={`Tortoise mascot, ${status} status`}
      >
        {/* body */}
        <Path
          d="M14 60c0-16 14-28 32-28s32 12 32 28z"
          fill={COLORS.primary}
          opacity="0.16"
        />
        {/* shell - brand blue */}
        <Path
          d="M18 58c0-17 13-30 28-30s28 13 28 30z"
          fill={COLORS.primary}
          opacity="0.9"
        />
        {/* shell plates */}
        <G stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.85">
          <Path d="M46 28v30" />
          <Path d="M28 44c8-3 28-3 36 0" />
        </G>
        {/* legs */}
        <Rect x="24" y="56" width="12" height="8" rx="4" fill={COLORS.primary} opacity="0.55" />
        <Rect x="56" y="56" width="12" height="8" rx="4" fill={COLORS.primary} opacity="0.55" />
        {/* head */}
        <G
          transform={
            status === "watch"
              ? "translate(2,-2) rotate(-8 82 50)"
              : ""
          }
        >
          <Rect
            x="70"
            y="40"
            width="20"
            height="18"
            rx="9"
            fill={COLORS.primary}
            opacity="0.62"
          />
          {status === "urgent" ? (
            <G stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round">
              <Path d="M76 47.5h3.4" />
              <Path d="M83.6 47.5H87" />
              <Path
                d="M78 54c2.4-2 5-2 7 0"
                strokeWidth="2.2"
                fill="none"
              />
            </G>
          ) : (
            <G>
              <Circle cx="78" cy="47" r="1.7" fill="#FFFFFF" />
              <Circle cx="86" cy="47" r="1.7" fill="#FFFFFF" />
              <Path
                d={
                  status === "good"
                    ? "M78 52c2.5 2.4 5 2.4 7.5 0"
                    : "M78.5 52.5h6.5"
                }
                stroke="#FFFFFF"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
            </G>
          )}
        </G>
      </Svg>
    </View>
  );
}