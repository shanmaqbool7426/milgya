import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LostItemCard, FoundItemCard } from "@/components/ItemCard";
import { LOST_ITEMS, FOUND_ITEMS, CATEGORIES } from "@/constants/mockData";

const RECENT_SEARCHES = ["Black backpack", "iPhone 15", "Brown wallet", "Car keys", "Passport"];
const FILTER_OPTIONS = ["All", "Lost", "Found"];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCategory, setActiveCategory] = useState("");
  const inputRef = useRef<TextInput>(null);

  const isSearching = query.length > 0;

  const allItems = [
    ...LOST_ITEMS.map((i) => ({ ...i, _type: "lost" as const })),
    ...FOUND_ITEMS.map((i) => ({ ...i, _type: "found" as const })),
  ];

  const filtered = allItems.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === "All" || item._type === activeFilter.toLowerCase();
    const matchesCategory = !activeCategory || item.category === activeCategory;
    return matchesQuery && matchesFilter && matchesCategory;
  });

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search items, categories, locations..."
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
          {FILTER_OPTIONS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: activeFilter === f ? colors.primary : colors.muted,
                  borderColor: activeFilter === f ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: activeFilter === f ? "#FFF" : colors.mutedForeground }]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={[styles.sortBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="sliders" size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

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
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setActiveCategory(selected ? "" : cat.label);
                      setQuery(selected ? "" : cat.label);
                    }}
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
                    <Text style={[styles.catCount, { color: colors.mutedForeground }]}>
                      {allItems.filter((i) => i.category === cat.label).length} items
                    </Text>
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
            <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
            </Text>
          }
          renderItem={({ item }) =>
            item._type === "lost" ? (
              <LostItemCard item={item as any} onPress={() => router.push(`/item/lost/${item.id}`)} />
            ) : (
              <FoundItemCard item={item as any} onPress={() => router.push(`/item/found/${item.id}`)} />
            )
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="search" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Try different keywords or browse categories
              </Text>
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
  resultsCount: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 12 },
  empty: { alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 80 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
});
