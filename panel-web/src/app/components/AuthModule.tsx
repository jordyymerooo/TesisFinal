import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Bell, FileText, Shield, ChevronRight, Trash2, KeyRound, LogOut, Check } from "lucide-react";
import { authService } from "../api/services";

const WINE = "#8C1515";
const WINE_DARK = "#6B1010";

function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? "#fff" : "#111";
  return (
    <div style={{ padding: "14px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: c }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 2 }}>{[3,2.5,2,1.5].map((h,i) => <div key={i} style={{ width:3, height:h*3, background: i<3?c:`${c}55`, borderRadius:1, alignSelf:"flex-end" }} />)}</div>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 2.5C9.8 2.5 11.4 3.2 12.6 4.4L14 3C12.4 1.4 10.3.5 8 .5 5.7.5 3.6 1.4 2 3L3.4 4.4C4.6 3.2 6.2 2.5 8 2.5Z" fill={c}/><path d="M8 5.5C9 5.5 9.9 5.9 10.6 6.6L12 5.2C10.9 4.1 9.5 3.5 8 3.5 6.5 3.5 5.1 4.1 4 5.2L5.4 6.6C6.1 5.9 7 5.5 8 5.5Z" fill={c}/><circle cx="8" cy="9.5" r="1.5" fill={c}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke={c} strokeOpacity=".35"/><rect x="2" y="2" width="16" height="8" rx="2" fill={c}/><path d="M23 4.5V7.5C23.8 7.2 24.5 6.4 24.5 6 24.5 5.6 23.8 4.8 23 4.5Z" fill={c} fillOpacity=".4"/></svg>
      </div>
    </div>
  );
}

function Shell({ children, bg = "#fff" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div style={{ width:390, height:844, background:bg, fontFamily:"'Inter',sans-serif", borderRadius:44, boxShadow:"0 32px 80px rgba(0,0,0,.22)", display:"flex", flexDirection:"column", border:"10px solid #1a1a1a", overflow:"hidden", position:"relative" }}>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width:48, height:28, borderRadius:14, background:on?WINE:"#D1D1D6", border:"none", cursor:"pointer", position:"relative", transition:"background .25s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:on?22:3, width:22, height:22, background:"#fff", borderRadius:"50%", transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
    </button>
  );
}

/* ── Screen 1: Login ── */
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [eF, setEF] = useState(false);
  const [pF, setPF] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(authService.getCurrentUser());

  const valid = email.length > 0 && pwd.length >= 6;

  const handleLogin = async (overrideEmail?: string, overridePwd?: string) => {
    const targetEmail = overrideEmail || email;
    const targetPwd = overridePwd || pwd;
    setLoading(true);
    setMessage(null);
    try {
      const res = await authService.login(targetEmail, targetPwd);
      setMessage({
        text: `✓ ¡Bienvenido ${res.user.nombres}! Token generado (${res.user.rol?.nombre || 'usuario'}).`,
        type: "success"
      });
      setLoggedInUser(res.user);
    } catch (err: any) {
      setMessage({
        text: err.message || "Error al iniciar sesión",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'estudiante' | 'arrendador' | 'admin') => {
    if (role === 'estudiante') {
      setEmail("estudiante@uleam.edu.ec");
      setPwd("estudiante123");
      handleLogin("estudiante@uleam.edu.ec", "estudiante123");
    } else if (role === 'arrendador') {
      setEmail("arrendador@uleam.edu.ec");
      setPwd("arrendador123");
      handleLogin("arrendador@uleam.edu.ec", "arrendador123");
    } else {
      setEmail("admin@uleam.edu.ec");
      setPwd("admin123");
      handleLogin("admin@uleam.edu.ec", "admin123");
    }
  };

  return (
    <Shell>
      <StatusBar />
      <div style={{ flex:1, overflowY:"auto", padding:"0 28px 32px", display:"flex", flexDirection:"column" }}>
        <div style={{ textAlign:"center", padding:"24px 0 20px" }}>
          <div style={{ width:68, height:68, background:`linear-gradient(135deg,${WINE} 0%,${WINE_DARK} 100%)`, borderRadius:22, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", boxShadow:`0 8px 24px ${WINE}45` }}>
            <span style={{ color:"#fff", fontSize:28, fontWeight:800, letterSpacing:"-1px" }}>U</span>
          </div>
          <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:"#111", letterSpacing:"-0.5px" }}>Bienvenido de nuevo</h1>
          <p style={{ margin:0, fontSize:13, color:"#8E8E93" }}>Accede a tu cuenta ULEAM Rental</p>
        </div>

        {/* Demo Fast Logins for Thesis Presentation */}
        <div style={{ background:"#F4F5F7", padding:10, borderRadius:12, marginBottom:16, border:"1px solid #E5E7EB" }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:6 }}>
            Acceso Rápido Tesis (PostgreSQL API):
          </span>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <button
              onClick={() => handleQuickDemo('estudiante')}
              style={{ flex:1, minWidth:80, padding:"6px 8px", background:"#3B82F6", color:"#fff", border:"none", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer" }}
            >
              🎓 Estudiante
            </button>
            <button
              onClick={() => handleQuickDemo('arrendador')}
              style={{ flex:1, minWidth:80, padding:"6px 8px", background:"#10B981", color:"#fff", border:"none", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer" }}
            >
              🏡 Arrendador
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              style={{ flex:1, minWidth:80, padding:"6px 8px", background:"#8C1515", color:"#fff", border:"none", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer" }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {message && (
          <div style={{
            padding:"10px 12px",
            borderRadius:10,
            marginBottom:14,
            fontSize:12,
            fontWeight:600,
            background: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
            color: message.type === "success" ? "#065F46" : "#991B1B",
            border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`
          }}>
            {message.text}
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:7 }}>Correo institucional / personal</label>
            <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${eF?WINE:email?"#D1D1D6":"#E5E5EA"}`, borderRadius:14, background:eF?"#FFFBFB":"#fff", boxShadow:eF?`0 0 0 3px ${WINE}12`:"none", transition:"all .2s", overflow:"hidden" }}>
              <div style={{ padding:"13px 12px 13px 16px" }}><Mail size={18} color={eF?WINE:"#8E8E93"} /></div>
              <input value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>setEF(true)} onBlur={()=>setEF(false)} placeholder="tu.correo@uleam.edu.ec" type="email" style={{ flex:1, border:"none", background:"transparent", padding:"13px 16px 13px 0", fontSize:14, color:"#111", outline:"none", fontFamily:"'Inter',sans-serif" }} />
              {email && <Check size={16} color="#10B981" style={{ marginRight:14 }} />}
            </div>
          </div>

          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:7 }}>Contraseña</label>
            <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${pF?WINE:pwd?"#D1D1D6":"#E5E5EA"}`, borderRadius:14, background:pF?"#FFFBFB":"#fff", boxShadow:pF?`0 0 0 3px ${WINE}12`:"none", transition:"all .2s", overflow:"hidden" }}>
              <div style={{ padding:"13px 12px 13px 16px" }}><Lock size={18} color={pF?WINE:"#8E8E93"} /></div>
              <input value={pwd} onChange={e=>setPwd(e.target.value)} onFocus={()=>setPF(true)} onBlur={()=>setPF(false)} type={show?"text":"password"} placeholder="••••••••" style={{ flex:1, border:"none", background:"transparent", padding:"13px 0", fontSize:14, color:"#111", outline:"none", fontFamily:"'Inter',sans-serif" }} />
              <button onClick={()=>setShow(!show)} style={{ padding:"13px 16px", background:"none", border:"none", cursor:"pointer" }}>{show?<EyeOff size={18} color="#8E8E93"/>:<Eye size={18} color="#8E8E93"/>}</button>
            </div>
          </div>

          <div style={{ textAlign:"right", marginTop:-4 }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:WINE, fontWeight:600, fontFamily:"'Inter',sans-serif" }}>¿Olvidaste tu contraseña?</button>
          </div>

          <button
            disabled={!valid || loading}
            onClick={() => handleLogin()}
            style={{ width:"100%", padding:"15px", background:valid?`linear-gradient(135deg,${WINE} 0%,${WINE_DARK} 100%)`:"#E5E5EA", border:"none", borderRadius:14, color:valid?"#fff":"#AEAEB2", fontSize:15, fontWeight:700, cursor:valid?"pointer":"default", boxShadow:valid?`0 6px 20px ${WINE}45`:"none", fontFamily:"'Inter',sans-serif", letterSpacing:"-0.2px", transition:"all .3s" }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1, height:1, background:"#E5E5EA" }} />
            <span style={{ fontSize:11, color:"#C7C7CC", fontWeight:500 }}>o continúa con</span>
            <div style={{ flex:1, height:1, background:"#E5E5EA" }} />
          </div>

          <button style={{ width:"100%", padding:"13px", background:"#fff", border:"1.5px solid #E5E5EA", borderRadius:14, color:"#111", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continuar con Google
          </button>
        </div>

        <div style={{ marginTop:"auto", textAlign:"center", paddingTop:24 }}>
          <span style={{ fontSize:13, color:"#8E8E93" }}>¿No tienes cuenta? </span>
          <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:WINE, fontWeight:700, fontFamily:"'Inter',sans-serif" }}>Regístrate gratis</button>
        </div>
      </div>
    </Shell>
  );
}

/* ── Screen 2: Forgot Password ── */
function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [eF, setEF] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <Shell bg="#F8F9FA">
      <StatusBar />
      <div style={{ flex:1, overflowY:"auto", padding:"0 28px 32px", display:"flex", flexDirection:"column" }}>
        <div style={{ paddingTop:16, paddingBottom:24 }}>
          <button style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif", color:"#555", fontSize:14, fontWeight:600 }}>
            <ArrowLeft size={18} /> Volver al inicio
          </button>
        </div>

        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:88, height:88, background:"#fff", borderRadius:28, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", boxShadow:"0 8px 24px rgba(0,0,0,.08)", border:"1.5px solid #E5E5EA", transition:"all .3s" }}>
            {sent ? <Check size={38} color="#10B981" strokeWidth={2.5} /> : <KeyRound size={38} color={WINE} />}
          </div>
          <h2 style={{ margin:"0 0 8px", fontSize:22, fontWeight:800, color:"#111", letterSpacing:"-0.5px" }}>
            {sent ? "¡Código enviado!" : "Recuperar contraseña"}
          </h2>
          <p style={{ margin:0, fontSize:13, color:"#8E8E93", lineHeight:1.6, maxWidth:280, marginInline:"auto" }}>
            {sent ? `Hemos enviado un PIN de 6 dígitos a ${email}. Revisa tu bandeja.` : "Ingresa tu correo y te enviaremos un código PIN de 6 dígitos para restablecer tu contraseña."}
          </p>
        </div>

        {!sent ? (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:7 }}>Correo electrónico</label>
              <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${eF?WINE:email?"#D1D1D6":"#E5E5EA"}`, borderRadius:14, background:"#fff", boxShadow:eF?`0 0 0 3px ${WINE}12`:"none", transition:"all .2s", overflow:"hidden" }}>
                <div style={{ padding:"13px 12px 13px 16px" }}><Mail size={18} color={eF?WINE:"#8E8E93"} /></div>
                <input value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>setEF(true)} onBlur={()=>setEF(false)} placeholder="tu.correo@uleam.edu.ec" type="email" style={{ flex:1, border:"none", background:"transparent", padding:"13px 16px 13px 0", fontSize:14, color:"#111", outline:"none", fontFamily:"'Inter',sans-serif" }} />
              </div>
            </div>
            <button onClick={()=>{ if(email) setSent(true); }} style={{ width:"100%", padding:"15px", background:email?`linear-gradient(135deg,${WINE} 0%,${WINE_DARK} 100%)`:"#E5E5EA", border:"none", borderRadius:14, color:email?"#fff":"#AEAEB2", fontSize:15, fontWeight:700, cursor:email?"pointer":"default", boxShadow:email?`0 6px 20px ${WINE}40`:"none", fontFamily:"'Inter',sans-serif", transition:"all .3s" }}>
              Enviar código PIN
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"#fff", borderRadius:16, padding:"16px", border:"1.5px solid #E5E5EA" }}>
              <p style={{ margin:"0 0 12px", fontSize:12, fontWeight:600, color:"#8E8E93", textAlign:"center" }}>Ingresa el código de 6 dígitos</p>
              <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                {[0,1,2,3,4,5].map(i=>(
                  <div key={i} style={{ flex:1, height:52, background:"#F8F9FA", borderRadius:12, border:"1.5px solid #E5E5EA", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:22, fontWeight:700, color:"#C7C7CC" }}>–</span>
                  </div>
                ))}
              </div>
            </div>
            <button style={{ width:"100%", padding:"15px", background:`linear-gradient(135deg,${WINE} 0%,${WINE_DARK} 100%)`, border:"none", borderRadius:14, color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
              Verificar código
            </button>
            <button onClick={()=>setSent(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:WINE, fontWeight:600, fontFamily:"'Inter',sans-serif", textAlign:"center" }}>
              Reenviar código
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── Screen 3: Account Settings ── */
function AccountSettingsScreen() {
  const [push, setPush] = useState(true);
  const [emailN, setEmailN] = useState(false);
  const [requests, setRequests] = useState(true);

  const notifs = [
    { label:"Notificaciones push", sub:"Alertas en tu dispositivo", icon:<Bell size={17} color="#3B82F6"/>, bg:"#EFF6FF", val:push, fn:()=>setPush(!push) },
    { label:"Notificaciones por correo", sub:"Resumen semanal", icon:<Mail size={17} color="#8B5CF6"/>, bg:"#F5F3FF", val:emailN, fn:()=>setEmailN(!emailN) },
    { label:"Alertas de solicitudes", sub:"Cuando alguien solicite tu espacio", icon:<Bell size={17} color="#10B981"/>, bg:"#ECFDF5", val:requests, fn:()=>setRequests(!requests) },
  ];

  return (
    <Shell bg="#F8F9FA">
      <StatusBar />
      <div style={{ background:"#fff", padding:"12px 20px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid #F0F0F2", flexShrink:0 }}>
        <button style={{ width:36, height:36, borderRadius:12, background:"#F5F5F7", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><ArrowLeft size={18} color="#111"/></button>
        <p style={{ margin:0, fontSize:17, fontWeight:700, color:"#111", letterSpacing:"-0.3px" }}>Ajustes de cuenta</p>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 0 80px" }}>
        {/* Profile mini */}
        <div style={{ margin:"0 16px 20px", background:"#fff", borderRadius:16, padding:"16px", border:"1px solid #F0F0F2", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:52, height:52, background:`linear-gradient(135deg,${WINE}25,${WINE}10)`, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:20, fontWeight:800, color:WINE }}>AM</span>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ margin:"0 0 2px", fontSize:15, fontWeight:700, color:"#111" }}>Andrea Murillo López</p>
            <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>andrea.murillo@uleam.edu.ec</p>
          </div>
          <div style={{ padding:"3px 10px", background:"#ECFDF5", borderRadius:20, border:"1px solid #A7F3D0" }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#059669" }}>Verificada</span>
          </div>
        </div>

        {/* Notifications */}
        <SectionGroup label="Notificaciones">
          {notifs.map((n,i)=>(
            <SettingsRow key={n.label} icon={n.icon} bg={n.bg} label={n.label} sub={n.sub} divider={i<notifs.length-1}>
              <Toggle on={n.val} onChange={n.fn} />
            </SettingsRow>
          ))}
        </SectionGroup>

        {/* Legal */}
        <SectionGroup label="Legal">
          {[
            { label:"Términos y condiciones", icon:<FileText size={17} color="#F59E0B"/>, bg:"#FFFBEB" },
            { label:"Política de privacidad", icon:<Shield size={17} color="#3B82F6"/>, bg:"#EFF6FF" },
          ].map((it,i)=>(
            <SettingsRow key={it.label} icon={it.icon} bg={it.bg} label={it.label} divider={i===0}>
              <ChevronRight size={16} color="#C7C7CC" />
            </SettingsRow>
          ))}
        </SectionGroup>

        {/* Danger */}
        <SectionGroup label="Cuenta">
          <SettingsRow icon={<LogOut size={17} color="#555"/>} bg="#F5F5F7" label="Cerrar sesión" divider>
            <ChevronRight size={16} color="#C7C7CC" />
          </SettingsRow>
          <SettingsRow icon={<Trash2 size={17} color="#EF4444"/>} bg="#FEF2F2" label="Eliminar cuenta" labelColor="#EF4444">
            <ChevronRight size={16} color="#FCA5A5" />
          </SettingsRow>
        </SectionGroup>
        <p style={{ margin:"6px 0 0 20px", fontSize:11, color:"#C7C7CC", lineHeight:1.5 }}>Esta acción es permanente e irreversible.</p>
      </div>
    </Shell>
  );
}

function SectionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ margin:"0 16px 16px" }}>
      <p style={{ margin:"0 0 8px 4px", fontSize:11, fontWeight:700, color:"#8E8E93", letterSpacing:"0.5px", textTransform:"uppercase" }}>{label}</p>
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #F0F0F2", overflow:"hidden" }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, bg, label, sub, labelColor, divider, children }: { icon: React.ReactNode; bg: string; label: string; sub?: string; labelColor?: string; divider?: boolean; children?: React.ReactNode }) {
  return (
    <div style={{ padding:"13px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:divider?"1px solid #F5F5F7":"none" }}>
      <div style={{ width:36, height:36, background:bg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <p style={{ margin:"0 0 2px", fontSize:14, fontWeight:600, color:labelColor||"#111" }}>{label}</p>
        {sub && <p style={{ margin:0, fontSize:11, color:"#8E8E93" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function AuthModule() {
  return (
    <div style={{ display:"flex", gap:40, alignItems:"flex-start", flexWrap:"wrap" }}>
      <LoginScreen />
      <ForgotPasswordScreen />
      <AccountSettingsScreen />
    </div>
  );
}
