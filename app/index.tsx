import { Redirect } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@clerk/expo";

// Redirect signed-in users straight to their dashboard, everyone else to welcome.
// Using <Redirect> replaces this route synchronously before any paint.
export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  // While Clerk is initialising, render the background colour only
  // - the custom splash screen is already covering it.
  if (!isLoaded) {
    return <View style={styles.bg} />;
  }

  if (isSignedIn) {
    return <Redirect href="/renter/dashboard" />;
  }

  return (
    <>
      <View style={styles.bg} />
      <Redirect href="/welcome" />
    </>
  );
}

const styles = StyleSheet.create({
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1A3C5E",
  },
});
