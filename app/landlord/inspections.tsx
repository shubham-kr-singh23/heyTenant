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
const PURPLE_BG    = "rgba(139,92,246,0.12)";
const WHITE        = "#FFFFFF";
const WHITE_90     = "rgba(255,255,255,0.90)";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

const INSPECTION_TABS = ["Scheduled", "In Progress", "Completed"] as const;
type InspTab = typeof INSPECTION_TABS[number];

const PROPERTIES = [
  { id: "1", name: "Oak Street 4B",    tenant: "Alex Lee",     lastInspected: "Jun 2024" },
  { id: "2", name: "Maple Ave 2A",     tenant: "Sarah Khan",   lastInspected: "Mar 2024" },
  { id: "3", name: "Cedar Ln 7C",      tenant: "James Patel",  lastInspected: "Aug 2024" },
  { id: "4", name: "Birch St 3D",      tenant: "Maria Garcia", lastInspected: "Sep 2024" },
];

const INSPECTIONS = [
  { id: "1", property: "Oak Street 4B",  tenant: "Alex Lee",     date: "22 Dec 2024", time: "10:00 AM", inspector: "Mike Ross",    status: "Scheduled",   type: "Routine",  result: null   },
  { id: "2", property: "Maple Ave 2A",   tenant: "Sarah Khan",   date: "24 Dec 2024", time: "2:00 PM",  inspector: "Mike Ross",    status: "Scheduled",   type: "Pre-exit", result: null   },
  { id: "3", property: "Cedar Ln 7C",    tenant: "James Patel",  date: "20 Dec 2024", time: "11:30 AM", inspector: "Lisa Turner",  status: "In Progress", type: "Routine",  result: null   },
  { id: "4", property: "Birch St 1A",    tenant: "New Tenant",   date: "10 Dec 2024", time: "9:00 AM",  inspector: "Lisa Turner",  status: "Completed",   type: "Move-in",  result: "Pass" },
  { id: "5", property: "Oak Street 2A",  tenant: "Tom Williams", date: "5 Dec 2024",  time: "3:00 PM",  inspector: "Mike Ross",    status: "Completed",   type: "Routine",  result: "Fail" },
  { id: "6", property: "Maple Ave 4B",   tenant: "Helen Wu",     date: "1 Dec 2024",  time: "1:00 PM",  inspector: "Lisa Turner",  status: "Completed",   type: "Pre-exit", result: "Pass" },
];

const CHECKLIST_CATEGORIES = [
  { name: "General Condition",  items: ["Walls & ceilings intact", "Floors undamaged", "Windows functional", "Doors & locks working"] },
  { name: "Kitchen",            items: ["Appliances working", "Oven & hob clean", "Cupboards intact", "Plumbing leak-free"] },
  { name: "Bathroom",           items: ["Sanitaryware intact", "Shower/bath functional", "Extractor fan working", "Sealant intact"] },
  { name: "Safety",             items: ["Smoke alarms tested", "CO detectors present", "Fire door compliant", "Electrical panel accessible"] },
  { name: "Exterior",           items: ["Garden/yard maintained", "Bins accessible", "Gutters clear", "External lighting working"] },
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

function Field({ label, placeholder, value, onChangeText }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, focused && f.focused]}
        placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.25)"
        value={value} onChangeText={onChangeText}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </View>
  );
}
const f = StyleSheet.create({
  wrap:   { marginBottom: 16 },
  label:  { fontSize: 12, fontWeight: "600", color: WHITE_72, marginBottom: 6, letterSpacing: 0.3 },
  input:  { backgroundColor: WHITE_05, borderRadius: 12, borderWidth: 1, borderColor: WHITE_15, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: WHITE },
  focused:{ borderColor: ACCENT_LIGHT },
});

function statusColor(s: string) {
  if (s === "Scheduled")   return ACCENT_LIGHT;
  if (s === "In Progress") return WARNING;
  return SUCCESS;
}
function resultColor(r: string | null) {
  if (r === "Pass") return SUCCESS;
  if (r === "Fail") return DANGER;
  return WHITE_40;
}

