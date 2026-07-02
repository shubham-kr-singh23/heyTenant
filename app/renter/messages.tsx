import { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import { useRouter } from "expo-router";

const BRAND_BLUE   = "#1A3C5E";
const BRAND_DEEP   = "#122B44";
const ACCENT_LIGHT = "#4A90D9";
const TEAL         = "#0D9488";
const SUCCESS      = "#22C55E";
const WARNING      = "#F59E0B";
const WARNING_BG   = "rgba(245,158,11,0.12)";
const DANGER       = "#F87171";
const DANGER_BG    = "rgba(248,113,113,0.12)";
const WHITE        = "#FFFFFF";
const WHITE_90     = "rgba(255,255,255,0.90)";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

const CONTACTS = [
  { id: "pm",  name: "Property Manager", role: "Management Office", icon: "🏢", color: ACCENT_LIGHT, online: true  },
  { id: "ll",  name: "John Davies",      role: "Landlord",          icon: "👤", color: TEAL,         online: true  },
  { id: "mt",  name: "Maintenance Team", role: "Repairs & Service", icon: "🔧", color: WARNING,      online: false },
  { id: "em",  name: "Emergency Line",   role: "24/7 Support",      icon: "🚨", color: DANGER,       online: true  },
];

type Msg = { id: string; text: string; mine: boolean; time: string };
const SEED: Record<string, Msg[]> = {
  pm: [
    { id: "1", text: "Hi Alex, your boiler service is confirmed for Dec 22 between 9am–12pm.", mine: false, time: "10:12 AM" },
    { id: "2", text: "A HeatPro engineer will attend. Please ensure access.", mine: false, time: "10:12 AM" },
    { id: "3", text: "Thanks! I'll be home. Anything I need to prepare?", mine: true,  time: "10:35 AM" },
    { id: "4", text: "Just clear space near the boiler. See you then!", mine: false, time: "10:41 AM" },
  ],
  ll: [
    { id: "1", text: "Your December rent statement is ready in Documents.", mine: false, time: "2 hrs ago" },
    { id: "2", text: "Got it, thanks. Is the January amount the same?", mine: true, time: "1 hr ago" },
  ],
  mt: [
    { id: "1", text: "A plumber is assigned to your kitchen tap. ETA tomorrow 9am–11am.", mine: false, time: "Yesterday" },
    { id: "2", text: "Perfect, I'll be home.", mine: true, time: "Yesterday" },
    { id: "3", text: "The plumber will call 30 mins before arrival.", mine: false, time: "Yesterday" },
  ],
  em: [],
};

function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const op = useSharedValue(0); const ty = useSharedValue(16);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 400 }));
    ty.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);
  return <Animated.View style={useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }))}>{children}</Animated.View>;
}

