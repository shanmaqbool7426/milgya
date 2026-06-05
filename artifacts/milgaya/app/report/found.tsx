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

const STEPS = ["Category", "Details", "Location", "Submit"];

export default function ReportFoundScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.success}>
          <View style={[styles.successIcon, { backgroundColor: `${colors.accent}15` }]}>
            <Feather name="check-circle" size={60} color={colors.accent} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Thank You!</Text>
          <Text style={[styles.successText, { color: colors.mutedForeground }]}>
            You're a community hero! Your found item report has been submitted. The owner will be notified.
          </Text>
          <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="award" size={18} color="#F59E0B" />
            <Text style={[styles.successCardText, { color: colors.mutedForeground }]}>
              You've earned +10 Community Points for helping!
            </Text>
          </View>
          <Button title="Go Home" onPress={() => router.replace("/(tabs)")} fullWidth size="lg" variant="accent" style={{ marginTop: 8 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Report Found Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.stepBar}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <TouchableOpacity onPress={() => i < step && setStep(i)} style={styles.stepItem}>
              <View style={[styles.stepCircle, {
                backgroundColor: i <= step ? colors.accent : colors.muted,
                borderColor: i <= step ? colors.accent : colors.border,
              }]}>
                {i < step ? (
                  <Feather name="check" size={12} color="#FFF" />
                ) : (
                  <Text style={[styles.stepNum, { color: i === step ? "#FFF" : colors.mutedForeground }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, { color: i === step ? colors.accent : colors.mutedForeground }]}>{s}</Text>
            </TouchableOpacity>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: i < step ? colors.accent : colors.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>What did you find?</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Select the category that best describes the item</Text>
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
              <Text style={[styles.uploadLabel, { color: colors.foreground }]}>Upload Photos</Text>
              <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Clear photos help the owner verify ownership</Text>
              <View style={styles.uploadGrid}>
                {[0, 1, 2, 3].map((i) => (
                  <TouchableOpacity key={i} style={[styles.uploadBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Feather name="camera" size={22} color={colors.mutedForeground} />
                    <Text style={[styles.uploadText, { color: colors.mutedForeground }]}>{i === 0 ? "Photo" : "+"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Describe the Item</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>A detailed description helps the owner prove it's theirs</Text>
            <FormField label="Item Name *" placeholder="e.g. Samsung Galaxy Phone" value={title} onChangeText={setTitle} colors={colors} />
            <FormField label="Description *" placeholder="Describe the item — color, brand, condition..." value={description} onChangeText={setDescription} colors={colors} multiline />
            <View style={[styles.tipCard, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}25` }]}>
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                Tip: Don't reveal all unique identifiers publicly — save some for ownership verification
              </Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Location Details</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Help the owner understand where it was found and where to collect</Text>
            <FormField label="Found Location *" placeholder="e.g. Cubbon Park, East Gate" value={foundLocation} onChangeText={setFoundLocation} colors={colors} />
            <FormField label="Storage Location *" placeholder="e.g. Kept at home / Nearby police station" value={storageLocation} onChangeText={setStorageLocation} colors={colors} />

            <TouchableOpacity style={[styles.partnerBtn, { backgroundColor: colors.secondary, borderColor: `${colors.primary}40` }]}>
              <Feather name="shield" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.partnerBtnTitle, { color: colors.foreground }]}>Drop at a Recovery Partner</Text>
                <Text style={[styles.partnerBtnSub, { color: colors.mutedForeground }]}>Find a verified nearby drop-off point</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Submit</Text>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <SummaryRow icon="tag" label="Category" value={CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? "Not selected"} colors={colors} />
              <SummaryRow icon="package" label="Item" value={title || "Not entered"} colors={colors} />
              <SummaryRow icon="map-pin" label="Found at" value={foundLocation || "Not entered"} colors={colors} />
              <SummaryRow icon="home" label="Stored at" value={storageLocation || "Not entered"} colors={colors} />
            </View>
            <View style={[styles.heroCard, { backgroundColor: `${colors.accent}10`, borderColor: `${colors.accent}30` }]}>
              <Feather name="award" size={22} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroTitle, { color: colors.foreground }]}>You're making a difference</Text>
                <Text style={[styles.heroText, { color: colors.mutedForeground }]}>Your report might reunite someone with something they treasure.</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        <Button
          title={step === STEPS.length - 1 ? "Submit Report" : "Continue"}
          onPress={handleNext}
          fullWidth
          size="lg"
          variant="accent"
          disabled={step === 0 && !selectedCategory}
        />
      </View>
    </View>
  );
}

function FormField({ label, placeholder, value, onChangeText, colors, multiline }: any) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        style={[styles.input, {
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.foreground,
          minHeight: multiline ? 100 : 48,
        }]}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function SummaryRow({ icon, label, value, colors }: any) {
  return (
    <View style={styles.summaryRow}>
      <Feather name={icon as any} size={14} color={colors.accent} />
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}:</Text>
      <Text style={[styles.summaryValue, { color: colors.foreground, flex: 1 }]}>{value}</Text>
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
  uploadGrid: { flexDirection: "row", gap: 10, marginTop: 4, flexWrap: "wrap" },
  uploadBox: { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 4 },
  uploadText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  field: { gap: 6 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  tipCard: { borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 19 },
  partnerBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  partnerBtnTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  partnerBtnSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  summaryCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  summaryValue: { fontFamily: "Inter_500Medium", fontSize: 14 },
  heroCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 12, alignItems: "center" },
  heroTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  heroText: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2, lineHeight: 18 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1 },
  success: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  successTitle: { fontFamily: "Inter_700Bold", fontSize: 26, textAlign: "center" },
  successText: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center", lineHeight: 23 },
  successCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, width: "100%" },
  successCardText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
});
