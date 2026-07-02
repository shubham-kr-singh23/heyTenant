import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import { useRouter } from "expo-router";

const BRAND_BLUE   = "#1A3C5E";
const BRAND_DEEP   = "#122B44";
const ACCENT       = "#3B6FA8";
const ACCENT_LIGHT = "#4A90D9";
const SUCCESS      = "#22C55E";
const SUCCESS_BG   = "rgba(34,197,94,0.12)";
const WARNING      = "#F59E0B";
const WARNING_BG   = "rgba(245,158,11,0.12)";
const DANGER       = "#F87171";
const DANGER_BG    = "rgba(248,113,113,0.12)";
const PURPLE       = "#8B5CF6";
const WHITE        = "#FFFFFF";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

const INVOICE_TYPES = [
  { id: "rent",        label: "Rent",           icon: "🏠", color: ACCENT_LIGHT },
  { id: "deposit",     label: "Deposit",         icon: "🔐", color: SUCCESS      },
  { id: "maintenance", label: "Maintenance",     icon: "🔧", color: WARNING      },
  { id: "penalty",     label: "Late Fee",        icon: "⚠️", color: DANGER       },
  { id: "service",     label: "Service Charge",  icon: "📋", color: PURPLE       },
  { id: "other",       label: "Other",           icon: "📄", color: WHITE_72     },
];

const TENANTS = [
  { id: "1", name: "Alex Lee",      unit: "Oak St 4B",    rent: "£1,250" },
  { id: "2", name: "Sarah Khan",    unit: "Maple Ave 2A", rent: "£1,100" },
  { id: "3", name: "James Patel",   unit: "Cedar Ln 7C",  rent: "£1,350" },
  { id: "4", name: "Maria Garcia",  unit: "Birch St 3D",  rent: "£950"   },
  { id: "5", name: "Tom Williams",  unit: "Oak St 2A",    rent: "£1,200" },
];

const RECENT_INVOICES = [
  { id: "INV-0042", tenant: "Alex Lee",     type: "Rent",    amount: "£1,250", date: "1 Dec 2024", status: "Paid"    },
  { id: "INV-0041", tenant: "Sarah Khan",   type: "Rent",    amount: "£1,100", date: "1 Dec 2024", status: "Paid"    },
  { id: "INV-0040", tenant: "James Patel",  type: "Late Fee",amount: "£50",    date: "8 Nov 2024", status: "Pending" },
  { id: "INV-0039", tenant: "Maria Garcia", type: "Rent",    amount: "£950",   date: "1 Nov 2024", status: "Overdue" },
  { id: "INV-0038", tenant: "Tom Williams", type: "Deposit", amount: "£2,400", date: "5 Oct 2024", status: "Paid"    },
];

function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const op = useSharedValue(0); const ty = useSharedValue(18);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 420 }));
    ty.value = withDelay(delay, withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function Field({ label, placeholder, value, onChangeText, keyboardType = "default", multiline = false }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, focused && f.focused, multiline && f.multi]}
        placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.25)"
        value={value} onChangeText={onChangeText} keyboardType={keyboardType}
        multiline={multiline} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </View>
  );
}
const f = StyleSheet.create({
  wrap:   { marginBottom: 16 },
  label:  { fontSize: 12, fontWeight: "600", color: WHITE_72, marginBottom: 6, letterSpacing: 0.3 },
  input:  { backgroundColor: WHITE_05, borderRadius: 12, borderWidth: 1, borderColor: WHITE_15, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: WHITE },
  focused:{ borderColor: ACCENT_LIGHT },
  multi:  { minHeight: 72, textAlignVertical: "top" },
});

function statusColor(s: string) {
  if (s === "Paid") return SUCCESS;
  if (s === "Pending") return WARNING;
  return DANGER;
}

