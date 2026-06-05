import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { findMatches, type MatchResult } from "@/utils/matching";

const { width } = Dimensions.get("window");

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "#3B82F6",
  Bags: "#8B5CF6",
  Wallet: "#10B981",
  Keys: "#F59E0B",
  Documents: "#EF4444",
  Jewellery: "#EC4899",
  Pets: "#06B6D4",
  Other: "#6B7280",
};
const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "smartphone",
  Bags: "briefcase",
  Wallet: "credit-card",
  Keys: "key",
  Documents: "file-text",
  Jewellery: "circle",
  Pets: "heart",
  Other: "box",
};

function ScoreRing({ score }: { score: number }) {
  const colors = useColors();
  const color =
    score >= 75 ? colors.success : score >= 50 ? colors.warning : colors.primary;

  return (
    <View style={[styles.scoreRing, { borderColor: color }]}>
      <Text style={[styles.scoreNum, { color }]}>{score}</Text>
      <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>%</Text>
    </View>
  );
}

function MatchCard({
  result,
  rank,
  onPress,
}: {
  result: MatchResult;
  rank: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const { item, score, reasons } = result;
  const iconColor = CATEGORY_COLORS[item.category] ?? "#6B7280";
  const iconName = (CATEGORY_ICONS[item.category] ?? "box") as any;
  const matchLevel =
    score >= 75 ? "Strong Match" : score >= 50 ? "Likely Match" : "Possible Match";
  const matchVariant: any =
    score >= 75 ? "success" : score >= 50 ? "warning" : "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        styles.matchCard,
        {
          backgroundColor: colors.card,
          borderColor:
            score >= 75
              ? `${colors.success}40`
              : score >= 50
              ? `${colors.warning}40`
              : colors.border,
          borderWidth: score >= 75 ? 1.5 : 1,
        },
      ]}
    >
      {/* Rank badge */}
      <View
        style={[
          styles.rankBadge,
          {
            backgroundColor:
              rank === 1 ? "#F59E0B" : rank === 2 ? "#9CA3AF" : colors.muted,
          },
        ]}
      >
        <Text style={styles.rankText}>#{rank}</Text>
      </View>

      <View style={styles.matchTop}>
        {/* Item image placeholder */}
        <View
          style={[
            styles.itemIcon,
            { backgroundColor: `${iconColor}15`, borderRadius: 12 },
          ]}
        >
          <Feather name={iconName} size={28} color={iconColor} />
        </View>

        <View style={styles.matchInfo}>
          <View style={styles.matchTitleRow}>
            <Text
              style={[styles.matchTitle, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {item.isVerified && (
              <Feather name="check-circle" size={13} color={colors.success} />
            )}
          </View>
          <Text
            style={[styles.matchLocation, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            <Feather name="map-pin" size={11} /> {item.foundLocation}
          </Text>
          <Text
            style={[styles.matchStorage, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            <Feather name="home" size={11} /> {item.storageLocation}
          </Text>
          <View style={styles.matchMeta}>
            <Badge label={matchLevel} variant={matchVariant} />
            <Text style={[styles.matchDate, { color: colors.mutedForeground }]}>
              {item.date}
            </Text>
          </View>
        </View>

        <ScoreRing score={score} />
      </View>

      {/* Reasons */}
      <View
        style={[
          styles.reasonsRow,
          { backgroundColor: colors.muted, borderRadius: 8 },
        ]}
      >
        <Feather name="zap" size={13} color={colors.primary} />
        <Text
          style={[styles.reasonsText, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {reasons.join(" · ")}
        </Text>
      </View>

      <Button
        title="This Could Be Mine — Contact Finder"
        onPress={onPress}
        fullWidth
        size="sm"
        variant={score >= 75 ? "primary" : "outline"}
      />
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const params = useLocalSearchParams<{
    category: string;
    title: string;
    description: string;
    location: string;
  }>();

  const matches = findMatches({
    category: params.category ?? "",
    title: params.title ?? "",
    description: params.description ?? "",
    location: params.location ?? "",
  });

  const topMatch = matches[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Potential Matches
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            AI-scanned {matches.length > 0 ? matches.length : "0"} results
          </Text>
        </View>
        <View style={[styles.aiBadge, { backgroundColor: `${colors.primary}15` }]}>
          <Feather name="zap" size={13} color={colors.primary} />
          <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
            Smart Match
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Report summary */}
        <View
          style={[
            styles.reportCard,
            { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}25` },
          ]}
        >
          <View style={styles.reportCardHeader}>
            <Feather name="file-text" size={16} color={colors.primary} />
            <Text style={[styles.reportCardTitle, { color: colors.foreground }]}>
              Your Report
            </Text>
          </View>
          <View style={styles.reportCardBody}>
            <View style={styles.reportField}>
              <Text style={[styles.reportFieldLabel, { color: colors.mutedForeground }]}>
                Item
              </Text>
              <Text style={[styles.reportFieldValue, { color: colors.foreground }]}>
                {params.title || "Not specified"}
              </Text>
            </View>
            <View style={styles.reportField}>
              <Text style={[styles.reportFieldLabel, { color: colors.mutedForeground }]}>
                Category
              </Text>
              <Text style={[styles.reportFieldValue, { color: colors.foreground }]}>
                {params.category || "Not specified"}
              </Text>
            </View>
            <View style={styles.reportField}>
              <Text style={[styles.reportFieldLabel, { color: colors.mutedForeground }]}>
                Lost at
              </Text>
              <Text
                style={[styles.reportFieldValue, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {params.location || "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: `${colors.mutedForeground}15` },
              ]}
            >
              <Feather name="search" size={40} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No matches found yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Your report is live. You'll get a push notification as soon as
              someone finds an item matching your description.
            </Text>
            <View
              style={[
                styles.alertCard,
                { backgroundColor: `${colors.accent}10`, borderColor: `${colors.accent}30` },
              ]}
            >
              <Feather name="bell" size={16} color={colors.accent} />
              <Text style={[styles.alertText, { color: colors.mutedForeground }]}>
                Match alerts are enabled for this report
              </Text>
            </View>
            <Button
              title="Go to Home"
              onPress={() => router.replace("/(tabs)")}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        ) : (
          <>
            {/* Top match highlight */}
            {topMatch && topMatch.score >= 60 && (
              <View
                style={[
                  styles.topMatchBanner,
                  {
                    backgroundColor: `${colors.success}12`,
                    borderColor: `${colors.success}35`,
                  },
                ]}
              >
                <View style={styles.topMatchLeft}>
                  <Feather name="award" size={18} color={colors.success} />
                  <View>
                    <Text
                      style={[styles.topMatchTitle, { color: colors.foreground }]}
                    >
                      High Confidence Match!
                    </Text>
                    <Text
                      style={[
                        styles.topMatchSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      "{topMatch.item.title}" has {topMatch.score}% similarity
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.scoreChip,
                    { backgroundColor: colors.success },
                  ]}
                >
                  <Text style={styles.scoreChipText}>{topMatch.score}%</Text>
                </View>
              </View>
            )}

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              {matches.length} MATCH{matches.length !== 1 ? "ES" : ""} FOUND
            </Text>

            {matches.map((result, index) => (
              <MatchCard
                key={result.item.id}
                result={result}
                rank={index + 1}
                onPress={() => router.push(`/item/found/${result.item.id}`)}
              />
            ))}

            {/* How it works */}
            <View
              style={[
                styles.howCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.howTitle, { color: colors.foreground }]}>
                How Matching Works
              </Text>
              {[
                {
                  icon: "tag",
                  text: "Category match — highest weight (40 pts)",
                },
                { icon: "type", text: "Keyword overlap in title (up to 30 pts)" },
                { icon: "file-text", text: "Description similarity (up to 20 pts)" },
                { icon: "map-pin", text: "Location proximity (up to 10 pts)" },
              ].map((row) => (
                <View key={row.text} style={styles.howRow}>
                  <Feather
                    name={row.icon as any}
                    size={14}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.howText, { color: colors.mutedForeground }]}
                  >
                    {row.text}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              title="Submit Report & Get Alerts"
              onPress={() => router.replace("/(tabs)")}
              fullWidth
              size="lg"
              style={{ marginTop: 4 }}
            />
            <Button
              title="Go Home"
              onPress={() => router.replace("/(tabs)")}
              fullWidth
              variant="ghost"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  aiBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },

  reportCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  reportCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  reportCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  reportCardBody: { gap: 6 },
  reportField: { flexDirection: "row", alignItems: "center", gap: 8 },
  reportFieldLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    width: 70,
  },
  reportFieldValue: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },

  topMatchBanner: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topMatchLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  topMatchTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  topMatchSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  scoreChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  scoreChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#FFF",
  },

  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: -4,
  },

  matchCard: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#FFF" },
  matchTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemIcon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  matchInfo: { flex: 1, gap: 2 },
  matchTitleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  matchTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  matchLocation: { fontFamily: "Inter_400Regular", fontSize: 12 },
  matchStorage: { fontFamily: "Inter_400Regular", fontSize: 12 },
  matchMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  matchDate: { fontFamily: "Inter_400Regular", fontSize: 11 },
  reasonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  reasonsText: { fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 },

  scoreRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 1,
  },
  scoreNum: { fontFamily: "Inter_700Bold", fontSize: 16 },
  scoreLabel: { fontFamily: "Inter_500Medium", fontSize: 10, marginTop: 2 },

  howCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  howTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  howRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  howText: { fontFamily: "Inter_400Regular", fontSize: 13 },

  emptyState: { alignItems: "center", gap: 14, paddingVertical: 20 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
  },
  alertText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
});
