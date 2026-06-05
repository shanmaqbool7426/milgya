import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { QuickAction } from "@/components/QuickAction";
import { LostItemCard, FoundItemCard } from "@/components/ItemCard";
import { FeedPost } from "@/components/FeedPost";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { LOST_ITEMS, FOUND_ITEMS, FEED_POSTS } from "@/constants/mockData";

const EMERGENCY_ALERTS = [
  { id: "e1", title: "Passports Lost at IGI Airport", count: 3, color: "#EF4444" },
  { id: "e2", title: "Wallets Stolen at City Mall", count: 7, color: "#F59E0B" },
];

const TRENDING_RECOVERIES = [
  { id: "t1", name: "MacBook Pro", days: 2, helper: "Rajesh G." },
  { id: "t2", name: "Gold Necklace", days: 1, helper: "Community" },
  { id: "t3", name: "Passport", days: 0, helper: "Airport Vol." },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
  const [searchText, setSearchText] = useState("");

  const displayedLost = LOST_ITEMS.filter((i) => i.status === "active").slice(0, 3);
  const displayedFound = FOUND_ITEMS.slice(0, 3);
  const previewFeed = FEED_POSTS.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>MilGaya</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/notifications")} style={[styles.notifBtn, { backgroundColor: colors.muted }]}>
            <Feather name="bell" size={20} color={colors.foreground} />
            <View style={[styles.notifDot, { backgroundColor: colors.destructive }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={{ marginLeft: 8 }}>
            <Avatar name="Rahul Kumar" size={38} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search lost & found items..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            onFocus={() => router.push("/(tabs)/search")}
          />
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.secondary }]}>
            <Feather name="sliders" size={15} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.locationBar, { backgroundColor: colors.muted }]}>
          <Feather name="map-pin" size={14} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.foreground }]}>Koramangala, Bangalore</Text>
          <TouchableOpacity>
            <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 90 }]}
      >
        {/* Emergency Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Emergency Alerts</Text>
            </View>
            <Badge label="Live" variant="destructive" />
          </View>
          {EMERGENCY_ALERTS.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.alertCard, { backgroundColor: `${alert.color}10`, borderColor: `${alert.color}30` }]}
            >
              <View style={[styles.alertDot, { backgroundColor: alert.color }]} />
              <Text style={[styles.alertText, { color: colors.foreground, flex: 1 }]}>{alert.title}</Text>
              <View style={[styles.alertBadge, { backgroundColor: alert.color }]}>
                <Text style={styles.alertBadgeText}>{alert.count} reports</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={[styles.quickActionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <QuickAction icon="alert-circle" label="Report Lost" color="#EF4444" onPress={() => router.push("/report/lost")} />
            <QuickAction icon="check-circle" label="Report Found" color="#10B981" onPress={() => router.push("/report/found")} />
            <QuickAction icon="search" label="Search Items" color="#3B82F6" onPress={() => router.push("/(tabs)/search")} />
            <QuickAction icon="map" label="Map View" color="#8B5CF6" onPress={() => router.push("/(tabs)/map")} />
          </View>
        </View>

        {/* Nearby Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                onPress={() => setActiveTab("lost")}
                style={[styles.tab, { borderBottomColor: activeTab === "lost" ? colors.primary : "transparent" }]}
              >
                <Text style={[styles.tabText, { color: activeTab === "lost" ? colors.primary : colors.mutedForeground }]}>
                  Lost ({displayedLost.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("found")}
                style={[styles.tab, { borderBottomColor: activeTab === "found" ? colors.accent : "transparent" }]}
              >
                <Text style={[styles.tabText, { color: activeTab === "found" ? colors.accent : colors.mutedForeground }]}>
                  Found ({displayedFound.length})
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {activeTab === "lost" ? (
            displayedLost.map((item) => (
              <LostItemCard key={item.id} item={item} onPress={() => router.push(`/item/lost/${item.id}`)} />
            ))
          ) : (
            displayedFound.map((item) => (
              <FoundItemCard key={item.id} item={item} onPress={() => router.push(`/item/found/${item.id}`)} />
            ))
          )}
        </View>

        {/* Community Feed Preview — LinkedIn style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="users" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Community Feed</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/community")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text>
            </TouchableOpacity>
          </View>
          {previewFeed.map((post) => (
            <FeedPost key={post.id} post={post} onPress={() => router.push("/(tabs)/community")} />
          ))}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/community")}
            style={[styles.moreFeedBtn, { backgroundColor: colors.secondary, borderColor: `${colors.primary}30` }]}
          >
            <Feather name="users" size={16} color={colors.primary} />
            <Text style={[styles.moreFeedText, { color: colors.primary }]}>
              See all community posts
            </Text>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Trending Recoveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="trending-up" size={16} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Recoveries</Text>
            </View>
          </View>
          <FlatList
            data={TRENDING_RECOVERIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <View style={[styles.trendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.trendIcon, { backgroundColor: `${colors.accent}15` }]}>
                  <Feather name="package" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.trendName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.trendHelper, { color: colors.mutedForeground }]}>by {item.helper}</Text>
                <Badge
                  label={item.days === 0 ? "Today" : `${item.days}d ago`}
                  variant={item.days === 0 ? "accent" : "muted"}
                />
              </View>
            )}
          />
        </View>

        {/* Partners CTA */}
        <TouchableOpacity
          onPress={() => router.push("/partners")}
          style={[styles.partnerCTA, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}25` }]}
        >
          <View style={[styles.partnerIcon, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={20} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.partnerTitle, { color: colors.foreground }]}>5 Recovery Partners Nearby</Text>
            <Text style={[styles.partnerSub, { color: colors.mutedForeground }]}>Verified shops, schools & police stations</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 13 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderColor: "white",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    height: 30,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  locationText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  changeText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 24 },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  seeAll: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  tabRow: { flexDirection: "row", gap: 0 },
  tab: { paddingBottom: 6, paddingHorizontal: 4, marginRight: 16, borderBottomWidth: 2 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  alertBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#FFF" },
  quickActionsCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  moreFeedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  moreFeedText: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1, textAlign: "center" },
  trendCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    width: 140,
    alignItems: "flex-start",
  },
  trendIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  trendName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  trendHelper: { fontFamily: "Inter_400Regular", fontSize: 11 },
  partnerCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  partnerIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  partnerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  partnerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
});
