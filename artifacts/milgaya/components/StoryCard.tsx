import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import type { RecoveryStory } from "@/constants/types";

interface StoryCardProps {
  story: RecoveryStory;
  onPress: () => void;
}

export function StoryCard({ story, onPress }: StoryCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <Avatar name={story.helperName} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.helper, { color: colors.foreground }]}>{story.helperName}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{story.date}</Text>
        </View>
        <Badge label={story.category} variant="accent" />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{story.title}</Text>
      <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
        {story.description}
      </Text>
      <View style={styles.footer}>
        <View style={styles.likes}>
          <Feather name="heart" size={14} color={colors.destructive} />
          <Text style={[styles.likesText, { color: colors.mutedForeground }]}>{story.likes}</Text>
        </View>
        <View style={styles.owner}>
          <Feather name="user" size={12} color={colors.mutedForeground} />
          <Text style={[styles.ownerText, { color: colors.mutedForeground }]}>Helped {story.ownerName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
    gap: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  helper: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    lineHeight: 21,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  likes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  likesText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  owner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ownerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
