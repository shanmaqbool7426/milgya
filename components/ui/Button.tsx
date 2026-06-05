import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getBg = () => {
    if (disabled) return colors.muted;
    switch (variant) {
      case "primary": return colors.primary;
      case "secondary": return colors.secondary;
      case "outline": return "transparent";
      case "ghost": return "transparent";
      case "destructive": return colors.destructive;
      case "accent": return colors.accent;
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.mutedForeground;
    switch (variant) {
      case "primary": return colors.primaryForeground;
      case "secondary": return colors.secondaryForeground;
      case "outline": return colors.primary;
      case "ghost": return colors.primary;
      case "destructive": return colors.destructiveForeground;
      case "accent": return colors.accentForeground;
      default: return colors.primaryForeground;
    }
  };

  const getBorder = () => {
    if (variant === "outline") return { borderWidth: 1.5, borderColor: colors.primary };
    return {};
  };

  const getPadding = () => {
    switch (size) {
      case "sm": return { paddingVertical: 8, paddingHorizontal: 16 };
      case "md": return { paddingVertical: 14, paddingHorizontal: 20 };
      case "lg": return { paddingVertical: 18, paddingHorizontal: 28 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm": return 13;
      case "md": return 15;
      case "lg": return 17;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        { backgroundColor: getBg(), borderRadius: colors.radius },
        getBorder(),
        getPadding(),
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
