import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
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
import { useClerk } from "@clerk/expo";

// â”€â”€â”€ Palette (matches dashboard) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
const WHITE_20     = "rgba(255,255,255,0.20)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

// â”€â”€â”€ Mock profile data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PROFILE = {
  name:         "John Davies",
  initials:     "JD",
  role:         "Landlord",
  email:        "john.davies@email.com",
  phone:        "+44 7911 123456",
  location:     "Manchester, United Kingdom",
  memberSince:  "March 2019",
  licenceNo:    "LIC-2024-GB-48821",
  taxRef:       "UTR 1234 5678 90",
  bio:          "Experienced residential landlord managing a portfolio of 12 properties across Greater Manchester. Committed to maintaining high-quality homes and building long-term tenant relationships.",
};

const PORTFOLIO_STATS = [
  { label: "Properties", value: "12",   color: ACCENT_LIGHT, bg: "rgba(74,144,217,0.15)"  },
  { label: "Tenants",    value: "38",   color: SUCCESS,       bg: SUCCESS_BG               },
  { label: "Vacancies",  value: "3",    color: DANGER,        bg: DANGER_BG                },
  { label: "Avg. Yield", value: "6.8%", color: PURPLE,        bg: PURPLE_BG                },
];

const PROPERTIES = [
  { id: "1", name: "Oak Street",   units: "8 units", status: "97% occupied",  statusColor: SUCCESS,  location: "Manchester, M1"  },
  { id: "2", name: "Maple Avenue", units: "6 units", status: "83% occupied",  statusColor: WARNING,  location: "Salford, M7"     },
  { id: "3", name: "Birch Studios", units: "5 units", status: "60% occupied", statusColor: DANGER,   location: "Manchester, M4"  },
  { id: "4", name: "Cedar Lane",   units: "4 units", status: "100% occupied", statusColor: SUCCESS,  location: "Stretford, M32"  },
];

const DOCUMENTS = [
  { id: "1", icon: "\uD83D\uDCC4", label: "Landlord Licence",        sub: "Valid until Dec 2025",   color: SUCCESS      },
  { id: "2", icon: "\uD83D\uDCCB", label: "Insurance Certificate",   sub: "Buildings & Contents",   color: ACCENT_LIGHT },
  { id: "3", icon: "\uD83C\uDFE6", label: "Tax Self-Assessment",     sub: "2023\u201324 filed",     color: PURPLE       },
  { id: "4", icon: "\uD83D\uDCDD", label: "EICR Report",             sub: "All properties current", color: WARNING      },
  { id: "5", icon: "\uD83D\uDD12", label: "Gas Safety Certificates", sub: "Next due Jan 2025",      color: DANGER       },
];

const QUICK_LINKS = [
  { id: "1", icon: "\uD83C\uDFE0", label: "Gov.uk Landlord Guide",  url: "https://www.gov.uk/renting-out-a-property"                        },
  { id: "2", icon: "\u2696\uFE0F", label: "NRLA Membership",        url: "https://www.nrla.org.uk"                                           },
  { id: "3", icon: "\uD83D\uDD0D", label: "Property Ombudsman",     url: "https://www.tpos.co.uk"                                            },
  { id: "4", icon: "\uD83D\uDCB7", label: "Deposit Protection",     url: "https://www.depositprotection.com"                                 },
  { id: "5", icon: "\uD83D\uDCCA", label: "HMRC Property Income",   url: "https://www.gov.uk/income-tax-when-you-rent-out-a-property"        },
];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const op = useSharedValue(0);
  const ty = useSharedValue(18);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 420 }));
    ty.value = withDelay(delay, withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {sub ? <Text style={sh.sub}>{sub}</Text> : null}
    </View>
  );
}
const sh = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 14, fontWeight: "700", color: WHITE_72, letterSpacing: 0.4, textTransform: "uppercase" },
  sub:   { fontSize: 12, color: ACCENT_LIGHT, fontWeight: "600" },
});

