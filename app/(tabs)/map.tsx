import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Dimensions, Platform, ViewToken, useColorScheme
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/ui/Badge";
import { MAP_MARKERS } from "@/constants/mockData";
import { useAppStore } from "@/hooks/useAppStore";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

const { height, width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const SNAP_INTERVAL = CARD_WIDTH + 16; // width + gap

const FILTERS = ["All", "Lost", "Found", "Mine", "Urgent", "Verified"];

// Calculate Map Bounding Box to dynamically place pins
const MIN_LAT = Math.min(...MAP_MARKERS.map(m => m.lat));
const MAX_LAT = Math.max(...MAP_MARKERS.map(m => m.lat));
const MIN_LNG = Math.min(...MAP_MARKERS.map(m => m.lng));
const MAX_LNG = Math.max(...MAP_MARKERS.map(m => m.lng));

// Function to safely map lat/lng to screen percentages (with some padding)
function mapToScreen(lat: number, lng: number) {
  const latRange = MAX_LAT - MIN_LAT || 1;
  const lngRange = MAX_LNG - MIN_LNG || 1;
  // X = longitude (left to right), Y = latitude (top to bottom inverted)
  const rawX = (lng - MIN_LNG) / lngRange;
  const rawY = 1 - ((lat - MIN_LAT) / latRange);
  
  // Pad the edges so markers don't clip outside (constrain between 0.15 and 0.85)
  return {
    x: 0.15 + (rawX * 0.7),
    y: 0.15 + (rawY * 0.7),
  };
}

// Pseudo-random lat/lng for user's own reports to integrate seamlessly
function generateMockCoords(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i) | 0;
  const latOffset = (Math.abs(h % 1000) / 1000) * (MAX_LAT - MIN_LAT);
  const lngOffset = (Math.abs((h >> 5) % 1000) / 1000) * (MAX_LNG - MIN_LNG);
  return { lat: MIN_LAT + latOffset, lng: MIN_LNG + lngOffset };
}

type MarkerPos = {
  id: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  type: "lost" | "found";
  isMine: boolean;
  title: string;
  category: string;
};

