import { View, StyleProp, ViewStyle } from "react-native";
import { cn } from "@lib/utils";

interface CardProps extends React.PropsWithChildren<{ className?: string; style?: StyleProp<ViewStyle> }> {}

export function Card({ children, className, style }: CardProps) {
  return (
    <View
      style={style}
      className={cn(
        "bg-card rounded-card border border-border",
        "shadow-card",
        className,
      )}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className, style }: CardProps) {
  return <View style={style} className={cn("p-5 pb-0", className)}>{children}</View>;
}

export function CardContent({ children, className, style }: CardProps) {
  return <View style={style} className={cn("p-5", className)}>{children}</View>;
}

export function CardFooter({ children, className, style }: CardProps) {
  return <View style={style} className={cn("p-5 pt-0", className)}>{children}</View>;
}
