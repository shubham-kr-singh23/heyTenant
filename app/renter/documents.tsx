import { useEffect, useState } from "react";
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
const PURPLE       = "#8B5CF6";
const WHITE        = "#FFFFFF";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

const CATEGORIES = [
  { id: "all",       label: "All"          },
  { id: "legal",     label: "Legal"        },
  { id: "receipts",  label: "Receipts"     },
  { id: "safety",    label: "Safety"       },
  { id: "inventory", label: "Inventory"    },
] as const;
type CatId = typeof CATEGORIES[number]["id"];

const DOCUMENTS = [
  { id: "1",  name: "Tenancy Agreement",          date: "15 Jan 2024", size: "1.2 MB", cat: "legal",     icon: "📄", color: ACCENT_LIGHT, status: "Current" },
  { id: "2",  name: "Nov 2024 Rent Receipt",       date: "1 Nov 2024",  size: "120 KB", cat: "receipts",  icon: "🧾", color: SUCCESS,      status: null       },
  { id: "3",  name: "Oct 2024 Rent Receipt",       date: "1 Oct 2024",  size: "118 KB", cat: "receipts",  icon: "🧾", color: SUCCESS,      status: null       },
  { id: "4",  name: "Sep 2024 Rent Receipt",       date: "3 Sep 2024",  size: "118 KB", cat: "receipts",  icon: "🧾", color: WARNING,      status: "Late"     },
  { id: "5",  name: "Aug 2024 Rent Receipt",       date: "1 Aug 2024",  size: "120 KB", cat: "receipts",  icon: "🧾", color: SUCCESS,      status: null       },
  { id: "6",  name: "Gas Safety Certificate",      date: "20 Mar 2024", size: "540 KB", cat: "safety",    icon: "🔒", color: TEAL,         status: "Valid"    },
  { id: "7",  name: "Electrical Safety Report",    date: "15 Jan 2024", size: "860 KB", cat: "safety",    icon: "⚡",  color: WARNING,      status: "Valid"    },
  { id: "8",  name: "EPC Certificate",             date: "15 Jan 2024", size: "320 KB", cat: "safety",    icon: "🌿", color: SUCCESS,      status: "B Rated"  },
  { id: "9",  name: "Move-in Inventory Report",    date: "15 Jan 2024", size: "2.4 MB", cat: "inventory", icon: "🏠", color: PURPLE,       status: null       },
  { id: "10", name: "Deposit Scheme Certificate",  date: "16 Jan 2024", size: "440 KB", cat: "legal",     icon: "🔐", color: ACCENT_LIGHT, status: "Protected"},
  { id: "11", name: "Tenancy Renewal Offer",       date: "1 Dec 2024",  size: "980 KB", cat: "legal",     icon: "📋", color: WARNING,      status: "Action needed"},
];

function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const op = useSharedValue(0); const ty = useSharedValue(16);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 420 }));
    ty.value = withDelay(delay, withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, []);
  return <Animated.View style={useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }))}>{children}</Animated.View>;
}

function statusBg(s: string | null) {
  if (!s) return null;
  if (s === "Current" || s === "Valid" || s === "Protected" || s === "B Rated") return SUCCESS_BG;
  if (s === "Action needed") return WARNING_BG;
  return null;
}
function statusTxtColor(s: string | null) {
  if (!s) return WHITE_40;
  if (s === "Current" || s === "Valid" || s === "Protected" || s === "B Rated") return SUCCESS;
  if (s === "Action needed") return WARNING;
  if (s === "Late") return DANGER;
  return WHITE_40;
}

