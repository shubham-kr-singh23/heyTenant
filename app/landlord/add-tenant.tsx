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
const WHITE        = "#FFFFFF";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

const AVAILABLE_UNITS = [
  { id: "1", label: "Oak Street — Flat 4B",  rent: "£1,250/mo" },
  { id: "2", label: "Maple Ave — Unit 3A",   rent: "£1,100/mo" },
  { id: "3", label: "Birch St — Studio 1A",  rent: "£850/mo"   },
  { id: "4", label: "Cedar Lane — Flat 6C",  rent: "£1,400/mo" },
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

function Field({ label, placeholder, value, onChangeText, keyboardType = "default", multiline = false, error }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fi.wrap}>
      <Text style={fi.label}>{label}</Text>
      <TextInput
        style={[fi.input, focused && fi.focused, multiline && fi.multi, error && fi.err]}
        placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.25)"
        value={value} onChangeText={onChangeText} keyboardType={keyboardType}
        multiline={multiline} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {error ? <Text style={fi.errTxt}>{error}</Text> : null}
    </View>
  );
}
const fi = StyleSheet.create({
  wrap:  { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", color: WHITE_72, marginBottom: 6, letterSpacing: 0.3 },
  input: { backgroundColor: WHITE_05, borderRadius: 12, borderWidth: 1, borderColor: WHITE_15, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: WHITE },
  focused: { borderColor: ACCENT_LIGHT },
  multi: { minHeight: 80, textAlignVertical: "top" },
  err:   { borderColor: DANGER },
  errTxt: { fontSize: 11, color: DANGER, marginTop: 4 },
});

export default function AddTenant() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === "android" ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32) : Math.max(insets.top + 8, 32);

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("");
  const [phone,      setPhone]      = useState("");
  const [dob,        setDob]        = useState("");
  const [nin,        setNin]        = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd,   setLeaseEnd]   = useState("");
  const [rentDay,    setRentDay]    = useState("");
  const [emergName,  setEmergName]  = useState("");
  const [emergPhone, setEmergPhone] = useState("");
  const [notes,      setNotes]      = useState("");
  const [checklist,  setChecklist]  = useState<string[]>([]);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const CHECKLIST = [
    "Right-to-rent checks completed",
    "ID document verified",
    "Security deposit received",
    "Tenancy agreement signed",
    "Keys handed over",
    "Move-in inventory completed",
  ];
  const toggleCheck = (item: string) =>
    setChecklist(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedUnit)             e.unit       = "Please select a property unit.";
    if (!firstName.trim())         e.firstName  = "First name is required.";
    if (!lastName.trim())          e.lastName   = "Last name is required.";
    if (!/\S+@\S+\.\S+/.test(email)) e.email   = "Enter a valid email address.";
    if (!phone.trim())             e.phone      = "Phone number is required.";
    if (!leaseStart.trim())        e.leaseStart = "Lease start date is required.";
    if (!leaseEnd.trim())          e.leaseEnd   = "Lease end date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
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
          <Text style={s.hTitle}>Add Tenant</Text>
          <Text style={s.hSub}>Register a new tenancy</Text>
        </View>
        <View style={{ width: 38 }} />
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={s.body} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 32, 48) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Assign unit */}
          <FadeIn delay={0}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Assign Property Unit</Text>
              {errors.unit ? <Text style={s.errMsg}>{errors.unit}</Text> : null}
              {AVAILABLE_UNITS.map((u) => (
                <TouchableOpacity key={u.id} onPress={() => setSelectedUnit(u.id)} activeOpacity={0.75}
                  style={[s.unitRow, selectedUnit === u.id && s.unitActive]}>
                  <View style={[s.radio, selectedUnit === u.id && s.radioActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.unitName, selectedUnit === u.id && { color: WHITE }]}>{u.label}</Text>
                    <Text style={s.unitRent}>{u.rent}</Text>
                  </View>
                  {selectedUnit === u.id && (
                    <View style={s.checkBadge}><Text style={s.checkTxt}>✓</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </FadeIn>

          {/* Personal info */}
          <FadeIn delay={80}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Personal Information</Text>
              <View style={s.twoCol}>
                <View style={{ flex: 1 }}><Field label="First Name" placeholder="Alex" value={firstName} onChangeText={setFirstName} error={errors.firstName} /></View>
                <View style={{ flex: 1 }}><Field label="Last Name" placeholder="Lee" value={lastName} onChangeText={setLastName} error={errors.lastName} /></View>
              </View>
              <Field label="Email Address" placeholder="alex.lee@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} />
              <Field label="Phone Number" placeholder="+44 7700 900000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.phone} />
              <View style={s.twoCol}>
                <View style={{ flex: 1 }}><Field label="Date of Birth" placeholder="DD/MM/YYYY" value={dob} onChangeText={setDob} /></View>
                <View style={{ flex: 1 }}><Field label="NI Number" placeholder="AB 12 34 56 C" value={nin} onChangeText={setNin} /></View>
              </View>
            </View>
          </FadeIn>

          {/* Lease terms */}
          <FadeIn delay={160}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Lease Terms</Text>
              <View style={s.twoCol}>
                <View style={{ flex: 1 }}><Field label="Lease Start" placeholder="01/01/2025" value={leaseStart} onChangeText={setLeaseStart} error={errors.leaseStart} /></View>
                <View style={{ flex: 1 }}><Field label="Lease End" placeholder="31/12/2025" value={leaseEnd} onChangeText={setLeaseEnd} error={errors.leaseEnd} /></View>
              </View>
              <Field label="Rent Due Day" placeholder="1" value={rentDay} onChangeText={setRentDay} keyboardType="numeric" />
              {selectedUnit && (
                <View style={s.leaseSummary}>
                  <View style={s.leaseSummaryRow}>
                    <Text style={s.leaseSummaryLbl}>Unit</Text>
                    <Text style={s.leaseSummaryVal}>{AVAILABLE_UNITS.find(u => u.id === selectedUnit)?.label}</Text>
                  </View>
                  <View style={[s.leaseSummaryRow, { marginTop: 6 }]}>
                    <Text style={s.leaseSummaryLbl}>Monthly Rent</Text>
                    <Text style={[s.leaseSummaryVal, { color: SUCCESS }]}>{AVAILABLE_UNITS.find(u => u.id === selectedUnit)?.rent}</Text>
                  </View>
                </View>
              )}
            </View>
          </FadeIn>

          {/* Emergency contact */}
          <FadeIn delay={230}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Emergency Contact</Text>
              <Field label="Full Name" placeholder="Jane Lee (Sister)" value={emergName} onChangeText={setEmergName} />
              <Field label="Phone Number" placeholder="+44 7700 900111" value={emergPhone} onChangeText={setEmergPhone} keyboardType="phone-pad" />
            </View>
          </FadeIn>

          {/* Pre-tenancy checklist */}
          <FadeIn delay={290}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Pre-tenancy Checklist</Text>
              <View style={s.checklistProgress}>
                <View style={[s.checklistBar, { width: `${Math.round((checklist.length / CHECKLIST.length) * 100)}%` }]} />
              </View>
              <Text style={s.checklistPct}>{checklist.length}/{CHECKLIST.length} items complete</Text>
              {CHECKLIST.map((item, i) => (
                <TouchableOpacity key={i} onPress={() => toggleCheck(item)} activeOpacity={0.7}
                  style={[s.checkItem, i > 0 && s.borderTop]}>
                  <View style={[s.checkbox, checklist.includes(item) && s.checkboxDone]}>
                    {checklist.includes(item) && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <Text style={[s.checkLbl, checklist.includes(item) && s.checkLblDone]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeIn>

          {/* Notes */}
          <FadeIn delay={340}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Notes</Text>
              <Field label="" placeholder="Any additional notes about this tenant or tenancy…" value={notes} onChangeText={setNotes} multiline />
            </View>
          </FadeIn>

          <FadeIn delay={380}>
            <TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}>
              <Text style={s.submitTxt}>{submitting ? "Saving…" : "Add Tenant"}</Text>
            </TouchableOpacity>
          </FadeIn>

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
  body:    { flex: 1 },
  content: { padding: 16, gap: 14 },
  card:    { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  cardTitle:    { fontSize: 14, fontWeight: "700", color: WHITE, marginBottom: 14, letterSpacing: 0.2 },
  twoCol:       { flexDirection: "row", gap: 12 },
  errMsg:       { fontSize: 11, color: DANGER, marginBottom: 10 },
  unitRow:      { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: WHITE_15, marginBottom: 8, backgroundColor: WHITE_05 },
  unitActive:   { borderColor: ACCENT_LIGHT, backgroundColor: `${ACCENT_LIGHT}10` },
  unitName:     { fontSize: 13, fontWeight: "600", color: WHITE_72, marginBottom: 2 },
  unitRent:     { fontSize: 11, color: WHITE_40 },
  radio:        { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: WHITE_40 },
  radioActive:  { borderColor: ACCENT_LIGHT, backgroundColor: ACCENT_LIGHT },
  checkBadge:   { width: 22, height: 22, borderRadius: 11, backgroundColor: SUCCESS_BG, alignItems: "center", justifyContent: "center" },
  checkTxt:     { fontSize: 12, color: SUCCESS, fontWeight: "800" },
  leaseSummary: { marginTop: 4, padding: 12, borderRadius: 12, backgroundColor: WHITE_05 },
  leaseSummaryRow: { flexDirection: "row", justifyContent: "space-between" },
  leaseSummaryLbl: { fontSize: 12, color: WHITE_40 },
  leaseSummaryVal: { fontSize: 12, fontWeight: "600", color: WHITE_72 },
  checklistProgress: { height: 4, backgroundColor: WHITE_08, borderRadius: 2, overflow: "hidden", marginBottom: 6 },
  checklistBar:      { height: 4, backgroundColor: SUCCESS, borderRadius: 2 },
  checklistPct:      { fontSize: 11, color: WHITE_40, marginBottom: 10 },
  checkItem:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  borderTop:    { borderTopWidth: 1, borderTopColor: WHITE_08 },
  checkbox:     { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: WHITE_15, alignItems: "center", justifyContent: "center" },
  checkboxDone: { backgroundColor: SUCCESS, borderColor: SUCCESS },
  checkMark:    { fontSize: 11, color: WHITE, fontWeight: "800" },
  checkLbl:     { fontSize: 13, color: WHITE_72, flex: 1 },
  checkLblDone: { color: WHITE_40, textDecorationLine: "line-through" },
  submitBtn:    { backgroundColor: SUCCESS, borderRadius: 16, height: 54, alignItems: "center", justifyContent: "center" },
  submitTxt:    { fontSize: 15, fontWeight: "800", color: WHITE, letterSpacing: 0.3 },
});
