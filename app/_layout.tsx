import { useEffect, useState, useCallback } from "react";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import SplashScreen from "./splash-screen";

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
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
    </>
  );
}
