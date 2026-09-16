import { useState, useEffect } from "react";
import { CheckCircle, XCircle, WifiOff, X, Search, MapPin, Heart, MessageCircle, User, Compass } from "lucide-react";

const WINE = "#8C1515";

/* ── Shimmer animation via injected style ── */
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .sk {
    background: linear-gradient(90deg, #E8E8ED 25%, #F5F5F7 50%, #E8E8ED 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 8px;
  }
`;

function SK({ w="100%", h=14, r=8, style={} as React.CSSProperties }) {
  return <div className="sk" style={{ width:w, height:h, borderRadius:r, ...style }}/>;
}

function StatusBarSkeleton() {
  return (
    <div style={{ padding:"14px 24px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div className="sk" style={{ width:32, height:13, borderRadius:6 }}/>
      <div className="sk" style={{ width:60, height:13, borderRadius:6 }}/>
    </div>
  );
}

/* ── Screen 1: Skeleton Loader ── */
function SkeletonScreen() {
  return (
    <div style={{ width:390, height:844, background:"#fff", fontFamily:"'Inter',sans-serif", borderRadius:44, boxShadow:"0 32px 80px rgba(0,0,0,.22)", display:"flex", flexDirection:"column", border:"10px solid #1a1a1a", overflow:"hidden", position:"relative" }}>
      <style>{shimmerStyle}</style>
      <StatusBarSkeleton />

      <div style={{ flex:1, overflowY:"hidden", padding:"16px 16px 80px" }}>
        {/* Header skeleton */}
        <div style={{ padding:"12px 4px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <SK w={100} h={12} style={{ marginBottom:8 }}/>
            <SK w={180} h={20} r={6}/>
          </div>
          <div className="sk" style={{ width:44, height:44, borderRadius:14 }}/>
        </div>

        {/* Search bar skeleton */}
        <div className="sk" style={{ width:"100%", height:48, borderRadius:14, marginBottom:20 }}/>

        {/* Category chips */}
        <div style={{ display:"flex", gap:10, marginBottom:22 }}>
          {[90,70,80,65].map((w,i)=><SK key={i} w={w} h={34} r={20}/>)}
        </div>

        {/* Section label */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <SK w={160} h={16} r={6}/>
          <SK w={60} h={14} r={6}/>
        </div>

        {/* Property cards (2) */}
        {[0,1].map(i=>(
          <div key={i} style={{ background:"#fff", borderRadius:18, marginBottom:16, border:"1px solid #F0F0F2", overflow:"hidden" }}>
            {/* Image skeleton */}
            <SK w="100%" h={160} r={0} style={{ borderRadius:0 }}/>
            <div style={{ padding:"14px 16px" }}>
              {/* Title */}
              <SK w="75%" h={16} style={{ marginBottom:8 }}/>
              {/* Location */}
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <SK w={14} h={14} r={4}/>
                <SK w="55%" h={14} r={6}/>
              </div>
              {/* Price + rating row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <SK w={80} h={20} r={6}/>
                <div style={{ display:"flex", gap:6 }}>
                  {[0,1,2,3,4].map(s=><SK key={s} w={16} h={16} r={4}/>)}
                </div>
              </div>
              {/* Chips */}
              <div style={{ display:"flex", gap:8 }}>
                {[70,60,80].map((w,j)=><SK key={j} w={w} h={28} r={20}/>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav skeleton */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"#fff", borderTop:"1px solid #F0F0F2", display:"flex", alignItems:"center", justifyContent:"space-around", padding:"0 8px" }}>
        {[Compass,MapPin,Heart,MessageCircle,User].map((Icon,i)=>(
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <div className="sk" style={{ width:24, height:24, borderRadius:8 }}/>
            <div className="sk" style={{ width:36, height:8, borderRadius:4 }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Toast component ── */
type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  visible: boolean;
}

const TOAST_CONFIG: Record<ToastType, { bg:string; border:string; icon:React.ReactNode; iconBg:string }> = {
  success: {
    bg:"#ECFDF5", border:"#A7F3D0",
    icon:<CheckCircle size={20} color="#059669" strokeWidth={2.5}/>,
    iconBg:"#D1FAE5",
  },
  error: {
    bg:"#FEF2F2", border:"#FECACA",
    icon:<XCircle size={20} color="#EF4444" strokeWidth={2.5}/>,
    iconBg:"#FEE2E2",
  },
  info: {
    bg:"#111", border:"rgba(255,255,255,0.12)",
    icon:<WifiOff size={20} color="#fff" strokeWidth={2}/>,
    iconBg:"rgba(255,255,255,0.15)",
  },
};

function ToastCard({ toast, onDismiss }: { toast:Toast; onDismiss:()=>void }) {
  const cfg = TOAST_CONFIG[toast.type];
  const isInfo = toast.type==="info";
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", background:cfg.bg, borderRadius:16, border:`1.5px solid ${cfg.border}`, boxShadow:isInfo?"0 8px 32px rgba(0,0,0,0.35)":"0 4px 20px rgba(0,0,0,0.1)", width:340, position:"relative", transition:"all .3s" }}>
      {/* Icon */}
      <div style={{ width:36, height:36, background:cfg.iconBg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {cfg.icon}
      </div>
      {/* Text */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:isInfo?"#fff":"#111" }}>{toast.title}</p>
        <p style={{ margin:0, fontSize:12, color:isInfo?"rgba(255,255,255,0.65)":"#6B7280", lineHeight:1.5 }}>{toast.message}</p>
      </div>
      {/* Dismiss */}
      <button onClick={onDismiss} style={{ background:"none", border:"none", cursor:"pointer", padding:2, flexShrink:0, marginTop:-2 }}>
        <X size={16} color={isInfo?"rgba(255,255,255,0.5)":"#9CA3AF"} />
      </button>
      {/* Progress bar */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:isInfo?"rgba(255,255,255,0.1)":cfg.border, borderRadius:"0 0 14px 14px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:"60%", background:toast.type==="success"?"#10B981":toast.type==="error"?"#EF4444":"rgba(255,255,255,0.4)", borderRadius:4, transition:"width .1s" }}/>
      </div>
    </div>
  );
}

const INITIAL_TOASTS: Toast[] = [
  { id:"t1", type:"success", title:"Guardado correctamente", message:"Tu anuncio fue publicado y está en revisión.", visible:true },
  { id:"t2", type:"error", title:"Contraseña incorrecta", message:"Verifica tus datos e intenta de nuevo.", visible:true },
  { id:"t3", type:"info", title:"Sin conexión a internet", message:"Revisa tu red. Los cambios se guardarán localmente.", visible:true },
];

/* ── Screen 2: Toast Alerts ── */
function ToastAlertsScreen() {
  const [toasts, setToasts] = useState(INITIAL_TOASTS);
  const [showing, setShowing] = useState(true);

  const dismiss = (id:string) => {
    setToasts(prev=>prev.map(t=>t.id===id?{...t,visible:false}:t));
  };

  const reset = () => {
    setToasts(INITIAL_TOASTS.map(t=>({...t,visible:true})));
    setShowing(true);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, alignItems:"flex-start" }}>
      {/* Mobile context (phone frame) */}
      <div style={{ position:"relative", width:390, height:200 }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)", borderRadius:20, overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, opacity:0.3 }}>
            <div style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", width:"100%", height:"100%" }}/>
          </div>
          <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", gap:10 }}>
            {toasts.filter(t=>t.visible).map(t=>(
              <div key={t.id} style={{ transform:"scale(0.85)", transformOrigin:"top center" }}>
                <ToastCard toast={t} onDismiss={()=>dismiss(t.id)}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-size demo */}
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"24px", minWidth:420 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <p style={{ margin:0, fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Toast Alerts · Full size</p>
          <button onClick={reset} style={{ padding:"6px 14px", background:`${WINE}20`, border:`1px solid ${WINE}40`, borderRadius:8, fontSize:12, fontWeight:600, color:"#ff9090", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
            Resetear todo
          </button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {INITIAL_TOASTS.map((t,i)=>{
            const live = toasts.find(x=>x.id===t.id);
            const visible = live?.visible !== false;
            return (
              <div key={t.id} style={{ opacity:visible?1:0.35, transition:"opacity .3s" }}>
                <ToastCard toast={t} onDismiss={()=>dismiss(t.id)}/>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:16, marginTop:20, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {[
            { dot:"#10B981", label:"Éxito — Acción completada" },
            { dot:"#EF4444", label:"Error — Acción fallida" },
            { dot:"#fff",    label:"Info / Sistema" },
          ].map(l=>(
            <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, background:l.dot, borderRadius:"50%", flexShrink:0 }}/>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage notes */}
      <div style={{ display:"flex", flexDirection:"column", gap:10, maxWidth:420 }}>
        {[
          { color:WINE, title:"Posicionamiento", desc:"Top-center en desktop, Top-right en mobile. Stack con gap de 10px." },
          { color:"#3B82F6", title:"Duración", desc:"Auto-dismiss en 4–5s. Barra de progreso visual indica el tiempo restante." },
          { color:"#10B981", title:"Interacción", desc:"Hover pausa el timer. Tap en ✕ descarta inmediatamente." },
        ].map(n=>(
          <div key={n.title} style={{ display:"flex", gap:10, padding:"12px 14px", background:"rgba(255,255,255,0.03)", borderRadius:12, border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width:4, background:n.color, borderRadius:2, flexShrink:0 }}/>
            <div>
              <p style={{ margin:"0 0 3px", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>{n.title}</p>
              <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.35)", lineHeight:1.5 }}>{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UIStatesModule() {
  return (
    <div style={{ display:"flex", gap:64, alignItems:"flex-start", flexWrap:"wrap" }}>
      {/* Skeleton */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:4, height:20, background:WINE, borderRadius:2 }}/>
          <span style={{ fontSize:14, fontWeight:700, color:"#fff" }}>Skeleton Loader</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>· Home · Cargando contenido</span>
        </div>
        <SkeletonScreen />
      </div>

      {/* Toasts */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:4, height:20, background:WINE, borderRadius:2 }}/>
          <span style={{ fontSize:14, fontWeight:700, color:"#fff" }}>Toast Alerts</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>· 3 variantes · Interactivas</span>
        </div>
        <ToastAlertsScreen />
      </div>
    </div>
  );
}
