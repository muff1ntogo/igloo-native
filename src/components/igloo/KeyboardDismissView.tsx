import React from "react";
import { Keyboard, PanResponder, StyleProp, View, ViewStyle } from "react-native";

interface KeyboardDismissViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function KeyboardDismissView({ children, style }: KeyboardDismissViewProps) {
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminate: () => Keyboard.dismiss(),
      onMoveShouldSetPanResponder: (_e, { dx, dy }) => {
        // Don't dismiss on scroll gestures (small movement)
        const isScroll = Math.abs(dx) < 10 && Math.abs(dy) < 10;
        return !isScroll;
      },
      onPanResponderRelease: (_e, { dx, dy }) => {
        const isScroll = Math.abs(dx) < 10 && Math.abs(dy) < 10;
        if (!isScroll) Keyboard.dismiss();
      },
    })
  ).current;

  return (
    <View style={style} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

