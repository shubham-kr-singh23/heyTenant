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
const WHITE_20     = "rgba(255,255,255,0.20)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

// ─── Static mock data ─────────────────────────────────────────────────────────
const KPI_CARDS = [
  { label: "Rent Due",     value: "£1,250", icon: "🏷️", color: WARNING,      bg: WARNING_BG  },
  { label: "Days Left",    value: "8",      icon: "📅", color: ACCENT_LIGHT, bg: "rgba(74,144,217,0.15)" },
  { label: "Open Tickets", value: "2",      icon: "🔧", color: DANGER,       bg: DANGER_BG   },
  { label: "Messages",     value: "3",      icon: "💬", color: TEAL,         bg: TEAL_BG     },
];

const PAYMENT_HISTORY = [
  { id: "1", month: "November 2024",  amount: "£1,250", date: "1 Nov", status: "Paid" },
  { id: "2", month: "October 2024",   amount: "£1,250", date: "1 Oct", status: "Paid" },
  { id: "3", month: "September 2024", amount: "£1,250", date: "3 Sep", status: "Late" },
  { id: "4", month: "August 2024",    amount: "£1,250", date: "1 Aug", status: "Paid" },
  { id: "5", month: "July 2024",      amount: "£1,250", date: "1 Jul", status: "Paid" },
];

const MAINTENANCE_REQUESTS = [
  { id: "1", issue: "Leaking tap — kitchen",    raised: "Dec 14", priority: "High",   status: "In Progress" },
  { id: "2", issue: "Bathroom extractor noisy", raised: "Dec 10", priority: "Medium", status: "Open"        },
  { id: "3", issue: "Door hinge squeaking",     raised: "Nov 28", priority: "Low",    status: "Resolved"    },
];

const MESSAGES = [
  { id: "1", from: "Property Manager",  preview: "Hi Alex, just to confirm your boiler service is scheduled for Dec 22.", time: "10 min ago", read: false },
  { id: "2", from: "John Davies (LL)",  preview: "Your December rent statement is ready to view in Documents.",           time: "2 hrs ago",  read: false },
  { id: "3", from: "Maintenance Team",  preview: "We have assigned a plumber to your kitchen tap — ETA tomorrow 9am.",   time: "Yesterday",  read: true  },
];

const DOCUMENTS = [
  { id: "1", name: "Tenancy Agreement",      date: "Jan 2024",   icon: "📄", color: ACCENT_LIGHT },
  { id: "2", name: "Nov 2024 Rent Receipt",  date: "1 Nov 2024", icon: "🧾", color: SUCCESS      },
  { id: "3", name: "Oct 2024 Rent Receipt",  date: "1 Oct 2024", icon: "🧾", color: SUCCESS      },
  { id: "4", name: "Gas Safety Certificate", date: "Mar 2024",   icon: "🔒", color: TEAL         },
  { id: "5", name: "Move-in Inspection",     date: "Jan 2024",   icon: "🏠", color: PURPLE       },
];

const UPCOMING_EVENTS = [
  { id: "1", title: "Rent Due",               date: "1 Jan",  color: WARNING      },
  { id: "2", title: "Boiler Service",         date: "22 Dec", color: ACCENT_LIGHT },
  { id: "3", title: "Lease Renewal Deadline", date: "15 Jan", color: DANGER       },
  { id: "4", title: "Annual Inspection",      date: "20 Jan", color: PURPLE       },
];

