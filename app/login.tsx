import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

// ─── Palette ────────────────────────────────────────────────────────────────
const BRAND_BLUE  = "#1A3C5E";
const ACCENT      = "#4A90D9";
const LANDLORD    = "#3B6FA8";   // slightly deeper accent for Landlord mode
const WHITE       = "#FFFFFF";
const WHITE_72    = "rgba(255,255,255,0.72)";
const WHITE_40    = "rgba(255,255,255,0.40)";
const WHITE_20    = "rgba(255,255,255,0.20)";
const WHITE_15    = "rgba(255,255,255,0.15)";
const WHITE_08    = "rgba(255,255,255,0.08)";

type Role = "renter" | "landlord";

const ROLE_CONFIG: Record<
  Role,
  { label: string; subtitle: string; placeholder: string; btnLabel: string; btnColor: string }
> = {
  renter: {
    label:       "Renter",
    subtitle:    "Access your home, raise requests\nand manage your tenancy.",
    placeholder: "renter@example.com",
    btnLabel:    "Sign in as Renter",
    btnColor:    ACCENT,
  },
  landlord: {
    label:       "Landlord",
    subtitle:    "Manage properties, review tenants\nand track maintenance.",
    placeholder: "landlord@example.com",
    btnLabel:    "Sign in as Landlord",
    btnColor:    LANDLORD,
  },
};

// TAB_WIDTH computed dynamically inside switchRole using live width from useWindowDimensions

