import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

// ─── Palette ──────────────────────────────────────────────────────────────────
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
const WHITE_90     = "rgba(255,255,255,0.90)";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_20     = "rgba(255,255,255,0.20)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

// ─── Static mock data ─────────────────────────────────────────────────────────
const QUICK_STATS = [
  { label: "Properties",  value: "12", icon: "\uD83C\uDFE2", color: ACCENT_LIGHT, bg: "rgba(74,144,217,0.15)" },
  { label: "Tenants",     value: "38", icon: "\uD83D\uDC65", color: SUCCESS,       bg: SUCCESS_BG             },
  { label: "Maintenance", value: "5",  icon: "\uD83D\uDD27", color: WARNING,       bg: WARNING_BG             },
  { label: "Vacancies",   value: "3",  icon: "\uD83D\uDEAA", color: DANGER,        bg: DANGER_BG              },
];

const RECENT_ACTIVITIES = [
  { id: "1", icon: "\uD83D\uDCB0", title: "Rent Received",        desc: "Unit 4B \u2013 Oak Street",          time: "2 min ago",  color: SUCCESS      },
  { id: "2", icon: "\uD83D\uDD27", title: "Maintenance Request",  desc: "Plumbing \u2013 Maple Ave, Unit 2A", time: "18 min ago", color: WARNING      },
  { id: "3", icon: "\uD83D\uDCC4", title: "Lease Expiring Soon",  desc: "Cedar Lane, Unit 7C \u2013 14 days", time: "1 hr ago",   color: DANGER       },
  { id: "4", icon: "\uD83D\uDCAC", title: "New Message",          desc: "Sarah K. \u2013 Rent receipt query", time: "3 hrs ago",  color: ACCENT_LIGHT },
  { id: "5", icon: "\uD83C\uDFE0", title: "Inspection Completed", desc: "Birch St, Unit 1A \u2013 All clear",  time: "Yesterday",  color: PURPLE       },
];

const MAINTENANCE_ITEMS = [
  { id: "1", unit: "Oak St 4B",    issue: "Water heater broken",   priority: "High",   status: "In Progress", days: 2 },
  { id: "2", unit: "Maple Ave 2A", issue: "Blocked drain",         priority: "High",   status: "Open",        days: 1 },
  { id: "3", unit: "Cedar Ln 7C",  issue: "Window latch loose",    priority: "Medium", status: "Open",        days: 4 },
  { id: "4", unit: "Birch St 3D",  issue: "Paint touch-up needed", priority: "Low",    status: "Scheduled",   days: 7 },
];

const UPCOMING_EVENTS = [
  { id: "1", title: "Lease renewal \u2013 Oak St 4B",       date: "Dec 22", color: ACCENT_LIGHT },
  { id: "2", title: "Annual inspection \u2013 Maple Ave",    date: "Dec 24", color: PURPLE       },
  { id: "3", title: "Contractor visit \u2013 Cedar Ln",      date: "Dec 26", color: WARNING      },
  { id: "4", title: "New tenant move-in \u2013 Birch St 1A", date: "Jan 2",  color: SUCCESS      },
];

const OCCUPANCY_DATA = [
  { month: "Jul", rate: 83 },
  { month: "Aug", rate: 88 },
  { month: "Sep", rate: 92 },
  { month: "Oct", rate: 90 },
  { month: "Nov", rate: 95 },
  { month: "Dec", rate: 75 },
];

const REVENUE_DATA   = [28400, 31200, 29800, 33500, 35100, 34200];
const REVENUE_MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function priorityColor(p: string) {
  if (p === "High")   return DANGER;
  if (p === "Medium") return WARNING;
  return SUCCESS;
}
function statusColor(s: string) {
  if (s === "Open")        return DANGER;
  if (s === "In Progress") return WARNING;
  return ACCENT_LIGHT;
}

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────
function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(16);
  useEffect(() => {
    opacity.value    = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value, transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {action && <Text style={sh.action}>{action}</Text>}
    </View>
  );
}
const sh = StyleSheet.create({
  row:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title:  { fontSize: 15, fontWeight: "700", color: WHITE, letterSpacing: 0.2 },
  action: { fontSize: 12, fontWeight: "600", color: ACCENT_LIGHT },
});