const NOTICE_BOARD = [
  { id: "1", title: "Planned water outage",  body: "Water will be off on Dec 21 from 8am–12pm for pipe maintenance.", type: "warning" },
  { id: "2", title: "Holiday office hours",  body: "Management office closed Dec 25–Jan 1. Emergencies: 0800 123 456.", type: "info"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === "Paid" || s === "Resolved") return SUCCESS;
  if (s === "In Progress")              return WARNING;
  if (s === "Late")                     return DANGER;
  return ACCENT_LIGHT;
}
function priorityColor(p: string) {
  if (p === "High")   return DANGER;
  if (p === "Medium") return WARNING;
  return SUCCESS;
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

// ─── Rent countdown ring ──────────────────────────────────────────────────────
function RentCountdown({ daysLeft, total }: { daysLeft: number; total: number }) {
  const pct = Math.round(((total - daysLeft) / total) * 100);
  return (
    <View style={{ alignItems: "center" }}>
      <View style={[rc.ring, { borderColor: WARNING }]}>
        <View style={[rc.inner, { borderColor: WHITE_08 }]}>
          <Text style={rc.days}>{daysLeft}</Text>
          <Text style={rc.label}>days left</Text>
        </View>
      </View>
      <View style={rc.legend}>
        <View style={rc.legendItem}>
          <View style={[rc.dot, { backgroundColor: WARNING }]} />
          <Text style={rc.legendTxt}>Cycle {pct}% elapsed</Text>
        </View>
      </View>
    </View>
  );
}
const rc = StyleSheet.create({
  ring:       { width: 96, height: 96, borderRadius: 48, borderWidth: 10, alignItems: "center", justifyContent: "center" },
  inner:      { width: 74, height: 74, borderRadius: 37, borderWidth: 10, alignItems: "center", justifyContent: "center" },
  days:       { fontSize: 20, fontWeight: "800", color: WHITE, lineHeight: 24 },
  label:      { fontSize: 8, color: WHITE_40, letterSpacing: 0.5, textTransform: "uppercase" },
  legend:     { marginTop: 10, gap: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  legendTxt:  { fontSize: 11, color: WHITE_72 },
});

// ─── Mini payment sparkline ───────────────────────────────────────────────────
function PaymentSparkline() {
  const { width } = useWindowDimensions();
  const chartW = (width - 32 - 12) / 2 - 32;
  const chartH = 48;
  const vals   = [1, 1, 0.5, 1, 1]; // 1 = on-time, 0.5 = late
  const pts    = vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * chartW,
    y: chartH - v * (chartH - 10) - 5,
  }));
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ height: chartH, position: "relative" }}>
        {pts.slice(0, -1).map((p, i) => {
          const nx = pts[i + 1].x; const ny = pts[i + 1].y;
          const dx = nx - p.x;     const dy = ny - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View key={i} style={{ position: "absolute", left: p.x, top: p.y - 1, width: len,
              height: 2, backgroundColor: SUCCESS, borderRadius: 1,
              transform: [{ rotate: `${ang}deg` }], transformOrigin: "0 50%" }} />
          );
        })}
        {pts.map((p, i) => (
          <View key={i} style={{ position: "absolute", left: p.x - 4, top: p.y - 4,
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: vals[i] < 1 ? DANGER : SUCCESS,
            borderWidth: i === pts.length - 1 ? 2 : 0, borderColor: WHITE }} />
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        {["Jul", "Aug", "Sep", "Oct", "Nov"].map((m) => (
          <Text key={m} style={{ fontSize: 9, color: WHITE_40 }}>{m}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RenterDashboard() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"home" | "payments" | "maintenance" | "messages">("home");

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
    { id: "home",        label: "Home"        },
    { id: "payments",    label: "Payments"    },
    { id: "maintenance", label: "Maintenance" },
    { id: "messages",    label: "Messages"    },
  ] as const;

  const unread = MESSAGES.filter((m) => !m.read).length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />

      {/* ── Header ── */}
      <Animated.View style={[s.header, { paddingTop }, headerStyle]}>
        <View style={s.hLeft}>
          <View style={s.avatar}><Text style={s.avatarTxt}>AL</Text></View>
          <View>
            <Text style={s.greeting}>Good morning</Text>
            <Text style={s.userName}>Alex Lee</Text>
          </View>
        </View>
        <View style={s.hRight}>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
            <Text style={s.iconBtnTxt}>🔔</Text>
            {unread > 0 && (
              <View style={s.notifBadge}><Text style={s.notifBadgeTxt}>{unread}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7}>
            <Text style={s.iconBtnTxt}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Tab bar ── */}
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
              {t.id === "messages" && unread > 0 && (
                <View style={s.tabBadge}><Text style={s.tabBadgeTxt}>{unread}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* ── Body ── */}
      <ScrollView
        style={s.body}
        contentContainerStyle={[s.bodyContent, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ══════════════ HOME TAB ══════════════ */}
        {activeTab === "home" && (
          <>
            {/* KPI row */}
            <FadeIn delay={0}>
              <View style={s.kpiRow}>
                {KPI_CARDS.map((k) => (
                  <View key={k.label} style={[s.kpiCard, { backgroundColor: k.bg }]}>
                    <Text style={s.kpiIcon}>{k.icon}</Text>
                    <Text style={[s.kpiVal, { color: k.color }]}>{k.value}</Text>
                    <Text style={s.kpiLbl}>{k.label}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>

            {/* Rent due banner */}
            <FadeIn delay={80}>
              <View style={[s.card, s.rentBanner]}>
                <View style={s.rentBannerLeft}>
                  <Text style={s.rentBannerLabel}>NEXT RENT DUE</Text>
                  <Text style={s.rentBannerAmount}>£1,250</Text>
                  <Text style={s.rentBannerDate}>1 January 2025</Text>
                  <TouchableOpacity style={s.payNowBtn} activeOpacity={0.8}>
                    <Text style={s.payNowTxt}>Pay Now</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.rentBannerRight}>
                  <RentCountdown daysLeft={8} total={31} />
                </View>
              </View>
            </FadeIn>

            {/* Property info */}
            <FadeIn delay={150}>
              <View style={s.card}>
                <SectionHeader title="My Property" />
                <View style={s.propRow}>
                  <View style={s.propIconBox}><Text style={{ fontSize: 28 }}>🏢</Text></View>
                  <View style={s.propDetails}>
                    <Text style={s.propName}>Apt 4B — Oak Street</Text>
                    <Text style={s.propAddr}>12 Oak Street, London, E1 5TW</Text>
                    <View style={s.propTagRow}>
                      <View style={[s.propTag, { backgroundColor: TEAL_BG }]}>
                        <Text style={[s.propTagTxt, { color: TEAL }]}>Active Lease</Text>
                      </View>
                      <View style={[s.propTag, { backgroundColor: PURPLE_BG }]}>
                        <Text style={[s.propTagTxt, { color: PURPLE }]}>2-Bed</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={s.leaseRow}>
                  <View style={s.leaseStat}>
                    <Text style={s.leaseVal}>Jan 2024</Text>
                    <Text style={s.leaseLbl}>Start Date</Text>
                  </View>
                  <View style={s.leaseDiv} />
                  <View style={s.leaseStat}>
                    <Text style={[s.leaseVal, { color: WARNING }]}>Jan 2025</Text>
                    <Text style={s.leaseLbl}>End Date</Text>
                  </View>
                  <View style={s.leaseDiv} />
                  <View style={s.leaseStat}>
                    <Text style={[s.leaseVal, { color: TEAL }]}>£1,250</Text>
                    <Text style={s.leaseLbl}>Monthly</Text>
                  </View>
                </View>
                <View style={s.renewalAlert}>
                  <Text style={s.renewalIcon}>⚠️</Text>
                  <Text style={s.renewalTxt}>
                    Lease renewal deadline:{" "}
                    <Text style={{ color: DANGER, fontWeight: "700" }}>15 Jan 2025</Text>
                  </Text>
                </View>
              </View>
            </FadeIn>

            {/* Notice board */}
            <FadeIn delay={220}>
              <View style={s.card}>
                <SectionHeader title="Notice Board" />
                {NOTICE_BOARD.map((n, i) => (
                  <View key={n.id} style={[s.noticeItem, i > 0 && s.borderTop]}>
                    <View style={[s.noticeIconBox, { backgroundColor: n.type === "warning" ? WARNING_BG : "rgba(74,144,217,0.12)" }]}>
                      <Text style={{ fontSize: 16 }}>{n.type === "warning" ? "⚠️" : "ℹ️"}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.noticeTitle}>{n.title}</Text>
                      <Text style={s.noticeBody}>{n.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </FadeIn>

            {/* Upcoming events */}
            <FadeIn delay={290}>
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
            <FadeIn delay={360}>
              <View style={s.card}>
                <SectionHeader title="Quick Actions" />
                <View style={s.actionsGrid}>
                  {[
                    { label: "Pay Rent",    color: WARNING,      route: "/renter/pay-rent"    },
                    { label: "New Request", color: DANGER,       route: "/renter/new-request" },
                    { label: "Messages",    color: TEAL,         route: "/renter/messages"    },
                    { label: "Documents",   color: ACCENT_LIGHT, route: "/renter/documents"   },
                    { label: "Lease Info",  color: PURPLE,       route: "/renter/lease-info"  },
                    { label: "Contact LL",  color: SUCCESS,      route: "/renter/contact-ll"  },
                  ].map((a) => (
                    <TouchableOpacity key={a.label} style={s.actionBtn} activeOpacity={0.7} onPress={() => router.push(a.route as any)}>
                      <View style={[s.actionDot, { backgroundColor: `${a.color}25` }]} />
                      <Text style={s.actionLbl}>{a.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </FadeIn>

            {/* Documents preview */}
            <FadeIn delay={420}>
              <View style={s.card}>
                <SectionHeader title="Documents" action="View all" />
                {DOCUMENTS.slice(0, 3).map((doc, i) => (
                  <TouchableOpacity key={doc.id} style={[s.docItem, i > 0 && s.borderTop]} activeOpacity={0.7}>
                    <View style={[s.docIconBox, { backgroundColor: `${doc.color}18` }]}>
                      <Text style={{ fontSize: 18 }}>{doc.icon}</Text>
                    </View>
                    <View style={s.docInfo}>
                      <Text style={s.docName}>{doc.name}</Text>
                      <Text style={s.docDate}>{doc.date}</Text>
                    </View>
                    <Text style={[s.docArrow, { color: ACCENT_LIGHT }]}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>
          </>
        )}

        {/* ══════════════ PAYMENTS TAB ══════════════ */}
        {activeTab === "payments" && (
          <>
            <FadeIn delay={0}>
              <View style={s.card}>
                <SectionHeader title="Payment Summary" />
                <View style={s.twoCol}>
                  <View style={[s.summCard, { backgroundColor: SUCCESS_BG, borderColor: `${SUCCESS}30` }]}>
                    <Text style={[s.summVal, { color: SUCCESS }]}>4/5</Text>
                    <Text style={s.summLbl}>On Time</Text>
                  </View>
                  <View style={[s.summCard, { backgroundColor: DANGER_BG, borderColor: `${DANGER}30` }]}>
                    <Text style={[s.summVal, { color: DANGER }]}>1/5</Text>
                    <Text style={s.summLbl}>Late</Text>
                  </View>
                  <View style={[s.summCard, { backgroundColor: "rgba(74,144,217,0.12)", borderColor: `${ACCENT_LIGHT}30` }]}>
                    <Text style={[s.summVal, { color: ACCENT_LIGHT }]}>£6,250</Text>
                    <Text style={s.summLbl}>Paid YTD</Text>
                  </View>
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={80}>
              <View style={s.twoCol}>
                <View style={[s.card, s.half]}>
                  <Text style={s.cardTitle}>Payment Trend</Text>
                  <Text style={s.cardSub}>Last 5 months</Text>
                  <PaymentSparkline />
                </View>
                <View style={[s.card, s.half]}>
                  <Text style={s.cardTitle}>Next Due</Text>
                  <Text style={s.bigVal}>£1,250</Text>
                  <Text style={s.cardSub}>1 Jan 2025</Text>
                  <View style={{ marginTop: 12 }}>
                    <View style={s.progTrack}>
                      <View style={[s.progFill, { width: "73%", backgroundColor: WARNING }]} />
                    </View>
                    <Text style={s.progLbl}>8 days remaining</Text>
                  </View>
                  <TouchableOpacity style={[s.payNowBtn, { marginTop: 14, alignSelf: "stretch" }]} activeOpacity={0.8}>
                    <Text style={s.payNowTxt}>Pay Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={160}>
              <View style={s.card}>
                <SectionHeader title="Payment History" action="Export" />
                {PAYMENT_HISTORY.map((p, i) => (
                  <View key={p.id} style={[s.payItem, i > 0 && s.borderTop]}>
                    <View style={[s.payIconBox, { backgroundColor: p.status === "Late" ? DANGER_BG : SUCCESS_BG }]}>
                      <Text style={{ fontSize: 16 }}>{p.status === "Late" ? "⚠️" : "✅"}</Text>
                    </View>
                    <View style={s.payInfo}>
                      <Text style={s.payMonth}>{p.month}</Text>
                      <Text style={s.payDate}>Paid: {p.date}</Text>
                    </View>
                    <View style={s.payRight}>
                      <Text style={s.payAmount}>{p.amount}</Text>
                      <View style={[s.statusBadge, { backgroundColor: `${statusColor(p.status)}22` }]}>
                        <Text style={[s.statusTxt, { color: statusColor(p.status) }]}>{p.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </FadeIn>
          </>
        )}

        {/* ══════════════ MAINTENANCE TAB ══════════════ */}
        {activeTab === "maintenance" && (
          <>
            <FadeIn delay={0}>
              <View style={s.kpiRow}>
                {[
                  { label: "Open",        val: "1", color: DANGER,  bg: DANGER_BG  },
                  { label: "In Progress", val: "1", color: WARNING, bg: WARNING_BG },
                  { label: "Resolved",    val: "1", color: SUCCESS, bg: SUCCESS_BG },
                ].map((k) => (
                  <View key={k.label} style={[s.kpiCard, { backgroundColor: k.bg, flex: 1 }]}>
                    <Text style={[s.kpiVal, { color: k.color, fontSize: 26 }]}>{k.val}</Text>
                    <Text style={s.kpiLbl}>{k.label}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={80}>
              <TouchableOpacity style={s.raiseBtn} activeOpacity={0.8}>
                <Text style={s.raiseBtnIcon}>+</Text>
                <Text style={s.raiseBtnTxt}>Raise New Request</Text>
              </TouchableOpacity>
            </FadeIn>

            <FadeIn delay={150}>
              <View style={s.card}>
                <SectionHeader title="My Requests" action="Filter" />
                {MAINTENANCE_REQUESTS.map((req, i) => (
                  <TouchableOpacity key={req.id} style={[s.maintItem, i > 0 && s.borderTop]} activeOpacity={0.7}>
                    <View style={s.maintLeft}>
                      <View style={[s.priorDot, { backgroundColor: priorityColor(req.priority) }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.maintIssue}>{req.issue}</Text>
                        <Text style={s.maintRaised}>Raised: {req.raised}</Text>
                      </View>
                    </View>
                    <View style={s.maintRight}>
                      <View style={[s.statusBadge, { backgroundColor: `${statusColor(req.status)}22` }]}>
                        <Text style={[s.statusTxt, { color: statusColor(req.status) }]}>{req.status}</Text>
                      </View>
                      <Text style={s.maintPriority}>{req.priority}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={220}>
              <View style={[s.card, { borderColor: `${TEAL}30` }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Text style={{ fontSize: 20 }}>💡</Text>
                  <Text style={sh.title}>Reporting a problem?</Text>
                </View>
                {[
                  "Include clear photos with your request.",
                  "Mark urgency level accurately — emergencies are prioritised.",
                  "Ensure access is available for scheduled repairs.",
                ].map((tip, i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                    <Text style={{ color: TEAL, fontWeight: "700" }}>•</Text>
                    <Text style={{ color: WHITE_72, fontSize: 12, flex: 1, lineHeight: 18 }}>{tip}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>
          </>
        )}

        {/* ══════════════ MESSAGES TAB ══════════════ */}
        {activeTab === "messages" && (
          <>
            <FadeIn delay={0}>
              <TouchableOpacity style={s.composeBtn} activeOpacity={0.8}>
                <Text style={s.composeBtnIcon}>✉️</Text>
                <Text style={s.composeBtnTxt}>Compose Message</Text>
              </TouchableOpacity>
            </FadeIn>

            <FadeIn delay={80}>
              <View style={s.card}>
                <SectionHeader title="Inbox" />
                {MESSAGES.map((msg, i) => (
                  <TouchableOpacity key={msg.id} style={[s.msgItem, i > 0 && s.borderTop]} activeOpacity={0.7}>
                    <View style={[s.msgAvatar, { backgroundColor: msg.read ? WHITE_08 : `${ACCENT_LIGHT}30` }]}>
                      <Text style={[s.msgAvatarTxt, { color: msg.read ? WHITE_40 : ACCENT_LIGHT }]}>
                        {msg.from.charAt(0)}
                      </Text>
                    </View>
                    <View style={s.msgBody}>
                      <View style={s.msgTopRow}>
                        <Text style={[s.msgFrom, { color: msg.read ? WHITE_72 : WHITE }]}>{msg.from}</Text>
                        <Text style={s.msgTime}>{msg.time}</Text>
                      </View>
                      <Text style={[s.msgPreview, { color: msg.read ? WHITE_40 : WHITE_72 }]} numberOfLines={2}>
                        {msg.preview}
                      </Text>
                    </View>
                    {!msg.read && <View style={s.unreadDot} />}
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={160}>
              <View style={s.card}>
                <SectionHeader title="Contacts" />
                {[
                  { name: "John Davies",      role: "Landlord",         icon: "👤", color: ACCENT_LIGHT },
                  { name: "Property Manager", role: "Management Office", icon: "🏢", color: TEAL         },
                  { name: "Maintenance Team", role: "Repairs & Service", icon: "🔧", color: WARNING      },
                  { name: "Emergency Line",   role: "24/7 Support",     icon: "🚨", color: DANGER       },
                ].map((c, i) => (
                  <TouchableOpacity key={c.name} style={[s.contactItem, i > 0 && s.borderTop]} activeOpacity={0.7}>
                    <View style={[s.contactAvatar, { backgroundColor: `${c.color}20` }]}>
                      <Text style={{ fontSize: 18 }}>{c.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.contactName}>{c.name}</Text>
                      <Text style={s.contactRole}>{c.role}</Text>
                    </View>
                    <TouchableOpacity style={[s.msgIconBtn, { backgroundColor: `${c.color}18` }]} activeOpacity={0.7}>
                      <Text style={{ fontSize: 15 }}>💬</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>
          </>
        )}

        {/* Sign out */}
        <FadeIn delay={480}>
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

  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  hLeft:         { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar:        { width: 42, height: 42, borderRadius: 21, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: WHITE_20 },
  avatarTxt:     { fontSize: 14, fontWeight: "800", color: WHITE },
  greeting:      { fontSize: 11, color: WHITE_40, letterSpacing: 0.4, marginBottom: 1 },
  userName:      { fontSize: 15, fontWeight: "700", color: WHITE },
  hRight:        { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn:       { width: 38, height: 38, borderRadius: 12, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center" },
  iconBtnTxt:    { fontSize: 18 },
  notifBadge:    { position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: DANGER, alignItems: "center", justifyContent: "center" },
  notifBadgeTxt: { fontSize: 9, fontWeight: "800", color: WHITE },

  tabBar:       { backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  tabInner:     { paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  tab:          { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: WHITE_05, flexDirection: "row", alignItems: "center", gap: 4 },
  tabActive:    { backgroundColor: TEAL },
  tabTxt:       { fontSize: 13, fontWeight: "500", color: WHITE_40 },
  tabTxtActive: { color: WHITE, fontWeight: "700" },
  tabBadge:     { width: 16, height: 16, borderRadius: 8, backgroundColor: DANGER, alignItems: "center", justifyContent: "center" },
  tabBadgeTxt:  { fontSize: 9, fontWeight: "800", color: WHITE },

  body:        { flex: 1 },
  bodyContent: { padding: 16, gap: 14 },

  kpiRow:  { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1, borderColor: WHITE_08 },
  kpiIcon: { fontSize: 20, marginBottom: 6 },
  kpiVal:  { fontSize: 18, fontWeight: "800", marginBottom: 2 },
  kpiLbl:  { fontSize: 10, color: WHITE_40, letterSpacing: 0.4, textAlign: "center" },

  card:      { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  twoCol:    { flexDirection: "row", gap: 12 },
  half:      { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: WHITE_72, letterSpacing: 0.3, marginBottom: 2 },
  bigVal:    { fontSize: 24, fontWeight: "800", color: WHITE, marginBottom: 2 },
  cardSub:   { fontSize: 11, color: WHITE_40 },
  progTrack: { height: 6, backgroundColor: WHITE_08, borderRadius: 3, overflow: "hidden", marginTop: 4 },
  progFill:  { height: 6, borderRadius: 3 },
  progLbl:   { fontSize: 11, color: WHITE_40, marginTop: 6 },

  rentBanner:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: `${WARNING}18`, borderColor: `${WARNING}30` },
  rentBannerLeft:   { flex: 1 },
  rentBannerRight:  { marginLeft: 12 },
  rentBannerLabel:  { fontSize: 10, fontWeight: "700", color: WARNING, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  rentBannerAmount: { fontSize: 32, fontWeight: "800", color: WHITE, marginBottom: 2 },
  rentBannerDate:   { fontSize: 12, color: WHITE_72, marginBottom: 14 },
  payNowBtn:        { backgroundColor: WARNING, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, alignSelf: "flex-start", alignItems: "center" },
  payNowTxt:        { fontSize: 13, fontWeight: "800", color: WHITE },

  propRow:     { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 14 },
  propIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: WHITE_15, flexShrink: 0 },
  propDetails: { flex: 1 },
  propName:    { fontSize: 15, fontWeight: "700", color: WHITE, marginBottom: 3 },
  propAddr:    { fontSize: 12, color: WHITE_40, marginBottom: 8, lineHeight: 17 },
  propTagRow:  { flexDirection: "row", gap: 6 },
  propTag:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  propTagTxt:  { fontSize: 10, fontWeight: "700" },

  leaseRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingVertical: 14, borderTopWidth: 1, borderTopColor: WHITE_08 },
  leaseStat: { alignItems: "center", gap: 4 },
  leaseVal:  { fontSize: 14, fontWeight: "700", color: WHITE },
  leaseLbl:  { fontSize: 10, color: WHITE_40 },
  leaseDiv:  { width: 1, height: 32, backgroundColor: WHITE_15 },

  renewalAlert: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: DANGER_BG, borderWidth: 1, borderColor: `${DANGER}30` },
  renewalIcon:  { fontSize: 14 },
  renewalTxt:   { fontSize: 12, color: WHITE_72, flex: 1 },

  noticeItem:    { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10 },
  noticeIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  noticeTitle:   { fontSize: 13, fontWeight: "700", color: WHITE, marginBottom: 3 },
  noticeBody:    { fontSize: 12, color: WHITE_72, lineHeight: 17 },

  evItem:      { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  evBorder:    { borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  evDot:       { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  evTitle:     { flex: 1, fontSize: 13, fontWeight: "500", color: WHITE_90 },
  evDateBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  evDate:      { fontSize: 11, fontWeight: "700" },

  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn:   { width: "30%", flexGrow: 1, alignItems: "center", paddingVertical: 14, backgroundColor: WHITE_05, borderRadius: 14, borderWidth: 1, borderColor: WHITE_08 },
  actionDot:   { width: 36, height: 36, borderRadius: 18, marginBottom: 8 },
  actionLbl:   { fontSize: 11, fontWeight: "600", color: WHITE_72, textAlign: "center" },

  docItem:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  docIconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  docInfo:    { flex: 1 },
  docName:    { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 2 },
  docDate:    { fontSize: 11, color: WHITE_40 },
  docArrow:   { fontSize: 22, fontWeight: "300", flexShrink: 0 },

  summCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1 },
  summVal:  { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  summLbl:  { fontSize: 10, color: WHITE_40 },

  payItem:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  payIconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  payInfo:    { flex: 1 },
  payMonth:   { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 2 },
  payDate:    { fontSize: 11, color: WHITE_40 },
  payRight:   { alignItems: "flex-end", gap: 4 },
  payAmount:  { fontSize: 13, fontWeight: "700", color: WHITE },

  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusTxt:   { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },

  borderTop: { borderTopWidth: 1, borderTopColor: WHITE_08 },

  raiseBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: TEAL, borderRadius: 16, height: 52 },
  raiseBtnIcon: { fontSize: 20, color: WHITE, fontWeight: "800" },
  raiseBtnTxt:  { fontSize: 15, fontWeight: "700", color: WHITE },

  maintItem:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  maintLeft:     { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1, marginRight: 12 },
  priorDot:      { width: 8, height: 8, borderRadius: 4, flexShrink: 0, marginTop: 4 },
  maintIssue:    { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 2 },
  maintRaised:   { fontSize: 11, color: WHITE_40 },
  maintRight:    { alignItems: "flex-end", gap: 4 },
  maintPriority: { fontSize: 10, color: WHITE_40 },

  composeBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: ACCENT, borderRadius: 16, height: 52 },
  composeBtnIcon: { fontSize: 18 },
  composeBtnTxt:  { fontSize: 15, fontWeight: "700", color: WHITE },

  msgItem:      { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12 },
  msgAvatar:    { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  msgAvatarTxt: { fontSize: 16, fontWeight: "700" },
  msgBody:      { flex: 1 },
  msgTopRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  msgFrom:      { fontSize: 13, fontWeight: "700" },
  msgTime:      { fontSize: 10, color: WHITE_40 },
  msgPreview:   { fontSize: 12, lineHeight: 17 },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT_LIGHT, flexShrink: 0, marginTop: 6 },

  contactItem:   { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  contactAvatar: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  contactName:   { fontSize: 13, fontWeight: "600", color: WHITE, marginBottom: 2 },
  contactRole:   { fontSize: 11, color: WHITE_40 },
  msgIconBtn:    { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  signOut:    { alignItems: "center", justifyContent: "center", height: 50, borderRadius: 16, borderWidth: 1, borderColor: WHITE_15, backgroundColor: WHITE_05 },
  signOutTxt: { fontSize: 14, fontWeight: "600", color: WHITE_40 },
});
