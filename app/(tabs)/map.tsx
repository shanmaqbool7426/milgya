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
import Animated, { 
  FadeInUp, 
  Layout, 
  ZoomIn,
  Pulse,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height, width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const SNAP_INTERVAL = CARD_WIDTH + 16;

const FILTERS = ["All", "Lost", "Found", "Mine", "Urgent", "Verified"];

// Calculate Map Bounding Box
const MIN_LAT = Math.min(...MAP_MARKERS.map(m => m.lat));
const MAX_LAT = Math.max(...MAP_MARKERS.map(m => m.lat));
const MIN_LNG = Math.min(...MAP_MARKERS.map(m => m.lng));
const MAX_LNG = Math.max(...MAP_MARKERS.map(m => m.lng));

function mapToScreen(lat: number, lng: number) {
  const latRange = MAX_LAT - MIN_LAT || 1;
  const lngRange = MAX_LNG - MIN_LNG || 1;
  const rawX = (lng - MIN_LNG) / lngRange;
  const rawY = 1 - ((lat - MIN_LAT) / latRange);
  
  return {
    x: 0.15 + (rawX * 0.7),
    y: 0.15 + (rawY * 0.7),
  };
}

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

// Marker Component with animations
function MapMarker({ 
  marker, 
  isSelected, 
  topPad, 
  height: mapHeight,
  onPress 
}: { 
  marker: MarkerPos; 
  isSelected: boolean; 
  topPad: number;
  height: number;
  onPress: () => void;
}) {
  const markerColor = marker.type === "lost" ? "#EF4444" : "#10B981";
  const scale = useSharedValue(isSelected ? 1.3 : 1);
  const opacity = useSharedValue(isSelected ? 1 : 0.8);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.3 : 1, { damping: 6, mass: 1 });
    opacity.value = withTiming(isSelected ? 1 : 0.8, { duration: 200 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.markerWrapper,
        {
          left: `${marker.x * 100}%`,
          top: topPad + 60 + marker.y * (mapHeight * 0.5),
          zIndex: isSelected ? 100 : marker.isMine ? 50 : 10,
        },
        animatedStyle,
      ]}
    >
      {isSelected && (
        <Animated.View
          entering={ZoomIn.springify()}
          style={[
            styles.pulseRing,
            {
              backgroundColor: markerColor,
            },
          ]}
        />
      )}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.markerInner,
          {
            backgroundColor: markerColor,
            borderWidth: isSelected ? 2 : marker.isMine ? 3 : 1.5,
            borderColor: marker.isMine ? "#F59E0B" : "#FFF",
            shadowColor: markerColor,
            shadowOpacity: isSelected ? 0.4 : 0.2,
            shadowRadius: isSelected ? 12 : 6,
            elevation: isSelected ? 8 : 4,
          },
        ]}
      >
        <Feather
          name={marker.isMine ? "star" : (marker.type === "lost" ? "alert-circle" : "check-circle")}
          size={12}
          color="#FFF"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

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

  const handleMarkerPress = (id: string) => {
    setSelectedMarkerId(id);
    const index = filteredMarkers.findIndex(m => m.id === id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const centerItem = viewableItems[Math.floor(viewableItems.length / 2)];
      if (centerItem && centerItem.item) {
        setSelectedMarkerId(centerItem.item.id);
      }
    }
  }, []);
  
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Enhanced Map Background */}
      <View style={[
        styles.map,
        {
          height: height,
          backgroundColor: isDark ? "#0F1419" : "#F8F9FC",
        },
      ]}>
        {/* Gradient background effect */}
        <View style={[styles.gradientOverlay, { backgroundColor: isDark ? "rgba(15,20,25,0.5)" : "rgba(248,249,252,0.5)" }]} />
        
        {/* Grid lines - horizontal */}
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((y) => (
          <View
            key={`h-${y}`}
            style={[
              styles.gridLine,
              {
                top: `${y * 100}%`,
                backgroundColor: colors.border,
                opacity: 0.25,
              },
            ]}
          />
        ))}
        {/* Grid lines - vertical */}
        {[0.2, 0.4, 0.6, 0.8].map((x) => (
          <View
            key={`v-${x}`}
            style={[
              styles.gridLineV,
              {
                left: `${x * 100}%`,
                backgroundColor: colors.border,
                opacity: 0.25,
              },
            ]}
          />
        ))}
        
        {/* Dynamic Markers */}
        {filteredMarkers.map((marker) => (
          <MapMarker
            key={marker.id}
            marker={marker}
            isSelected={selectedMarkerId === marker.id}
            topPad={topPad}
            height={height}
            onPress={() => handleMarkerPress(marker.id)}
          />
        ))}
      </View>

      {/* Floating Header with Glassmorphism */}
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[
          styles.floatingHeader,
          {
            top: topPad + 8,
            backgroundColor: `${colors.card}E8`,
            backdropFilter: "blur(10px)",
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.searchBtn,
            {
              backgroundColor: colors.muted,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <Feather name="search" size={18} color={colors.primary} />
          <Text style={[styles.searchBtnText, { color: colors.mutedForeground }]}>
            Search mapped items...
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.layerBtn,
            {
              backgroundColor: colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Feather name="layers" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Row with Better Styling */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={[styles.filterRow, { top: topPad + 75 }]}
      >
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          scrollEventThrottle={16}
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
                    backgroundColor: isActive
                      ? item === "Mine"
                        ? "#F59E0B"
                        : colors.primary
                      : colors.card,
                    borderColor: isActive ? "transparent" : colors.border,
                    borderWidth: 1,
                    shadowColor: isActive ? colors.primary : "transparent",
                    shadowOpacity: isActive ? 0.2 : 0,
                    shadowRadius: 8,
                    elevation: isActive ? 3 : 0,
                  },
                ]}
                activeOpacity={0.7}
              >
                {item === "Mine" && (
                  <Feather
                    name="star"
                    size={13}
                    color={isActive ? "#FFF" : "#F59E0B"}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive ? "#FFF" : colors.foreground,
                      fontWeight: isActive ? "700" : "600",
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>

      {/* Bottom Card List with Enhanced Styling */}
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
            contentContainerStyle={{
              paddingHorizontal: (width - CARD_WIDTH) / 2,
              gap: 16,
            }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(item) => item.id}
            getItemLayout={(data, index) => ({
              length: SNAP_INTERVAL,
              offset: SNAP_INTERVAL * index,
              index,
            })}
            renderItem={({ item }) => {
              const isSelected = selectedMarkerId === item.id;
              const accentColor = item.type === "lost" ? "#EF4444" : "#10B981";

              return (
                <Animated.View
                  layout={Layout.springify()}
                  entering={FadeInUp.delay(200).springify()}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleMarkerPress(item.id)}
                    style={[
                      styles.listCard,
                      {
                        width: CARD_WIDTH,
                        backgroundColor: colors.card,
                        borderColor: isSelected ? accentColor : colors.border,
                        borderWidth: isSelected ? 2.5 : 1,
                        shadowColor: isSelected ? accentColor : "#000",
                        shadowOpacity: isSelected ? 0.25 : 0.08,
                        shadowRadius: isSelected ? 16 : 8,
                        elevation: isSelected ? 10 : 3,
                      },
                    ]}
                  >
                    {/* Accent line at top */}
                    {isSelected && (
                      <View
                        style={[
                          styles.accentTop,
                          { backgroundColor: accentColor },
                        ]}
                      />
                    )}

                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.iconWrap,
                          { backgroundColor: `${accentColor}15` },
                        ]}
                      >
                        <Feather
                          name={item.type === "lost" ? "alert-circle" : "check-circle"}
                          size={18}
                          color={accentColor}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.cardTitle, { color: colors.foreground }]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.cardSubtitle,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {item.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Badge
                        label={item.type === "lost" ? "Lost" : "Found"}
                        variant={item.type === "lost" ? "destructive" : "success"}
                      />
                      {item.isMine && <Badge label="My Report" variant="accent" />}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />
        ) : (
          <Animated.View
            entering={FadeInUp.springify()}
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather
              name="inbox"
              size={32}
              color={colors.mutedForeground}
              style={{ marginBottom: 8, opacity: 0.6 }}
            />
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                marginBottom: 4,
              }}
            >
              No items found
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Try adjusting your filters to see more items
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Info Badge - Bottom Right */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(400)}
        style={[
          styles.infoBadge,
          {
            bottom: bottomPad + 130,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Feather name="map-pin" size={12} color="#FFF" />
        <Text style={styles.infoBadgeText}>
          {filteredMarkers.length} items
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  map: { position: "absolute", top: 0, left: 0, right: 0 },
  gradientOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1 },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1 },

  markerWrapper: {
    position: "absolute",
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.3,
  },

  floatingHeader: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchBtnText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  layerBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  filterRow: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  bottomListWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 130,
  },
  listCard: {
    padding: 16,
    borderRadius: 20,
    height: 120,
    justifyContent: "space-between",
  },
  accentTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  emptyState: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBadge: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  infoBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#FFF",
  },
});
