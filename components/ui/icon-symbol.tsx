// Copyright © Knoux. All rights reserved.
// Full Android + iOS + Web compatible icon component
// Maps SF Symbol names → Material Icons names

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSymbolName = string;

const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>["name"]> = {
  // Navigation
  "house.fill": "home",
  "gearshape.fill": "settings",
  "person.fill": "person",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  // Media
  "video.fill": "videocam",
  "mic.fill": "mic",
  "antenna.radiowaves.left.and.right": "broadcast-on-personal",
  "wand.and.stars": "auto-fix-high",
  "cloud.fill": "cloud",
  "cloud.upload": "cloud-upload",
  // AI & Effects
  "sparkles": "auto-awesome",
  "face.smiling": "face-retouching-natural",
  "chart.bar": "bar-chart",
  "star.fill": "star",
  "headphones": "headphones",
  "creditcard.fill": "credit-card",
  "bubble.left.fill": "chat",
  "slider.horizontal.3": "dashboard",
  "paintbrush.fill": "brush",
  "camera.metering.multispot": "camera-enhance",
  // Misc
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "bell.fill": "notifications",
  "lock.fill": "lock",
  "info.circle.fill": "info",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "heart.fill": "favorite",
  "bookmark.fill": "bookmark",
  "share": "share",
  "trash.fill": "delete",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] ?? "help-outline";
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
