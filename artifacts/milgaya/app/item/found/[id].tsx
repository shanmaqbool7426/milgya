import React from "react";
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
import { Avatar } from "@/components/ui/Avatar";
import { FOUND_ITEMS, PARTNERS } from "@/constants/mockData";
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

export default function FoundItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const { myFoundReports } = useAppStore();

  const mockItem = FOUND_ITEMS.find((i) => i.id === id);
  const myItem = myFoundReports.find((i) => i.id === id);
  const item = mockItem ?? myItem ?? FOUND_ITEMS[0];
  const isMyReport = !!myItem && !mockItem;

  const partner = item.partnerId ? PARTNERS.find((p) => p.id === item.partnerId) : null;
  const iconColor = CATEGORY_COLORS[item.category] ?? "#6B7280";
  const iconName = (CATEGORY_ICONS[item.category] ?? "box") as any;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Found Item</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="share-2" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.gallery, { backgroundColor: `${iconColor}10` }]}>
          <View style={[styles.galleryIcon, { backgroundColor: `${iconColor}20` }]}>
            <Feather name={iconName} size={64} color={iconColor} />
          </View>
          {item.isVerified && (
            <View style={[styles.verifiedBanner, { backgroundColor: colors.success }]}>
              <Feather name="check-circle" size={14} color="#FFF" />
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
            <Badge label={item.category} variant="accent" />
          </View>

          <InfoRow icon="map-pin" label="Found at" value={item.foundLocation} colors={colors} />
          <InfoRow icon="home" label="Stored at" value={item.storageLocation} colors={colors} />
          <InfoRow icon="calendar" label="Date" value={item.date} colors={colors} />
          <InfoRow icon="clock" label="Time" value={item.time} colors={colors} />

          <View style={[styles.finderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Finder</Text>
            <View style={styles.finderRow}>
              <Avatar name={item.finderName} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.finderName, { color: colors.foreground }]}>{item.finderName}</Text>
                <Text style={[styles.finderSub, { color: colors.mutedForeground }]}>Community Member</Text>
              </View>
              {item.isVerified && (
                <View style={[styles.verifiedChip, { backgroundColor: `${colors.success}15` }]}>
                  <Feather name="shield" size={12} color={colors.success} />
                  <Text style={[styles.verifiedChipText, { color: colors.success }]}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          {partner && (
            <View style={[styles.partnerCard, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}25` }]}>
              <View style={styles.partnerHeader}>
                <Feather name="shield" size={16} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recovery Partner</Text>
                <Badge label="Verified" variant="primary" />
              </View>
              <Text style={[styles.partnerName, { color: colors.foreground }]}>{partner.name}</Text>
              <Text style={[styles.partnerAddress, { color: colors.mutedForeground }]}>{partner.address}</Text>
              <View style={styles.partnerStats}>
                <View style={styles.partnerStat}>
                  <Feather name="star" size={13} color="#F59E0B" />
                  <Text style={[styles.partnerStatText, { color: colors.foreground }]}>{partner.rating}</Text>
                </View>
                <View style={styles.partnerStat}>
                  <Feather name="navigation" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.partnerStatText, { color: colors.mutedForeground }]}>{partner.distance}</Text>
                </View>
                <View style={[styles.openChip, { backgroundColor: partner.openNow ? `${colors.success}15` : `${colors.destructive}10` }]}>
                  <Text style={[styles.openText, { color: partner.openNow ? colors.success : colors.destructive }]}>
                    {partner.openNow ? "Open Now" : "Closed"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
            <Text style={[styles.descText, { color: colors.mutedForeground }]}>{item.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        {isMyReport ? (
          <View style={[styles.myReportBar, { backgroundColor: `${colors.accent}12`, borderColor: `${colors.accent}30` }]}>
            <Feather name="star" size={16} color={colors.accent} />
            <Text style={[styles.myReportText, { color: colors.accent }]}>Your Report</Text>
            <Text style={[styles.myReportSub, { color: colors.mutedForeground }]}>You submitted this found item</Text>
          </View>
        ) : (
          <>
            <Button title="This is Mine!" onPress={() => {}} fullWidth size="lg" />
            <Button title="Contact Finder" onPress={() => {}} variant="outline" style={{ flex: 0, paddingHorizontal: 16 }} />
          </>
        )}
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={16} color={colors.primary} />
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}:</Text>
      <Text style={[styles.infoValue, { color: colors.foreground, flex: 1 }]}>{value}</Text>
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
  verifiedBanner: {
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
  verifiedText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#FFF", letterSpacing: 0.5 },
  body: { padding: 20, gap: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, flex: 1, lineHeight: 28 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  infoValue: { fontFamily: "Inter_500Medium", fontSize: 14 },
  finderCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  finderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  finderName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  finderSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  verifiedChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  verifiedChipText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  partnerCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  partnerHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  partnerName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  partnerAddress: { fontFamily: "Inter_400Regular", fontSize: 13 },
  partnerStats: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  partnerStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  partnerStatText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  openChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  openText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  descCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  descText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
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
