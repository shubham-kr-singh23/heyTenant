import { useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import { useRouter } from "expo-router";

const BRAND_BLUE   = "#1A3C5E";
const BRAND_DEEP   = "#122B44";
const ACCENT_LIGHT = "#4A90D9";
const TEAL         = "#0D9488";
const TEAL_BG      = "rgba(13,148,136,0.12)";
const SUCCESS      = "#22C55E";
const SUCCESS_BG   = "rgba(34,197,94,0.12)";
const WARNING      = "#F59E0B";
const WARNING_BG   = "rgba(245,158,11,0.12)";
const DANGER       = "#F87171";
const DANGER_BG    = "rgba(248,113,113,0.12)";
const PURPLE       = "#8B5CF6";
const PURPLE_BG    = "rgba(139,92,246,0.12)";
const WHITE        = "#FFFFFF";
const WHITE_90     = "rgba(255,255,255,0.90)";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const op = useSharedValue(0); const ty = useSharedValue(16);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 420 }));
    ty.value = withDelay(delay, withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, []);
  return <Animated.View style={useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }))}>{children}</Animated.View>;
}

// Lease timeline bar
function LeaseTimeline() {
  const startMs = new Date("2024-01-15").getTime();
  const endMs   = new Date("2025-01-15").getTime();
  const nowMs   = new Date().getTime();
  const pct     = Math.min(Math.max(Math.round(((nowMs - startMs) / (endMs - startMs)) * 100), 0), 100);
  const prog = useSharedValue(0);
  useEffect(() => { prog.value = withDelay(300, withTiming(pct / 100, { duration: 800, easing: Easing.out(Easing.cubic) })); }, []);
  const fillStyle = useAnimatedStyle(() => ({ width: `${prog.value * 100}%` as any, height: 8, backgroundColor: pct > 85 ? DANGER : pct > 60 ? WARNING : TEAL, borderRadius: 4 }));
  return (
    <View>
      <View style={{ height: 8, backgroundColor: WHITE_08, borderRadius: 4, overflow: "hidden" }}>
        <Animated.View style={fillStyle} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ fontSize: 11, color: WHITE_40 }}>15 Jan 2024</Text>
        <Text style={{ fontSize: 11, fontWeight: "700", color: pct > 85 ? DANGER : WARNING }}>{pct}% elapsed</Text>
        <Text style={{ fontSize: 11, color: pct > 85 ? DANGER : WARNING, fontWeight: "700" }}>15 Jan 2025</Text>
      </View>
    </View>
  );
}