export default function Messages() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pt = Platform.OS === "android" ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32) : Math.max(insets.top + 8, 32);

  const [thread,  setThread]  = useState<string | null>(null);
  const [threads, setThreads] = useState(SEED);
  const [draft,   setDraft]   = useState("");
  const [iF,      setIF]      = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const contact  = CONTACTS.find(c => c.id === thread);
  const messages = thread ? (threads[thread] ?? []) : [];

  const send = () => {
    if (!draft.trim() || !thread) return;
    const m: Msg = { id: Date.now().toString(), text: draft.trim(), mine: true, time: "Just now" };
    setThreads(p => ({ ...p, [thread]: [...(p[thread] ?? []), m] }));
    setDraft("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const hOp = useSharedValue(0); const hTy = useSharedValue(-14);
  useEffect(() => { hOp.value = withTiming(1, { duration: 350 }); hTy.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }); }, []);
  const hStyle = useAnimatedStyle(() => ({ opacity: hOp.value, transform: [{ translateY: hTy.value }] }));

  // Thread view
  if (thread && contact) return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />
      <View style={[s.thHeader, { paddingTop: pt }]}>
        <TouchableOpacity onPress={() => setThread(null)} style={s.backBtn} activeOpacity={0.7}><Text style={s.backArrow}>‹</Text></TouchableOpacity>
        <View style={[s.thAvatar, { backgroundColor: `${contact.color}22` }]}><Text style={{ fontSize: 18 }}>{contact.icon}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.thName}>{contact.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1 }}>
            <View style={[s.onlineDot, { backgroundColor: contact.online ? SUCCESS : WHITE_40 }]} />
            <Text style={s.onlineTxt}>{contact.online ? "Online" : "Offline"}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.callBtn} activeOpacity={0.7}><Text style={{ fontSize: 18 }}>📞</Text></TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {messages.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
              <Text style={{ fontSize: 15, color: WHITE_40 }}>No messages yet.</Text>
              <Text style={{ fontSize: 13, color: WHITE_40, marginTop: 4 }}>Start the conversation below.</Text>
            </View>
          ) : (
            messages.map((m, i) => (
              <View key={m.id} style={[m.mine ? s.bubbleMine : s.bubbleTheirs, { marginTop: i > 0 && messages[i - 1].mine === m.mine ? 3 : 12 }]}>
                <Text style={{ fontSize: 14, lineHeight: 20, color: m.mine ? WHITE : WHITE_90 }}>{m.text}</Text>
                <Text style={{ fontSize: 10, color: WHITE_40, marginTop: 4, textAlign: m.mine ? "right" : "left" }}>{m.time}</Text>
              </View>
            ))
          )}
        </ScrollView>
        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput style={[s.msgInput, iF && s.msgInputF]} placeholder="Type a message…" placeholderTextColor="rgba(255,255,255,0.3)" value={draft} onChangeText={setDraft} multiline onFocus={() => setIF(true)} onBlur={() => setIF(false)} />
          <TouchableOpacity style={[s.sendBtn, { backgroundColor: draft.trim() ? TEAL : WHITE_08 }]} onPress={send} activeOpacity={0.85} disabled={!draft.trim()}>
            <Text style={{ fontSize: 26, fontWeight: "700", lineHeight: 30, color: draft.trim() ? WHITE : WHITE_40 }}>›</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  // Inbox view
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEP} translucent={false} />
      <Animated.View style={[s.header, { paddingTop: pt }, hStyle]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}><Text style={s.backArrow}>‹</Text></TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={s.hTitle}>Messages</Text>
          <View style={s.unreadPill}><Text style={s.unreadTxt}>2 unread</Text></View>
        </View>
        <View style={{ width: 38 }} />
      </Animated.View>
      <ScrollView style={s.body} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 32, 48) }]} showsVerticalScrollIndicator={false}>
        <FadeIn delay={0}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Conversations</Text>
            {CONTACTS.map((c, i) => {
              const msgs = threads[c.id] ?? [];
              const last = msgs[msgs.length - 1];
              const unread = c.id === "pm" || c.id === "ll";
              return (
                <TouchableOpacity key={c.id} onPress={() => setThread(c.id)} activeOpacity={0.75} style={[s.inboxRow, i > 0 && s.bt]}>
                  <View style={{ position: "relative", flexShrink: 0 }}>
                    <View style={[s.inboxAvatar, { backgroundColor: `${c.color}20` }]}><Text style={{ fontSize: 20 }}>{c.icon}</Text></View>
                    {c.online && <View style={s.onlineBadge} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <Text style={[s.inboxName, unread && { color: WHITE }]}>{c.name}</Text>
                      <Text style={{ fontSize: 10, color: WHITE_40 }}>{last?.time ?? ""}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: WHITE_40, marginBottom: 3 }}>{c.role}</Text>
                    {last ? <Text style={[s.inboxPreview, unread && { color: WHITE_72 }]} numberOfLines={1}>{last.mine ? "You: " : ""}{last.text}</Text>
                      : <Text style={s.inboxPreview}>Tap to start a conversation</Text>}
                  </View>
                  {unread && <View style={s.unreadDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </FadeIn>
        <FadeIn delay={80}>
          <View style={[s.card, { borderColor: `${DANGER}30` }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Text style={{ fontSize: 24 }}>🚨</Text>
              <View style={{ flex: 1 }}><Text style={{ fontSize: 15, fontWeight: "700", color: WHITE }}>Emergency?</Text><Text style={{ fontSize: 11, color: WHITE_40, marginTop: 1 }}>24/7 support always available</Text></View>
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <TouchableOpacity style={[s.emergBtn, { backgroundColor: DANGER_BG, borderColor: `${DANGER}30` }]} activeOpacity={0.8}><Text style={[s.emergTxt, { color: DANGER }]}>📞 Call Now</Text></TouchableOpacity>
              <TouchableOpacity style={[s.emergBtn, { backgroundColor: WARNING_BG, borderColor: `${WARNING}30` }]} activeOpacity={0.8}><Text style={[s.emergTxt, { color: WARNING }]}>💬 Text Now</Text></TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: WHITE_72, textAlign: "center" }}>Emergency: 0800 123 456</Text>
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
  hCenter: { alignItems: "center", flex: 1 },
  hTitle: { fontSize: 16, fontWeight: "700", color: WHITE },
  unreadPill: { marginTop: 3, backgroundColor: `${TEAL}30`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  unreadTxt: { fontSize: 10, fontWeight: "700", color: TEAL },
  body: { flex: 1 },
  content: { padding: 16, gap: 14 },
  card: { backgroundColor: WHITE_08, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: WHITE_15 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: WHITE, marginBottom: 14, letterSpacing: 0.2 },
  bt: { borderTopWidth: 1, borderTopColor: WHITE_08 },
  inboxRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  inboxAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  onlineBadge: { position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: SUCCESS, borderWidth: 2, borderColor: BRAND_BLUE },
  inboxName: { fontSize: 14, fontWeight: "700", color: WHITE_72 },
  inboxPreview: { fontSize: 12, color: WHITE_40 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT_LIGHT, flexShrink: 0 },
  emergBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  emergTxt: { fontSize: 13, fontWeight: "700" },
  thHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: BRAND_DEEP, borderBottomWidth: 1, borderBottomColor: WHITE_08 },
  thAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  thName: { fontSize: 15, fontWeight: "700", color: WHITE },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineTxt: { fontSize: 11, color: WHITE_40 },
  callBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: WHITE_08, alignItems: "center", justifyContent: "center" },
  bubbleMine: { maxWidth: "78%", alignSelf: "flex-end", backgroundColor: TEAL, borderRadius: 18, borderBottomRightRadius: 4, padding: 12 },
  bubbleTheirs: { maxWidth: "78%", alignSelf: "flex-start", backgroundColor: WHITE_08, borderRadius: 18, borderBottomLeftRadius: 4, padding: 12 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingTop: 10, backgroundColor: BRAND_DEEP, borderTopWidth: 1, borderTopColor: WHITE_08 },
  msgInput: { flex: 1, backgroundColor: WHITE_05, borderRadius: 20, borderWidth: 1, borderColor: WHITE_15, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: WHITE, maxHeight: 100 },
  msgInputF: { borderColor: TEAL },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
