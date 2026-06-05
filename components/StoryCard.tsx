import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import type { RecoveryStory } from "@/constants/types";

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "#3B82F6",
  Bags: "#8B5CF6",
  Wallet: "#10B981",
  Keys: "#F59E0B",
  Documents: "#EF4444",
  Jewellery: "#EC4899",
  Pets: "#06B6D4",
  Other: "#6B7280",
};

interface StoryCardProps {
  story: RecoveryStory;
  onPress: () => void;
}

export function StoryCard({ story, onPress }: StoryCardProps) {
  const colors = useColors();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likes);
  const accentColor = CATEGORY_COLORS[story.category] ?? colors.primary;

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 16,
        },
      ]}
    >
      {/* Colored accent bar at the top */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* Post Title — most prominent element */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          {story.title}
        </Text>

        {/* Author row */}
        <View style={styles.authorRow}>
          <Avatar name={story.helperName} size={32} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.authorName, { color: colors.foreground }]}>
              {story.helperName}
            </Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {story.date}
            </Text>
          </View>
          <Badge label={story.category} variant="accent" />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Post body */}
        <Text
          style={[styles.desc, { color: colors.mutedForeground }]}
          numberOfLines={3}
        >
          {story.description}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleLike}
            style={styles.likeBtn}
            activeOpacity={0.75}
          >
            <Feather
              name="heart"
              size={15}
              color={liked ? colors.destructive : colors.mutedForeground}
            />
            <Text
              style={[
                styles.likeCount,
                {
                  color: liked ? colors.destructive : colors.mutedForeground,
                  fontFamily: liked ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {likeCount}
            </Text>
          </TouchableOpacity>

          <View style={styles.helpedRow}>
            <Feather name="check-circle" size={13} color={accentColor} />
            <Text style={[styles.helpedText, { color: colors.mutedForeground }]}>
              Helped{" "}
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                {story.ownerName}
              </Text>
            </Text>
          </View>

          <Feather name="share-2" size={15} color={colors.mutedForeground} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  body: {
    padding: 16,
    gap: 10,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    lineHeight: 24,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  likeCount: {
    fontSize: 13,
  },
  helpedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  helpedText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
