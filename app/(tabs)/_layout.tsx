import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 10,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 10,
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} colors={colors} insets={insets} isDark={isDark} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="qr-tags" options={{ title: "Tags", href: null }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="community" options={{ title: "Profile", href: null }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation, colors, insets, isDark }: any) {
  const isIOS = Platform.OS === "ios";

  // Tab routes to show (not the FAB)
  const visibleTabs = state.routes.filter((r: any) => 
    ["index", "map", "search", "profile"].includes(r.name)
  );

  // Split into left 2 and right 2 to create space for center FAB
  const leftTabs = visibleTabs.slice(0, 2);
  const rightTabs = visibleTabs.slice(2, 4);

  const tabIcons: Record<string, string> = {
    index: "home",
    map: "map",
    search: "search",
    profile: "user",
  };
  const tabLabels: Record<string, string> = {
    index: "Home",
    map: "Map",
    search: "Search",
    profile: "Profile",
  };

  function renderTab(route: any) {
    const isFocused = state.index === state.routes.findIndex((r: any) => r.name === route.name);
    const icon = tabIcons[route.name] || "circle";
    const label = tabLabels[route.name] || route.name;

    return (
      <TouchableOpacity
        key={route.name}
        onPress={() => navigation.navigate(route.name)}
        activeOpacity={0.7}
        style={styles.tabItem}
      >
        <Feather
          name={icon as any}
          size={22}
          color={isFocused ? colors.primary : colors.mutedForeground}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? colors.primary : colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.tabBar, { 
      backgroundColor: isDark ? colors.card : "#FFFFFF", 
      borderTopColor: colors.border,
      paddingBottom: insets.bottom,
    }]}>
      {/* Left tabs */}
      <View style={styles.tabSide}>
        {leftTabs.map(renderTab)}
      </View>

      {/* Center FAB */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          onPress={() => router.push("/report/lost")}
          activeOpacity={0.85}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={[styles.fabLabel, { color: colors.mutedForeground }]}>Report</Text>
      </View>

      {/* Right tabs */}
      <View style={styles.tabSide}>
        {rightTabs.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderTopWidth: 1,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 16,
    height: 80,
  },
  tabSide: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingTop: 2,
  },
  tabLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  fabWrapper: {
    width: 72,
    alignItems: "center",
    marginTop: -20,
    gap: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B67FF",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  fabLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
});
