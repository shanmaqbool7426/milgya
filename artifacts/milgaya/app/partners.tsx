import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PartnerCard } from "@/components/PartnerCard";
import { PARTNERS } from "@/constants/mockData";
import type { Partner } from "@/constants/types";

const FILTER_TYPES = [
  { id: "all", label: "All" },
  { id: "shop", label: "Shops" },
  { id: "school", label: "Schools" },
  { id: "police", label: "Police" },
  { id: "petrol", label: "Petrol Pumps" },
  { id: "hospital", label: "Hospitals" },
];

export default function PartnersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? PARTNERS : PARTNERS.filter((p) => p.type === filter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Recovery Partners</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Verified locations holding found items
          </Text>
        </View>
        <View style={[styles.totalBadge, { backgroundColor: colors.secondary }]}>
          <Feather name="shield" size={14} color={colors.primary} />
          <Text style={[styles.totalText, { color: colors.primary }]}>{PARTNERS.length} Verified</Text>
        </View>
      </View>

      <View style={[styles.filterWrap, { borderBottomColor: colors.border }]}>
        <FlatList
          data={FILTER_TYPES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === item.id ? colors.primary : colors.muted,
                  borderColor: filter === item.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === item.id ? "#FFFFFF" : colors.mutedForeground }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PartnerCard partner={item} onPress={() => {}} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="map-pin" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No partners found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Try a different filter</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  totalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  totalText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  filterWrap: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
});
