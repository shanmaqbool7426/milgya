import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Dimensions, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/ui/Badge";
import { MAP_MARKERS } from "@/constants/mockData";
import { useAppStore } from "@/hooks/useAppStore";

const { height } = Dimensions.get("window");

const FILTERS = ["All", "Lost", "Found", "Mine", "Urgent", "Verified"];

const MOCK_MARKER_POSITIONS = [
  { id: "l1", x: 0.3,  y: 0.35, type: "lost" as const,  isMine: false },
  { id: "l2", x: 0.65, y: 0.55, type: "lost" as const,  isMine: false },
  { id: "l3", x: 0.48, y: 0.42, type: "lost" as const,  isMine: false },
  { id: "f1", x: 0.28, y: 0.28, type: "found" as const, isMine: false },
  { id: "f2", x: 0.72, y: 0.32, type: "found" as const, isMine: false },
  { id: "f3", x: 0.5,  y: 0.6,  type: "found" as const, isMine: false },
];

function stablePos(id: string, slot: number): { x: number; y: number } {
  let h = 5381;
  const s = id + String(slot);
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff;
  }
  const x = 0.08 + ((h % 840) / 1000);
  const y = 0.08 + (((h >> 4) % 760) / 1000);
  return { x: Math.min(x, 0.88), y: Math.min(y, 0.84) };
}