export default function MapScreen() {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0);
  const { myReports, myFoundReports } = useAppStore();

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  const allMarkers: MarkerPos[] = useMemo(() => {
    const baseMarkers: MarkerPos[] = MAP_MARKERS.map(m => {
      const { x, y } = mapToScreen(m.lat, m.lng);
      return { ...m, x, y, isMine: false, title: m.title, category: m.category || "Unknown" };
    });

    const lostMine: MarkerPos[] = myReports.map(r => {
      const coords = generateMockCoords(r.id);
      const { x, y } = mapToScreen(coords.lat, coords.lng);
      return { id: r.id, type: "lost", isMine: true, title: r.title, category: r.category, ...coords, x, y };
    });

    const foundMine: MarkerPos[] = myFoundReports.map(r => {
      const coords = generateMockCoords(r.id + "f");
      const { x, y } = mapToScreen(coords.lat, coords.lng);
      return { id: r.id, type: "found", isMine: true, title: r.title, category: r.category, ...coords, x, y };
    });

    return [...baseMarkers, ...lostMine, ...foundMine];
  }, [myReports, myFoundReports]);

  const filteredMarkers = useMemo(() => {
    return allMarkers.filter((m) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Lost") return m.type === "lost";
      if (activeFilter === "Found") return m.type === "found";
      if (activeFilter === "Mine") return m.isMine;
      return true;
    });
  }, [allMarkers, activeFilter]);

  // Handle Map Pin Click -> Scroll List
  const handleMarkerPress = (id: string) => {
    setSelectedMarkerId(id);
    const index = filteredMarkers.findIndex(m => m.id === id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  };

  // Handle List Scroll -> Highlight Map Pin
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      // Find the item most in the center
      const centerItem = viewableItems[Math.floor(viewableItems.length / 2)];
      if (centerItem && centerItem.item) {
        setSelectedMarkerId(centerItem.item.id);
      }
    }
  }, []);
  
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map Background Grid */}
      <View style={[styles.map, { height: height, backgroundColor: isDark ? "#1A1D24" : "#F3F4F6" }]}>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((y) => (
          <View key={`h-${y}`} style={[styles.gridLine, { top: `${y * 100}%`, backgroundColor: colors.border, opacity: 0.4 }]} />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((x) => (
          <View key={`v-${x}`} style={[styles.gridLineV, { left: `${x * 100}%`, backgroundColor: colors.border, opacity: 0.4 }]} />
        ))}
        
        {/* Dynamic Markers */}
        {filteredMarkers.map((marker) => {
          const isSelected = selectedMarkerId === marker.id;
          const markerColor = marker.type === "lost" ? "#EF4444" : "#10B981";
          
          return (
            <TouchableOpacity
              key={marker.id}
              activeOpacity={0.8}
              onPress={() => handleMarkerPress(marker.id)}
              style={[
                styles.markerWrapper,
                {
                  left: `${marker.x * 100}%`,
                  top: topPad + 60 + marker.y * (height * 0.5),
                  zIndex: isSelected ? 100 : marker.isMine ? 50 : 10,
                  transform: [{ scale: isSelected ? 1.3 : 1 }],
                },
              ]}
            >
              {isSelected && (
                <View style={[styles.pulseRing, { backgroundColor: markerColor }]} />
              )}
              <View style={[
                styles.markerInner, 
                { 
                  backgroundColor: markerColor,
                  borderWidth: isSelected ? 2 : marker.isMine ? 3 : 1.5,
                  borderColor: marker.isMine ? "#F59E0B" : "#FFF"
                }
              ]}>
                <Feather 
                  name={marker.isMine ? "star" : (marker.type === "lost" ? "alert-circle" : "check-circle")} 
                  size={12} 
                  color="#FFF" 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Header Actions */}
      <Animated.View entering={FadeInUp.duration(400)} style={[styles.floatingHeader, { top: topPad + 8 }]}>
        <View style={[styles.searchBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.primary} />
          <Text style={[styles.searchBtnText, { color: colors.mutedForeground }]}>Search mapped items...</Text>
        </View>
        <TouchableOpacity style={[styles.layerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="layers" size={20} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Row */}
      <View style={[styles.filterRow, { top: topPad + 70 }]}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          renderItem={({ item }) => {
            const isActive = activeFilter === item;
            return (
              <TouchableOpacity
                onPress={() => {
                  setActiveFilter(item);
                  setSelectedMarkerId(null);
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? (item === "Mine" ? "#F59E0B" : colors.primary) : colors.card,
                    borderColor: isActive ? "transparent" : colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                {item === "Mine" && (
                  <Feather
                    name="star"
                    size={12}
                    color={isActive ? "#FFF" : "#F59E0B"}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text style={[styles.chipText, { color: isActive ? "#FFF" : colors.foreground }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Bottom Horizontal List */}
      <View style={[styles.bottomListWrapper, { bottom: bottomPad }]}>
        {filteredMarkers.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={filteredMarkers}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2, gap: 16 }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={item => item.id}
            getItemLayout={(data, index) => ({ length: SNAP_INTERVAL, offset: SNAP_INTERVAL * index, index })}
            renderItem={({ item }) => {
              const isSelected = selectedMarkerId === item.id;
              const accentColor = item.type === "lost" ? "#EF4444" : "#10B981";
              
              return (
                <Animated.View layout={Layout}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.listCard,
                      {
                        width: CARD_WIDTH,
                        backgroundColor: colors.card,
                        borderColor: isSelected ? accentColor : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                        shadowColor: isSelected ? accentColor : "#000",
                      }
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconWrap, { backgroundColor: `${accentColor}15` }]}>
                        <Feather name={item.type === "lost" ? "alert-circle" : "check-circle"} size={18} color={accentColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{item.category}</Text>
                      </View>
                    </View>
                    <View style={styles.cardFooter}>
                      <Badge label={item.type === "lost" ? "Lost" : "Found"} variant={item.type === "lost" ? "destructive" : "success"} />
                      {item.isMine && <Badge label="My Report" variant="accent" />}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>No items found for this filter.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  map: { position: "absolute", top: 0, left: 0, right: 0 },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1 },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1 },
  
  markerWrapper: {
    position: "absolute",
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pulseRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.25,
  },
  
  floatingHeader: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  searchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  searchBtnText: { fontFamily: "Inter_500Medium", fontSize: 15 },
  layerBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  
  filterRow: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  
  bottomListWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 120,
  },
  listCard: {
    padding: 16,
    borderRadius: 20,
    height: 110,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  emptyState: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  }
});
