import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform, StatusBar,
  useWindowDimensions, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const BRAND_BLUE = "#1A3C5E";
const ACCENT     = "#4A90D9";
const LANDLORD_C = "#3B6FA8";
const SUCCESS    = "#22C55E";
const ERROR_RED  = "#F87171";
const WHITE      = "#FFFFFF";
const WHITE_72   = "rgba(255,255,255,0.72)";
const WHITE_40   = "rgba(255,255,255,0.40)";
const WHITE_15   = "rgba(255,255,255,0.15)";
const WHITE_08   = "rgba(255,255,255,0.08)";

type Role = "landlord" | "renter";
// Tab pill width is computed as percentage at runtime — see tabPill style below

function generateLandlordKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

function StepBar({ total, current, color }: { total: number; current: number; color: string }) {
  return (
    <View style={sb.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[sb.seg, { backgroundColor: i < current ? color : WHITE_15 }]} />
      ))}
    </View>
  );
}
const sb = StyleSheet.create({ row: { flexDirection: "row", gap: 6, marginBottom: 24 }, seg: { flex: 1, height: 3, borderRadius: 2 } });

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const kavOffset = Platform.OS === "android" ? insets.top : 0;
  const [role, setRole]     = useState<Role>("landlord");
  const [step, setStep]     = useState(1);
  const [submitting, setSub] = useState(false);
  const [fullName, setFN]   = useState(""); const [email, setEM]     = useState("");
  const [phone, setPH]      = useState(""); const [password, setPW]  = useState("");
  const [confirmPass, setCP]= useState(""); const [passVis, setPVis] = useState(false);
  const [confVis, setCVis]  = useState(false);
  const [landlordKey, setLK]= useState(""); const [keyStatus, setKS] = useState<"idle"|"checking"|"valid"|"invalid">("idle");
  const [generatedKey, setGK]= useState("");
  const [focused, setFoc]   = useState<string|null>(null);
  const [errors, setErr]    = useState<Record<string,string>>({});
  const pillX        = useSharedValue(0);
  const pageOp       = useSharedValue(0); const pageTY = useSharedValue(24);
  const formOp       = useSharedValue(0); const formTY = useSharedValue(16);

  useEffect(() => {
    pageOp.value = withTiming(1, { duration: 500 });
    pageTY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    formOp.value = withDelay(200, withTiming(1, { duration: 500 }));
    formTY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []);

  const pageStyle = useAnimatedStyle(() => ({ opacity: pageOp.value, transform: [{ translateY: pageTY.value }] }));
  const formStyle = useAnimatedStyle(() => ({ opacity: formOp.value, transform: [{ translateY: formTY.value }] }));
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pillX.value }] }));

  const animForm = (cb: () => void) => {
    formOp.value = withTiming(0, { duration: 140 });
    formTY.value = withTiming(10, { duration: 140 });
    setTimeout(() => {
      cb();
      formOp.value = withTiming(1, { duration: 350 });
      formTY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    }, 155);
  };

  const switchRole = (next: Role) => {
    if (next === role) return;
    animForm(() => { setRole(next); setStep(1); clearF(); });
    // Pill slides to half the track width (accounting for 4px padding on each side)
    const trackInnerWidth = (width - 48 - 8) / 2;  // screen - hPad*2 - pill-pad*2, halved
    pillX.value = withSpring(next === "landlord" ? 0 : trackInnerWidth, { damping: 18, stiffness: 200, mass: 0.8 });
  };

  const clearF = () => {
    setFN(""); setEM(""); setPH(""); setPW(""); setCP("");
    setLK(""); setKS("idle"); setErr({});
    setPVis(false); setCVis(false);
  };

  const accent = role === "landlord" ? LANDLORD_C : ACCENT;

  const validatePersonal = (): boolean => {
    const e: Record<string,string> = {};
    if (!fullName.trim())         e.fullName    = "Full name is required.";
    if (!isValidEmail(email))     e.email       = "Enter a valid email address.";
    if (phone && phone.length < 7)e.phone       = "Enter a valid phone number.";
    if (password.length < 8)      e.password    = "Password must be at least 8 characters.";
    if (password !== confirmPass) e.confirmPass = "Passwords do not match.";
    setErr(e); return Object.keys(e).length === 0;
  };

  const verifyKey = async (): Promise<boolean> => {
    if (landlordKey.length < 8) { setErr({ landlordKey: "Please enter the full 8-character landlord key." }); return false; }
    setKS("checking"); setErr({});
    await new Promise(r => setTimeout(r, 1200));
    const ok = landlordKey.length === 8;
    setKS(ok ? "valid" : "invalid");
    if (!ok) setErr({ landlordKey: "Invalid key. Ask your landlord for the correct code." });
    return ok;
  };

  const handleLandlordSubmit = async () => {
    if (!validatePersonal()) return;
    setSub(true); await new Promise(r => setTimeout(r, 1400));
    const k = generateLandlordKey(); setGK(k); setSub(false);
    animForm(() => setStep(2));
  };

  const handleRenterStep1 = async () => { const ok = await verifyKey(); if (ok) animForm(() => setStep(2)); };
  const handleRenterStep2 = async () => {
    if (!validatePersonal()) return;
    setSub(true); await new Promise(r => setTimeout(r, 1400)); setSub(false);
    router.replace("/login");
  };

  const fld = (label: string, icon: string, fk: string, val: string, onChange: (v:string)=>void,
    opts: { ph?: string; secure?: boolean; vis?: boolean; togVis?: ()=>void; kb?: "default"|"email-address"|"phone-pad"; caps?: "none"|"words" } = {}) => (
    <View style={s.fg} key={fk}>
      <Text style={s.fl}>{label}</Text>
      <View style={[s.iw, focused===fk&&s.iFoc, !!errors[fk]&&s.iErr]}>
        <Text style={s.iIc}>{icon}</Text>
        <TextInput style={s.inp} placeholder={opts.ph??""} placeholderTextColor={WHITE_40}
          secureTextEntry={opts.secure && !opts.vis} keyboardType={opts.kb??"default"}
          autoCapitalize={opts.caps??"sentences"} autoCorrect={false}
          value={val} onChangeText={onChange}
          onFocus={()=>setFoc(fk)} onBlur={()=>setFoc(null)} selectionColor={accent} />
        {opts.secure&&<TouchableOpacity onPress={opts.togVis} activeOpacity={0.7} style={s.eye}>
          <Text style={[s.eyeTxt,{color:accent}]}>{opts.vis?"Hide":"Show"}</Text></TouchableOpacity>}
      </View>
      {errors[fk]?<Text style={s.errTxt}>⚠ {errors[fk]}</Text>:null}
    </View>
  );

  const personalForm = () => (<>
    {fld("Full name",       "👤","fullName",   fullName,   setFN,  {ph:"Your full name",                              caps:"words"})}
    {fld("Email address",   "✉", "email",      email,      setEM,  {ph:role==="landlord"?"landlord@example.com":"renter@example.com", kb:"email-address", caps:"none"})}
    {fld("Phone number",    "📱","phone",       phone,      setPH,  {ph:"+1 555 000 0000",                            kb:"phone-pad", caps:"none"})}
    {fld("Password",        "🔒","password",   password,   setPW,  {ph:"Min. 8 characters", secure:true, vis:passVis, togVis:()=>setPVis(v=>!v), caps:"none"})}
    {fld("Confirm password","🔒","confirmPass",confirmPass,setCP,  {ph:"Re-enter password",  secure:true, vis:confVis, togVis:()=>setCVis(v=>!v), caps:"none"})}
  </>);

  const content = () => {
    if (role==="landlord" && step===1) return (<>
      <View style={[s.chip,{backgroundColor:"rgba(59,111,168,0.15)",borderColor:LANDLORD_C+"44"}]}>
        <View style={[s.chipDot,{backgroundColor:LANDLORD_C}]}/><Text style={[s.chipTxt,{color:LANDLORD_C}]}>Property owner account</Text>
      </View>
      <Text style={s.sh}>Your details</Text>
      <Text style={s.ss}>Fill in your information. Once registered, a unique key is generated that your renters will use to link their accounts to your properties.</Text>
      {personalForm()}
      <TouchableOpacity style={[s.btn,{backgroundColor:LANDLORD_C},submitting&&s.btnOff]} onPress={handleLandlordSubmit} activeOpacity={0.88} disabled={submitting}>
        {submitting?<ActivityIndicator color={WHITE}/>:<Text style={s.btnTxt}>Create Landlord Account  →</Text>}
      </TouchableOpacity>
    </>);

    if (role==="landlord" && step===2) return (<>
      <View style={s.successWrap}><Text style={s.successEmoji}>🎉</Text></View>
      <Text style={s.sh}>Account Created!</Text>
      <Text style={s.ss}>Your landlord account is ready. Share the unique key below with your tenants — they need it during sign-up to link to your property.</Text>
      <View style={[s.keyCard,{borderColor:LANDLORD_C}]}>
        <Text style={s.kcLabel}>YOUR LANDLORD KEY</Text>
        <Text style={[s.kcVal,{color:LANDLORD_C}]}>{generatedKey}</Text>
        <View style={s.kcDiv}/>
        <Text style={s.kcHint}>Multiple tenants can register using the same key — all will be linked to your account.</Text>
      </View>
      {[{i:"🔗",t:"Share with multiple renters — all are linked to your landlord account."},{i:"🔔",t:"You'll be notified each time a renter uses your key."},{i:"🔄",t:"Regenerate anytime from your dashboard if the key is compromised."}].map(({i,t})=>(
        <View key={i} style={s.infoRow}><Text style={s.infoIc}>{i}</Text><Text style={s.infoTxt}>{t}</Text></View>
      ))}
      <TouchableOpacity style={[s.btn,{backgroundColor:LANDLORD_C,marginTop:20}]} onPress={()=>router.replace("/login")} activeOpacity={0.88}>
        <Text style={s.btnTxt}>Go to Sign In</Text>
      </TouchableOpacity>
    </>);

    if (role==="renter" && step===1) return (<>
      <View style={[s.chip,{backgroundColor:"rgba(74,144,217,0.12)",borderColor:ACCENT+"44"}]}>
        <View style={[s.chipDot,{backgroundColor:ACCENT}]}/><Text style={[s.chipTxt,{color:ACCENT}]}>Tenant account</Text>
      </View>
      <Text style={s.sh}>Enter landlord key</Text>
      <Text style={s.ss}>Your landlord will have shared an 8-character invite key with you. Enter it to link your account to their property.</Text>
      <View style={s.fg}>
        <Text style={s.fl}>Landlord invite key</Text>
        <View style={[s.iw,focused==="lk"&&s.iFoc,!!errors.landlordKey&&s.iErr,keyStatus==="valid"&&s.iOk]}>
          <Text style={s.iIc}>🔑</Text>
          <TextInput style={[s.inp,s.keyInp]} placeholder="e.g.  A3KX9PLM" placeholderTextColor={WHITE_40}
            value={landlordKey} onChangeText={v=>{setLK(v.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8));setKS("idle");setErr({});}}
            onFocus={()=>setFoc("lk")} onBlur={()=>setFoc(null)}
            autoCapitalize="characters" autoCorrect={false} selectionColor={ACCENT} maxLength={8}/>
          {keyStatus==="checking"&&<ActivityIndicator color={ACCENT} size="small"/>}
          {keyStatus==="valid"   &&<Text style={s.okIc}>✓</Text>}
          {keyStatus==="invalid" &&<Text style={s.errIc}>✗</Text>}
        </View>
        {errors.landlordKey?<Text style={s.errTxt}>⚠ {errors.landlordKey}</Text>:keyStatus==="valid"?<Text style={s.okTxt}>✓  Key verified — landlord found.</Text>:null}
      </View>
      <View style={s.kbRow}>
        {Array.from({length:8}).map((_,i)=>(
          <View key={i} style={[s.kb,landlordKey[i]&&{borderColor:ACCENT,backgroundColor:"rgba(74,144,217,0.13)"}]}>
            <Text style={s.kbC}>{landlordKey[i]??""}</Text>
          </View>
        ))}
      </View>
      <Text style={s.kHint}>Don't have a key? Ask your landlord to share their heyTenant invite code with you.</Text>
      <TouchableOpacity
        style={[s.btn,{backgroundColor:keyStatus==="valid"?ACCENT:"rgba(74,144,217,0.38)"},keyStatus==="checking"&&s.btnOff]}
        onPress={handleRenterStep1} activeOpacity={0.88} disabled={keyStatus==="checking"}>
        {keyStatus==="checking"?<ActivityIndicator color={WHITE}/>:<Text style={s.btnTxt}>Verify &amp; Continue  →</Text>}
      </TouchableOpacity>
    </>);

    if (role==="renter" && step===2) return (<>
      <View style={s.linkedBadge}>
        <Text style={s.lbIc}>🔗</Text>
        <View style={{flex:1}}>
          <Text style={[s.lbTitle,{color:SUCCESS}]}>Landlord key verified</Text>
          <Text style={s.lbSub}>Your account will be linked to key <Text style={s.lbKey}>{landlordKey}</Text></Text>
        </View>
      </View>
      <Text style={s.sh}>Your details</Text>
      <Text style={s.ss}>Complete your profile to finish creating your renter account.</Text>
      {personalForm()}
      <TouchableOpacity style={[s.btn,{backgroundColor:ACCENT},submitting&&s.btnOff]} onPress={handleRenterStep2} activeOpacity={0.88} disabled={submitting}>
        {submitting?<ActivityIndicator color={WHITE}/>:<Text style={s.btnTxt}>Create Renter Account  →</Text>}
      </TouchableOpacity>
    </>);

    return null;
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS==="ios"?"padding":"height"} keyboardVerticalOffset={kavOffset}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BLUE} translucent={false}/>
      <View style={[s.orb1,{width:width*.85,height:width*.85,borderRadius:(width*.85)/2,top:-width*.4,right:-width*.28}]}/>
      <View style={[s.orb2,{width:width*.55,height:width*.55,borderRadius:(width*.55)/2,bottom:width*.1,left:-width*.2}]}/>
      <ScrollView contentContainerStyle={[s.scroll,{paddingBottom:Math.max(insets.bottom+16,36)}]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View style={pageStyle}>
          <TouchableOpacity style={[s.back,{marginTop:Math.max(insets.top+12,44)}]} onPress={()=>{if(step===2&&role==="renter"){animForm(()=>setStep(1));}else{router.back();}}} activeOpacity={0.7}>
            <Text style={s.backArrow}>←</Text>
            <Text style={s.backTxt}>{step===2&&role==="renter"?"Back":"Sign in"}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[s.header,pageStyle]}>
          <View style={[s.logoOut,{backgroundColor:accent}]}><View style={s.logoIn}><Text style={s.logoTxt}>hT</Text></View></View>
          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Join heyTenant as a landlord or renter</Text>
        </Animated.View>

        {step===1&&(
          <Animated.View style={[s.tabTrack,pageStyle]}>
            <Animated.View style={[s.tabPill,pillStyle,{backgroundColor:accent}]}/>
            {(["landlord","renter"] as Role[]).map(r=>(
              <TouchableOpacity key={r} style={s.tabBtn} onPress={()=>switchRole(r)} activeOpacity={0.85}>
                <Text style={[s.tabLbl,role===r&&s.tabLblOn]}>{r==="landlord"?"🏢  Landlord":"🏠  Renter"}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {!(role==="landlord"&&step===2)&&(
          <Animated.View style={pageStyle}><StepBar total={2} current={step} color={accent}/></Animated.View>
        )}

        <Animated.View style={formStyle}>{content()}</Animated.View>

        {step===1&&(
          <Animated.View style={[s.footer,formStyle]}>
            <Text style={s.footerTxt}>Already have an account?{" "}
              <Text style={[s.footerLnk,{color:accent}]} onPress={()=>router.replace("/login")}>Sign in</Text>
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// KBW is used as a fallback minimum; actual key-box width may use screen width at runtime.
// We use a safe default of 320 (smallest common phone width) so the style is always valid.
const KBW = Math.floor((320 - 48 - 42) / 8);
const s = StyleSheet.create({
  root:   {flex:1,backgroundColor:BRAND_BLUE},
  scroll: {flexGrow:1,paddingHorizontal:24},
  // orb dimensions set dynamically in component
  orb1:   {position:"absolute",backgroundColor:"rgba(74,144,217,0.09)"},
  orb2:   {position:"absolute",backgroundColor:"rgba(74,144,217,0.06)"},
  // marginTop set dynamically via insets in component
  back:   {flexDirection:"row",alignItems:"center",gap:6,marginBottom:8,alignSelf:"flex-start"},
  backArrow:{fontSize:18,color:WHITE_72},
  backTxt:  {fontSize:14,color:WHITE_72,fontWeight:"500"},
  header:   {alignItems:"center",paddingTop:12,paddingBottom:20},
  logoOut:  {width:68,height:68,borderRadius:18,alignItems:"center",justifyContent:"center",marginBottom:14},
  logoIn:   {width:54,height:54,borderRadius:13,backgroundColor:WHITE,alignItems:"center",justifyContent:"center"},
  logoTxt:  {fontSize:20,fontWeight:"800",color:BRAND_BLUE,letterSpacing:-1},
  title:    {fontSize:26,fontWeight:"700",color:WHITE,letterSpacing:0.2,marginBottom:4},
  subtitle: {fontSize:13,color:WHITE_72,textAlign:"center"},
  tabTrack: {flexDirection:"row",backgroundColor:WHITE_08,borderWidth:1,borderColor:WHITE_15,borderRadius:16,padding:4,marginBottom:20,position:"relative"},
  tabPill:  {position:"absolute",top:4,left:4,bottom:4,width:"50%",borderRadius:12},
  tabBtn:   {flex:1,height:44,alignItems:"center",justifyContent:"center",borderRadius:12,zIndex:1},
  tabLbl:   {fontSize:14,fontWeight:"600",color:WHITE_40,letterSpacing:0.2},
  tabLblOn: {color:WHITE},
  chip:     {flexDirection:"row",alignItems:"center",gap:7,borderWidth:1,borderRadius:20,paddingHorizontal:13,paddingVertical:6,marginBottom:18,alignSelf:"flex-start"},
  chipDot:  {width:6,height:6,borderRadius:3},
  chipTxt:  {fontSize:12,fontWeight:"600",letterSpacing:0.2},
  sh:       {fontSize:20,fontWeight:"700",color:WHITE,marginBottom:6,letterSpacing:0.1},
  ss:       {fontSize:13,color:WHITE_72,lineHeight:20,marginBottom:22},
  fg:       {marginBottom:14},
  fl:       {fontSize:12,fontWeight:"600",color:WHITE_72,letterSpacing:0.3,marginBottom:7},
  iw:       {flexDirection:"row",alignItems:"center",backgroundColor:WHITE_08,borderWidth:1,borderColor:WHITE_15,borderRadius:14,paddingHorizontal:14,height:52,gap:10},
  iFoc:     {borderColor:ACCENT,backgroundColor:"rgba(74,144,217,0.08)"},
  iErr:     {borderColor:ERROR_RED,backgroundColor:"rgba(248,113,113,0.07)"},
  iOk:      {borderColor:SUCCESS,backgroundColor:"rgba(34,197,94,0.07)"},
  iIc:      {fontSize:14,color:WHITE_40,width:18,textAlign:"center"},
  inp:      {flex:1,fontSize:15,color:WHITE,alignSelf:"center",paddingVertical:0},
  keyInp:   {fontSize:18,fontWeight:"700",letterSpacing:5},
  eye:      {paddingLeft:6,paddingVertical:4},
  eyeTxt:   {fontSize:12,fontWeight:"600"},
  errTxt:   {marginTop:5,fontSize:11,color:ERROR_RED},
  okTxt:    {marginTop:5,fontSize:11,color:SUCCESS,fontWeight:"500"},
  okIc:     {fontSize:16,color:SUCCESS,fontWeight:"700"},
  errIc:    {fontSize:16,color:ERROR_RED,fontWeight:"700"},
  kbRow:    {flexDirection:"row",gap:6,marginBottom:14,justifyContent:"center"},
  kb:       {width:KBW,height:KBW,borderRadius:8,borderWidth:1.5,borderColor:WHITE_15,backgroundColor:WHITE_08,alignItems:"center",justifyContent:"center"},
  kbC:      {fontSize:15,fontWeight:"800",color:WHITE},
  kHint:    {fontSize:12,color:WHITE_40,textAlign:"center",lineHeight:18,marginBottom:22},
  btn:      {borderRadius:16,height:56,alignItems:"center",justifyContent:"center",marginTop:8},
  btnTxt:   {fontSize:15,fontWeight:"700",color:WHITE,letterSpacing:0.3},
  btnOff:   {opacity:0.55},
  keyCard:  {borderWidth:1.5,borderRadius:18,padding:22,alignItems:"center",backgroundColor:WHITE_08,marginBottom:18},
  kcLabel:  {fontSize:10,fontWeight:"700",color:WHITE_40,letterSpacing:2.5,textTransform:"uppercase",marginBottom:12},
  kcVal:    {fontSize:32,fontWeight:"800",letterSpacing:8,marginBottom:14},
  kcDiv:    {width:"80%",height:1,backgroundColor:WHITE_15,marginBottom:14},
  kcHint:   {fontSize:12,color:WHITE_72,textAlign:"center",lineHeight:18},
  infoRow:  {flexDirection:"row",alignItems:"flex-start",gap:12,backgroundColor:WHITE_08,borderWidth:1,borderColor:WHITE_15,borderRadius:12,padding:14,marginBottom:10},
  infoIc:   {fontSize:15,marginTop:1},
  infoTxt:  {flex:1,fontSize:12,color:WHITE_72,lineHeight:18},
  successWrap:{alignItems:"center",marginBottom:14},
  successEmoji:{fontSize:52},
  linkedBadge:{flexDirection:"row",alignItems:"flex-start",gap:10,borderWidth:1,borderColor:SUCCESS+"55",borderRadius:14,padding:14,backgroundColor:"rgba(34,197,94,0.07)",marginBottom:20},
  lbIc:     {fontSize:18,marginTop:1},
  lbTitle:  {fontSize:13,fontWeight:"700",marginBottom:2},
  lbSub:    {fontSize:12,color:WHITE_72},
  lbKey:    {fontWeight:"800",letterSpacing:2,color:WHITE},
  footer:   {alignItems:"center",paddingTop:24},
  footerTxt:{fontSize:13,color:WHITE_40},
  footerLnk:{fontWeight:"600"},
  fieldLabelRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:7},
});