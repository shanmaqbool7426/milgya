import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: string;
  label: string;
  onPress?: () => void;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
}

function SettingRow({ icon, label, onPress, value, onToggle, danger }: SettingRowProps) {
  const colors = useColors();
  const color = danger ? colors.destructive : colors.foreground;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onToggle ? 1 : 0.75}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? `${colors.destructive}15` : colors.muted }]}>
        <Feather name={icon as any} size={16} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color, flex: 1 }]}>{label}</Text>
      {onToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Section title="ACCOUNT">
          <SettingRow icon="user" label="Edit Profile" onPress={() => {}} />
          <SettingRow icon="mail" label="Email Address" onPress={() => {}} />
          <SettingRow icon="phone" label="Phone Number" onPress={() => {}} />
          <SettingRow icon="lock" label="Change Password" onPress={() => {}} />
        </Section>

        <Section title="NOTIFICATIONS">
          <SettingRow icon="bell" label="Push Notifications" value={pushNotif} onToggle={setPushNotif} />
          <SettingRow icon="mail" label="Email Notifications" value={emailNotif} onToggle={setEmailNotif} />
          <SettingRow icon="zap" label="Match Alerts" value={matchAlerts} onToggle={setMatchAlerts} />
        </Section>

        <Section title="APPEARANCE">
          <SettingRow icon="moon" label="Dark Mode" value={darkMode} onToggle={setDarkMode} />
          <SettingRow icon="type" label="Font Size" onPress={() => {}} />
          <SettingRow icon="globe" label="Language" onPress={() => {}} />
        </Section>

        <Section title="PRIVACY">
          <SettingRow icon="map-pin" label="Location Services" value={locationEnabled} onToggle={setLocationEnabled} />
          <SettingRow icon="eye" label="Public Profile" value={publicProfile} onToggle={setPublicProfile} />
          <SettingRow icon="download" label="Download My Data" onPress={() => {}} />
        </Section>

        <Section title="HELP CENTER">
          <SettingRow icon="help-circle" label="FAQ" onPress={() => {}} />
          <SettingRow icon="message-circle" label="Contact Support" onPress={() => {}} />
          <SettingRow icon="star" label="Rate the App" onPress={() => {}} />
          <SettingRow icon="info" label="About MilGaya" onPress={() => {}} />
        </Section>

        <Section title="DANGER ZONE">
          <SettingRow icon="log-out" label="Sign Out" onPress={() => router.replace("/welcome")} />
          <SettingRow icon="trash-2" label="Delete Account" danger onPress={() => {}} />
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 4,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.2,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
});
