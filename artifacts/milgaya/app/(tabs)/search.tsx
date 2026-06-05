import React, { useState, useRef, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Platform, Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LostItemCard, FoundItemCard } from "@/components/ItemCard";
import { LOST_ITEMS, FOUND_ITEMS, CATEGORIES } from "@/constants/mockData";
import { useAppStore } from "@/hooks/useAppStore";
import { Badge } from "@/components/ui/Badge";

const RECENT_SEARCHES = ["Black backpack", "iPhone 15", "Brown wallet", "Car keys", "Passport"];
const TYPE_FILTERS = ["All", "Lost", "Found"];
const STATUS_FILTERS = ["Any", "Active", "Recovered"];

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

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const { myReports, myFoundReports } = useAppStore();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Any");
  const [activeCategory, setActiveCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isSearching = query.length > 0 || activeCategory !== "";

  const activeFilterCount = [
    typeFilter !== "All",
    statusFilter !== "Any",
    activeCategory !== "",
  ].filter(Boolean).length;

  const allItems = useMemo(() => [
    ...LOST_ITEMS.map((i) => ({ ...i, _type: "lost" as const, _mine: false })),
    ...myReports.map((i) => ({ ...i, _type: "lost" as const, _mine: true })),
    ...FOUND_ITEMS.map((i) => ({ ...i, _type: "found" as const, _mine: false })),
    ...myFoundReports.map((i) => ({ ...i, _type: "found" as const, _mine: true })),
  ], [myReports, myFoundReports]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allItems.filter((item) => {
      const matchesQuery = !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        ("location" in item ? (item.location ?? "").toLowerCase().includes(q) : false) ||
        ("foundLocation" in item ? (item.foundLocation ?? "").toLowerCase().includes(q) : false);

      const matchesType =
        typeFilter === "All" ||
        (typeFilter === "Lost" && item._type === "lost") ||
        (typeFilter === "Found" && item._type === "found");

      const matchesCategory = !activeCategory || item.category === activeCategory;

      const matchesStatus =
        statusFilter === "Any" ||
        item._type === "found" ||
        (statusFilter === "Active" && (item as any).status === "active") ||
        (statusFilter === "Recovered" && (item as any).status === "recovered");

      return matchesQuery && matchesType && matchesCategory && matchesStatus;
    });
  }, [allItems, query, typeFilter, activeCategory, statusFilter]);

  function clearFilters() {
    setTypeFilter("All");
    setStatusFilter("Any");
    setActiveCategory("");
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Items, categories, locations…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            autoFocus={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter row */}
        <View style={styles.filterRow}>
          {TYPE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setTypeFilter(f)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: typeFilter === f ? colors.primary : colors.muted,
                  borderColor: typeFilter === f ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: typeFilter === f ? "#FFF" : colors.mutedForeground }]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            style={[
              styles.sortBtn,
              {
                backgroundColor: showFilters || activeFilterCount > 0 ? `${colors.primary}15` : colors.muted,
                borderColor: showFilters || activeFilterCount > 0 ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather name="sliders" size={15} color={activeFilterCount > 0 ? colors.primary : colors.mutedForeground} />
            {activeFilterCount > 0 && (
              <View style={[styles.filterDot, { backgroundColor: colors.primary }]}>
                <Text style={styles.filterDotText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Expandable filter panel */}
        {showFilters && (
          <View style={[styles.filterPanel, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <View style={styles.filterPanelRow}>
              <Text style={[styles.filterPanelLabel, { color: colors.foreground }]}>Status</Text>
              <View style={styles.filterPanelChips}>
                {STATUS_FILTERS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatusFilter(s)}
                    style={[
                      styles.panelChip,
                      {
                        backgroundColor: statusFilter === s ? colors.primary : colors.card,
                        borderColor: statusFilter === s ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {s === "Recovered" && (
                      <Feather name="check-circle" size={12} color={statusFilter === s ? "#FFF" : colors.success} style={{ marginRight: 4 }} />
                    )}
                    {s === "Active" && (
                      <Feather name="alert-circle" size={12} color={statusFilter === s ? "#FFF" : colors.primary} style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.panelChipText, { color: statusFilter === s ? "#FFF" : colors.foreground }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterPanelRow}>
              <Text style={[styles.filterPanelLabel, { color: colors.foreground }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {CATEGORIES.map((cat) => {
                  const color = CATEGORY_COLORS[cat.label] ?? "#6B7280";
                  const selected = activeCategory === cat.label;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setActiveCategory(selected ? "" : cat.label)}
                      style={[
                        styles.panelChip,
                        {
                          backgroundColor: selected ? `${color}20` : colors.card,
                          borderColor: selected ? color : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.panelChipText, { color: selected ? color : colors.foreground }]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersBtn}>
                <Text style={[styles.clearFiltersText, { color: colors.destructive }]}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Body */}
      {!isSearching ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 90 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Searches</Text>
              <TouchableOpacity>
                <Text style={[styles.clear, { color: colors.primary }]}>Clear all</Text>
              </TouchableOpacity>
            </View>
            {RECENT_SEARCHES.map((search) => (
              <TouchableOpacity
                key={search}
                onPress={() => setQuery(search)}
                style={[styles.recentRow, { borderBottomColor: colors.border }]}
              >
                <Feather name="clock" size={15} color={colors.mutedForeground} />
                <Text style={[styles.recentText, { color: colors.foreground }]}>{search}</Text>
                <Feather name="arrow-up-left" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Browse Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse Categories</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat.label] ?? "#6B7280";
                const icon = (CATEGORY_ICONS[cat.label] ?? "box") as any;
                const selected = activeCategory === cat.label;
                const count = allItems.filter((i) => i.category === cat.label).length;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setActiveCategory(selected ? "" : cat.label)}
                    style={[
                      styles.catCard,
                      {
                        backgroundColor: selected ? `${color}15` : colors.card,
                        borderColor: selected ? color : colors.border,
                        borderWidth: selected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.catIconWrap, { backgroundColor: `${color}15` }]}>
                      <Feather name={icon} size={22} color={color} />
                    </View>
                    <Text style={[styles.catLabel, { color: selected ? color : colors.foreground }]}>{cat.label}</Text>
                    <Text style={[styles.catCount, { color: colors.mutedForeground }]}>{count} item{count !== 1 ? "s" : ""}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => `${item._type}-${item.id}`}
          contentContainerStyle={[styles.resultsList, { paddingBottom: bottomPad + 90 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                {query ? ` for "${query}"` : ""}
                {activeCategory ? ` in ${activeCategory}` : ""}
              </Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={[styles.clear, { color: colors.primary }]}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const card = item._type === "lost" ? (
              <LostItemCard item={item as any} onPress={() => router.push(`/item/lost/${item.id}`)} />
            ) : (
              <FoundItemCard item={item as any} onPress={() => router.push(`/item/found/${item.id}`)} />
            );
            if (!item._mine) return card;
            return (
              <View>
                {card}
                <View style={[styles.minePill, { backgroundColor: `${colors.primary}12` }]}>
                  <Feather name="star" size={11} color={colors.primary} />
                  <Text style={[styles.minePillText, { color: colors.primary }]}>Your report</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="search" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Try different keywords or adjust your filters
              </Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={[styles.clearBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.clearBtnText}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    height: 26,
  },
  filterRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  sortBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDotText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#FFF" },
  filterPanel: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  filterPanelRow: { gap: 8 },
  filterPanelLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  filterPanelChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  panelChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  panelChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  clearFiltersBtn: { alignSelf: "flex-start" },
  clearFiltersText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  clear: { fontFamily: "Inter_500Medium", fontSize: 13 },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentText: { fontFamily: "Inter_400Regular", fontSize: 15, flex: 1 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: {
    width: "47%",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    gap: 6,
  },
  catIconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  catLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  catCount: { fontFamily: "Inter_400Regular", fontSize: 12 },
  resultsList: { paddingHorizontal: 20, paddingTop: 12 },
  resultsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  resultsCount: { fontFamily: "Inter_400Regular", fontSize: 13 },
  minePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginTop: -6,
    marginBottom: 8,
    marginRight: 4,
  },
  minePillText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  empty: { alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 80 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, marginTop: 4 },
  clearBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFF" },
});