type MarkerPos = {
  id: string;
  x: number;
  y: number;
  type: "lost" | "found";
  isMine: boolean;
  title?: string;
  category?: string;
};

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const { myReports, myFoundReports } = useAppStore();

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const mapHeight = height - topPad - bottomPad - 90;

  const myMarkers = useMemo<MarkerPos[]>(() => {
    const lost: MarkerPos[] = myReports.map((r, i) => ({
      ...stablePos(r.id, i),
      id: r.id,
      type: "lost",
      isMine: true,
      title: r.title,
      category: r.category,
    }));
    const found: MarkerPos[] = myFoundReports.map((r, i) => ({
      ...stablePos(r.id, i + 100),
      id: r.id,
      type: "found",
      isMine: true,
      title: r.title,
      category: r.category,
    }));
    return [...lost, ...found];
  }, [myReports, myFoundReports]);

  const allMarkers: MarkerPos[] = useMemo(
    () => [...MOCK_MARKER_POSITIONS, ...myMarkers],
    [myMarkers]
  );

  const filteredMarkers = useMemo(() => {
    return allMarkers.filter((m) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Lost") return m.type === "lost";
      if (activeFilter === "Found") return m.type === "found";
      if (activeFilter === "Mine") return m.isMine;
      return true;
    });
  }, [allMarkers, activeFilter]);

  const selectedMockItem = selectedMarker
    ? MAP_MARKERS.find((m) => m.id === selectedMarker)
    : null;

  const selectedMyItem = selectedMarker
    ? myMarkers.find((m) => m.id === selectedMarker)
    : null;

  const myLostCount = myReports.length;
  const myFoundCount = myFoundReports.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map mockup */}
      <View style={[styles.map, { height: mapHeight + topPad + 56, backgroundColor: colors.muted }]}>
        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map((y) => (
          <View key={y} style={[styles.gridLine, { top: `${y * 100}%`, backgroundColor: colors.border }]} />
        ))}
        {[0.25, 0.5, 0.75].map((x) => (
          <View key={x} style={[styles.gridLineV, { left: `${x * 100}%`, backgroundColor: colors.border }]} />
        ))}

        {/* Road-like lines */}
        <View style={[styles.road, styles.roadH1, { backgroundColor: colors.border, opacity: 0.6 }]} />
        <View style={[styles.road, styles.roadH2, { backgroundColor: colors.border, opacity: 0.4 }]} />
        <View style={[styles.road, styles.roadV1, { backgroundColor: colors.border, opacity: 0.5 }]} />

        {/* Map label */}
        <View style={[styles.mapLabel, { top: topPad + 10, backgroundColor: `${colors.foreground}10` }]}>
          <Feather name="info" size={12} color={colors.mutedForeground} />
          <Text style={[styles.mapLabelText, { color: colors.mutedForeground }]}>Interactive map — Koramangala, Bangalore</Text>
        </View>

        {/* Community markers */}
        {filteredMarkers.filter((m) => !m.isMine).map((marker) => (
          <TouchableOpacity
            key={marker.id}
            onPress={() => setSelectedMarker(selectedMarker === marker.id ? null : marker.id)}
            style={[
              styles.marker,
              {
                left: `${marker.x * 100}%`,
                top: topPad + 30 + marker.y * (mapHeight * 0.65),
                backgroundColor: marker.type === "lost" ? "#EF4444" : "#10B981",
                borderColor: selectedMarker === marker.id ? "#FFF" : "transparent",
                borderWidth: selectedMarker === marker.id ? 3 : 0,
                transform: [{ scale: selectedMarker === marker.id ? 1.2 : 1 }],
              },
            ]}
          >
            <Feather name={marker.type === "lost" ? "alert-circle" : "check-circle"} size={14} color="#FFF" />
          </TouchableOpacity>
        ))}

        {/* My item markers — rendered on top, distinct gold ring style */}
        {filteredMarkers.filter((m) => m.isMine).map((marker) => (
          <TouchableOpacity
            key={marker.id}
            onPress={() => setSelectedMarker(selectedMarker === marker.id ? null : marker.id)}
            style={[
              styles.marker,
              styles.myMarker,
              {
                left: `${marker.x * 100}%`,
                top: topPad + 30 + marker.y * (mapHeight * 0.65),
                backgroundColor: marker.type === "lost" ? "#EF4444" : "#10B981",
                borderColor: selectedMarker === marker.id ? "#FFF" : "#F59E0B",
                transform: [{ scale: selectedMarker === marker.id ? 1.2 : 1 }],
              },
            ]}
          >
            <Feather name="star" size={13} color="#FFF" />
          </TouchableOpacity>
        ))}

        {/* My location dot */}
        <View style={[styles.myLocation, { left: "48%", top: topPad + 30 + mapHeight * 0.4, borderColor: colors.primary }]}>
          <View style={[styles.myLocationDot, { backgroundColor: colors.primary }]} />
        </View>
      </View>

      {/* Floating header */}
      <View style={[styles.floatingHeader, { top: topPad + 8, paddingHorizontal: 16 }]}>
        <View style={[styles.searchBtn, { backgroundColor: colors.card }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <Text style={[styles.searchBtnText, { color: colors.mutedForeground }]}>Search on map...</Text>
        </View>
        <TouchableOpacity style={[styles.layerBtn, { backgroundColor: colors.card }]}>
          <Feather name="layers" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={[styles.filterRow, { top: topPad + 60 }]}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: activeFilter === item
                    ? (item === "Mine" ? "#F59E0B" : colors.primary)
                    : colors.card,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                },
              ]}
            >
              {item === "Mine" && (
                <Feather
                  name="star"
                  size={12}
                  color={activeFilter === "Mine" ? "#FFF" : "#F59E0B"}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text style={[styles.chipText, { color: activeFilter === item ? "#FFF" : colors.foreground }]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { bottom: bottomPad + 90 }]}>
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.stat}>
            <View style={[styles.statDot, { backgroundColor: "#EF4444" }]} />
            <Text style={[styles.statNum, { color: colors.foreground }]}>
              {MAP_MARKERS.filter((m) => m.type === "lost").length + myLostCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Lost</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <View style={[styles.statDot, { backgroundColor: "#10B981" }]} />
            <Text style={[styles.statNum, { color: colors.foreground }]}>
              {MAP_MARKERS.filter((m) => m.type === "found").length + myFoundCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Found</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <View style={[styles.statDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={[styles.statNum, { color: colors.foreground }]}>
              {myLostCount + myFoundCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Mine</Text>
          </View>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPad + 100, right: 20 }]}
      >
        <Feather name="navigation" size={22} color="#FFF" />
      </TouchableOpacity>

      {/* Selected community item popup */}
      {selectedMockItem && !selectedMyItem && (
        <View style={[styles.popup, { backgroundColor: colors.card, borderColor: colors.border, bottom: bottomPad + 160 }]}>
          <View style={[styles.popupIcon, { backgroundColor: selectedMockItem.type === "lost" ? "#EF444420" : "#10B98120" }]}>
            <Feather
              name={selectedMockItem.type === "lost" ? "alert-circle" : "check-circle"}
              size={20}
              color={selectedMockItem.type === "lost" ? "#EF4444" : "#10B981"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.popupTitle, { color: colors.foreground }]}>{selectedMockItem.title}</Text>
            <Text style={[styles.popupCat, { color: colors.mutedForeground }]}>{selectedMockItem.category}</Text>
          </View>
          <Badge
            label={selectedMockItem.type === "lost" ? "Lost" : "Found"}
            variant={selectedMockItem.type === "lost" ? "destructive" : "success"}
          />
        </View>
      )}

      {/* Selected my item popup */}
      {selectedMyItem && (
        <View style={[styles.popup, { backgroundColor: colors.card, borderColor: "#F59E0B", borderWidth: 1.5, bottom: bottomPad + 160 }]}>
          <View style={[styles.popupIcon, { backgroundColor: "#F59E0B20" }]}>
            <Feather name="star" size={20} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.popupTitle, { color: colors.foreground }]}>
              {selectedMyItem.title ?? (selectedMyItem.type === "lost" ? "My Lost Report" : "My Found Report")}
            </Text>
            <Text style={[styles.popupCat, { color: colors.mutedForeground }]}>
              {selectedMyItem.category ?? "—"} · Your report
            </Text>
          </View>
          <Badge
            label={selectedMyItem.type === "lost" ? "Lost" : "Found"}
            variant={selectedMyItem.type === "lost" ? "destructive" : "success"}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { position: "absolute", top: 0, left: 0, right: 0 },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1 },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1 },
  road: { position: "absolute", backgroundColor: "#00000010" },
  roadH1: { height: 8, left: 0, right: 0, top: "38%" },
  roadH2: { height: 5, left: 0, right: 0, top: "62%" },
  roadV1: { width: 6, top: 0, bottom: 0, left: "45%" },
  mapLabel: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  mapLabelText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  marker: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginLeft: -17,
    marginTop: -17,
  },
  myMarker: {
    borderWidth: 3,
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: -19,
    marginTop: -19,
    shadowColor: "#F59E0B",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  myLocation: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -11,
    marginTop: -11,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  myLocationDot: { width: 10, height: 10, borderRadius: 5 },
  floatingHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
  },
  searchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  searchBtnText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  layerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  filterRow: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
  },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  statsBar: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statNum: { fontFamily: "Inter_700Bold", fontSize: 18 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  divider: { width: 1, height: 30, marginHorizontal: 4 },
  fab: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B4DDE",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  popup: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  popupIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  popupTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  popupCat: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
});
