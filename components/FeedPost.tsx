import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./ui/Avatar";

export interface FeedPostData {
  id: string;
  type: "lost" | "found" | "story" | "alert";
  authorName: string;
  authorSubtitle: string;
  timeAgo: string;
  category: string;
  title: string;
  body: string;
  location: string;
  likes: number;
  comments: number;
  reward?: string;
  isUrgent?: boolean;
  isVerified?: boolean;
}

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

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "smartphone",
  Bags: "briefcase",
  Wallet: "credit-card",
  Keys: "key",
  Documents: "file-text",
  Jewellery: "circle",
  Pets: "heart",
  Other: "box",
};

const TYPE_CONFIG = {
  lost: { label: "Lost Item", color: "#EF4444", icon: "alert-circle" },
  found: { label: "Found Item", color: "#10B981", icon: "check-circle" },
  story: { label: "Recovery Story", color: "#3B82F6", icon: "star" },
  alert: { label: "Community Alert", color: "#F59E0B", icon: "bell" },
};

interface FeedPostProps {
  post: FeedPostData;
  onPress?: () => void;
}

export function FeedPost({ post, onPress }: FeedPostProps) {
  const colors = useColors();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [expanded, setExpanded] = useState(false);

  const catColor = CATEGORY_COLORS[post.category] ?? "#6B7280";
  const catIcon = (CATEGORY_ICONS[post.category] ?? "box") as any;
  const typeConfig = TYPE_CONFIG[post.type];

  const handleLike = () => {
    setLiked((p) => !p);
    setLikeCount((p) => (liked ? p - 1 : p + 1));
  };

  const bodyTrimmed = post.body.length > 120 && !expanded
    ? post.body.slice(0, 120) + "..."
    : post.body;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.96}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* IMAGE BANNER */}
      <View style={[styles.banner, { backgroundColor: catColor }]}>
        {/* Subtle pattern layers */}
        <View style={[styles.bannerCircle1, { backgroundColor: `${catColor}60` }]} />
        <View style={[styles.bannerCircle2, { backgroundColor: "#FFFFFF10" }]} />
        <View style={[styles.bannerIconWrap, { backgroundColor: "#FFFFFF20" }]}>
          <Feather name={catIcon} size={44} color="#FFFFFF" />
        </View>
        {/* Type badge overlay */}
        <View style={[styles.typeBadge, { backgroundColor: typeConfig.color }]}>
          <Feather name={typeConfig.icon as any} size={11} color="#FFF" />
          <Text style={styles.typeBadgeText}>{typeConfig.label}</Text>
        </View>
        {/* Urgent badge */}
        {post.isUrgent && (
          <View style={styles.urgentBadge}>
            <Feather name="zap" size={10} color="#FFF" />
            <Text style={styles.urgentBadgeText}>URGENT</Text>
          </View>
        )}
        {/* Reward badge */}
        {post.reward && (
          <View style={[styles.rewardBadge, { backgroundColor: "#F59E0B" }]}>
            <Text style={styles.rewardBadgeText}>{post.reward}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* Author row */}
        <View style={styles.authorRow}>
          <Avatar name={post.authorName} size={38} />
          <View style={{ flex: 1 }}>
            <View style={styles.authorNameRow}>
              <Text style={[styles.authorName, { color: colors.foreground }]}>
                {post.authorName}
              </Text>
              {post.isVerified && (
                <Feather name="check-circle" size={13} color={colors.accent} />
              )}
            </View>
            <Text style={[styles.authorSub, { color: colors.mutedForeground }]}>
              {post.authorSubtitle} · {post.timeAgo}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.followBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.followBtnText, { color: colors.primary }]}>
              Connect
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          {post.title}
        </Text>

        {/* Body */}
        <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
          {bodyTrimmed}
          {post.body.length > 120 && !expanded && (
            <Text
              onPress={() => setExpanded(true)}
              style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}
            >
              {" "}see more
            </Text>
          )}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <View style={[styles.locationPill, { backgroundColor: `${catColor}12` }]}>
            <Feather name="map-pin" size={12} color={catColor} />
            <Text style={[styles.locationText, { color: catColor }]}>
              {post.location}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        {(likeCount > 0 || post.comments > 0) && (
          <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
            {likeCount > 0 && (
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#3B82F6" }]}>
                  <Feather name="thumbs-up" size={9} color="#FFF" />
                </View>
                <Text style={[styles.statText, { color: colors.mutedForeground }]}>
                  {likeCount}
                </Text>
              </View>
            )}
            {post.comments > 0 && (
              <Text style={[styles.commentCount, { color: colors.mutedForeground }]}>
                {post.comments} comments
              </Text>
            )}
          </View>
        )}

        {/* Action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
            <Feather
              name="thumbs-up"
              size={18}
              color={liked ? colors.primary : colors.mutedForeground}
            />
            <Text
              style={[
                styles.actionText,
                { color: liked ? colors.primary : colors.mutedForeground },
              ]}
            >
              Like
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="message-circle" size={18} color={colors.mutedForeground} />
            <Text style={[styles.actionText, { color: colors.mutedForeground }]}>
              Comment
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="share-2" size={18} color={colors.mutedForeground} />
            <Text style={[styles.actionText, { color: colors.mutedForeground }]}>
              Share
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="send" size={18} color={colors.mutedForeground} />
            <Text style={[styles.actionText, { color: colors.mutedForeground }]}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  banner: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  bannerCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -60,
    left: -60,
  },
  bannerCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -40,
    right: -30,
  },
  bannerIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  typeBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFF",
  },
  urgentBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  urgentBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#FFF",
    letterSpacing: 0.5,
  },
  rewardBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  rewardBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFF",
  },
  body: {
    padding: 14,
    gap: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  authorSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  followBtn: {
    borderWidth: 1.5,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  followBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    lineHeight: 24,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  locationRow: {
    flexDirection: "row",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  locationText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  statText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  commentCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
  },
  actionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
