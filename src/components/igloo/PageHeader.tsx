import { View, Text } from "react-native";
import { cn } from "@lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  right,
  className,
}: PageHeaderProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between px-5 pb-3",
        className,
      )}
    >
      <View className="flex-1">
        <Text className="font-serif text-2xl font-bold tracking-tight text-foreground">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 font-sans text-xs font-semibold text-muted-foreground">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View className="ml-3 flex-row items-center">{right}</View> : null}
    </View>
  );
}