export default function Documents() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pt = Platform.OS === "android" ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32) : Math.max(insets.top + 8, 32);
  const [activeCat, setActiveCat] = useState<CatId>("all");

  const filtered = activeCat === "all" ? DOCUMENTS : DOCUMENTS.filter(d => d.cat === activeCat);
  const actionItems = DOCUMENTS.filter(d => d.status === "Action needed");

  const hOp = useSharedValue(0); const hTy = useSharedValue(-14);
  useEffect(() => { hOp.value = withTiming(1, { duration: 350 }); hTy.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }); }, []);
  const hStyle = useAnimatedStyle(() => ({ opacity: hOp.value, transform: [{ translateY: hTy.value }] }));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />
      <Animated.View style={[s.header, { paddingTop: pt }, hStyle]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}><Text style={s.backArrow}>‹</Text></TouchableOpacity>
        <View style={s.hCenter}><Text style={s.hTitle}>Documents</Text><Text style={s.hSub}>{DOCUMENTS.length} files</Text></View>
        <View style={{ width: 38 }} />
      </Animated.View>

      {/* Category filter */}
      <Animated.View style={[s.filterBar, hStyle]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterInner}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c.id} onPress={() => setActiveCat(c.id)} activeOpacity={0.75}
              style={[s.filterChip, activeCat === c.id && s.filterChipActive]}>
              <Text style={[s.filterTxt, activeCat === c.id && s.filterTxtActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView style={s.body} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 24, 40) }]} showsVerticalScrollIndicator={false}>

        {/* Action needed banner */}
        {activeCat === "all" && actionItems.length > 0 && (
          <FadeIn delay={0}>
            <View style={s.actionBanner}>
              <Text style={{ fontSize: 18 }}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.actionBannerTitle}>Action Required</Text>
                {actionItems.map(a => <Text key={a.id} style={s.actionBannerBody}>{a.name} — please review and sign</Text>)}
              </View>
              <TouchableOpacity style={s.actionBannerBtn} activeOpacity={0.8}><Text style={s.actionBannerBtnTxt}>View</Text></TouchableOpacity>
            </View>
          </FadeIn>
        )}

        {/* Storage usage */}
        {activeCat === "all" && (
          <FadeIn delay={60}>
            <View style={s.storageCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={s.storageTitle}>Storage Used</Text>
                <Text style={s.storageSub}>7.2 MB / 50 MB</Text>
              </View>
              <View style={s.storageTrack}><View style={[s.storageFill, { width: "14%" }]} /></View>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
                {[["📄", "Legal", "3"], ["🧾", "Receipts", "4"], ["🔒", "Safety", "3"], ["🏠", "Inventory", "1"]].map(([ic, l, n]) => (
                  <View key={l} style={{ alignItems: "center", gap: 3 }}>
                    <Text style={{ fontSize: 16 }}>{ic}</Text>
                    <Text style={{ fontSize: 10, color: WHITE_40 }}>{n} files</Text>
                    <Text style={{ fontSize: 9, color: WHITE_40 }}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeIn>
        )}

        {/* Document list */}
        <FadeIn delay={activeCat === "all" ? 120 : 0}>
          <View style={s.card}>
            <Text style={s.cardTitle}>{activeCat === "all" ? "All Documents" : CATEGORIES.find(c => c.id === activeCat)?.label} ({filtered.length})</Text>
            {filtered.map((doc, i) => (
              <TouchableOpacity key={doc.id} style={[s.docRow, i > 0 && s.bt]} activeOpacity={0.75}>
                <View style={[s.docIconBox, { backgroundColor: `${doc.color}18` }]}>
                  <Text style={{ fontSize: 22 }}>{doc.icon}</Text>
                </View>
                <View style={s.docBody}>
                  <Text style={s.docName} numberOfLines={1}>{doc.name}</Text>
                  <Text style={s.docMeta}>{doc.date} · {doc.size}</Text>
                  {doc.status && (
                    <View style={[s.docStatusBadge, { backgroundColor: statusBg(doc.status) ?? WHITE_05 }]}>
                      <Text style={[s.docStatusTxt, { color: statusTxtColor(doc.status) }]}>{doc.status}</Text>
                    </View>
                  )}
                </View>
                <View style={s.docActions}>
                  <TouchableOpacity style={s.docActionBtn} activeOpacity={0.7}><Text style={{ fontSize: 16 }}>👁️</Text></TouchableOpacity>
                  <TouchableOpacity style={s.docActionBtn} activeOpacity={0.7}><Text style={{ fontSize: 16 }}>⬇️</Text></TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </FadeIn>

        {/* Request document */}
        <FadeIn delay={activeCat === "all" ? 180 : 80}>
          <TouchableOpacity style={s.requestDocBtn} activeOpacity={0.8}>
            <Text style={{ fontSize: 18 }}>📤</Text>
            <Text style={s.requestDocTxt}>Request a Document from Landlord</Text>
          </TouchableOpacity>
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
  filterBar: { backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  filterInner: { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: WHITE_05, borderWidth: 1, borderColor: WHITE_15 },
  filterChipActive: { backgroundColor: TEAL, borderColor: TEAL },
  filterTxt: { fontSize: 13, fontWeight: "500", color: WHITE_40 },
  filterTxtActive: { color: WHITE, fontWeight: "700" },
  body: { flex: 1 },
  content: { padding: 16, gap: 14 },
  card: { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: WHITE, marginBottom: 14, letterSpacing: 0.2 },
  bt: { borderTopWidth: 1, borderTopColor: WHITE_08 },
  actionBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: WARNING_BG, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: `${WARNING}30` },
  actionBannerTitle: { fontSize: 13, fontWeight: "700", color: WARNING, marginBottom: 3 },
  actionBannerBody: { fontSize: 12, color: WHITE_72 },
  actionBannerBtn: { backgroundColor: WARNING, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  actionBannerBtnTxt: { fontSize: 12, fontWeight: "700", color: WHITE },
  storageCard: { backgroundColor: WHITE_08, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  storageTitle: { fontSize: 13, fontWeight: "600", color: WHITE_72 },
  storageSub: { fontSize: 12, color: WHITE_40 },
  storageTrack: { height: 6, backgroundColor: WHITE_05, borderRadius: 3, overflow: "hidden" },
  storageFill: { height: 6, backgroundColor: TEAL, borderRadius: 3 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  docIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  docBody: { flex: 1 },
  docName: { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 3 },
  docMeta: { fontSize: 11, color: WHITE_40, marginBottom: 4 },
  docStatusBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  docStatusTxt: { fontSize: 10, fontWeight: "700" },
  docActions: { flexDirection: "row", gap: 6 },
  docActionBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: WHITE_05, alignItems: "center", justifyContent: "center" },
  requestDocBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: WHITE_08, borderRadius: 16, height: 52, borderWidth: 1, borderColor: WHITE_15 },
  requestDocTxt: { fontSize: 14, fontWeight: "600", color: WHITE_72 },
});
