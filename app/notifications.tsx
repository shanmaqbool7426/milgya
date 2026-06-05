import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { NotificationCard } from "@/components/NotificationCard";
import { NOTIFICATIONS } from "@/constants/mockData";
import { useAppStore } from "@/hooks/useAppStore";
import type { Notification } from "@/constants/types";

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const { notifications: storeNotifs, markNotificationRead, markAllNotificationsRead, unreadCount } = useAppStore();

  // Merge store notifications (match alerts) on top of static mock ones, deduped by id
  const storeIds = new Set(storeNotifs.map((n) => n.id));
  const mockFiltered = NOTIFICATIONS.filter((n) => !storeIds.has(n.id));
  const allNotifications: Notification[] = [...storeNotifs, ...mockFiltered];

  const handlePress = (id: string) => {
    markNotificationRead(id);
  };

  const handleMarkAll = () => {
    markAllNotificationsRead();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAll} style={[styles.markAll, { backgroundColor: colors.secondary }]}>
            <Feather name="check-square" size={14} color={colors.primary} />
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={allNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard item={item} onPress={() => handlePress(item.id)} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          storeNotifs.filter((n) => n.type === "match").length > 0 ? (
            <View style={[styles.matchBanner, { backgroundColor: `#F59E0B18`, borderColor: `#F59E0B30` }]}>
              <Feather name="zap" size={15} color="#F59E0B" />
              <Text style={[styles.matchBannerText, { color: "#F59E0B" }]}>
                {storeNotifs.filter((n) => n.type === "match" && !n.isRead).length > 0
                  ? `${storeNotifs.filter((n) => n.type === "match" && !n.isRead).length} new match alert${storeNotifs.filter((n) => n.type === "match" && !n.isRead).length !== 1 ? "s" : ""} for your reports`
                  : "Match alerts are shown here when found items match your reports"}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell-off" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All caught up!</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No new notifications right now.</Text>
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
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  markAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  markAllText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  list: { paddingHorizontal: 20, paddingTop: 16 },
  matchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  matchBannerText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 80,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
});
