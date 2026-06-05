import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/ui/Button";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.hero, { paddingTop: topPad + 40 }]}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <Feather name="search" size={36} color="#FFFFFF" />
        </View>
        <View style={[styles.logoRing1, { borderColor: `${colors.primary}30` }]} />
        <View style={[styles.logoRing2, { borderColor: `${colors.primary}15` }]} />

        <View style={styles.logoText}>
          <Text style={[styles.appName, { color: colors.foreground }]}>MilGaya</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Your Community Lost & Found Network
          </Text>
        </View>

        <View style={[styles.statRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <StatPill icon="package" value="12K+" label="Items Recovered" color={colors.primary} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatPill icon="users" value="50K+" label="Community Members" color={colors.accent} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatPill icon="map-pin" value="100+" label="Partner Locations" color="#8B5CF6" />
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: bottomPad + 24 }]}>
        <Button
          title="Sign In"
          onPress={() => router.replace("/(tabs)")}
          fullWidth
          size="lg"
        />
        <Button
          title="Create Account"
          onPress={() => router.replace("/(tabs)")}
          variant="outline"
          fullWidth
          size="lg"
        />
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={styles.guest}
        >
          <Text style={[styles.guestText, { color: colors.mutedForeground }]}>
            Continue as Guest
          </Text>
          <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatPill({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.stat}>
      <Feather name={icon as any} size={16} color={color} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B4DDE",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  logoRing1: {
    position: "absolute",
    top: 40 + 8,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
  },
  logoRing2: {
    position: "absolute",
    top: 40 - 12,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
  },
  logoText: {
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  statRow: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 40,
  },
  actions: {
    paddingHorizontal: 32,
    gap: 12,
    alignItems: "center",
  },
  guest: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  guestText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
