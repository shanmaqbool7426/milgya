import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { FeedPost } from "@/components/FeedPost";
import { FEED_POSTS, TOP_HELPERS } from "@/constants/mockData";

const TABS = ["Feed", "Top Helpers", "Achievements"];

const ACHIEVEMENTS = [
  { id: "a1", icon: "star", label: "First Recovery", desc: "Helped your first person", earned: true, color: "#F59E0B" },
  { id: "a2", icon: "users", label: "Community Builder", desc: "10+ community interactions", earned: true, color: "#3B82F6" },
  { id: "a3", icon: "shield", label: "Verified Helper", desc: "Identity verified by MilGaya", earned: true, color: "#10B981" },
  { id: "a4", icon: "award", label: "Gold Helper", desc: "50+ successful recoveries", earned: false, color: "#F59E0B" },
  { id: "a5", icon: "zap", label: "Speed Recoverer", desc: "Recovered item within 1 hour", earned: false, color: "#8B5CF6" },
  { id: "a6", icon: "heart", label: "Community Hero", desc: "100+ recoveries", earned: false, color: "#EF4444" },
];

const FEED_FILTERS = ["All", "Lost", "Found", "Stories", "Alerts"];

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const [activeTab, setActiveTab] = useState(0);
  const [feedFilter, setFeedFilter] = useState("All");
  const [postText, setPostText] = useState("");

  const filteredPosts = FEED_POSTS.filter((p) => {
    if (feedFilter === "All") return true;
    if (feedFilter === "Lost") return p.type === "lost";
    if (feedFilter === "Found") return p.type === "found";
    if (feedFilter === "Stories") return p.type === "story";
    if (feedFilter === "Alerts") return p.type === "alert";
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Community</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              50,000+ members helping each other
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.postBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/report/lost")}
          >
            <Feather name="edit-2" size={15} color="#FFF" />
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Stats banner */}
        <View style={[styles.statsBanner, { backgroundColor: colors.primary }]}>
          <StatBannerItem label="Recoveries" value="12,847" />
          <View style={[styles.bannerDiv, { backgroundColor: "#FFFFFF40" }]} />
          <StatBannerItem label="This Week" value="347" />
          <View style={[styles.bannerDiv, { backgroundColor: "#FFFFFF40" }]} />
          <StatBannerItem label="Members" value="50K+" />
        </View>
      </View>

      {/* Tab bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(i)}
            style={[
              styles.tab,
              {
                borderBottomColor:
                  activeTab === i ? colors.primary : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === i ? colors.primary : colors.mutedForeground,
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── FEED TAB ── */}
        {activeTab === 0 && (
          <View style={styles.feedSection}>
            {/* Create post box */}
            <View
              style={[
                styles.createPost,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Avatar name="Rahul Kumar" size={40} />
              <TouchableOpacity
                style={[
                  styles.createPostInput,
                  { backgroundColor: colors.muted, borderColor: colors.border },
                ]}
                onPress={() => router.push("/report/lost")}
              >
                <Text
                  style={[
                    styles.createPostPlaceholder,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Share a lost/found report with the community...
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create post action row */}
            <View
              style={[
                styles.createActions,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => router.push("/report/lost")}
                style={styles.createAction}
              >
                <Feather name="alert-circle" size={16} color="#EF4444" />
                <Text style={[styles.createActionText, { color: colors.mutedForeground }]}>
                  Lost Item
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/report/found")}
                style={styles.createAction}
              >
                <Feather name="check-circle" size={16} color="#10B981" />
                <Text style={[styles.createActionText, { color: colors.mutedForeground }]}>
                  Found Item
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createAction}>
                <Feather name="star" size={16} color="#3B82F6" />
                <Text style={[styles.createActionText, { color: colors.mutedForeground }]}>
                  Recovery Story
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              {FEED_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFeedFilter(f)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        feedFilter === f
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        feedFilter === f ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          feedFilter === f ? "#FFF" : colors.mutedForeground,
                      },
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Feed posts */}
            {filteredPosts.map((post) => (
              <FeedPost key={post.id} post={post} onPress={() => {}} />
            ))}
          </View>
        )}

        {/* ── TOP HELPERS TAB ── */}
        {activeTab === 1 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Top Community Helpers
            </Text>
            <Text
              style={[
                styles.sectionSub,
                { color: colors.mutedForeground },
              ]}
            >
              These members have gone above and beyond to help the community
            </Text>
            {TOP_HELPERS.map((helper, index) => (
              <View
                key={helper.id}
                style={[
                  styles.helperCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.rank,
                    {
                      backgroundColor:
                        index === 0
                          ? "#F59E0B"
                          : index === 1
                          ? "#9CA3AF"
                          : index === 2
                          ? "#B87333"
                          : colors.muted,
                    },
                  ]}
                >
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <Avatar name={helper.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.helperName, { color: colors.foreground }]}
                  >
                    {helper.name}
                  </Text>
                  <Text
                    style={[
                      styles.helperLocation,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    <Feather name="map-pin" size={11} /> {helper.location}
                  </Text>
                  <View style={styles.helperMeta}>
                    <Badge
                      label={helper.badge}
                      variant={index === 0 ? "warning" : "muted"}
                    />
                    <View style={styles.helperStar}>
                      <Feather name="star" size={11} color="#F59E0B" />
                      <Text
                        style={[
                          styles.helperRating,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {helper.rating}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.helperRecoveries}>
                  <Text
                    style={[
                      styles.recoveryNum,
                      { color: colors.primary },
                    ]}
                  >
                    {helper.recoveries}
                  </Text>
                  <Text
                    style={[
                      styles.recoveryLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Recoveries
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── ACHIEVEMENTS TAB ── */}
        {activeTab === 2 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Achievement Badges
            </Text>
            <Text
              style={[
                styles.sectionSub,
                { color: colors.mutedForeground },
              ]}
            >
              Earn badges by helping the community recover lost items
            </Text>
            <View style={styles.achievementGrid}>
              {ACHIEVEMENTS.map((a) => (
                <View
                  key={a.id}
                  style={[
                    styles.achievementCard,
                    {
                      backgroundColor: a.earned ? colors.card : colors.muted,
                      borderColor: a.earned
                        ? `${a.color}40`
                        : colors.border,
                      opacity: a.earned ? 1 : 0.6,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.achieveIcon,
                      {
                        backgroundColor: a.earned
                          ? `${a.color}18`
                          : colors.background,
                      },
                    ]}
                  >
                    <Feather
                      name={a.icon as any}
                      size={22}
                      color={a.earned ? a.color : colors.mutedForeground}
                    />
                  </View>
                  <Text
                    style={[
                      styles.achieveLabel,
                      {
                        color: a.earned
                          ? colors.foreground
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {a.label}
                  </Text>
                  <Text
                    style={[
                      styles.achieveDesc,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {a.desc}
                  </Text>
                  {!a.earned && (
                    <View
                      style={[
                        styles.lockIcon,
                        { backgroundColor: colors.border },
                      ]}
                    >
                      <Feather
                        name="lock"
                        size={10}
                        color={colors.mutedForeground}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatBannerItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bannerStat}>
      <Text style={styles.bannerValue}>{value}</Text>
      <Text style={styles.bannerLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  postBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  postBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFF",
  },
  statsBanner: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  bannerStat: { flex: 1, alignItems: "center" },
  bannerValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#FFFFFF" },
  bannerLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#FFFFFF99",
  },
  bannerDiv: { width: 1, height: 30 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
  },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  content: { paddingTop: 16, gap: 0 },
  feedSection: { gap: 0 },
  createPost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  createPostInput: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createPostPlaceholder: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  createActions: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  createAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  createActionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  filterChips: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  section: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  sectionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: -4,
  },
  helperCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#FFF" },
  helperName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  helperLocation: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  helperMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  helperStar: { flexDirection: "row", alignItems: "center", gap: 3 },
  helperRating: { fontFamily: "Inter_500Medium", fontSize: 12 },
  helperRecoveries: { alignItems: "center" },
  recoveryNum: { fontFamily: "Inter_700Bold", fontSize: 22 },
  recoveryLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  achievementGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  achievementCard: {
    width: "47%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  achieveIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  achieveLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textAlign: "center",
  },
  achieveDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
  lockIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