export default function Inspections() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === "android" ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32) : Math.max(insets.top + 8, 32);

  const [activeTab,      setActiveTab]     = useState<InspTab>("Scheduled");
  const [showSchedule,   setShowSchedule]  = useState(false);
  const [selectedProp,   setSelectedProp]  = useState<string | null>(null);
  const [inspType,       setInspType]      = useState("Routine");
  const [date,           setDate]          = useState("");
  const [time,           setTime]          = useState("");
  const [inspector,      setInspector]     = useState("");
  const [checklistOpen,  setChecklistOpen] = useState<string | null>(null);
  const [checked,        setChecked]       = useState<string[]>([]);

  const filteredInspections = INSPECTIONS.filter(i => i.status === activeTab);

  const toggleCheck = (item: string) =>
    setChecked(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);

  const totalItems = CHECKLIST_CATEGORIES.reduce((a, c) => a + c.items.length, 0);

  const hOp = useSharedValue(0); const hTy = useSharedValue(-14);
  useEffect(() => {
    hOp.value = withTiming(1, { duration: 350 });
    hTy.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
  }, []);
  const hStyle = useAnimatedStyle(() => ({ opacity: hOp.value, transform: [{ translateY: hTy.value }] }));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />

      {/* Header */}
      <Animated.View style={[s.header, { paddingTop }, hStyle]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={s.hTitle}>Inspections</Text>
          <Text style={s.hSub}>Property condition tracking</Text>
        </View>
        <View style={{ width: 38 }} />
      </Animated.View>

      {/* KPI strip */}
      <Animated.View style={[s.kpiStrip, hStyle]}>
        {[
          { label: "Scheduled",    count: INSPECTIONS.filter(i => i.status === "Scheduled").length,   color: ACCENT_LIGHT },
          { label: "In Progress",  count: INSPECTIONS.filter(i => i.status === "In Progress").length,  color: WARNING      },
          { label: "Completed",    count: INSPECTIONS.filter(i => i.status === "Completed").length,    color: SUCCESS      },
          { label: "Overdue",      count: 1, color: DANGER },
        ].map((k) => (
          <View key={k.label} style={s.kpiStripItem}>
            <Text style={[s.kpiStripVal, { color: k.color }]}>{k.count}</Text>
            <Text style={s.kpiStripLbl}>{k.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Tab bar */}
      <Animated.View style={[s.tabBar, hStyle]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabInner}>
          {INSPECTION_TABS.map((t) => (
            <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)} activeOpacity={0.75}>
              <Text style={[s.tabTxt, activeTab === t && s.tabTxtActive]}>{t}</Text>
              <View style={[s.tabCount, activeTab === t && s.tabCountActive]}>
                <Text style={[s.tabCountTxt, activeTab === t && { color: WHITE }]}>
                  {INSPECTIONS.filter(i => i.status === t).length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={s.body} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 24, 40) }]} showsVerticalScrollIndicator={false}>

          {/* Schedule new inspection CTA */}
          <FadeIn delay={0}>
            <TouchableOpacity style={s.scheduleBtn} onPress={() => setShowSchedule(!showSchedule)} activeOpacity={0.85}>
              <Text style={s.scheduleBtnTxt}>{showSchedule ? "✕  Cancel" : "+ Schedule New Inspection"}</Text>
            </TouchableOpacity>
          </FadeIn>

          {/* Schedule form */}
          {showSchedule && (
            <FadeIn delay={0}>
              <View style={s.card}>
                <Text style={s.cardTitle}>Schedule Inspection</Text>

                {/* Inspection type */}
                <Text style={f.label}>Type</Text>
                <View style={s.chipRow}>
                  {["Routine", "Move-in", "Pre-exit", "Emergency"].map((t) => (
                    <TouchableOpacity key={t} onPress={() => setInspType(t)} activeOpacity={0.75}
                      style={[s.chip, inspType === t && s.chipActive]}>
                      <Text style={[s.chipTxt, inspType === t && s.chipTxtActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Property */}
                <Text style={[f.label, { marginTop: 12 }]}>Property</Text>
                {PROPERTIES.map((p, i) => (
                  <TouchableOpacity key={p.id} onPress={() => setSelectedProp(p.id)} activeOpacity={0.75}
                    style={[s.propRow, i > 0 && s.borderTop, selectedProp === p.id && s.propRowActive]}>
                    <View style={[s.radio, selectedProp === p.id && s.radioActive]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.propName, selectedProp === p.id && { color: WHITE }]}>{p.name}</Text>
                      <Text style={s.propSub}>{p.tenant} · Last: {p.lastInspected}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Date / time / inspector */}
                <View style={{ marginTop: 12 }}>
                  <View style={s.twoCol}>
                    <View style={{ flex: 1 }}><Field label="Date" placeholder="22/12/2024" value={date} onChangeText={setDate} /></View>
                    <View style={{ flex: 1 }}><Field label="Time" placeholder="10:00 AM" value={time} onChangeText={setTime} /></View>
                  </View>
                  <Field label="Inspector Name" placeholder="Mike Ross" value={inspector} onChangeText={setInspector} />
                </View>

                <TouchableOpacity
                  style={[s.confirmBtn, (!selectedProp || !date || !time) && { opacity: 0.5 }]}
                  onPress={() => setShowSchedule(false)} activeOpacity={0.85}
                  disabled={!selectedProp || !date || !time}
                >
                  <Text style={s.confirmTxt}>Confirm Inspection</Text>
                </TouchableOpacity>
              </View>
            </FadeIn>
          )}

          {/* Inspection list */}
          {filteredInspections.length === 0 ? (
            <FadeIn delay={80}>
              <View style={[s.card, { alignItems: "center", paddingVertical: 32 }]}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>🔍</Text>
                <Text style={{ fontSize: 14, color: WHITE_40 }}>No {activeTab.toLowerCase()} inspections</Text>
              </View>
            </FadeIn>
          ) : (
            <FadeIn delay={80}>
              <View style={s.card}>
                {filteredInspections.map((insp, i) => (
                  <View key={insp.id} style={[s.inspItem, i > 0 && s.borderTop]}>
                    <View style={s.inspTop}>
                      <View style={[s.typePill, { backgroundColor: `${statusColor(insp.status)}18` }]}>
                        <Text style={[s.typePillTxt, { color: statusColor(insp.status) }]}>{insp.type}</Text>
                      </View>
                      {insp.result && (
                        <View style={[s.resultBadge, { backgroundColor: `${resultColor(insp.result)}20` }]}>
                          <Text style={[s.resultTxt, { color: resultColor(insp.result) }]}>{insp.result}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.inspProp}>{insp.property}</Text>
                    <Text style={s.inspTenant}>{insp.tenant}</Text>
                    <View style={s.inspMeta}>
                      <Text style={s.inspMetaTxt}>📅 {insp.date} · {insp.time}</Text>
                      <Text style={s.inspMetaTxt}>👤 {insp.inspector}</Text>
                    </View>
                    {insp.status === "In Progress" && (
                      <TouchableOpacity style={s.startChecklistBtn} onPress={() => setChecklistOpen(insp.id)} activeOpacity={0.8}>
                        <Text style={s.startChecklistTxt}>Start Checklist</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </FadeIn>
          )}

          {/* Inline checklist when started */}
          {checklistOpen && (
            <FadeIn delay={0}>
              <View style={[s.card, { borderColor: `${WARNING}30` }]}>
                <View style={s.checklistHeader}>
                  <Text style={s.cardTitle}>Inspection Checklist</Text>
                  <TouchableOpacity onPress={() => setChecklistOpen(null)} activeOpacity={0.7}>
                    <Text style={s.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.checklistProgress}>
                  <View style={[s.checklistBar, { width: `${Math.round((checked.length / totalItems) * 100)}%` }]} />
                </View>
                <Text style={s.checklistPct}>{checked.length}/{totalItems} items complete</Text>

                {CHECKLIST_CATEGORIES.map((cat) => (
                  <View key={cat.name} style={{ marginTop: 14 }}>
                    <Text style={s.catTitle}>{cat.name}</Text>
                    {cat.items.map((item, j) => (
                      <TouchableOpacity key={item} onPress={() => toggleCheck(item)} activeOpacity={0.7}
                        style={[s.checkItem, j > 0 && s.borderTop]}>
                        <View style={[s.checkbox, checked.includes(item) && s.checkboxDone]}>
                          {checked.includes(item) && <Text style={s.checkMark}>✓</Text>}
                        </View>
                        <Text style={[s.checkLbl, checked.includes(item) && s.checkLblDone]}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}

                <TouchableOpacity style={[s.completeBtn, checked.length < totalItems && { opacity: 0.5 }]}
                  onPress={() => setChecklistOpen(null)} activeOpacity={0.85} disabled={checked.length < totalItems}>
                  <Text style={s.completeTxt}>
                    {checked.length < totalItems ? `${totalItems - checked.length} items remaining` : "Mark Complete  ✓"}
                  </Text>
                </TouchableOpacity>
              </View>
            </FadeIn>
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

  kpiStrip:     { flexDirection: "row", backgroundColor: BRAND_DEEP, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  kpiStripItem: { flex: 1, alignItems: "center", gap: 3 },
  kpiStripVal:  { fontSize: 18, fontWeight: "800" },
  kpiStripLbl:  { fontSize: 9, color: WHITE_40, letterSpacing: 0.3, textAlign: "center" },

  tabBar:      { backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  tabInner:    { paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  tab:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: WHITE_05, flexDirection: "row", alignItems: "center", gap: 6 },
  tabActive:   { backgroundColor: ACCENT },
  tabTxt:      { fontSize: 13, fontWeight: "500", color: WHITE_40 },
  tabTxtActive:{ color: WHITE, fontWeight: "700" },
  tabCount:    { width: 18, height: 18, borderRadius: 9, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center" },
  tabCountActive: { backgroundColor: "rgba(255,255,255,0.20)" },
  tabCountTxt: { fontSize: 9, fontWeight: "800", color: WHITE_40 },

  body:    { flex: 1 },
  content: { padding: 16, gap: 14 },
  card:    { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: WHITE, letterSpacing: 0.2 },
  twoCol:  { flexDirection: "row", gap: 12 },
  borderTop: { borderTopWidth: 1, borderTopColor: WHITE_08 },

  scheduleBtn:    { backgroundColor: ACCENT, borderRadius: 16, height: 52, alignItems: "center", justifyContent: "center" },
  scheduleBtnTxt: { fontSize: 14, fontWeight: "700", color: WHITE },

  chipRow:     { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: WHITE_15, backgroundColor: WHITE_05 },
  chipActive:  { borderColor: DANGER, backgroundColor: DANGER_BG },
  chipTxt:     { fontSize: 12, fontWeight: "600", color: WHITE_40 },
  chipTxtActive: { color: DANGER },

  propRow:      { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  propRowActive:{ backgroundColor: `${ACCENT_LIGHT}10`, borderRadius: 8 },
  propName:     { fontSize: 13, fontWeight: "600", color: WHITE_72, marginBottom: 2 },
  propSub:      { fontSize: 11, color: WHITE_40 },
  radio:        { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: WHITE_40 },
  radioActive:  { borderColor: ACCENT_LIGHT, backgroundColor: ACCENT_LIGHT },

  confirmBtn:  { backgroundColor: DANGER, borderRadius: 14, height: 48, alignItems: "center", justifyContent: "center", marginTop: 12 },
  confirmTxt:  { fontSize: 14, fontWeight: "700", color: WHITE },

  inspItem:    { paddingVertical: 14 },
  inspTop:     { flexDirection: "row", gap: 8, marginBottom: 6 },
  typePill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typePillTxt: { fontSize: 10, fontWeight: "700" },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  resultTxt:   { fontSize: 10, fontWeight: "700" },
  inspProp:    { fontSize: 14, fontWeight: "700", color: WHITE, marginBottom: 2 },
  inspTenant:  { fontSize: 12, color: WHITE_72, marginBottom: 6 },
  inspMeta:    { flexDirection: "row", gap: 16 },
  inspMetaTxt: { fontSize: 11, color: WHITE_40 },
  startChecklistBtn: { marginTop: 10, backgroundColor: `${WARNING}20`, borderRadius: 10, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${WARNING}30` },
  startChecklistTxt: { fontSize: 12, fontWeight: "700", color: WARNING },

  checklistHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  closeBtn:         { fontSize: 16, color: WHITE_40, padding: 4 },
  checklistProgress:{ height: 4, backgroundColor: WHITE_08, borderRadius: 2, overflow: "hidden", marginBottom: 6 },
  checklistBar:     { height: 4, backgroundColor: SUCCESS, borderRadius: 2 },
  checklistPct:     { fontSize: 11, color: WHITE_40, marginBottom: 8 },
  catTitle:         { fontSize: 12, fontWeight: "700", color: ACCENT_LIGHT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  checkItem:        { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 },
  checkbox:         { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: WHITE_15, alignItems: "center", justifyContent: "center" },
  checkboxDone:     { backgroundColor: SUCCESS, borderColor: SUCCESS },
  checkMark:        { fontSize: 11, color: WHITE, fontWeight: "800" },
  checkLbl:         { fontSize: 13, color: WHITE_72, flex: 1 },
  checkLblDone:     { color: WHITE_40, textDecorationLine: "line-through" },
  completeBtn:      { marginTop: 16, backgroundColor: SUCCESS, borderRadius: 14, height: 48, alignItems: "center", justifyContent: "center" },
  completeTxt:      { fontSize: 14, fontWeight: "700", color: WHITE },
});