export default function NewInvoice() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === "android" ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32) : Math.max(insets.top + 8, 32);

  const [view,          setView]         = useState<"new" | "history">("new");
  const [invoiceType,   setInvoiceType]  = useState("rent");
  const [selectedTenant,setTenant]       = useState<string | null>(null);
  const [amount,        setAmount]       = useState("");
  const [dueDate,       setDueDate]      = useState("");
  const [invoiceNum,    setInvoiceNum]   = useState("INV-0043");
  const [notes,         setNotes]        = useState("");
  const [submitting,    setSubmitting]   = useState(false);
  const [submitted,     setSubmitted]    = useState(false);

  const currentType = INVOICE_TYPES.find(t => t.id === invoiceType)!;
  const currentTenant = TENANTS.find(t => t.id === selectedTenant);

  // Auto-fill amount when tenant and type selected
  useEffect(() => {
    if (invoiceType === "rent" && selectedTenant) {
      const tenant = TENANTS.find(t => t.id === selectedTenant);
      setAmount(tenant?.rent.replace("£", "") ?? "");
    }
  }, [invoiceType, selectedTenant]);

  const handleCreate = async () => {
    if (!selectedTenant || !amount || !dueDate) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 600));
    router.back();
  };

  const hOp = useSharedValue(0); const hTy = useSharedValue(-14);
  useEffect(() => {
    hOp.value = withTiming(1, { duration: 350 });
    hTy.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
  }, []);
  const hStyle = useAnimatedStyle(() => ({ opacity: hOp.value, transform: [{ translateY: hTy.value }] }));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />
      <Animated.View style={[s.header, { paddingTop }, hStyle]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={s.hTitle}>New Invoice</Text>
          <Text style={s.hSub}>{invoiceNum}</Text>
        </View>
        <TouchableOpacity onPress={() => setView(v => v === "new" ? "history" : "new")} style={s.viewToggle} activeOpacity={0.7}>
          <Text style={s.viewToggleTxt}>{view === "new" ? "History" : "New"}</Text>
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={s.body} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 32, 48) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {view === "history" ? (
            <>
              {/* Recent invoices */}
              <FadeIn delay={0}>
                <View style={s.card}>
                  <View style={s.cardHeaderRow}>
                    <Text style={s.cardTitle}>Recent Invoices</Text>
                    <Text style={s.cardSub}>Last 5</Text>
                  </View>
                  {RECENT_INVOICES.map((inv, i) => (
                    <TouchableOpacity key={inv.id} style={[s.invRow, i > 0 && s.borderTop]} activeOpacity={0.7}>
                      <View style={s.invLeft}>
                        <Text style={s.invId}>{inv.id}</Text>
                        <Text style={s.invTenant}>{inv.tenant} · {inv.type}</Text>
                        <Text style={s.invDate}>{inv.date}</Text>
                      </View>
                      <View style={s.invRight}>
                        <Text style={s.invAmount}>{inv.amount}</Text>
                        <View style={[s.statusBadge, { backgroundColor: `${statusColor(inv.status)}22` }]}>
                          <Text style={[s.statusTxt, { color: statusColor(inv.status) }]}>{inv.status}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </FadeIn>

              <FadeIn delay={80}>
                <View style={s.twoCol}>
                  {[
                    { label: "Total Invoiced", value: "£47,350", color: ACCENT_LIGHT },
                    { label: "Outstanding",    value: "£2,800",  color: DANGER        },
                  ].map((k) => (
                    <View key={k.label} style={[s.card, s.half, { alignItems: "center" }]}>
                      <Text style={[s.bigVal, { color: k.color }]}>{k.value}</Text>
                      <Text style={s.cardSub}>{k.label}</Text>
                    </View>
                  ))}
                </View>
              </FadeIn>
            </>
          ) : (
            <>
              {/* Invoice type */}
              <FadeIn delay={0}>
                <View style={s.card}>
                  <Text style={s.cardTitle}>Invoice Type</Text>
                  <View style={s.typeGrid}>
                    {INVOICE_TYPES.map((t) => (
                      <TouchableOpacity key={t.id} onPress={() => setInvoiceType(t.id)} activeOpacity={0.75}
                        style={[s.typeCard, invoiceType === t.id && { borderColor: t.color, backgroundColor: `${t.color}18` }]}>
                        <Text style={s.typeIcon}>{t.icon}</Text>
                        <Text style={[s.typeLabel, invoiceType === t.id && { color: t.color }]}>{t.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </FadeIn>

              {/* Select tenant */}
              <FadeIn delay={80}>
                <View style={s.card}>
                  <Text style={s.cardTitle}>Bill To</Text>
                  {TENANTS.map((t, i) => (
                    <TouchableOpacity key={t.id} onPress={() => setTenant(t.id)} activeOpacity={0.75}
                      style={[s.tenantRow, i > 0 && s.borderTop, selectedTenant === t.id && s.tenantActive]}>
                      <View style={[s.radio, selectedTenant === t.id && s.radioActive]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.tenantName, selectedTenant === t.id && { color: WHITE }]}>{t.name}</Text>
                        <Text style={s.tenantUnit}>{t.unit} · {t.rent}/mo</Text>
                      </View>
                      {selectedTenant === t.id && (
                        <View style={s.selectedBadge}><Text style={s.selectedTxt}>✓</Text></View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </FadeIn>

              {/* Invoice details */}
              <FadeIn delay={160}>
                <View style={[s.card, { borderColor: `${currentType.color}30` }]}>
                  <View style={s.cardHeaderRow}>
                    <Text style={s.cardTitle}>Invoice Details</Text>
                    <View style={[s.typeBadge, { backgroundColor: `${currentType.color}18` }]}>
                      <Text>{currentType.icon}</Text>
                      <Text style={[s.typeBadgeTxt, { color: currentType.color }]}>{currentType.label}</Text>
                    </View>
                  </View>
                  <Field label="Invoice Number" placeholder="INV-0043" value={invoiceNum} onChangeText={setInvoiceNum} />
                  <View style={s.twoCol}>
                    <View style={{ flex: 1 }}><Field label="Amount (£)" placeholder="1,250" value={amount} onChangeText={setAmount} keyboardType="numeric" /></View>
                    <View style={{ flex: 1 }}><Field label="Due Date" placeholder="01/01/2025" value={dueDate} onChangeText={setDueDate} /></View>
                  </View>
                  <Field label="Notes" placeholder="Optional invoice note…" value={notes} onChangeText={setNotes} multiline />
                </View>
              </FadeIn>

              {/* Preview */}
              {currentTenant && amount && dueDate ? (
                <FadeIn delay={220}>
                  <View style={s.previewCard}>
                    <Text style={s.previewHeading}>📄 Invoice Preview</Text>
                    <View style={s.previewRow}>
                      <Text style={s.previewLbl}>Invoice No.</Text>
                      <Text style={s.previewVal}>{invoiceNum}</Text>
                    </View>
                    <View style={s.previewRow}>
                      <Text style={s.previewLbl}>Bill To</Text>
                      <Text style={s.previewVal}>{currentTenant.name}</Text>
                    </View>
                    <View style={s.previewRow}>
                      <Text style={s.previewLbl}>Unit</Text>
                      <Text style={s.previewVal}>{currentTenant.unit}</Text>
                    </View>
                    <View style={s.previewRow}>
                      <Text style={s.previewLbl}>Type</Text>
                      <Text style={[s.previewVal, { color: currentType.color }]}>{currentType.label}</Text>
                    </View>
                    <View style={s.previewRow}>
                      <Text style={s.previewLbl}>Amount</Text>
                      <Text style={[s.previewVal, { color: SUCCESS, fontSize: 16, fontWeight: "800" }]}>£{amount}</Text>
                    </View>
                    <View style={s.previewRow}>
                      <Text style={s.previewLbl}>Due Date</Text>
                      <Text style={s.previewVal}>{dueDate}</Text>
                    </View>
                  </View>
                </FadeIn>
              ) : null}

              <FadeIn delay={270}>
                <TouchableOpacity
                  style={[s.createBtn, (!selectedTenant || !amount || !dueDate || submitting || submitted) && { opacity: 0.6 }]}
                  onPress={handleCreate} activeOpacity={0.85}
                  disabled={!selectedTenant || !amount || !dueDate || submitting || submitted}
                >
                  <Text style={s.createTxt}>{submitted ? "Created ✓" : submitting ? "Creating…" : "Create & Send Invoice"}</Text>
                </TouchableOpacity>
              </FadeIn>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: BRAND_BLUE },
  header:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 24, color: WHITE, lineHeight: 28 },
  hCenter: { alignItems: "center" },
  hTitle:  { fontSize: 16, fontWeight: "700", color: WHITE },
  hSub:    { fontSize: 11, color: WHITE_40, marginTop: 1 },
  viewToggle: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: WHITE_08, borderWidth: 1, borderColor: WHITE_15 },
  viewToggleTxt: { fontSize: 12, fontWeight: "600", color: WHITE_72 },
  body:    { flex: 1 },
  content: { padding: 16, gap: 14 },
  card:    { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: WHITE, letterSpacing: 0.2 },
  cardSub:   { fontSize: 11, color: WHITE_40 },
  twoCol:  { flexDirection: "row", gap: 12 },
  half:    { flex: 1 },
  bigVal:  { fontSize: 24, fontWeight: "800", color: WHITE, marginBottom: 2 },
  borderTop: { borderTopWidth: 1, borderTopColor: WHITE_08 },

  typeGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  typeCard:  { width: "31%", flexGrow: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: WHITE_15, backgroundColor: WHITE_05, gap: 6 },
  typeIcon:  { fontSize: 22 },
  typeLabel: { fontSize: 11, fontWeight: "600", color: WHITE_40, textAlign: "center" },

  tenantRow:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11 },
  tenantActive: { backgroundColor: `${ACCENT_LIGHT}10`, borderRadius: 8 },
  tenantName:   { fontSize: 13, fontWeight: "600", color: WHITE_72, marginBottom: 2 },
  tenantUnit:   { fontSize: 11, color: WHITE_40 },
  radio:        { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: WHITE_40 },
  radioActive:  { borderColor: ACCENT_LIGHT, backgroundColor: ACCENT_LIGHT },
  selectedBadge:{ width: 22, height: 22, borderRadius: 11, backgroundColor: SUCCESS_BG, alignItems: "center", justifyContent: "center" },
  selectedTxt:  { fontSize: 12, color: SUCCESS, fontWeight: "800" },

  typeBadge:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  typeBadgeTxt: { fontSize: 12, fontWeight: "700" },

  invRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  invLeft:   { flex: 1 },
  invId:     { fontSize: 12, fontWeight: "700", color: ACCENT_LIGHT, marginBottom: 2 },
  invTenant: { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 2 },
  invDate:   { fontSize: 11, color: WHITE_40 },
  invRight:  { alignItems: "flex-end", gap: 4 },
  invAmount: { fontSize: 14, fontWeight: "800", color: WHITE },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusTxt:   { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },

  previewCard: { backgroundColor: WHITE_05, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: WHITE_08 },
  previewHeading: { fontSize: 12, fontWeight: "700", color: WHITE_40, marginBottom: 12, letterSpacing: 0.5 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  previewLbl: { fontSize: 12, color: WHITE_40 },
  previewVal: { fontSize: 13, fontWeight: "600", color: WHITE },

  createBtn: { backgroundColor: ACCENT, borderRadius: 16, height: 54, alignItems: "center", justifyContent: "center" },
  createTxt: { fontSize: 15, fontWeight: "800", color: WHITE, letterSpacing: 0.3 },
});
