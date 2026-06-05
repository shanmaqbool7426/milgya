import React from "react";
import { View, Text, Image, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ name, uri, size = 40, style }: AvatarProps) {
  const colors = useColors();
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const bgColors = [
    "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B",
    "#EF4444", "#EC4899", "#06B6D4", "#1B4DDE",
  ];
  const bgColor = bgColors[name.charCodeAt(0) % bgColors.length];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: uri ? "transparent" : bgColor,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.38, color: "#FFFFFF" }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    fontFamily: "Inter_700Bold",
  },
});