function VerifiedBadge() {
  return (
    <View style={vb.wrap}>
      <Text style={vb.icon}>{"\u2713"}</Text>
      <Text style={vb.txt}>Verified</Text>
    </View>
  );
}
const vb = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: SUCCESS_BG, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(34,197,94,0.25)" },
  icon: { fontSize: 11, color: SUCCESS, fontWeight: "800" },
  txt:  { fontSize: 11, color: SUCCESS, fontWeight: "700", letterSpacing: 0.3 },
});

function ContactRow({ icon, value, onPress }: { icon: string; value: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={cr.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <View style={cr.iconWrap}><Text style={cr.icon}>{icon}</Text></View>
      <Text style={[cr.value, onPress && cr.link]}>{value}</Text>
      {onPress ? <Text style={cr.chevron}>{"\u203A"}</Text> : null}
    </TouchableOpacity>
  );
}
const cr = StyleSheet.create({
  row:      { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  icon:     { fontSize: 16 },
  value:    { flex: 1, fontSize: 14, color: WHITE_90, fontWeight: "500" },
  link:     { color: ACCENT_LIGHT },
  chevron:  { fontSize: 18, color: WHITE_40 },
});

// â”€â”€â”€ Main screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function LandlordProfile() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              setSigningOut(true);
              await signOut();
              router.replace("/welcome");
            } catch (err) {
              console.error("Sign out error:", err);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState<"overview" | "portfolio" | "documents">("overview");

  const headerOp = useSharedValue(0);
  const headerTy = useSharedValue(-14);
  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 350 });
    headerTy.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerTy.value }],
  }));

  const paddingTop = Platform.OS === "android"
    ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32)
    : Math.max(insets.top + 8, 32);

  const TABS = [
    { id: "overview",  label: "Overview"  },
    { id: "portfolio", label: "Portfolio" },
    { id: "documents", label: "Documents" },
  ] as const;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />

      {/* â”€â”€ Top bar â”€â”€ */}
      <Animated.View style={[s.topBar, { paddingTop }, headerStyle]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backIcon}>{"\u2039"}</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Profile</Text>
        <TouchableOpacity style={s.editBtn} activeOpacity={0.7}>
          <Text style={s.editTxt}>Edit</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* â”€â”€ Tab bar â”€â”€ */}
      <Animated.View style={[s.tabBar, headerStyle]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[s.tab, activeSection === t.id && s.tabActive]}
            onPress={() => setActiveSection(t.id)}
            activeOpacity={0.75}
          >
            <Text style={[s.tabTxt, activeSection === t.id && s.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: Math.max(insets.bottom + 32, 48) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* â•â•â•â• HERO CARD â•â•â•â• */}
        <FadeIn delay={0}>
          <View style={s.heroCard}>
            <View style={s.avatarOuter}>
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>{PROFILE.initials}</Text>
              </View>
              <View style={s.onlineDot} />
            </View>

            <View style={s.heroName}>
              <Text style={s.nameText}>{PROFILE.name}</Text>
              <VerifiedBadge />
            </View>
            <Text style={s.roleText}>{PROFILE.role} {"\u00B7"} Since {PROFILE.memberSince}</Text>

            <View style={s.heroStrip}>
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>4.9</Text>
                <Text style={s.heroStatLbl}>Rating</Text>
              </View>
              <View style={s.heroDiv} />
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>12</Text>
                <Text style={s.heroStatLbl}>Properties</Text>
              </View>
              <View style={s.heroDiv} />
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>38</Text>
                <Text style={s.heroStatLbl}>Tenants</Text>
              </View>
              <View style={s.heroDiv} />
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>5 yrs</Text>
                <Text style={s.heroStatLbl}>Experience</Text>
              </View>
            </View>

            <View style={s.heroActions}>
              <TouchableOpacity
                style={[s.heroActionBtn, s.heroPrimary]}
                onPress={() => Linking.openURL(`mailto:${PROFILE.email}`)}
                activeOpacity={0.8}
              >
                <Text style={s.heroPrimaryTxt}>{"\u2709"}{"  "}Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.heroActionBtn, s.heroSecondary]}
                onPress={() => Linking.openURL(`tel:${PROFILE.phone}`)}
                activeOpacity={0.8}
              >
                <Text style={s.heroSecondaryTxt}>{"\uD83D\uDCDE"}{"  "}Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>

        {/* â•â•â•â• OVERVIEW TAB â•â•â•â• */}
        {activeSection === "overview" && (
          <>
            <FadeIn delay={60}>
              <View style={s.card}>
                <SectionHeader title="About" />
                <Text style={s.bioText}>{PROFILE.bio}</Text>
              </View>
            </FadeIn>

            <FadeIn delay={120}>
              <View style={s.card}>
                <SectionHeader title="Contact Details" />
                <ContactRow
                  icon={"\u2709\uFE0F"}
                  value={PROFILE.email}
                  onPress={() => Linking.openURL(`mailto:${PROFILE.email}`)}
                />
                <ContactRow
                  icon={"\uD83D\uDCDE"}
                  value={PROFILE.phone}
                  onPress={() => Linking.openURL(`tel:${PROFILE.phone}`)}
                />
                <ContactRow icon={"\uD83D\uDCCD"} value={PROFILE.location} />
                <View style={[cr.row, { borderBottomWidth: 0 }]}>
                  <View style={cr.iconWrap}><Text style={cr.icon}>{"\uD83D\uDCC5"}</Text></View>
                  <Text style={cr.value}>Member since {PROFILE.memberSince}</Text>
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={180}>
              <View style={s.card}>
                <SectionHeader title="Compliance & Legal" />
                <View style={s.complianceRow}>
                  <View style={s.complianceItem}>
                    <Text style={s.complianceIcon}>{"\uD83C\uDFDB"}</Text>
                    <Text style={s.complianceLbl}>Licence No.</Text>
                    <Text style={s.complianceVal}>{PROFILE.licenceNo}</Text>
                  </View>
                  <View style={s.compDivider} />
                  <View style={s.complianceItem}>
                    <Text style={s.complianceIcon}>{"\uD83D\uDCBC"}</Text>
                    <Text style={s.complianceLbl}>Tax Ref (UTR)</Text>
                    <Text style={s.complianceVal}>{PROFILE.taxRef}</Text>
                  </View>
                </View>
                <View style={s.complianceBadgeRow}>
                  {[
                    { label: "Gas Safe",    color: SUCCESS      },
                    { label: "EPC Rated",   color: ACCENT_LIGHT },
                    { label: "DPS Member",  color: PURPLE       },
                    { label: "NRLA Member", color: WARNING      },
                  ].map((b) => (
                    <View key={b.label} style={[s.compBadge, { backgroundColor: `${b.color}18`, borderColor: `${b.color}35` }]}>
                      <View style={[s.compBadgeDot, { backgroundColor: b.color }]} />
                      <Text style={[s.compBadgeTxt, { color: b.color }]}>{b.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={240}>
              <View style={s.card}>
                <SectionHeader title="Important Links" />
                {QUICK_LINKS.map((link, i) => (
                  <TouchableOpacity
                    key={link.id}
                    style={[s.linkRow, i < QUICK_LINKS.length - 1 && s.linkBorder]}
                    onPress={() => Linking.openURL(link.url)}
                    activeOpacity={0.7}
                  >
                    <View style={s.linkIconWrap}>
                      <Text style={s.linkIcon}>{link.icon}</Text>
                    </View>
                    <Text style={s.linkLabel}>{link.label}</Text>
                    <Text style={s.linkChevron}>{"\u2197"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>
          </>
        )}

        {/* â•â•â•â• PORTFOLIO TAB â•â•â•â• */}
        {activeSection === "portfolio" && (
          <>
            <FadeIn delay={0}>
              <View style={s.kpiRow}>
                {PORTFOLIO_STATS.map((stat) => (
                  <View key={stat.label} style={[s.kpiCard, { backgroundColor: stat.bg }]}>
                    <Text style={[s.kpiVal, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={s.kpiLbl}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={60}>
              <View style={s.revenueCard}>
                <View style={s.revLeft}>
                  <Text style={s.revLabel}>Monthly Revenue</Text>
                  <Text style={s.revAmount}>{"\u00A3"}34,200</Text>
                  <View style={s.revBadge}>
                    <Text style={s.revBadgeTxt}>{"\u2191"} 8.4% vs last month</Text>
                  </View>
                </View>
                <View style={s.revRight}>
                  <Text style={s.revLabel}>Annual (projected)</Text>
                  <Text style={s.revAnnual}>{"\u00A3"}408k</Text>
                  <Text style={s.revSub}>Net yield: 6.8%</Text>
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={120}>
              <View style={s.card}>
                <SectionHeader title="Properties" sub="12 total" />
                {PROPERTIES.map((prop, i) => (
                  <TouchableOpacity
                    key={prop.id}
                    style={[s.propItem, i < PROPERTIES.length - 1 && s.propBorder]}
                    activeOpacity={0.75}
                  >
                    <View style={s.propIconWrap}>
                      <Text style={s.propIcon}>{"\uD83C\uDFE2"}</Text>
                    </View>
                    <View style={s.propBody}>
                      <Text style={s.propName}>{prop.name}</Text>
                      <Text style={s.propLocation}>{prop.location} {"\u00B7"} {prop.units}</Text>
                    </View>
                    <View style={[s.propBadge, { backgroundColor: `${prop.statusColor}18` }]}>
                      <Text style={[s.propBadgeTxt, { color: prop.statusColor }]}>{prop.status}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={180}>
              <View style={s.card}>
                <SectionHeader title="Rent Collection \u2014 Dec" />
                <View style={s.collectRow}>
                  <View style={s.collectStat}>
                    <Text style={[s.collectVal, { color: SUCCESS }]}>28</Text>
                    <Text style={s.collectLbl}>Collected</Text>
                  </View>
                  <View style={s.collectDiv} />
                  <View style={s.collectStat}>
                    <Text style={[s.collectVal, { color: WARNING }]}>6</Text>
                    <Text style={s.collectLbl}>Pending</Text>
                  </View>
                  <View style={s.collectDiv} />
                  <View style={s.collectStat}>
                    <Text style={[s.collectVal, { color: DANGER }]}>4</Text>
                    <Text style={s.collectLbl}>Overdue</Text>
                  </View>
                </View>
                <View style={s.progTrack}>
                  <View style={[s.progFill, { width: "73%", backgroundColor: SUCCESS }]} />
                </View>
                <Text style={s.progLbl}>73% collected this month</Text>
              </View>
            </FadeIn>
          </>
        )}

        {/* â•â•â•â• DOCUMENTS TAB â•â•â•â• */}
        {activeSection === "documents" && (
          <>
            <FadeIn delay={0}>
              <View style={s.docNotice}>
                <Text style={s.docNoticeIcon}>{"\uD83D\uDD12"}</Text>
                <Text style={s.docNoticeTxt}>Documents are encrypted and stored securely. Only you and authorised parties can access them.</Text>
              </View>
            </FadeIn>

            <FadeIn delay={60}>
              <View style={s.card}>
                <SectionHeader title="My Documents" sub="5 files" />
                {DOCUMENTS.map((doc, i) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={[s.docItem, i < DOCUMENTS.length - 1 && s.docBorder]}
                    activeOpacity={0.75}
                  >
                    <View style={[s.docIconWrap, { backgroundColor: `${doc.color}15` }]}>
                      <Text style={s.docIcon}>{doc.icon}</Text>
                    </View>
                    <View style={s.docBody}>
                      <Text style={s.docLabel}>{doc.label}</Text>
                      <Text style={s.docSub}>{doc.sub}</Text>
                    </View>
                    <View style={[s.docStatus, { backgroundColor: `${doc.color}15`, borderColor: `${doc.color}30` }]}>
                      <Text style={[s.docStatusTxt, { color: doc.color }]}>View</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>

            <FadeIn delay={120}>
              <TouchableOpacity style={s.uploadBtn} activeOpacity={0.8}>
                <Text style={s.uploadIcon}>{"\u2B06"}</Text>
                <Text style={s.uploadTxt}>Upload New Document</Text>
              </TouchableOpacity>
            </FadeIn>
          </>
        )}

        {/* â”€â”€ Sign out â”€â”€ */}
        <FadeIn delay={320}>
          <TouchableOpacity
            style={[s.signOut, signingOut && s.signOutDisabled]}
            onPress={handleSignOut}
            activeOpacity={0.75}
            disabled={signingOut}
          >
            {signingOut
              ? <ActivityIndicator size="small" color="#F87171" />
              : <Text style={s.signOutTxt}>Sign Out</Text>
            }
          </TouchableOpacity>
        </FadeIn>

      </ScrollView>
    </View>
  );
}

// â”€â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BRAND_BLUE },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  // Top bar
  topBar:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  backBtn:  { width: 38, height: 38, borderRadius: 12, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 26, color: WHITE, lineHeight: 30, marginTop: -2 },
  topTitle: { fontSize: 16, fontWeight: "700", color: WHITE },
  editBtn:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(74,144,217,0.20)", borderWidth: 1, borderColor: "rgba(74,144,217,0.40)" },
  editTxt:  { fontSize: 13, fontWeight: "600", color: ACCENT_LIGHT },

  // Tab bar
  tabBar:       { flexDirection: "row", backgroundColor: BRAND_DEEP, paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab:          { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 20, backgroundColor: WHITE_05 },
  tabActive:    { backgroundColor: ACCENT },
  tabTxt:       { fontSize: 13, fontWeight: "500", color: WHITE_40 },
  tabTxtActive: { color: WHITE, fontWeight: "700" },

  // Hero card
  heroCard:       { backgroundColor: WHITE_08, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: WHITE_15, alignItems: "center" },
  avatarOuter:    { position: "relative", marginBottom: 14 },
  avatar:         { width: 88, height: 88, borderRadius: 44, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: WHITE_20 },
  avatarTxt:      { fontSize: 30, fontWeight: "800", color: WHITE },
  onlineDot:      { position: "absolute", bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: SUCCESS, borderWidth: 2, borderColor: BRAND_BLUE },
  heroName:       { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  nameText:       { fontSize: 22, fontWeight: "800", color: WHITE },
  roleText:       { fontSize: 13, color: WHITE_40, marginBottom: 20 },
  heroStrip:      { flexDirection: "row", alignItems: "center", width: "100%", backgroundColor: WHITE_05, borderRadius: 14, paddingVertical: 14, marginBottom: 18, borderWidth: 1, borderColor: WHITE_08 },
  heroStat:       { flex: 1, alignItems: "center" },
  heroStatVal:    { fontSize: 17, fontWeight: "800", color: WHITE, marginBottom: 2 },
  heroStatLbl:    { fontSize: 10, color: WHITE_40, letterSpacing: 0.4 },
  heroDiv:        { width: 1, height: 32, backgroundColor: WHITE_15 },
  heroActions:    { flexDirection: "row", gap: 12, width: "100%" },
  heroActionBtn:  { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 14 },
  heroPrimary:    { backgroundColor: ACCENT },
  heroPrimaryTxt: { fontSize: 14, fontWeight: "700", color: WHITE },
  heroSecondary:  { backgroundColor: WHITE_08, borderWidth: 1, borderColor: WHITE_20 },
  heroSecondaryTxt: { fontSize: 14, fontWeight: "600", color: WHITE_90 },

  // Shared card
  card: { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },

  // Bio
  bioText: { fontSize: 14, color: WHITE_72, lineHeight: 22 },

  // Compliance
  complianceRow:      { flexDirection: "row", marginBottom: 16 },
  complianceItem:     { flex: 1, alignItems: "center", gap: 4, paddingVertical: 10 },
  complianceIcon:     { fontSize: 24, marginBottom: 4 },
  complianceLbl:      { fontSize: 10, color: WHITE_40, letterSpacing: 0.4, textTransform: "uppercase" },
  complianceVal:      { fontSize: 12, fontWeight: "700", color: WHITE_90, textAlign: "center" },
  compDivider:        { width: 1, backgroundColor: WHITE_15 },
  complianceBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  compBadge:          { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  compBadgeDot:       { width: 6, height: 6, borderRadius: 3 },
  compBadgeTxt:       { fontSize: 11, fontWeight: "600" },

  // Links
  linkRow:      { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  linkBorder:   { borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  linkIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  linkIcon:     { fontSize: 16 },
  linkLabel:    { flex: 1, fontSize: 14, color: WHITE_90, fontWeight: "500" },
  linkChevron:  { fontSize: 14, color: ACCENT_LIGHT, fontWeight: "700" },

  // Portfolio KPI
  kpiRow:  { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1, borderColor: WHITE_08 },
  kpiVal:  { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  kpiLbl:  { fontSize: 10, color: WHITE_40, letterSpacing: 0.4, textAlign: "center" },

  // Revenue highlight
  revenueCard: { flexDirection: "row", backgroundColor: "rgba(59,111,168,0.25)", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "rgba(74,144,217,0.30)" },
  revLeft:     { flex: 1, borderRightWidth: 1, borderRightColor: WHITE_15, paddingRight: 16 },
  revRight:    { flex: 1, paddingLeft: 16 },
  revLabel:    { fontSize: 11, color: WHITE_40, letterSpacing: 0.4, marginBottom: 4 },
  revAmount:   { fontSize: 26, fontWeight: "800", color: WHITE, marginBottom: 6 },
  revBadge:    { backgroundColor: SUCCESS_BG, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  revBadgeTxt: { fontSize: 11, fontWeight: "700", color: SUCCESS },
  revAnnual:   { fontSize: 22, fontWeight: "800", color: WHITE_90, marginBottom: 4 },
  revSub:      { fontSize: 12, color: WHITE_40 },

  // Properties list
  propItem:     { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  propBorder:   { borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  propIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(74,144,217,0.15)", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  propIcon:     { fontSize: 18 },
  propBody:     { flex: 1 },
  propName:     { fontSize: 14, fontWeight: "700", color: WHITE, marginBottom: 3 },
  propLocation: { fontSize: 12, color: WHITE_40 },
  propBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  propBadgeTxt: { fontSize: 11, fontWeight: "700" },

  // Rent collection
  collectRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginVertical: 14 },
  collectStat: { alignItems: "center", gap: 4 },
  collectVal:  { fontSize: 28, fontWeight: "800" },
  collectLbl:  { fontSize: 11, color: WHITE_40 },
  collectDiv:  { width: 1, height: 40, backgroundColor: WHITE_15 },
  progTrack:   { height: 6, backgroundColor: WHITE_08, borderRadius: 3, overflow: "hidden", marginTop: 4 },
  progFill:    { height: 6, borderRadius: 3 },
  progLbl:     { fontSize: 11, color: WHITE_40, marginTop: 6, textAlign: "center" },

  // Documents
  docNotice:     { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: PURPLE_BG, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(139,92,246,0.25)" },
  docNoticeIcon: { fontSize: 20 },
  docNoticeTxt:  { flex: 1, fontSize: 12, color: WHITE_72, lineHeight: 18 },
  docItem:       { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  docBorder:     { borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  docIconWrap:   { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  docIcon:       { fontSize: 20 },
  docBody:       { flex: 1 },
  docLabel:      { fontSize: 14, fontWeight: "600", color: WHITE, marginBottom: 3 },
  docSub:        { fontSize: 12, color: WHITE_40 },
  docStatus:     { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, flexShrink: 0 },
  docStatusTxt:  { fontSize: 12, fontWeight: "700" },

  uploadBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 16, borderWidth: 1, borderColor: WHITE_20, backgroundColor: WHITE_05 },
  uploadIcon: { fontSize: 18, color: ACCENT_LIGHT },
  uploadTxt:  { fontSize: 14, fontWeight: "600", color: ACCENT_LIGHT },

  // Sign out
  signOut:         { alignItems: "center", justifyContent: "center", height: 50, borderRadius: 16, borderWidth: 1, borderColor: WHITE_15, backgroundColor: WHITE_05 },
  signOutDisabled: { opacity: 0.5 },
  signOutTxt:      { fontSize: 14, fontWeight: "600", color: "#F87171" },
});

