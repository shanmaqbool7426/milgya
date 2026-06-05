import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppStoreProvider } from "@/hooks/useAppStore";

// Suppress fontfaceobserver's "Xms timeout exceeded" unhandled rejection on web.
// This fires when Google Fonts take > 6 s to load; the app still renders fine
// because we default `ready` to true on web and use system-font fallbacks.
if (Platform.OS === "web" && typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason?.message &&
      /timeout exceeded/i.test(event.reason.message)
    ) {
      event.preventDefault();
    }
  });
}

// Only gate on splash screen for native — web doesn't support it properly
if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      <Stack.Screen name="welcome" options={{ animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="partners"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="report/lost"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="report/found"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="matches"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="item/lost/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="item/found/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  // On web, fontfaceobserver throws a 6s timeout error — bypass it by tracking
  // readiness with our own state that defaults to true on web.
  const [ready, setReady] = useState(Platform.OS === "web");

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setReady(true);
      if (Platform.OS !== "web") {
        SplashScreen.hideAsync();
      }
    }
  }, [fontsLoaded, fontError]);

  // Safety valve: if fonts never resolve (web timeout), render after 2s anyway
  useEffect(() => {
    if (Platform.OS === "web") return;
    const timer = setTimeout(() => {
      setReady(true);
      SplashScreen.hideAsync();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppStoreProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </AppStoreProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
