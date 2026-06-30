import { Redirect } from "expo-router";
import { View, StyleSheet } from "react-native";

// The true entry point is /welcome.
// Using <Redirect> means Expo Router replaces this route synchronously
// before any paint — the user never sees this screen.
export default function Index() {
  return (
    <>
      {/* Solid background matches the splash so there is zero visible flash
          in the unlikely event the redirect hasn't resolved yet. */}
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
