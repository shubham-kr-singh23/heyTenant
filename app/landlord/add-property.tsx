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
const DANGER       = "#F87171";
const WHITE        = "#FFFFFF";
const WHITE_72     = "rgba(255,255,255,0.72)";
const WHITE_40     = "rgba(255,255,255,0.40)";
const WHITE_15     = "rgba(255,255,255,0.15)";
const WHITE_08     = "rgba(255,255,255,0.08)";
const WHITE_05     = "rgba(255,255,255,0.05)";

const PROPERTY_TYPES = ["Apartment", "House", "Studio", "Commercial", "HMO"];
const FURNISHING     = ["Furnished", "Part-Furnished", "Unfurnished"];

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
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, focused && f.inputFocused, multiline && f.inputMulti, error && f.inputError]}
        placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.25)"
        value={value} onChangeText={onChangeText} keyboardType={keyboardType}
        multiline={multiline} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {error ? <Text style={f.error}>{error}</Text> : null}
    </View>
  );
}
const f = StyleSheet.create({
  wrap:         { marginBottom: 16 },
  label:        { fontSize: 12, fontWeight: "600", color: WHITE_72, marginBottom: 6, letterSpacing: 0.3 },
  input:        { backgroundColor: WHITE_05, borderRadius: 12, borderWidth: 1, borderColor: WHITE_15, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: WHITE },
  inputFocused: { borderColor: ACCENT_LIGHT },
  inputMulti:   { minHeight: 80, textAlignVertical: "top" },
  inputError:   { borderColor: DANGER },
  error:        { fontSize: 11, color: DANGER, marginTop: 4 },
});

function Chip({ label, active, onPress, color = ACCENT_LIGHT }: any) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={[ch.chip, active && { backgroundColor: `${color}25`, borderColor: color }]}>
      <Text style={[ch.txt, active && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const ch = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: WHITE_15, backgroundColor: WHITE_05 },
  txt:  { fontSize: 12, fontWeight: "600", color: WHITE_40 },
});

