import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface BadgeProps {
  label: string;
  variant?: "primary" | "accent" | "success" | "warning" | "destructive" | "muted" | "outline";
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function Badge({ label, variant = "primary", size = "sm", style }: BadgeProps) {
  const colors = useColors();

  const getBgColor = () => {
    switch (variant) {
      case "primary": return colors.secondary;
      case "accent": return `${colors.accent}22`;
      case "success": return `${colors.success}22`;
      case "warning": return `${colors.warning}22`;
      case "destructive": return `${colors.destructive}22`;
      case "muted": return colors.muted;
      case "outline": return "transparent";
      default: return colors.secondary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary": return colors.primary;
      case "accent": return colors.accent;
      case "success": return colors.success;
      case "warning": return colors.warning;
      case "destructive": return colors.destructive;
      case "muted": return colors.mutedForeground;
      case "outline": return colors.foreground;
      default: return colors.primary;
    }
  };

  const getBorder = () => {
    if (variant === "outline") return { borderWidth: 1, borderColor: colors.border };
    return {};
  };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: getBgColor(),
          paddingVertical: size === "sm" ? 3 : 5,
          paddingHorizontal: size === "sm" ? 8 : 12,
          borderRadius: 100,
        },
        getBorder(),
        style,
      ]}
    >
      <Text style={[styles.text, { color: getTextColor(), fontSize: size === "sm" ? 11 : 13 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