// ─── Occupancy bar chart ──────────────────────────────────────────────────────
function OccupancyChart() {
  const maxH = 80;
  const a0 = useSharedValue(0); const a1 = useSharedValue(0); const a2 = useSharedValue(0);
  const a3 = useSharedValue(0); const a4 = useSharedValue(0); const a5 = useSharedValue(0);
  const avs = [a0, a1, a2, a3, a4, a5];
  useEffect(() => {
    OCCUPANCY_DATA.forEach((d, i) => {
      avs[i].value = withDelay(300 + i * 80, withTiming(d.rate / 100, { duration: 600, easing: Easing.out(Easing.cubic) }));
    });
  }, []);
  const bs0 = useAnimatedStyle(() => ({ height: a0.value * maxH, backgroundColor: ACCENT_LIGHT, borderRadius: 5, flex: 1 }));
  const bs1 = useAnimatedStyle(() => ({ height: a1.value * maxH, backgroundColor: ACCENT_LIGHT, borderRadius: 5, flex: 1 }));
  const bs2 = useAnimatedStyle(() => ({ height: a2.value * maxH, backgroundColor: ACCENT_LIGHT, borderRadius: 5, flex: 1 }));
  const bs3 = useAnimatedStyle(() => ({ height: a3.value * maxH, backgroundColor: ACCENT_LIGHT, borderRadius: 5, flex: 1 }));
  const bs4 = useAnimatedStyle(() => ({ height: a4.value * maxH, backgroundColor: ACCENT_LIGHT, borderRadius: 5, flex: 1 }));
  const bs5 = useAnimatedStyle(() => ({ height: a5.value * maxH, backgroundColor: WHITE_40,     borderRadius: 5, flex: 1 }));
  const barStyles = [bs0, bs1, bs2, bs3, bs4, bs5];
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: maxH + 32 }}>
      {OCCUPANCY_DATA.map((d, i) => (
        <View key={d.month} style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ fontSize: 9, color: WHITE_72, marginBottom: 3 }}>{d.rate}%</Text>
          <Animated.View style={barStyles[i]} />
          <Text style={{ fontSize: 9, color: WHITE_40, marginTop: 4 }}>{d.month}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Revenue sparkline ────────────────────────────────────────────────────────
function RevenueSparkline() {
  const { width } = useWindowDimensions();
  const cardW  = (width - 32 - 12) / 2 - 32;
  const chartH = 56;
  const minVal = Math.min(...REVENUE_DATA);
  const maxVal = Math.max(...REVENUE_DATA);
  const range  = maxVal - minVal || 1;
  const pts    = REVENUE_DATA.map((v, i) => ({
    x: (i / (REVENUE_DATA.length - 1)) * cardW,
    y: chartH - ((v - minVal) / range) * (chartH - 10) - 5,
  }));
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ height: chartH, position: "relative" }}>
        {[0.33, 0.66, 1].map((f) => (
          <View key={f} style={{ position: "absolute", left: 0, right: 0,
            top: chartH - f * (chartH - 10) - 5, height: 1, backgroundColor: WHITE_08 }} />
        ))}
        {pts.slice(0, -1).map((p, i) => {
          const nx = pts[i + 1].x; const ny = pts[i + 1].y;
          const dx = nx - p.x; const dy = ny - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View key={i} style={{ position: "absolute", left: p.x, top: p.y - 1, width: len,
              height: 2, backgroundColor: ACCENT_LIGHT, borderRadius: 1,
              transform: [{ rotate: `${ang}deg` }], transformOrigin: "0 50%" }} />
          );
        })}
        {pts.map((p, i) => (
          <View key={i} style={{ position: "absolute", left: p.x - 4, top: p.y - 4,
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: i === pts.length - 1 ? ACCENT_LIGHT : WHITE_20,
            borderWidth: i === pts.length - 1 ? 2 : 0, borderColor: WHITE }} />
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        {REVENUE_MONTHS.map((m) => <Text key={m} style={{ fontSize: 9, color: WHITE_40 }}>{m}</Text>)}
      </View>
    </View>
  );
}

// ─── Donut summary ────────────────────────────────────────────────────────────
function DonutSummary() {
  const pct = Math.round((9 / 12) * 100);
  return (
    <View style={{ alignItems: "center" }}>
      <View style={[dn.ring, { borderColor: ACCENT_LIGHT }]}>
        <View style={[dn.inner, { borderColor: WHITE_08 }]}>
          <Text style={dn.pct}>{pct}%</Text>
          <Text style={dn.sub}>Occupied</Text>
        </View>
      </View>
      <View style={dn.legend}>
        <View style={dn.item}><View style={[dn.dot, { backgroundColor: ACCENT_LIGHT }]} /><Text style={dn.txt}>9 Occupied</Text></View>
        <View style={dn.item}><View style={[dn.dot, { backgroundColor: DANGER      }]} /><Text style={dn.txt}>3 Vacant</Text></View>
      </View>
    </View>
  );
}
const dn = StyleSheet.create({
  ring:   { width: 96, height: 96, borderRadius: 48, borderWidth: 10, alignItems: "center", justifyContent: "center" },
  inner:  { width: 74, height: 74, borderRadius: 37, borderWidth: 10, alignItems: "center", justifyContent: "center" },
  pct:    { fontSize: 17, fontWeight: "800", color: WHITE, lineHeight: 21 },
  sub:    { fontSize: 8, color: WHITE_40, letterSpacing: 0.5, textTransform: "uppercase" },
  legend: { marginTop: 10, gap: 6 },
  item:   { flexDirection: "row", alignItems: "center", gap: 6 },
  dot:    { width: 8, height: 8, borderRadius: 4 },
  txt:    { fontSize: 11, color: WHITE_72 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function LandlordDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "tenants" | "finance">("overview");

  const headerOpacity    = useSharedValue(0);
  const headerTranslateY = useSharedValue(-16);
  useEffect(() => {
    headerOpacity.value    = withTiming(1, { duration: 400 });
    headerTranslateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value, transform: [{ translateY: headerTranslateY.value }],
  }));

  const paddingTop = Platform.OS === "android"
    ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32)
    : Math.max(insets.top + 8, 32);

  const TABS = [
    { id: "overview",   label: "Overview"   },
    { id: "properties", label: "Properties" },
    { id: "tenants",    label: "Tenants"    },
    { id: "finance",    label: "Finance"    },
  ] as const;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />

      {/* Header */}
      <Animated.View style={[s.header, { paddingTop }, headerStyle]}>
        <View style={s.hLeft}>
          <View style={s.avatar}><Text style={s.avatarTxt}>JD</Text></View>
          <View>
            <Text style={s.greeting}>Good morning</Text>
            <Text style={s.userName}>John Davies</Text>
          </View>
        </View>
        <View style={s.hRight}>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
            <Text style={s.iconBtnTxt}>{"\uD83D\uDD14"}</Text>
            <View style={s.badge}><Text style={s.badgeTxt}>5</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
            <Text style={s.iconBtnTxt}>{"\u2699\uFE0F"}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Tab bar */}
      <Animated.View style={[s.tabBar, headerStyle]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabInner}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[s.tab, activeTab === t.id && s.tabActive]}
              onPress={() => setActiveTab(t.id)}
              activeOpacity={0.75}
            >
              <Text style={[s.tabTxt, activeTab === t.id && s.tabTxtActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Body */}
      <ScrollView
        style={s.body}
        contentContainerStyle={[s.bodyContent, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI row */}
        <FadeIn delay={0}>
          <View style={s.kpiRow}>
            {QUICK_STATS.map((stat) => (
              <View key={stat.label} style={[s.kpiCard, { backgroundColor: stat.bg }]}>
                <Text style={s.kpiIcon}>{stat.icon}</Text>
                <Text style={[s.kpiVal, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.kpiLbl}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </FadeIn>

        {/* Revenue + Occupancy */}
        <FadeIn delay={80}>
          <View style={s.twoCol}>
            <View style={[s.card, s.half]}>
              <View style={s.cardRow}>
                <Text style={s.cardTitle}>Revenue</Text>
                <View style={[s.pill, { backgroundColor: SUCCESS_BG }]}>
                  <Text style={[s.pillTxt, { color: SUCCESS }]}>+8.4%</Text>
                </View>
              </View>
              <Text style={s.bigVal}>{"\u00A3"}34,200</Text>
              <Text style={s.cardSub}>This month</Text>
              <RevenueSparkline />
            </View>
            <View style={[s.card, s.half]}>
              <Text style={s.cardTitle}>Occupancy</Text>
              <View style={{ marginTop: 8 }}><DonutSummary /></View>
            </View>
          </View>
        </FadeIn>

        {/* Occupancy trend */}
        <FadeIn delay={160}>
          <View style={s.card}>
            <SectionHeader title="Occupancy Trend" action="6 months" />
            <OccupancyChart />
          </View>
        </FadeIn>

        {/* Rent collection */}
        <FadeIn delay={220}>
          <View style={s.card}>
            <SectionHeader title="Rent Collection — Dec" />
            <View style={s.rentRow}>
              <View style={s.rentStat}>
                <Text style={[s.rentVal, { color: SUCCESS }]}>28</Text>
                <Text style={s.rentLbl}>Collected</Text>
              </View>
              <View style={s.rentDiv} />
              <View style={s.rentStat}>
                <Text style={[s.rentVal, { color: WARNING }]}>6</Text>
                <Text style={s.rentLbl}>Pending</Text>
              </View>
              <View style={s.rentDiv} />
              <View style={s.rentStat}>
                <Text style={[s.rentVal, { color: DANGER }]}>4</Text>
                <Text style={s.rentLbl}>Overdue</Text>
              </View>
            </View>
            <View style={s.progTrack}>
              <View style={[s.progFill, { width: "73%", backgroundColor: SUCCESS }]} />
            </View>
            <Text style={s.progLbl}>73% of tenants paid this month</Text>
          </View>
        </FadeIn>

        {/* Maintenance */}
        <FadeIn delay={280}>
          <View style={s.card}>
            <SectionHeader title="Maintenance Requests" action="View all" />
            {MAINTENANCE_ITEMS.map((item, i) => (
              <TouchableOpacity key={item.id} style={[s.maintItem, i > 0 && s.borderTop]} activeOpacity={0.7}>
                <View style={s.maintLeft}>
                  <View style={[s.priorDot, { backgroundColor: priorityColor(item.priority) }]} />
                  <View>
                    <Text style={s.maintUnit}>{item.unit}</Text>
                    <Text style={s.maintIssue}>{item.issue}</Text>
                  </View>
                </View>
                <View style={s.maintRight}>
                  <View style={[s.statusBadge, { backgroundColor: `${statusColor(item.status)}22` }]}>
                    <Text style={[s.statusTxt, { color: statusColor(item.status) }]}>{item.status}</Text>
                  </View>
                  <Text style={s.daysAgo}>{item.days}d ago</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </FadeIn>

        {/* Activity feed */}
        <FadeIn delay={340}>
          <View style={s.card}>
            <SectionHeader title="Recent Activity" action="See all" />
            {RECENT_ACTIVITIES.map((act, i) => (
              <View key={act.id} style={[s.actItem, i < RECENT_ACTIVITIES.length - 1 && s.actBorder]}>
                <View style={[s.actIcon, { backgroundColor: `${act.color}18` }]}>
                  <Text style={s.actIconTxt}>{act.icon}</Text>
                </View>
                <View style={s.actBody}>
                  <Text style={s.actTitle}>{act.title}</Text>
                  <Text style={s.actDesc}>{act.desc}</Text>
                </View>
                <Text style={s.actTime}>{act.time}</Text>
              </View>
            ))}
          </View>
        </FadeIn>

        {/* Upcoming events */}
        <FadeIn delay={400}>
          <View style={s.card}>
            <SectionHeader title="Upcoming Events" action="Calendar" />
            {UPCOMING_EVENTS.map((ev, i) => (
              <TouchableOpacity key={ev.id} style={[s.evItem, i < UPCOMING_EVENTS.length - 1 && s.evBorder]} activeOpacity={0.7}>
                <View style={[s.evDot, { backgroundColor: ev.color }]} />
                <Text style={s.evTitle}>{ev.title}</Text>
                <View style={[s.evDateBadge, { backgroundColor: `${ev.color}20` }]}>
                  <Text style={[s.evDate, { color: ev.color }]}>{ev.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </FadeIn>

        {/* Quick actions */}
        <FadeIn delay={460}>
          <View style={s.card}>
            <SectionHeader title="Quick Actions" />
            <View style={s.actionsGrid}>
              {[
                { label: "Add Property", color: ACCENT_LIGHT },
                { label: "Add Tenant",   color: SUCCESS       },
                { label: "Send Notice",  color: WARNING       },
                { label: "View Reports", color: PURPLE        },
                { label: "New Invoice",  color: ACCENT_LIGHT  },
                { label: "Inspections",  color: DANGER        },
              ].map((a) => (
                <TouchableOpacity key={a.label} style={s.actionBtn} activeOpacity={0.7}>
                  <View style={[s.actionDot, { backgroundColor: `${a.color}25` }]} />
                  <Text style={s.actionLbl}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FadeIn>

        {/* Sign out */}
        <FadeIn delay={500}>
          <TouchableOpacity style={s.signOut} onPress={() => router.replace("/login")} activeOpacity={0.75}>
            <Text style={s.signOutTxt}>Sign Out</Text>
          </TouchableOpacity>
        </FadeIn>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND_BLUE },

  header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  hLeft:      { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar:     { width: 42, height: 42, borderRadius: 21, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: WHITE_20 },
  avatarTxt:  { fontSize: 14, fontWeight: "800", color: WHITE },
  greeting:   { fontSize: 11, color: WHITE_40, letterSpacing: 0.4, marginBottom: 1 },
  userName:   { fontSize: 15, fontWeight: "700", color: WHITE },
  hRight:     { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn:    { width: 38, height: 38, borderRadius: 12, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center" },
  iconBtnTxt: { fontSize: 18 },
  badge:      { position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: DANGER, alignItems: "center", justifyContent: "center" },
  badgeTxt:   { fontSize: 9, fontWeight: "800", color: WHITE },

  tabBar:      { backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  tabInner:    { paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  tab:         { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: WHITE_05 },
  tabActive:   { backgroundColor: ACCENT },
  tabTxt:      { fontSize: 13, fontWeight: "500", color: WHITE_40 },
  tabTxtActive:{ color: WHITE, fontWeight: "700" },

  body:        { flex: 1 },
  bodyContent: { padding: 16, gap: 14 },

  kpiRow:  { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1, borderColor: WHITE_08 },
  kpiIcon: { fontSize: 20, marginBottom: 6 },
  kpiVal:  { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  kpiLbl:  { fontSize: 10, color: WHITE_40, letterSpacing: 0.4, textAlign: "center" },

  card:    { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  twoCol:  { flexDirection: "row", gap: 12 },
  half:    { flex: 1 },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: WHITE_72, letterSpacing: 0.3 },
  bigVal:  { fontSize: 24, fontWeight: "800", color: WHITE, marginBottom: 2 },
  cardSub: { fontSize: 11, color: WHITE_40 },
  pill:    { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  pillTxt: { fontSize: 11, fontWeight: "700" },

  rentRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginVertical: 14 },
  rentStat: { alignItems: "center", gap: 4 },
  rentVal:  { fontSize: 28, fontWeight: "800" },
  rentLbl:  { fontSize: 11, color: WHITE_40 },
  rentDiv:  { width: 1, height: 40, backgroundColor: WHITE_15 },
  progTrack:{ height: 6, backgroundColor: WHITE_08, borderRadius: 3, overflow: "hidden", marginTop: 4 },
  progFill: { height: 6, borderRadius: 3 },
  progLbl:  { fontSize: 11, color: WHITE_40, marginTop: 6, textAlign: "center" },

  borderTop:   { borderTopWidth: 1, borderTopColor: WHITE_08 },
  maintItem:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  maintLeft:   { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  priorDot:    { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  maintUnit:   { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 2 },
  maintIssue:  { fontSize: 11, color: WHITE_40 },
  maintRight:  { alignItems: "flex-end", gap: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusTxt:   { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  daysAgo:     { fontSize: 10, color: WHITE_40 },

  actItem:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  actBorder:  { borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  actIcon:    { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  actIconTxt: { fontSize: 17 },
  actBody:    { flex: 1 },
  actTitle:   { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 2 },
  actDesc:    { fontSize: 11, color: WHITE_40 },
  actTime:    { fontSize: 10, color: WHITE_40, flexShrink: 0 },

  evItem:      { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  evBorder:    { borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  evDot:       { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  evTitle:     { flex: 1, fontSize: 13, fontWeight: "500", color: WHITE_90 },
  evDateBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  evDate:      { fontSize: 11, fontWeight: "700" },

  actionsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn:      { width: "30%", flexGrow: 1, alignItems: "center", paddingVertical: 14, backgroundColor: WHITE_05, borderRadius: 14, borderWidth: 1, borderColor: WHITE_08 },
  actionDot:      { width: 36, height: 36, borderRadius: 18, marginBottom: 8 },
  actionLbl:      { fontSize: 11, fontWeight: "600", color: WHITE_72, textAlign: "center" },

  signOut:    { alignItems: "center", justifyContent: "center", height: 50, borderRadius: 16, borderWidth: 1, borderColor: WHITE_15, backgroundColor: WHITE_05 },
  signOutTxt: { fontSize: 14, fontWeight: "600", color: WHITE_40 },
});