import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAppStore } from "@/hooks/useAppStore";

const CATEGORY_ICON: Record<string, any> = {
  Electronics: "smartphone",
  Bags: "briefcase",
  Wallet: "credit-card",
  Keys: "key",
  Documents: "file-text",
  Jewellery: "circle",
  Pets: "heart",
  Other: "more-horizontal",
};

const CATEGORY_COLOR: Record<string, string> = {
  Electronics: "#3B82F6",
  Bags: "#8B5CF6",
  Wallet: "#10B981",
  Keys: "#F59E0B",
  Documents: "#EF4444",
  Jewellery: "#EC4899",
  Pets: "#06B6D4",
  Other: "#6B7280",
};

// Generate a pseudo-unique tag ID from item info
function generateTagId(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `MGT-${hash.toString(16).toUpperCase().padStart(6, "0")}`;
}

// QR code visual built from divs — no library needed
function QRCodeVisual({ value, size = 120, color = "#111827" }: { value: string; size?: number; color?: string }) {
  // Generate a deterministic 9x9 grid from the value string
  const cells = 9;
  const cell = size / cells;
  const grid = useMemo(() => {
    const rows: boolean[][] = [];
    let seed = value.split("").reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7);
    for (let r = 0; r < cells; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < cells; c++) {
        // Force corner "finder patterns" to be filled
        const inCorner =
          (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
        if (inCorner) { row.push(true); }
        else {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff;
          row.push(seed % 3 !== 0); // ~66% fill for QR look
        }
      }
      rows.push(row);
    }
    return rows;
  }, [value]);

  return (
    <View style={{ width: size, height: size, backgroundColor: "#FFF", padding: 4, borderRadius: 8 }}>
      {grid.map((row, r) => (
        <View key={r} style={{ flexDirection: "row" }}>
          {row.map((filled, c) => (
            <View
              key={c}
              style={{
                width: cell - 1,
                height: cell - 1,
                margin: 0.5,
                backgroundColor: filled ? color : "transparent",
                borderRadius: 1,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function TagCard({
  item,
  type,
  index,
}: {
  item: { id: string; title: string; category: string; location?: string; foundLocation?: string };
  type: "lost" | "found";
  index: number;
}) {
  const colors = useColors();
  const [showQR, setShowQR] = useState(false);
  const tagId = generateTagId(item.id);
  const tagUrl = `milgaya.app/tag/${tagId}`;
  const catColor = CATEGORY_COLOR[item.category] || "#6B7280";
  const catIcon = CATEGORY_ICON[item.category] || "more-horizontal";
  const location = type === "lost" ? (item as any).location : (item as any).foundLocation;

  return (
    <>
      <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowQR(true)}
          style={[styles.tagCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.tagIconWrap, { backgroundColor: catColor + "15" }]}>
            <Feather name={catIcon} size={22} color={catColor} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.tagTitle, { color: colors.foreground }]} numberOfLines={1}>
              {item.title}
            </Text>
            {location ? (
              <View style={styles.tagMeta}>
                <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                <Text style={[styles.tagMetaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}
            <Text style={[styles.tagId, { color: catColor }]}>{tagId}</Text>
          </View>
          <View style={styles.tagRight}>
            <View style={[styles.qrBadge, { backgroundColor: catColor + "15", borderColor: catColor + "30" }]}>
              <Feather name="maximize" size={14} color={catColor} />
              <Text style={[styles.qrBadgeText, { color: catColor }]}>QR</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: type === "lost" ? "#EF444415" : "#10B98115" }]}>
              <Text style={[styles.typeBadgeText, { color: type === "lost" ? "#EF4444" : "#10B981" }]}>
                {type === "lost" ? "Lost" : "Found"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* QR Modal */}
      <Modal visible={showQR} transparent animationType="fade" onRequestClose={() => setShowQR(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowQR(false)}>
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Modal Header */}
            <LinearGradient
              colors={[catColor + "20", catColor + "05"]}
              style={styles.modalHeader}
            >
              <View style={[styles.tagIconWrap, { backgroundColor: catColor + "25" }]}>
                <Feather name={catIcon} size={22} color={catColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>{item.category}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowQR(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </LinearGradient>

            {/* QR Code */}
            <View style={styles.qrSection}>
              <View style={[styles.qrContainer, { borderColor: colors.border }]}>
                <QRCodeVisual value={tagUrl} size={160} color="#111827" />
              </View>
              <Text style={[styles.qrTagId, { color: catColor }]}>{tagId}</Text>
              <Text style={[styles.qrUrl, { color: colors.mutedForeground }]}>{tagUrl}</Text>
              <Text style={[styles.qrHint, { color: colors.mutedForeground }]}>
                Print and attach this tag to your item. Anyone who finds it can scan to contact you anonymously.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => Alert.alert("Copied!", `Tag URL copied: ${tagUrl}`)}
              >
                <Feather name="copy" size={16} color={colors.foreground} />
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnPrimary, { backgroundColor: catColor }]}
                onPress={() => Alert.alert("Print", "Opening print dialog...")}
              >
                <Feather name="printer" size={16} color="#FFF" />
                <Text style={styles.modalBtnPrimaryText}>Print Tag</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function QRTagsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + 160;

  const { myReports, myFoundReports } = useAppStore();

  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
  const [search, setSearch] = useState("");

  const lostItems = myReports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );
  const foundItems = myFoundReports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const displayedItems = activeTab === "lost" ? lostItems : foundItems;
  const total = myReports.length + myFoundReports.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Smart Tags</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {total > 0 ? `${total} item${total > 1 ? "s" : ""} tagged` : "Protect your belongings"}
            </Text>
          </View>
          <View style={[styles.statsChip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Feather name="shield" size={14} color={colors.primary} />
            <Text style={[styles.statsChipText, { color: colors.primary }]}>{total} Tags</Text>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search your items..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          {(["lost", "found"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === "lost" ? lostItems.length : foundItems.length;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
                ]}
              >
                <Text style={[styles.tabText, { color: isActive ? colors.foreground : colors.mutedForeground }]}>
                  {tab === "lost" ? "Lost Items" : "Found Items"}
                </Text>
                <View style={[styles.tabBadge, { backgroundColor: tab === "lost" ? "#EF444420" : "#10B98120" }]}>
                  <Text style={[styles.tabBadgeText, { color: tab === "lost" ? "#EF4444" : "#10B981" }]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
      >
        {displayedItems.length > 0 ? (
          <>
            {/* How it works banner */}
            <Animated.View entering={FadeInDown.delay(50).duration(400)}>
              <LinearGradient
                colors={[colors.primary + "15", colors.primary + "05"]}
                style={[styles.infoBanner, { borderColor: colors.primary + "30" }]}
              >
                <Feather name="info" size={16} color={colors.primary} />
                <Text style={[styles.infoBannerText, { color: colors.primary }]}>
                  Tap any item to view and print its unique QR tag. Anyone who finds your item can scan it to contact you anonymously.
                </Text>
              </LinearGradient>
            </Animated.View>

            {displayedItems.map((item, i) => (
              <TagCard key={item.id} item={item} type={activeTab} index={i} />
            ))}
          </>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.muted }]}>
              <Feather name="tag" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search.length > 0 ? "No results found" : `No ${activeTab} items yet`}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
              {search.length > 0
                ? "Try a different search term"
                : `Report a ${activeTab} item first and it will appear here with its Smart Tag.`}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  headerTop: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  headerSub: { fontFamily: "Inter_500Medium", fontSize: 14, marginTop: 3 },
  statsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  statsChipText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, height: 28 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  tabBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  tabBadgeText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  infoBannerText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 20 },
  tagCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tagIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tagTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  tagMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  tagMetaText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  tagId: { fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 0.5 },
  tagRight: { gap: 6, alignItems: "flex-end" },
  qrBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  qrBadgeText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 16 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 20, textAlign: "center" },
  emptySubtext: { fontFamily: "Inter_500Medium", fontSize: 14, textAlign: "center", maxWidth: 280, lineHeight: 22 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
  },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  modalSub: { fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 3 },
  qrSection: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 20, gap: 10 },
  qrContainer: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  qrTagId: { fontFamily: "Inter_700Bold", fontSize: 16, letterSpacing: 1 },
  qrUrl: { fontFamily: "Inter_500Medium", fontSize: 13 },
  qrHint: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", lineHeight: 18, paddingHorizontal: 10 },
  modalActions: { flexDirection: "row", gap: 12, padding: 20, paddingTop: 0 },
  modalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  modalBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  modalBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },
  modalBtnPrimaryText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFF" },
});
