import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface QuickActionProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

export function QuickAction({ icon, label, color, onPress }: QuickActionProps) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.container}>
      <View style={[styles.icon, { backgroundColor: `${color}18`, borderRadius: colors.radius }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  icon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textAlign: "center",
  },
});
