import { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, KeyboardAvoidingView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import { API_URL } from "../../constants/api";
import { useStableFocusEffect } from "../../hooks/useStableFocusEffect";

const BRAND_BLUE   = "#1A3C5E";
const BRAND_DEEP   = "#122B44";
const TEAL         = "#0D9488";
const TEAL_BG      = "rgba(13,148,136,0.12)";
const ACCENT_LIGHT = "#4A90D9";
const SUCCESS      = "#22C55E";
const SUCCESS_BG   = "rgba(34,197,94,0.12)";
const WARNING      = "#F59E0B";
const WARNING_BG   = "rgba(245,158,11,0.12)";
const DANGER       = "#F87171";
const DANGER_BG    = "rgba(248,113,113,0.12)";
const WHITE        = "#FFFFFF";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

const PAYMENT_METHODS = [
  { id: "bank",  label: "Bank Transfer",  icon: "🏦", sub: "Record an external transfer" },
  { id: "card",  label: "Debit / Credit", icon: "💳", sub: "Record an external card payment" },
  { id: "bacs",  label: "Direct Debit",   icon: "🔄", sub: "Record an external debit" },
  { id: "open",  label: "Open Banking",   icon: "🔐", sub: "Record an external payment" },
];

type LeaseData = { _id: string; monthlyRent: number };
type PaymentData = { _id: string; amount: number; status: string; period?: string; paidAt?: string; createdAt: string };

function scColor(s: string) {
  return s === "PAID" ? SUCCESS : s === "LATE" ? DANGER : WARNING;
}

function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const op = useSharedValue(0); const ty = useSharedValue(18);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 430 }));
    ty.value = withDelay(delay, withTiming(0, { duration: 430, easing: Easing.out(Easing.cubic) }));
  }, []);
  return <Animated.View style={useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }))}>{children}</Animated.View>;
}