export default function LeaseInfo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pt = Platform.OS === "android" ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32) : Math.max(insets.top + 8, 32);

  const hOp = useSharedValue(0); const hTy = useSharedValue(-14);
  useEffect(() => { hOp.value = withTiming(1, { duration: 350 }); hTy.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }); }, []);
  const hStyle = useAnimatedStyle(() => ({ opacity: hOp.value, transform: [{ translateY: hTy.value }] }));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />
      <Animated.View style={[s.header, { paddingTop: pt }, hStyle]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}><Text style={s.backArrow}>‹</Text></TouchableOpacity>
        <View style={s.hCenter}><Text style={s.hTitle}>Lease Info</Text><Text style={s.hSub}>Tenancy details & terms</Text></View>
        <View style={{ width: 38 }} />
      </Animated.View>

      <ScrollView style={s.body} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 24, 40) }]} showsVerticalScrollIndicator={false}>

        {/* Renewal alert */}
        <FadeIn delay={0}>
          <View style={s.renewalAlert}>
            <Text style={{ fontSize: 20 }}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.renewalTitle}>Renewal Deadline Approaching</Text>
              <Text style={s.renewalBody}>Your lease expires in <Text style={{ color: DANGER, fontWeight: "700" }}>31 days</Text>. Please contact your landlord to confirm renewal.</Text>
            </View>
          </View>
        </FadeIn>

        {/* Property summary */}
        <FadeIn delay={60}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Property</Text>
            <View style={s.propRow}>
              <View style={s.propIconBox}><Text style={{ fontSize: 28 }}>🏢</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.propName}>Apt 4B — Oak Street</Text>
                <Text style={s.propAddr}>12 Oak Street, London, E1 5TW</Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                  <View style={[s.propTag, { backgroundColor: TEAL_BG }]}><Text style={[s.propTagTxt, { color: TEAL }]}>Active Lease</Text></View>
                  <View style={[s.propTag, { backgroundColor: PURPLE_BG }]}><Text style={[s.propTagTxt, { color: PURPLE }]}>2-Bed</Text></View>
                  <View style={[s.propTag, { backgroundColor: WHITE_08 }]}><Text style={[s.propTagTxt, { color: WHITE_40 }]}>Floor 2</Text></View>
                </View>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Lease term timeline */}
        <FadeIn delay={120}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Lease Period</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
              {[["Start", "15 Jan 2024", WHITE_72], ["End", "15 Jan 2025", WARNING], ["Type", "AST 12-Month", TEAL]].map(([l, v, c]) => (
                <View key={l as string} style={{ alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: c as string }}>{v}</Text>
                  <Text style={{ fontSize: 10, color: WHITE_40 }}>{l}</Text>
                </View>
              ))}
            </View>
            <LeaseTimeline />
          </View>
        </FadeIn>

        {/* Financial terms */}
        <FadeIn delay={180}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Financial Terms</Text>
            {[
              ["Monthly Rent",    "£1,250",   WARNING,      "Payable 1st of each month"],
              ["Security Deposit","£2,500",   ACCENT_LIGHT, "Protected · MyDeposits scheme"],
              ["Late Fee",        "£25/day",  DANGER,       "Applies after 7 days overdue"],
              ["Notice Period",   "1 Month",  TEAL,         "Written notice required"],
            ].map(([l, v, c, sub], i) => (
              <View key={l as string} style={[s.finRow, i > 0 && s.bt]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.finLabel}>{l}</Text>
                  <Text style={s.finSub}>{sub}</Text>
                </View>
                <Text style={[s.finValue, { color: c as string }]}>{v}</Text>
              </View>
            ))}
          </View>
        </FadeIn>

        {/* Key clauses */}
        <FadeIn delay={240}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Key Clauses</Text>
            {[
              { icon: "🐾", title: "Pets",          body: "Not permitted without prior written consent from the landlord.",       ok: false },
              { icon: "🚬", title: "Smoking",        body: "Strictly no smoking anywhere inside the property or communal areas.",  ok: false },
              { icon: "🛠️", title: "Alterations",   body: "No structural alterations. Minor redecoration requires approval.",     ok: false },
              { icon: "🏠", title: "Sub-letting",    body: "Subletting or Airbnb use strictly prohibited.",                       ok: false },
              { icon: "🌱", title: "Garden",         body: "Tenant responsible for maintaining the rear garden to a tidy standard.",ok: true  },
              { icon: "🔧", title: "Minor Repairs",  body: "Tenant responsible for minor repairs under £50 (e.g. bulbs, fuses).", ok: true  },
            ].map((c, i) => (
              <View key={c.title} style={[s.clauseRow, i > 0 && s.bt]}>
                <Text style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.clauseTitle}>{c.title}</Text>
                  <Text style={s.clauseBody}>{c.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </FadeIn>

        {/* Responsibilities */}
        <FadeIn delay={300}>
          <View style={s.twoCol}>
            <View style={[s.card, s.half, { borderColor: `${SUCCESS}25` }]}>
              <Text style={[s.cardTitle, { color: SUCCESS, marginBottom: 10 }]}>✓ Tenant</Text>
              {["Council Tax", "Gas & Electric", "Internet/TV", "Contents Insurance", "Garden upkeep"].map((r, i) => (
                <View key={r} style={[s.respRow, i > 0 && s.bt]}><View style={[s.respDot, { backgroundColor: SUCCESS }]} /><Text style={s.respTxt}>{r}</Text></View>
              ))}
            </View>
            <View style={[s.card, s.half, { borderColor: `${ACCENT_LIGHT}25` }]}>
              <Text style={[s.cardTitle, { color: ACCENT_LIGHT, marginBottom: 10 }]}>🏠 Landlord</Text>
              {["Building Insurance", "Structural repairs", "Boiler service", "Safety certificates", "Major appliances"].map((r, i) => (
                <View key={r} style={[s.respRow, i > 0 && s.bt]}><View style={[s.respDot, { backgroundColor: ACCENT_LIGHT }]} /><Text style={s.respTxt}>{r}</Text></View>
              ))}
            </View>
          </View>
        </FadeIn>

        {/* CTA buttons */}
        <FadeIn delay={360}>
          <View style={s.ctaRow}>
            <TouchableOpacity style={[s.ctaBtn, { backgroundColor: TEAL }]} activeOpacity={0.85}>
              <Text style={s.ctaTxt}>📄 View Agreement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.ctaBtn, { backgroundColor: WARNING }]} activeOpacity={0.85}>
              <Text style={s.ctaTxt}>✉️ Renew Lease</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND_BLUE },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 24, color: WHITE, lineHeight: 28 },
  hCenter: { alignItems: "center" },
  hTitle: { fontSize: 16, fontWeight: "700", color: WHITE },
  hSub: { fontSize: 11, color: WHITE_40, marginTop: 1 },
  body: { flex: 1 },
  content: { padding: 16, gap: 14 },
  card: { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: WHITE, marginBottom: 14, letterSpacing: 0.2 },
  bt: { borderTopWidth: 1, borderTopColor: WHITE_08 },
  twoCol: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  renewalAlert: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: DANGER_BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: `${DANGER}30` },
  renewalTitle: { fontSize: 13, fontWeight: "700", color: DANGER, marginBottom: 4 },
  renewalBody: { fontSize: 12, color: WHITE_72, lineHeight: 17 },
  propRow: { flexDirection: "row", gap: 14 },
  propIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: WHITE_15, flexShrink: 0 },
  propName: { fontSize: 15, fontWeight: "700", color: WHITE, marginBottom: 3 },
  propAddr: { fontSize: 12, color: WHITE_40, lineHeight: 17 },
  propTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  propTagTxt: { fontSize: 10, fontWeight: "700" },
  finRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11 },
  finLabel: { fontSize: 13, fontWeight: "600", color: WHITE_72, marginBottom: 2 },
  finSub: { fontSize: 11, color: WHITE_40 },
  finValue: { fontSize: 15, fontWeight: "800" },
  clauseRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10 },
  clauseTitle: { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 3 },
  clauseBody: { fontSize: 12, color: WHITE_72, lineHeight: 17 },
  respRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 7 },
  respDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  respTxt: { fontSize: 12, color: WHITE_72 },
  ctaRow: { flexDirection: "row", gap: 12 },
  ctaBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  ctaTxt: { fontSize: 13, fontWeight: "700", color: WHITE },
});
