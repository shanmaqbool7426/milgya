import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { FeedPost } from "@/components/FeedPost";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { FEED_POSTS, LOST_ITEMS, FOUND_ITEMS } from "@/constants/mockData";
import { useAppStore } from "@/hooks/useAppStore";

const EMERGENCY_ALERTS = [
  { id: "e1", title: "Passports Lost at IGI Airport", count: 3, color: "#FF4757" },
  { id: "e2", title: "Wallets Stolen at City Mall", count: 7, color: "#FFA502" },
];

const CATEGORY_ITEMS = [
  { label: "Wallet", icon: "credit-card", color: "#5B67FF" },
  { label: "Phone", icon: "smartphone", color: "#FF4757" },
  { label: "Keys", icon: "key", color: "#FFA502" },
  { label: "Bag", icon: "briefcase", color: "#8B94FF" },
  { label: "Docs", icon: "file-text", color: "#00BFA5" },
  { label: "Other", icon: "more-horizontal", color: "#8A90A2" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + 90;
  const [searchText, setSearchText] = useState("");
  const { unreadCount } = useAppStore();

  const recentLost = LOST_ITEMS.filter((i) => i.status === "active").slice(0, 3);
  const recentFound = FOUND_ITEMS.slice(0, 3);
  const previewFeed = FEED_POSTS.slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(350)}
        style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.locationPill}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.foreground }]}>Bahawalpur</Text>
            <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={[styles.headerIconBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name="bell" size={18} color={colors.foreground} />
              {unreadCount > 0 && (
                <View style={[styles.notifDot, { backgroundColor: colors.destructive }]} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
              <Avatar name="Ali Hassan" size={38} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search")}
          style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
            Search lost or found items...
          </Text>
          <View style={[styles.filterIconBtn, { backgroundColor: colors.primary + "15" }]}>
            <Feather name="sliders" size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 80 }]}
      >
        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "25" }]}
              activeOpacity={0.8}
              onPress={() => router.push("/report/lost")}
            >
              <View style={[styles.qaIconWrap, { backgroundColor: colors.destructive + "20" }]}>
                <Feather name="alert-circle" size={20} color={colors.destructive} />
              </View>
              <Text style={[styles.qaTitle, { color: colors.destructive }]}>Report Lost</Text>
              <Text style={[styles.qaSub, { color: colors.destructive + "BB" }]}>Report something you lost</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#2ED57312", borderColor: "#2ED57325" }]}
              activeOpacity={0.8}
              onPress={() => router.push("/report/found")}
            >
              <View style={[styles.qaIconWrap, { backgroundColor: "#2ED57325" }]}>
                <Feather name="check-circle" size={20} color={colors.success} />
              </View>
              <Text style={[styles.qaTitle, { color: colors.success }]}>Report Found</Text>
              <Text style={[styles.qaSub, { color: colors.success + "BB" }]}>Found something? Return it</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Emergency Alerts */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="activity" size={15} color={colors.destructive} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Live Alerts</Text>
            </View>
            <Badge label="Live" variant="destructive" />
          </View>
          {EMERGENCY_ALERTS.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              activeOpacity={0.8}
              style={[styles.alertCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: alert.color, shadowColor: alert.color }]}
            >
              <View style={[styles.alertDot, { backgroundColor: alert.color }]} />
              <Text style={[styles.alertText, { color: colors.foreground }]} numberOfLines={1}>{alert.title}</Text>
              <View style={[styles.alertCount, { backgroundColor: alert.color }]}>
                <Text style={styles.alertCountText}>{alert.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Nearby Lost Items */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nearby Lost Items</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentLost.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/item/lost/${item.id}`)}
            >
              <View style={[styles.itemImgPlaceholder, { backgroundColor: "#FF475715" }]}>
                <Feather name="alert-circle" size={20} color={colors.destructive} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                <View style={styles.itemMeta}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.itemMetaText, { color: colors.mutedForeground }]} numberOfLines={1}>{item.location}</Text>
                </View>
                <Text style={[styles.itemTime, { color: colors.mutedForeground }]}>{item.time}</Text>
              </View>
              <View style={[styles.lostBadge, { backgroundColor: "#FF475715" }]}>
                <Text style={[styles.lostBadgeText, { color: colors.destructive }]}>Lost</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Nearby Found Items */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nearby Found Items</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentFound.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/item/found/${item.id}`)}
            >
              <View style={[styles.itemImgPlaceholder, { backgroundColor: "#2ED57315" }]}>
                <Feather name="check-circle" size={20} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                <View style={styles.itemMeta}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.itemMetaText, { color: colors.mutedForeground }]} numberOfLines={1}>{item.foundLocation}</Text>
                </View>
                <Text style={[styles.itemTime, { color: colors.mutedForeground }]}>{item.time}</Text>
              </View>
              <View style={[styles.foundBadge, { backgroundColor: "#2ED57315" }]}>
                <Text style={[styles.foundBadgeText, { color: colors.success }]}>Found</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Community Feed */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="users" size={15} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Success</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/community")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {previewFeed.map((post) => (
            <FeedPost key={post.id} post={post} onPress={() => router.push("/(tabs)/community")} />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14 },
  filterIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingTop: 20, gap: 28 },
  section: { gap: 12, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  seeAll: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  quickActionsRow: { flexDirection: "row", gap: 14 },
  quickActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  qaIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qaTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  qaSub: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },

  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
  alertCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  alertCountText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#FFF" },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  itemImgPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 4 },
  itemMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  itemMetaText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  itemTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
  lostBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  lostBadgeText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  foundBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  foundBadgeText: { fontFamily: "Inter_700Bold", fontSize: 12 },
});
