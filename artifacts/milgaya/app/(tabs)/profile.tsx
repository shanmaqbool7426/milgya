import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { LOST_ITEMS } from "@/constants/mockData";

const MY_REPORTS = LOST_ITEMS.slice(0, 3);

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerBg, { paddingTop: topPad + 20, backgroundColor: colors.primary }]}>
          <View style={styles.headerActions}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => router.push("/settings")} style={styles.settingsBtn}>
              <Feather name="settings" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileMain}>
            <View style={styles.avatarWrap}>
              <Avatar name="Rahul Kumar" size={80} />
              <View style={[styles.verifiedBadge, { backgroundColor: colors.accent }]}>
                <Feather name="check" size={10} color="#FFF" />
              </View>
            </View>
            <Text style={styles.profileName}>Rahul Kumar</Text>
            <Text style={styles.profileEmail}>rahul.kumar@email.com</Text>
            <View style={styles.profileLocation}>
              <Feather name="map-pin" size={13} color="#FFFFFF99" />
              <Text style={styles.profileLocationText}>Koramangala, Bangalore</Text>
            </View>
            <Badge label="Silver Helper" variant="outline" style={{ borderColor: "#FFFFFF60", marginTop: 4 }} />
          </View>

          {/* Stats */}
          <View style={[styles.statsCard, { backgroundColor: colors.background }]}>
            <StatBox label="Reports" value="8" icon="file-text" color={colors.primary} colors={colors} />
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <StatBox label="Recoveries" value="3" icon="check-circle" color={colors.success} colors={colors} />
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <StatBox label="Points" value="420" icon="star" color="#F59E0B" colors={colors} />
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <StatBox label="Rating" value="4.8" icon="heart" color={colors.destructive} colors={colors} />
          </View>
        </View>

        {/* Reputation Score */}
        <View style={[styles.reputationCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20 }]}>
          <View style={styles.reputationHeader}>
            <View>
              <Text style={[styles.reputationTitle, { color: colors.foreground }]}>Reputation Score</Text>
              <Text style={[styles.reputationSub, { color: colors.mutedForeground }]}>Based on community interactions</Text>
            </View>
            <Text style={[styles.reputationScore, { color: colors.primary }]}>87</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: "87%", backgroundColor: colors.primary }]} />
          </View>
          <View style={styles.reputationTiers}>
            <Text style={[styles.tierText, { color: colors.mutedForeground }]}>Bronze</Text>
            <Text style={[styles.tierText, { color: colors.primary }]}>Silver ← You</Text>
            <Text style={[styles.tierText, { color: colors.mutedForeground }]}>Gold</Text>
          </View>
        </View>

        {/* My Active Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Reports</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {MY_REPORTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/item/lost/${item.id}`)}
              style={[styles.reportRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.reportIcon, { backgroundColor: `${item.status === "recovered" ? colors.success : colors.primary}15` }]}>
                <Feather
                  name={item.status === "recovered" ? "check-circle" : "alert-circle"}
                  size={18}
                  color={item.status === "recovered" ? colors.success : colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reportTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.reportDate, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <Badge
                label={item.status === "recovered" ? "Recovered" : "Active"}
                variant={item.status === "recovered" ? "success" : "primary"}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account</Text>
          <View style={[styles.linksCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <QuickLink icon="shield" label="Recovery Partners" onPress={() => router.push("/partners")} colors={colors} />
            <QuickLink icon="bell" label="Notifications" onPress={() => router.push("/notifications")} colors={colors} badge="2" />
            <QuickLink icon="users" label="Community" onPress={() => router.push("/(tabs)/community")} colors={colors} />
            <QuickLink icon="settings" label="Settings" onPress={() => router.push("/settings")} colors={colors} last />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value, icon, color, colors }: { label: string; value: string; icon: string; color: string; colors: any }) {
  return (
    <View style={styles.statBox}>
      <Feather name={icon as any} size={16} color={color} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function QuickLink({ icon, label, onPress, colors, badge, last }: { icon: string; label: string; onPress: () => void; colors: any; badge?: string; last?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.quickLink, { borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
    >
      <View style={[styles.quickLinkIcon, { backgroundColor: colors.muted }]}>
        <Feather name={icon as any} size={15} color={colors.primary} />
      </View>
      <Text style={[styles.quickLinkLabel, { color: colors.foreground, flex: 1 }]}>{label}</Text>
      {badge && (
        <View style={[styles.quickBadge, { backgroundColor: colors.destructive }]}>
          <Text style={styles.quickBadgeText}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { gap: 0 },
  headerBg: {
    paddingBottom: 0,
    gap: 16,
  },
  headerActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileMain: {
    alignItems: "center",
    gap: 6,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 4,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF" },
  profileEmail: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#FFFFFF90" },
  profileLocation: { flexDirection: "row", alignItems: "center", gap: 4 },
  profileLocationText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#FFFFFF80" },
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginTop: -40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 20,
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  statDiv: { width: 1, marginVertical: 4 },
  reputationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  reputationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reputationTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  reputationSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  reputationScore: { fontFamily: "Inter_700Bold", fontSize: 32 },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  reputationTiers: { flexDirection: "row", justifyContent: "space-between" },
  tierText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  section: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  seeAll: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reportTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  reportDate: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  linksCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  quickLink: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  quickLinkIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  quickLinkLabel: { fontFamily: "Inter_500Medium", fontSize: 15 },
  quickBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#FFF" },
});