export default function PayRent() {
  const router = useRouter();
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();
  const pt = Platform.OS === "android" ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32) : Math.max(insets.top + 8, 32);

  const [method,  setMethod]  = useState("bank");
  const [ref,     setRef]     = useState("");
  const [step,    setStep]    = useState<"select" | "confirm" | "success">("select");
  const [busy,    setBusy]    = useState(false);
  const btnSc  = useSharedValue(1);
  const succOp = useSharedValue(0);
  const succSc = useSharedValue(0.6);
  const cur    = PAYMENT_METHODS.find(m => m.id === method)!;

  const [payError, setPayError] = useState<string | null>(null);
  const [lease, setLease] = useState<LeaseData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const fetchPaymentData = useCallback(async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const token = await getToken();
      if (!token) { setDataError("Not authenticated."); return; }
      const headers = { Authorization: `Bearer ${token}` };
      const [leaseResponse, paymentsResponse] = await Promise.all([
        fetch(`${API_URL}/api/renter/lease`, { headers }),
        fetch(`${API_URL}/api/renter/payments`, { headers }),
      ]);
      const [leaseJson, paymentsJson] = await Promise.all([
        leaseResponse.json().catch(() => null),
        paymentsResponse.json().catch(() => null),
      ]);
      if (leaseResponse.status === 404) {
        setLease(null);
      } else if (!leaseResponse.ok) {
        setDataError(leaseJson?.error?.message ?? "Failed to load the active lease.");
        return;
      } else {
        setLease(leaseJson?.data ?? null);
      }
      if (!paymentsResponse.ok) {
        setDataError(paymentsJson?.error?.message ?? "Failed to load payment history.");
        return;
      }
      setPayments(paymentsJson?.data ?? []);
    } catch {
      setDataError("Network error — is the server running?");
    } finally {
      setDataLoading(false);
    }
  }, [getToken]);

  useStableFocusEffect(() => { void fetchPaymentData(); });
  const period = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const currentPeriodPayments = payments
    .filter((payment) => payment.period === period && payment.status !== "LATE")
    .reduce((total, payment) => total + payment.amount, 0);
  const amountDue = Math.max((lease?.monthlyRent ?? 0) - currentPeriodPayments, 0);

  const METHOD_MAP: Record<string, string> = {
    bank: "BANK_TRANSFER", card: "CARD", bacs: "DIRECT_DEBIT", open: "OPEN_BANKING",
  };

  const pay = async () => {
    if (step === "select") { setStep("confirm"); return; }
    setBusy(true);
    setPayError(null);
    btnSc.value = withSpring(0.96, { damping: 15 });
    try {
      const token = await getToken();
      if (!token) { router.replace("/login"); return; }
      if (!lease) {
        setPayError("No active lease found. Cannot process payment.");
        return;
      }
      if (amountDue <= 0) {
        setPayError("There is no outstanding rent amount for this period.");
        return;
      }

      const response = await fetch(`${API_URL}/api/renter/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          leaseId: lease._id,
          amount: amountDue,
          method: METHOD_MAP[method] ?? "BANK_TRANSFER",
          reference: ref,
          period,
        }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        setPayError(json?.error?.message ?? "Payment request could not be saved.");
        return;
      }
      await fetchPaymentData();
      setStep("success");
      succOp.value = withTiming(1, { duration: 400 });
      succSc.value = withSpring(1, { damping: 12, stiffness: 180 });
    } catch {
      setPayError("Network error — is the server running?");
    } finally {
      setBusy(false);
    }
  };

  const hOp = useSharedValue(0); const hTy = useSharedValue(-14);
  useEffect(() => { hOp.value = withTiming(1, { duration: 350 }); hTy.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }); }, []);
  const hStyle   = useAnimatedStyle(() => ({ opacity: hOp.value, transform: [{ translateY: hTy.value }] }));
  const succStyle = useAnimatedStyle(() => ({ opacity: succOp.value, transform: [{ scale: succSc.value }] }));
  const btnStyle  = useAnimatedStyle(() => ({ transform: [{ scale: btnSc.value }] }));

  if (step === "success") return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />
      <View style={[s.succRoot, { paddingTop: pt }]}>
        <Animated.View style={[s.succCard, succStyle]}>
          <View style={s.succIconWrap}><Text style={s.succIconTxt}>✓</Text></View>
          <Text style={s.succTitle}>Payment Request Saved</Text>
          <Text style={s.succSub}>Your landlord must confirm receipt; no payment gateway is connected.</Text>
          <View style={s.succDetail}>
            {[["Method", cur.label], ["Reference", ref || "Generated by server"], ["Date", new Date().toLocaleDateString("en-IN")], ["Status", "Pending confirmation"]].map(([l, v]) => (
              <View key={l} style={s.succRow}><Text style={s.succLbl}>{l}</Text>              <Text style={[s.succVal, l === "Status" && { color: WARNING }]}>{v}</Text></View>
            ))}
          </View>
          <TouchableOpacity style={s.doneBtn} onPress={() => router.back()} activeOpacity={0.85}><Text style={s.doneTxt}>Back to Dashboard</Text></TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />
      <Animated.View style={[s.header, { paddingTop: pt }, hStyle]}>
        <TouchableOpacity onPress={() => step === "confirm" ? setStep("select") : router.back()} style={s.backBtn} activeOpacity={0.7}><Text style={s.backArrow}>‹</Text></TouchableOpacity>
        <View style={s.hCenter}><Text style={s.hTitle}>{step === "confirm" ? "Confirm Payment" : "Pay Rent"}</Text><Text style={s.hSub}>{period}</Text></View>
        <View style={{ width: 38 }} />
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={s.body} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 32, 48) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {step === "select" && <>
            <FadeIn delay={0}>
              <View style={s.dueBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={s.dueLabel}>AMOUNT DUE</Text>
                  <Text style={s.dueAmt}>{lease ? `₹${amountDue.toLocaleString("en-IN")}` : dataLoading ? "Loading…" : "—"}</Text>
                  <Text style={s.dueSub}>{lease ? `Due for ${period}` : dataError || "No active lease"}</Text>
                </View>
                <View style={s.daysRing}><Text style={s.daysNum}>—</Text><Text style={s.daysLbl}>due date</Text></View>
              </View>
            </FadeIn>

            <FadeIn delay={80}>
              <View style={s.statsRow}>
                {[[SUCCESS, SUCCESS_BG, String(payments.filter((payment) => payment.status === "PAID").length), "Paid"],
                  [ACCENT_LIGHT, "rgba(74,144,217,0.12)", `₹${payments.filter((payment) => payment.status === "PAID" && new Date(payment.paidAt ?? payment.createdAt).getFullYear() === new Date().getFullYear()).reduce((sum, payment) => sum + payment.amount, 0).toLocaleString("en-IN")}`, "Paid YTD"],
                  [DANGER, DANGER_BG, String(payments.filter((payment) => payment.status === "LATE").length), "Late"]].map(([c, bg, val, lbl]) => (
                  <View key={lbl as string} style={[s.statCard, { borderColor: `${c}30`, backgroundColor: bg as string }]}>
                    <Text style={[s.statVal, { color: c as string }]}>{val}</Text>
                    <Text style={s.statLbl}>{lbl}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={150}>
              <View style={s.card}>
                <Text style={s.cardTitle}>Payment Method</Text>
                {PAYMENT_METHODS.map((m, i) => (
                  <TouchableOpacity key={m.id} onPress={() => setMethod(m.id)} activeOpacity={0.75}
                    style={[s.methodRow, i > 0 && s.bt, method === m.id && s.methodActive]}>
                    <View style={[s.methodIcon, { backgroundColor: method === m.id ? TEAL_BG : WHITE_05 }]}><Text style={{ fontSize: 20 }}>{m.icon}</Text></View>
                    <View style={{ flex: 1 }}><Text style={[s.methodLbl, method === m.id && { color: WHITE }]}>{m.label}</Text><Text style={s.methodSub}>{m.sub}</Text></View>
                    <View style={[s.radio, method === m.id && s.radioOn]} />
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={220}>
              <View style={s.card}>
                <Text style={s.cardTitle}>Payment Reference</Text>
                <Text style={s.refHint}>Add your bank transfer reference if available. The app records the request but does not process payments.</Text>
                <View style={s.refBox}>
                  <Text style={s.refVal}>{ref}</Text>
                  <TouchableOpacity style={s.copyBtn} activeOpacity={0.7}><Text style={s.copyTxt}>Copy</Text></TouchableOpacity>
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={290}>
              <View style={s.card}>
                <Text style={s.cardTitle}>Recent Payments</Text>
                {dataLoading ? <ActivityIndicator color={ACCENT_LIGHT} /> : dataError ? (
                  <Text style={{ color: DANGER, fontSize: 13 }}>{dataError}</Text>
                ) : payments.length === 0 ? (
                  <Text style={{ color: WHITE_40, fontSize: 13, textAlign: "center", paddingVertical: 16 }}>No payment history yet</Text>
                ) : payments.slice(0, 3).map((p, i) => (
                  <View key={p._id} style={[s.histRow, i > 0 && s.bt]}>
                    <View style={[s.histIcon, { backgroundColor: p.status === "LATE" ? DANGER_BG : p.status === "PAID" ? SUCCESS_BG : WARNING_BG }]}><Text style={{ fontSize: 14 }}>{p.status === "LATE" ? "⚠️" : p.status === "PAID" ? "✅" : "⏳"}</Text></View>
                    <View style={{ flex: 1 }}><Text style={s.histMonth}>{p.period ?? new Date(p.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</Text><Text style={s.histDate}>{new Date(p.paidAt ?? p.createdAt).toLocaleDateString("en-IN")}</Text></View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <Text style={s.histAmt}>₹{p.amount.toLocaleString("en-IN")}</Text>
                      <View style={[s.badge, { backgroundColor: `${scColor(p.status)}22` }]}><Text style={[s.badgeTxt, { color: scColor(p.status) }]}>{p.status}</Text></View>
                    </View>
                  </View>
                ))}
              </View>
            </FadeIn>
          </>}

          {step === "confirm" && <>
            <FadeIn delay={0}>
              <View style={s.card}>
                <Text style={s.cardTitle}>Payment Summary</Text>
                {[["Payee","Your Landlord"],["Property",lease ? "Active rental property" : "—"],["Period",period],["Amount",`₹${amountDue.toLocaleString("en-IN")}`],["Method",cur.label],["Reference",ref || "Generated when saved"]].map(([l, v], i) => (
                  <View key={l} style={[s.confRow, i > 0 && s.bt]}>
                    <Text style={s.confLbl}>{l}</Text>
                    <Text style={[s.confVal, l === "Amount" && { color: WARNING, fontSize: 17, fontWeight: "800" }]}>{v}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>
            <FadeIn delay={80}>
              <View style={s.secureBox}>
                <Text style={{ fontSize: 16 }}>ℹ️</Text>
                <Text style={s.secureTxt}>This app records a payment request only. It does not connect to a bank or payment gateway.</Text>
              </View>
            </FadeIn>
          </>}

          {payError ? (
            <View style={{ paddingHorizontal: 4, marginBottom: 4 }}>
              <Text style={{ color: "#F87171", fontSize: 12, textAlign: "center" }}>{payError}</Text>
            </View>
          ) : null}

          <FadeIn delay={step === "confirm" ? 140 : 350}>
            <Animated.View style={btnStyle}>
              <TouchableOpacity
                style={[s.payBtn, { backgroundColor: step === "confirm" ? SUCCESS : WARNING }, busy && { opacity: 0.65 }]}
                onPress={pay} activeOpacity={0.85} disabled={busy}
                onPressIn={() => btnSc.value = withSpring(0.97, { damping: 15 })}
                onPressOut={() => btnSc.value = withSpring(1, { damping: 15 })}
              >
                <Text style={s.payTxt}>{busy ? "Saving…" : step === "confirm" ? "Submit Payment Record  ✓" : "Continue  →"}</Text>
              </TouchableOpacity>
            </Animated.View>
          </FadeIn>

        </ScrollView>
      </KeyboardAvoidingView>
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
  dueBanner: { backgroundColor: `${WARNING}18`, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: `${WARNING}30`, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dueLabel: { fontSize: 10, fontWeight: "700", color: WARNING, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  dueAmt: { fontSize: 36, fontWeight: "800", color: WHITE, marginBottom: 4 },
  dueSub: { fontSize: 12, color: WHITE_72 },
  daysRing: { width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: WARNING, alignItems: "center", justifyContent: "center", marginLeft: 16 },
  daysNum: { fontSize: 22, fontWeight: "800", color: WHITE, lineHeight: 26 },
  daysLbl: { fontSize: 9, color: WHITE_40, letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1, alignItems: "center", gap: 4 },
  statVal: { fontSize: 18, fontWeight: "800" },
  statLbl: { fontSize: 10, color: WHITE_40, textAlign: "center" },
  methodRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  methodActive: { backgroundColor: `${TEAL}08`, borderRadius: 10, marginHorizontal: -4, paddingHorizontal: 4 },
  methodIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  methodLbl: { fontSize: 14, fontWeight: "600", color: WHITE_72, marginBottom: 2 },
  methodSub: { fontSize: 11, color: WHITE_40 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: WHITE_40 },
  radioOn: { borderColor: TEAL, backgroundColor: TEAL },
  refHint: { fontSize: 12, color: WHITE_40, marginBottom: 12, lineHeight: 17 },
  refBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: WHITE_05, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: WHITE_15 },
  refVal: { fontSize: 14, fontWeight: "600", color: WHITE, letterSpacing: 0.5 },
  copyBtn: { backgroundColor: `${ACCENT_LIGHT}25`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  copyTxt: { fontSize: 12, fontWeight: "700", color: ACCENT_LIGHT },
  histRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  histIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  histMonth: { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 2 },
  histDate: { fontSize: 11, color: WHITE_40 },
  histAmt: { fontSize: 13, fontWeight: "700", color: WHITE },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  confRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 11 },
  confLbl: { fontSize: 13, color: WHITE_40 },
  confVal: { fontSize: 13, fontWeight: "600", color: WHITE },
  secureBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: `${TEAL}12`, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${TEAL}25` },
  secureTxt: { fontSize: 12, color: WHITE_72, flex: 1, lineHeight: 18 },
  payBtn: { borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center" },
  payTxt: { fontSize: 16, fontWeight: "800", color: WHITE, letterSpacing: 0.4 },
  succRoot: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  succCard: { width: "100%", backgroundColor: WHITE_08, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: WHITE_15, alignItems: "center" },
  succIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: SUCCESS_BG, borderWidth: 2, borderColor: SUCCESS, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  succIconTxt: { fontSize: 32, color: SUCCESS },
  succTitle: { fontSize: 24, fontWeight: "800", color: WHITE, marginBottom: 6 },
  succSub: { fontSize: 14, color: WHITE_72, marginBottom: 24 },
  succDetail: { width: "100%", backgroundColor: WHITE_05, borderRadius: 14, padding: 16 },
  succRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  succLbl: { fontSize: 13, color: WHITE_40 },
  succVal: { fontSize: 13, fontWeight: "600", color: WHITE },
  doneBtn: { marginTop: 24, backgroundColor: SUCCESS, borderRadius: 14, height: 52, width: "100%", alignItems: "center", justifyContent: "center" },
  doneTxt: { fontSize: 15, fontWeight: "800", color: WHITE },
});
