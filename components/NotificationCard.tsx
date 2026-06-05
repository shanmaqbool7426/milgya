import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Notification } from "@/constants/types";

interface NotificationCardProps {
  item: Notification;
  onPress: () => void;
}

const TYPE_META: Record<string, { icon: string; color: string }> = {
  match: { icon: "zap", color: "#F59E0B" },
  recovery: { icon: "check-circle", color: "#10B981" },
  alert: { icon: "alert-triangle", color: "#EF4444" },
  update: { icon: "info", color: "#3B82F6" },
};

export function NotificationCard({ item, onPress }: NotificationCardProps) {
  const colors = useColors();
  const meta = TYPE_META[item.type] ?? TYPE_META.update;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: item.isRead ? colors.card : `${meta.color}0A`,
          borderRadius: colors.radius,
          borderColor: item.isRead ? colors.border : `${meta.color}30`,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${meta.color}18`, borderRadius: 10 }]}>
        <Feather name={meta.icon as any} size={18} color={meta.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
          {!item.isRead && (
            <View style={[styles.dot, { backgroundColor: meta.color }]} />
          )}
        </View>
        <Text style={[styles.message, { color: colors.mutedForeground }]}>{item.message}</Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
});