// ─── Component ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // KeyboardAvoidingView offset = status bar height on Android
  const kavOffset = Platform.OS === "android" ? insets.top : 0;

  const [role, setRole] = useState<Role>("renter");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);

  // ── Entry animations
  const pageOpacity    = useSharedValue(0);
  const pageTranslateY = useSharedValue(28);
  const formOpacity    = useSharedValue(0);
  const formTranslateY = useSharedValue(20);
  const buttonScale    = useSharedValue(1);
  const orb1Scale      = useSharedValue(0.7);
  const orb2Scale      = useSharedValue(0.7);

  // ── Role-switcher pill indicator
  const pillX = useSharedValue(0);

  useEffect(() => {
    orb1Scale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    orb2Scale.value = withDelay(150, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));

    pageOpacity.value    = withTiming(1, { duration: 500 });
    pageTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

    formOpacity.value    = withDelay(250, withTiming(1, { duration: 500 }));
    formTranslateY.value = withDelay(250, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []);

  // ── Switch role
  const switchRole = (next: Role) => {
    if (next === role) return;
    setRole(next);
    setEmail("");
    setPassword("");
    const TAB_WIDTH = (width - 48 - 8) / 2;
    pillX.value = withSpring(next === "renter" ? 0 : TAB_WIDTH, {
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    });

    // Bounce the form content out and back in
    formOpacity.value    = withTiming(0, { duration: 120 }, () => {
      formOpacity.value    = withTiming(1, { duration: 300 });
      formTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    });
    formTranslateY.value = withTiming(8, { duration: 120 });
  };

  // ── Press handlers
  const handlePressIn  = () => buttonScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  const handlePressOut = () => buttonScale.value = withSpring(1,    { damping: 15, stiffness: 300 });
  const handleLogin    = () => { /* auth logic */ };
  const handleBack     = () => router.back();

  // ── Animated styles
  const pageStyle = useAnimatedStyle(() => ({
    opacity:   pageOpacity.value,
    transform: [{ translateY: pageTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity:   formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb1Scale.value }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ scale: orb2Scale.value }],
  }));

  const cfg = ROLE_CONFIG[role];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={kavOffset}
    >
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} translucent={false} />

      {/* Decorative orbs — sized dynamically so they respond to screen changes */}
      <Animated.View style={[styles.orb1, { width: width * 0.9, height: width * 0.9, borderRadius: (width * 0.9) / 2 }, orb1Style]} />
      <Animated.View style={[styles.orb2, { width: width * 0.55, height: width * 0.55, borderRadius: (width * 0.55) / 2 }, orb2Style]} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back button — marginTop driven by real status bar / notch inset */}
        <Animated.View style={pageStyle}>
          <TouchableOpacity style={[styles.backBtn, { marginTop: Math.max(insets.top + 12, 44) }]} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Logo + headline */}
        <Animated.View style={[styles.headerSection, pageStyle]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoInitial}>hT</Text>
            </View>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>{cfg.subtitle}</Text>
        </Animated.View>

        {/* ── Role switcher pill */}
        <Animated.View style={[styles.tabTrack, pageStyle]}>
          {/* sliding indicator */}
          <Animated.View style={[styles.tabPill, pillStyle]} />

          {(["renter", "landlord"] as Role[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.tabBtn}
              onPress={() => switchRole(r)}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabLabel, role === r && styles.tabLabelActive]}>
                {r === "renter" ? "🏠  Renter" : "🏢  Landlord"}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── Role context chip */}
        <Animated.View style={[styles.roleChipRow, formStyle]}>
          <View style={[styles.roleChip, { backgroundColor: role === "renter" ? "rgba(74,144,217,0.15)" : "rgba(59,111,168,0.15)" }]}>
            <View style={[styles.roleChipDot, { backgroundColor: cfg.btnColor }]} />
            <Text style={[styles.roleChipText, { color: cfg.btnColor }]}>
              {role === "renter" ? "Tenant account" : "Property owner account"}
            </Text>
          </View>
        </Animated.View>

        {/* ── Form */}
        <Animated.View style={[styles.formSection, formStyle]}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <View style={[styles.inputWrapper, focused === "email" && styles.inputFocused]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder={cfg.placeholder}
                placeholderTextColor={WHITE_40}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                selectionColor={cfg.btnColor}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.forgotText, { color: cfg.btnColor }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrapper, focused === "password" && styles.inputFocused]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="Enter your password"
                placeholderTextColor={WHITE_40}
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                selectionColor={cfg.btnColor}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setPasswordVisible((v) => !v)}
                activeOpacity={0.7}
              >
                <Text style={[styles.eyeText, { color: cfg.btnColor }]}>
                  {passwordVisible ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign-in button */}
          <Animated.View style={[{ marginTop: 6 }, buttonAnimStyle]}>
            <TouchableOpacity
              style={[styles.signInBtn, { backgroundColor: cfg.btnColor }]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleLogin}
              activeOpacity={1}
            >
              <Text style={styles.signInText}>{cfg.btnLabel}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <View style={styles.socialRow}>
            {[
              { id: "google", label: "Google" },
              { id: "apple",  label: "Apple"  },
              { id: "sso",    label: "SSO"    },
            ].map(({ id, label }) => (
              <TouchableOpacity key={id} style={styles.socialBtn} activeOpacity={0.75}>
                <Text style={styles.socialText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── Footer */}
        <Animated.View style={[styles.footer, formStyle]}>
          <Text style={styles.footerText}>
            New to heyTenant?{" "}
            <Text
              style={[styles.footerLink, { color: cfg.btnColor }]}
              onPress={() => router.push("/register")}
            >
              Create an account
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // Orbs — width/height/borderRadius set dynamically in component
  orb1: {
    position: "absolute",
    backgroundColor: "rgba(74,144,217,0.09)",
    top: -60,
    left: -40,
  },
  orb2: {
    position: "absolute",
    backgroundColor: "rgba(74,144,217,0.06)",
    bottom: 80,
    right: -40,
  },

  // Back — marginTop set dynamically via insets in component
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  backArrow: { fontSize: 18, color: WHITE_72 },
  backText:  { fontSize: 14, color: WHITE_72, fontWeight: "500" },

  // Header
  headerSection: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
  },
  logoOuter: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoInner: {
    width: 54,
    height: 54,
    borderRadius: 13,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInitial: {
    fontSize: 20,
    fontWeight: "800",
    color: BRAND_BLUE,
    letterSpacing: -1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: WHITE_72,
    textAlign: "center",
    lineHeight: 20,
  },

  // Role switcher track
  tabTrack: {
    flexDirection: "row",
    backgroundColor: WHITE_08,
    borderWidth: 1,
    borderColor: WHITE_15,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    position: "relative",
  },
  tabPill: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    width: "50%",
    borderRadius: 12,
    backgroundColor: ACCENT,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: WHITE_40,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: WHITE,
  },

  // Role chip
  roleChipRow: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: WHITE_15,
  },
  roleChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Form
  formSection: {},
  fieldGroup:  { marginBottom: 16 },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: WHITE_72,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE_08,
    borderWidth: 1,
    borderColor: WHITE_15,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputFocused: {
    borderColor: ACCENT,
    backgroundColor: "rgba(74,144,217,0.08)",
  },
  inputIcon: {
    fontSize: 14,
    color: WHITE_40,
    width: 18,
    textAlign: "center",
  },
  // height:"100%" is unsupported on Android TextInput — use alignSelf + paddingVertical:0
  input: {
    flex: 1,
    fontSize: 15,
    color: WHITE,
    alignSelf: "center",
    paddingVertical: 0,
  },
  inputPassword: { paddingRight: 4 },
  eyeBtn: { paddingLeft: 6, paddingVertical: 4 },
  eyeText: { fontSize: 12, fontWeight: "600" },

  // CTA
  signInBtn: {
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.4,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 18,
    gap: 10,
  },
  dividerLine:  { flex: 1, height: 1, backgroundColor: WHITE_15 },
  dividerLabel: { fontSize: 12, color: WHITE_40, letterSpacing: 0.3 },

  // Social
  socialRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: WHITE_15,
    backgroundColor: WHITE_08,
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: { fontSize: 13, color: WHITE_72, fontWeight: "600" },

  // Footer
  footer: { alignItems: "center", paddingTop: 24 },
  footerText: { fontSize: 13, color: WHITE_40 },
  footerLink: { fontWeight: "600" },
});
