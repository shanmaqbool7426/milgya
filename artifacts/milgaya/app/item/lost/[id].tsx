import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LOST_ITEMS } from "@/constants/mockData";
import { useAppStore } from "@/hooks/useAppStore";

const { width } = Dimensions.get("window");

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "#3B82F6", Bags: "#8B5CF6", Wallet: "#10B981",
  Keys: "#F59E0B", Documents: "#EF4444", Jewellery: "#EC4899",
  Pets: "#06B6D4", Other: "#6B7280",
};
const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "smartphone", Bags: "briefcase", Wallet: "credit-card",
  Keys: "key", Documents: "file-text", Jewellery: "circle",
  Pets: "heart", Other: "box",
};

export default function LostItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const { myReports } = useAppStore();

  const mockItem = LOST_ITEMS.find((i) => i.id === id);
  const myItem = myReports.find((i) => i.id === id);
  const item = mockItem ?? myItem ?? LOST_ITEMS[0];
  const isMyReport = !!myItem && !mockItem;

  const iconColor = CATEGORY_COLORS[item.category] ?? "#6B7280";
  const iconName = (CATEGORY_ICONS[item.category] ?? "box") as any;

  const [shared, setShared] = useState(false);

  const statusColor = item.status === "recovered" ? colors.success : item.status === "active" ? colors.primary : colors.mutedForeground;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Lost Item</Text>
        <TouchableOpacity onPress={() => setShared(!shared)} style={styles.iconBtn}>
          <Feather name="share-2" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.gallery, { backgroundColor: `${iconColor}10` }]}>
          <View style={[styles.galleryIcon, { backgroundColor: `${iconColor}20` }]}>
            <Feather name={iconName} size={64} color={iconColor} />
          </View>
          {item.isUrgent && (
            <View style={[styles.urgentBanner, { backgroundColor: colors.destructive }]}>
              <Feather name="alert-circle" size={14} color="#FFF" />
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}30` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
            <Badge label={item.category} variant="primary" />
          </View>

          <InfoRow icon="map-pin" label="Last Seen" value={item.location} colors={colors} />
          {item.route && <InfoRow icon="navigation" label="Route" value={item.route} colors={colors} />}
          <InfoRow icon="calendar" label="Date" value={item.date} colors={colors} />
          <InfoRow icon="clock" label="Time" value={item.time} colors={colors} />
          {item.reward && <InfoRow icon="gift" label="Reward" value={item.reward} colors={colors} accent />}
          <InfoRow icon="user" label="Reported by" value={item.contactName} colors={colors} />

          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>Description</Text>
            <Text style={[styles.descText, { color: colors.mutedForeground }]}>{item.description}</Text>
          </View>

          <View style={[styles.warnCard, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]}>
            <Feather name="alert-triangle" size={16} color={colors.warning} />
            <Text style={[styles.warnText, { color: colors.warning }]}>
              Please only contact the owner if you've found this item. False claims are reported.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        {isMyReport ? (
          <View style={[styles.myReportBar, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}>
            <Feather name="star" size={16} color={colors.primary} />
            <Text style={[styles.myReportText, { color: colors.primary }]}>Your Report</Text>
            <Text style={[styles.myReportSub, { color: colors.mutedForeground }]}>You submitted this lost item</Text>
          </View>
        ) : (
          <>
            <Button title="I Found This!" onPress={() => {}} fullWidth size="lg" variant="accent" />
            <Button title="Report" onPress={() => {}} variant="outline" style={{ flex: 0, paddingHorizontal: 20 }} />
          </>
        )}
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, colors, accent }: { icon: string; label: string; value: string; colors: any; accent?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={16} color={accent ? colors.accent : colors.primary} />
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}:</Text>
      <Text style={[styles.infoValue, { color: accent ? colors.accent : colors.foreground, flex: 1 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  content: { gap: 0 },
  gallery: {
    width,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  galleryIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  urgentBanner: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  urgentText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#FFF", letterSpacing: 0.5 },
  statusBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  body: { padding: 20, gap: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, flex: 1, lineHeight: 28 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  infoValue: { fontFamily: "Inter_500Medium", fontSize: 14 },
  descCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  descTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  descText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  warnCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  warnText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 19 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  myReportBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  myReportText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  myReportSub: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
});
