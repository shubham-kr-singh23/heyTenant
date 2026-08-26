import { useEffect, useState, useCallback } from "react";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider, ClerkLoaded } from "@clerk/expo";
import { tokenCache } from "../lib/clerk-token-cache";
import SplashScreen from "./splash-screen";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file."
  );
}

// Keep the native splash visible while JS bundle loads
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Load fonts / prefetch data here in future
      await ExpoSplashScreen.hideAsync();
      setAppReady(true);
    }
    prepare();
  }, []);

  // index.tsx handles the /welcome redirect via <Redirect>.
  // All this callback needs to do is unmount the custom splash overlay.
  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!appReady) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
          {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