export default function AddProperty() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingTop = Platform.OS === "android" ? Math.max((StatusBar.currentHeight ?? 0) + 8, 32) : Math.max(insets.top + 8, 32);

  const [propertyType, setPropertyType] = useState("Apartment");
  const [furnishing,   setFurnishing]   = useState("Furnished");
  const [name,  setName]  = useState("");
  const [addr,  setAddr]  = useState("");
  const [city,  setCity]  = useState("");
  const [post,  setPost]  = useState("");
  const [beds,  setBeds]  = useState("");
  const [baths, setBaths] = useState("");
  const [rent,  setRent]  = useState("");
  const [deposit, setDeposit] = useState("");
  const [desc,  setDesc]  = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const AMENITIES = ["Parking", "Garden", "EV Charger", "Gym", "Concierge", "Bike Storage", "Pet Friendly", "Bills Included"];
  const toggleAmenity = (a: string) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Property name is required.";
    if (!addr.trim()) e.addr = "Address is required.";
    if (!city.trim()) e.city = "City is required.";
    if (!post.trim()) e.post = "Postcode is required.";
    if (!beds.trim()) e.beds = "Number of bedrooms is required.";
    if (!rent.trim()) e.rent = "Monthly rent is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 800));
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
          <Text style={s.hTitle}>Add Property</Text>
          <Text style={s.hSub}>List a new rental unit</Text>
        </View>
        <View style={{ width: 38 }} />
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={s.body} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 32, 48) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Step bar */}
          <FadeIn delay={0}>
            <View style={s.stepRow}>
              {["Details", "Specs", "Pricing", "Notes"].map((step, i) => (
                <View key={step} style={s.stepItem}>
                  <View style={[s.stepDot, i === 0 && s.stepDotActive]}>
                    <Text style={[s.stepNum, i === 0 && s.stepNumActive]}>{i + 1}</Text>
                  </View>
                  <Text style={[s.stepLbl, i === 0 && s.stepLblActive]}>{step}</Text>
                </View>
              ))}
            </View>
          </FadeIn>

          {/* Property type */}
          <FadeIn delay={60}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Property Type</Text>
              <View style={s.chipRow}>
                {PROPERTY_TYPES.map((t) => (
                  <Chip key={t} label={t} active={propertyType === t} onPress={() => setPropertyType(t)} color={ACCENT_LIGHT} />
                ))}
              </View>
            </View>
          </FadeIn>

          {/* Details */}
          <FadeIn delay={120}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Property Details</Text>
              <Field label="Property Name / Reference" placeholder="e.g. Oak Street Flat 4B" value={name} onChangeText={setName} error={errors.name} />
              <Field label="Street Address" placeholder="12 Oak Street" value={addr} onChangeText={setAddr} error={errors.addr} />
              <View style={s.twoCol}>
                <View style={{ flex: 1 }}><Field label="City / Town" placeholder="London" value={city} onChangeText={setCity} error={errors.city} /></View>
                <View style={{ flex: 1 }}><Field label="Postcode" placeholder="E1 5TW" value={post} onChangeText={setPost} error={errors.post} /></View>
              </View>
            </View>
          </FadeIn>

          {/* Specs */}
          <FadeIn delay={180}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Specifications</Text>
              <View style={s.twoCol}>
                <View style={{ flex: 1 }}><Field label="Bedrooms" placeholder="2" value={beds} onChangeText={setBeds} keyboardType="numeric" error={errors.beds} /></View>
                <View style={{ flex: 1 }}><Field label="Bathrooms" placeholder="1" value={baths} onChangeText={setBaths} keyboardType="numeric" /></View>
              </View>
              <Text style={[f.label, { marginBottom: 8, marginTop: 4 }]}>Furnishing</Text>
              <View style={s.chipRow}>
                {FURNISHING.map((t) => (
                  <Chip key={t} label={t} active={furnishing === t} onPress={() => setFurnishing(t)} color={SUCCESS} />
                ))}
              </View>
            </View>
          </FadeIn>

          {/* Pricing */}
          <FadeIn delay={240}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Pricing</Text>
              <View style={s.twoCol}>
                <View style={{ flex: 1 }}><Field label="Monthly Rent (£)" placeholder="1,250" value={rent} onChangeText={setRent} keyboardType="numeric" error={errors.rent} /></View>
                <View style={{ flex: 1 }}><Field label="Deposit (£)" placeholder="2,500" value={deposit} onChangeText={setDeposit} keyboardType="numeric" /></View>
              </View>
              {rent.length > 0 && !isNaN(parseFloat(rent.replace(/,/g, ""))) && (
                <View style={s.infoBanner}>
                  <Text style={s.infoBannerTxt}>
                    💡 Suggested deposit: £{(parseFloat(rent.replace(/,/g, "")) * 2).toLocaleString()} (2 months)
                  </Text>
                </View>
              )}
            </View>
          </FadeIn>

          {/* Amenities */}
          <FadeIn delay={300}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Amenities</Text>
              <View style={s.amenGrid}>
                {AMENITIES.map((a) => (
                  <TouchableOpacity key={a} onPress={() => toggleAmenity(a)} activeOpacity={0.7}
                    style={[s.amenItem, amenities.includes(a) && s.amenItemActive]}>
                    <View style={[s.amenCheck, amenities.includes(a) && s.amenCheckActive]}>
                      {amenities.includes(a) && <Text style={s.amenCheckTxt}>✓</Text>}
                    </View>
                    <Text style={[s.amenLbl, amenities.includes(a) && { color: WHITE }]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </FadeIn>

          {/* Description */}
          <FadeIn delay={360}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Description</Text>
              <Field label="Property description" placeholder="Describe the property, nearby transport links, parking…" value={desc} onChangeText={setDesc} multiline />
            </View>
          </FadeIn>

          {/* Submit */}
          <FadeIn delay={400}>
            <TouchableOpacity style={[s.submitBtn, submitted && s.submitDim]} onPress={handleSubmit} activeOpacity={0.85} disabled={submitted}>
              <Text style={s.submitTxt}>{submitted ? "Saving…" : "Add Property"}</Text>
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
  cardTitle: { fontSize: 14, fontWeight: "700", color: WHITE, marginBottom: 14, letterSpacing: 0.2 },
  twoCol:  { flexDirection: "row", gap: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stepRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: WHITE_08, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: WHITE_15 },
  stepItem: { alignItems: "center", gap: 6, flex: 1 },
  stepDot:  { width: 28, height: 28, borderRadius: 14, backgroundColor: WHITE_05, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: WHITE_15 },
  stepDotActive: { backgroundColor: ACCENT, borderColor: ACCENT_LIGHT },
  stepNum:  { fontSize: 12, fontWeight: "700", color: WHITE_40 },
  stepNumActive: { color: WHITE },
  stepLbl:  { fontSize: 10, color: WHITE_40 },
  stepLblActive: { color: ACCENT_LIGHT, fontWeight: "600" },
  infoBanner: { marginTop: 4, padding: 10, borderRadius: 10, backgroundColor: `${ACCENT_LIGHT}15`, borderWidth: 1, borderColor: `${ACCENT_LIGHT}25` },
  infoBannerTxt: { fontSize: 12, color: WHITE_72 },
  amenGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amenItem: { flexDirection: "row", alignItems: "center", gap: 8, width: "47%", paddingVertical: 4 },
  amenItemActive: {},
  amenCheck: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: WHITE_15, alignItems: "center", justifyContent: "center" },
  amenCheckActive: { backgroundColor: SUCCESS, borderColor: SUCCESS },
  amenCheckTxt: { fontSize: 11, color: WHITE, fontWeight: "800" },
  amenLbl:  { fontSize: 12, color: WHITE_72, flex: 1 },
  submitBtn: { backgroundColor: ACCENT, borderRadius: 16, height: 54, alignItems: "center", justifyContent: "center" },
  submitDim: { opacity: 0.6 },
  submitTxt: { fontSize: 15, fontWeight: "800", color: WHITE, letterSpacing: 0.3 },
});
