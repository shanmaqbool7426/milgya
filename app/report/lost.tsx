import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/constants/mockData";
import { useAppStore } from "@/hooks/useAppStore";

const STEPS = ["Category", "Details", "Location", "Submit"];

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

export default function ReportLostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const { addReport } = useAppStore();

  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reward, setReward] = useState("");
  const [route, setRoute] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newItemId, setNewItemId] = useState<string | null>(null);

  const categoryLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? "";

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!title.trim()) next.title = "Item name is required";
      if (!description.trim()) next.description = "Description is required";
    }
    if (step === 2) {
      if (!location.trim()) next.location = "Last seen location is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const id = `user_${Date.now()}`;
      await addReport({
        id,
        title: title.trim() || "Untitled Item",
        category: categoryLabel,
        description: description.trim(),
        location: location.trim(),
        date: dateStr,
        time: timeStr,
        status: "active",
        images: [],
        contactName: "Rahul Kumar",
        reward: reward.trim() || undefined,
        route: route.trim() || undefined,
        userId: "me",
        isUrgent,
      });
      setNewItemId(id);
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  if (submitted && newItemId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.success}>
          <View style={[styles.successIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="check-circle" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Report Submitted!</Text>
          <Text style={[styles.successText, { color: colors.mutedForeground }]}>
            Your lost item report is now live. The community will help find it.
          </Text>

          {isUrgent && (
            <View style={[styles.urgentNotice, { backgroundColor: `${colors.destructive}10`, borderColor: `${colors.destructive}30` }]}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.urgentNoticeText, { color: colors.destructive }]}>
                Marked as URGENT — community members will be alerted immediately.
              </Text>
            </View>
          )}

          <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="bell" size={18} color={colors.primary} />
            <Text style={[styles.successCardText, { color: colors.mutedForeground }]}>
              You'll be notified the moment a matching found item is reported.
            </Text>
          </View>

          <View style={styles.successBtns}>
            <Button
              title="Check Instant Matches"
              onPress={() => router.replace({
                pathname: "/matches",
                params: { category: categoryLabel, title, description, location },
              })}
              fullWidth
              size="lg"
            />
            <Button
              title="Go Home"
              onPress={() => router.replace("/(tabs)")}
              fullWidth
              variant="outline"
            />
          </View>
        </View>
      </View>
    );
  }

  const canContinue = step === 0 ? !!selectedCategory : true;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Report Lost Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.stepBar}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <TouchableOpacity onPress={() => i < step && setStep(i)} style={styles.stepItem}>
              <View style={[styles.stepCircle, {
                backgroundColor: i <= step ? colors.primary : colors.muted,
                borderColor: i <= step ? colors.primary : colors.border,
              }]}>
                {i < step ? (
                  <Feather name="check" size={12} color="#FFF" />
                ) : (
                  <Text style={[styles.stepNum, { color: i === step ? "#FFF" : colors.mutedForeground }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, { color: i === step ? colors.primary : colors.mutedForeground }]}>{s}</Text>
            </TouchableOpacity>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: i < step ? colors.primary : colors.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>What did you lose?</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Select the category that best describes your item</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat.label] ?? "#6B7280";
                const icon = (CATEGORY_ICONS[cat.label] ?? "box") as any;
                const selected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[styles.catCard, {
                      backgroundColor: selected ? `${color}15` : colors.card,
                      borderColor: selected ? color : colors.border,
                      borderWidth: selected ? 2 : 1,
                    }]}
                  >
                    <View style={[styles.catIcon, { backgroundColor: `${color}15` }]}>
                      <Feather name={icon} size={24} color={color} />
                    </View>
                    <Text style={[styles.catLabel, { color: selected ? color : colors.foreground }]}>{cat.label}</Text>
                    {selected && <View style={[styles.catCheck, { backgroundColor: color }]}><Feather name="check" size={10} color="#FFF" /></View>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.uploadSection}>
              <Text style={[styles.uploadLabel, { color: colors.foreground }]}>Add Photos</Text>
              <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Photos help the community identify your item</Text>
              <View style={styles.uploadGrid}>
                {[0, 1, 2].map((i) => (
                  <TouchableOpacity key={i} style={[styles.uploadBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Feather name="camera" size={22} color={colors.mutedForeground} />
                    <Text style={[styles.uploadText, { color: colors.mutedForeground }]}>{i === 0 ? "Add Photo" : "+"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Item Details</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Be specific — it helps the community identify your item</Text>

            <FormField
              label="Item Name *"
              placeholder="e.g. Black Leather Backpack"
              value={title}
              onChangeText={(t: string) => { setTitle(t); setErrors((e) => ({ ...e, title: "" })); }}
              colors={colors}
              error={errors.title}
            />
            <FormField
              label="Description *"
              placeholder="Describe your item in detail — color, brand, unique markings..."
              value={description}
              onChangeText={(t: string) => { setDescription(t); setErrors((e) => ({ ...e, description: "" })); }}
              colors={colors}
              multiline
              error={errors.description}
            />
            <FormField
              label="Reward (Optional)"
              placeholder="e.g. ₹2,000"
              value={reward}
              onChangeText={setReward}
              colors={colors}
            />

            <TouchableOpacity
              onPress={() => setIsUrgent(!isUrgent)}
              style={[styles.urgentToggle, {
                backgroundColor: isUrgent ? `${colors.destructive}10` : colors.card,
                borderColor: isUrgent ? `${colors.destructive}40` : colors.border,
              }]}
            >
              <View style={[styles.urgentIconWrap, { backgroundColor: isUrgent ? `${colors.destructive}18` : colors.muted }]}>
                <Feather name="alert-circle" size={18} color={isUrgent ? colors.destructive : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.urgentTitle, { color: isUrgent ? colors.destructive : colors.foreground }]}>Mark as Urgent</Text>
                <Text style={[styles.urgentSub, { color: colors.mutedForeground }]}>Notifies the community immediately (use for valuable or critical items)</Text>
              </View>
              <View style={[styles.toggle, { backgroundColor: isUrgent ? colors.destructive : colors.border }]}>
                <View style={[styles.toggleThumb, { transform: [{ translateX: isUrgent ? 18 : 2 }] }]} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Where did you lose it?</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>An accurate location improves recovery chances by 3×</Text>
            <FormField
              label="Last Seen Location *"
              placeholder="e.g. MG Road Metro Station"
              value={location}
              onChangeText={(t: string) => { setLocation(t); setErrors((e) => ({ ...e, location: "" })); }}
              colors={colors}
              error={errors.location}
            />
            <FormField
              label="Route Taken (Optional)"
              placeholder="e.g. Route 42A — MG Road to Koramangala"
              value={route}
              onChangeText={setRoute}
              colors={colors}
            />

            <TouchableOpacity style={[styles.mapBtn, { backgroundColor: colors.secondary, borderColor: `${colors.primary}40` }]}>
              <Feather name="map-pin" size={18} color={colors.primary} />
              <Text style={[styles.mapBtnText, { color: colors.primary }]}>Pin Location on Map</Text>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>

            <View style={[styles.mapPreview, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="map" size={40} color={colors.mutedForeground} />
              <Text style={[styles.mapPreviewText, { color: colors.mutedForeground }]}>Tap to select location on map</Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Submit</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Review your report before submitting</Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <SummaryRow icon="tag" label="Category" value={categoryLabel || "Not selected"} colors={colors} />
              <SummaryRow icon="package" label="Item" value={title || "Not entered"} colors={colors} />
              <SummaryRow icon="align-left" label="Description" value={description || "Not entered"} colors={colors} />
              <SummaryRow icon="map-pin" label="Location" value={location || "Not entered"} colors={colors} />
              {reward ? <SummaryRow icon="gift" label="Reward" value={reward} colors={colors} /> : null}
              {isUrgent && <SummaryRow icon="alert-circle" label="Priority" value="URGENT" colors={colors} urgent />}
            </View>

            <View style={[styles.privacyCard, { backgroundColor: `${colors.accent}10`, borderColor: `${colors.accent}30` }]}>
              <Feather name="shield" size={16} color={colors.accent} />
              <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
                Your contact details are kept private. Claimants go through our verification process.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        <Button
          title={step === STEPS.length - 1 ? (submitting ? "Submitting…" : "Submit Report") : "Continue"}
          onPress={handleNext}
          fullWidth
          size="lg"
          disabled={!canContinue || submitting}
        />
      </View>
    </View>
  );
}

function FormField({ label, placeholder, value, onChangeText, colors, multiline, error }: any) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.border,
            color: colors.foreground,
            minHeight: multiline ? 100 : 48,
          },
        ]}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error ? <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

function SummaryRow({ icon, label, value, colors, urgent }: any) {
  return (
    <View style={styles.summaryRow}>
      <Feather name={icon as any} size={14} color={urgent ? colors.destructive : colors.primary} />
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}:</Text>
      <Text style={[styles.summaryValue, { color: urgent ? colors.destructive : colors.foreground, flex: 1, fontFamily: urgent ? "Inter_700Bold" : "Inter_500Medium" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  stepBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  stepItem: { alignItems: "center", gap: 4 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  stepNum: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  stepLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
  stepLine: { flex: 1, height: 2, marginBottom: 14 },
  content: { paddingHorizontal: 20 },
  step: { gap: 16, paddingBottom: 20 },
  stepTitle: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 4 },
  stepSub: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginTop: -8 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: { width: "47%", padding: 14, borderRadius: 12, alignItems: "center", gap: 8, position: "relative" },
  catIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  catLabel: { fontFamily: "Inter_500Medium", fontSize: 13, textAlign: "center" },
  catCheck: { position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  uploadSection: { gap: 6 },
  uploadLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  uploadSub: { fontFamily: "Inter_400Regular", fontSize: 13 },
  uploadGrid: { flexDirection: "row", gap: 10, marginTop: 4 },
  uploadBox: { width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 6 },
  uploadText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  field: { gap: 6 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: -2 },
  urgentToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  urgentIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  urgentTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  urgentSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2, lineHeight: 17 },
  toggle: { width: 42, height: 24, borderRadius: 12, justifyContent: "center" },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFF" },
  mapBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  mapBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  mapPreview: { height: 160, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  mapPreviewText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  summaryCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  summaryValue: { fontSize: 14 },
  privacyCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  privacyText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 19 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1 },
  success: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  successTitle: { fontFamily: "Inter_700Bold", fontSize: 26, textAlign: "center" },
  successText: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center", lineHeight: 23 },
  urgentNotice: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, width: "100%" },
  urgentNoticeText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1, lineHeight: 18 },
  successCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, width: "100%" },
  successCardText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  successBtns: { gap: 10, width: "100%", marginTop: 4 },
});
