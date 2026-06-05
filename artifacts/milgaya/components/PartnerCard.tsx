import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Badge } from "./ui/Badge";
import type { Partner } from "@/constants/types";

const TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  shop: { icon: "shopping-bag", color: "#8B5CF6", label: "Shop" },
  school: { icon: "book", color: "#3B82F6", label: "School" },
  police: { icon: "shield", color: "#1B4DDE", label: "Police" },
  petrol: { icon: "truck", color: "#F59E0B", label: "Petrol Pump" },
  hospital: { icon: "plus-circle", color: "#EF4444", label: "Hospital" },
  other: { icon: "map-pin", color: "#6B7280", label: "Other" },
};

interface PartnerCardProps {
  partner: Partner;
  onPress: () => void;
}

export function PartnerCard({ partner, onPress }: PartnerCardProps) {
  const colors = useColors();
  const meta = TYPE_META[partner.type] ?? TYPE_META.other;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}
    >
      <View style={[styles.icon, { backgroundColor: `${meta.color}15`, borderRadius: 12 }]}>
        <Feather name={meta.icon as any} size={22} color={meta.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {partner.name}
          </Text>
          {partner.isVerified && (
            <Feather name="check-circle" size={14} color={colors.accent} />
          )}
        </View>
        <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>
          {partner.address}
        </Text>
        <View style={styles.meta}>
          <Badge label={meta.label} variant="muted" />
          <View style={styles.stat}>
            <Feather name="star" size={11} color="#F59E0B" />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{partner.rating}</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="package" size={11} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{partner.totalItems} items</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="navigation" size={11} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>{partner.distance}</Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <View style={[styles.status, { backgroundColor: partner.openNow ? `${colors.success}18` : `${colors.destructive}12` }]}>
          <Text style={[styles.statusText, { color: partner.openNow ? colors.success : colors.destructive }]}>
            {partner.openNow ? "Open" : "Closed"}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
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
    alignItems: "center",
  },
  icon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    flex: 1,
  },
  address: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  right: {
    alignItems: "center",
    gap: 8,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
});
