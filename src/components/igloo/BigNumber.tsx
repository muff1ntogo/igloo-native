import { View, Text } from "react-native";
import { cn } from "@lib/utils";

interface BigNumberProps {
  value: string;
  unit: string;
  className?: string;
  valueClassName?: string;
  unitClassName?: string;
}

export function BigNumber({
  value,
  unit,
  className,
  valueClassName,
  unitClassName,
}: BigNumberProps) {
  return (
    <View className={cn("flex-row items-baseline", className)}>
      <Text
        className={cn(
          "font-serif text-3xl leading-none tracking-tight text-foreground",
          valueClassName,
        )}
      >
        {value}
      </Text>
      <Text
        className={cn(
          "ml-1.5 font-sans text-xs font-semibold text-muted-foreground",
          unitClassName,
        )}
      >
        {unit}
      </Text>
    </View>
  );
}
