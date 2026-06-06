import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Badge } from "./ui/Badge";
import type { LostItem, FoundItem } from "@/constants/types";

interface LostItemCardProps {
  item: LostItem;
  onPress: () => void;
}

interface FoundItemCardProps {
  item: FoundItem;
  onPress: () => void;
}

function ItemImagePlaceholder({ category, size = 90 }: { category: string; size?: number }) {
  const colors = useColors();
  const iconMap: Record<string, string> = {
    Electronics: "smartphone",
    Bags: "briefcase",
    Wallet: "credit-card",
    Keys: "key",
    Documents: "file-text",
    Jewellery: "circle",
    Pets: "heart",
    Other: "box",
  };
  const colorMap: Record<string, string> = {
    Electronics: "#3B82F6",
    Bags: "#8B5CF6",
    Wallet: "#10B981",
    Keys: "#F59E0B",
    Documents: "#EF4444",
    Jewellery: "#EC4899",
    Pets: "#06B6D4",
    Other: "#6B7280",
  };
  const iconName = (iconMap[category] ?? "box") as any;
  const bgColor = colorMap[category] ?? "#6B7280";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: `${bgColor}18`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name={iconName} size={size * 0.4} color={bgColor} />
    </View>
  );
}

export function LostItemCard({ item, onPress }: LostItemCardProps) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.88}
      style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}
    >
      <ItemImagePlaceholder category={item.category} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.isUrgent && <Badge label="Urgent" variant="destructive" />}
        </View>
        <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} /> {item.location}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.footer}>
          <Badge label={item.category} variant="muted" />
          {item.reward ? (
            <View style={[styles.reward, { backgroundColor: `${colors.accent}15` }]}>
              <Feather name="gift" size={11} color={colors.accent} />
              <Text style={[styles.rewardText, { color: colors.accent }]}>{item.reward}</Text>
            </View>
          ) : null}
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function FoundItemCard({ item, onPress }: FoundItemCardProps) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.88}
      style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}
    >
      <ItemImagePlaceholder category={item.category} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.isVerified && (
            <View style={[styles.verified, { backgroundColor: `${colors.success}15` }]}>
              <Feather name="check-circle" size={11} color={colors.success} />
              <Text style={[styles.verifiedText, { color: colors.success }]}>Verified</Text>
            </View>
          )}
        </View>
        <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} /> {item.foundLocation}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.footer}>
          <Badge label={item.category} variant="muted" />
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{item.date}</Text>
        </View>
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    flex: 1,
  },
  location: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    flexWrap: "wrap",
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginLeft: "auto",
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
  },
  rewardText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  verified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
  },
  verifiedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
});
