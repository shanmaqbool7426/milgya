import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/ui/Button";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Reunite What's Lost",
    subtitle: "MilGaya connects the community to help recover lost items faster than ever before.",
    icon: "search",
    iconBg: "#1B4DDE",
    bg: "#EEF2FF",
    dark_bg: "#1A2236",
    accent: "#1B4DDE",
  },
  {
    id: "2",
    title: "Map-Powered Recovery",
    subtitle: "See lost and found items on an interactive map near you. Proximity makes recovery possible.",
    icon: "map-pin",
    iconBg: "#00BFA5",
    bg: "#E6FAF8",
    dark_bg: "#0F2420",
    accent: "#00BFA5",
  },
  {
    id: "3",
    title: "A Community That Cares",
    subtitle: "Join thousands of helpers who have already reunited families with their treasured belongings.",
    icon: "users",
    iconBg: "#8B5CF6",
    bg: "#F3F0FF",
    dark_bg: "#1E1A2E",
    accent: "#8B5CF6",
  },
];

function OnboardingSlide({ slide }: { slide: typeof SLIDES[0] }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bgColor = colors.background === "#F8F9FD" ? slide.bg : slide.dark_bg;

  return (
    <View style={[styles.slide, { width, backgroundColor: bgColor }]}>
      <View style={{ height: insets.top + (Platform.OS === "web" ? 67 : 0) }} />
      <View style={[styles.illustrationWrap, { backgroundColor: `${slide.iconBg}18` }]}>
        <View style={[styles.illustrationInner, { backgroundColor: `${slide.iconBg}28` }]}>
          <View style={[styles.illustrationIcon, { backgroundColor: slide.iconBg }]}>
            <Feather name={slide.icon as any} size={52} color="#FFFFFF" />
          </View>
        </View>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: 8 + i * 5,
              height: 8 + i * 5,
              borderRadius: 100,
              backgroundColor: slide.iconBg,
              opacity: 0.15 + i * 0.08,
              top: 20 + i * 30,
              right: 20 + i * 20,
            }}
          />
        ))}
        {[0, 1].map((i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: 10 + i * 6,
              height: 10 + i * 6,
              borderRadius: 100,
              backgroundColor: slide.iconBg,
              opacity: 0.12 + i * 0.08,
              bottom: 30 + i * 25,
              left: 30 + i * 20,
            }}
          />
        ))}
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: slide.iconBg }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{slide.subtitle}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      router.replace("/welcome");
    }
  };

  const skip = () => router.replace("/welcome");

  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={({ item }) => <OnboardingSlide slide={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
      />

      <View style={[styles.footer, { paddingBottom: bottomPad + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: "clamp" });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: "clamp" });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: SLIDES[currentIndex].iconBg }]}
              />
            );
          })}
        </View>
        <Button
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
          onPress={goToNext}
          fullWidth
          size="lg"
          style={{ backgroundColor: SLIDES[currentIndex].iconBg }}
        />
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={skip} style={styles.skip}>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 48,
  },
  illustrationWrap: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  illustrationInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  textWrap: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    gap: 16,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  skip: {
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
});
