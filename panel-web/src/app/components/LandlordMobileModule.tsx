import { useState } from "react";
import { ArrowLeft, Plus, MoreHorizontal, Eye, MessageSquare, ChevronRight, Check, X, Clock, Bell, Home, User } from "lucide-react";

const WINE = "#8C1515";
const WINE_DARK = "#6B1010";

function StatusBar() {
  return (
    <div style={{ padding:"14px 24px 0", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
      <span style={{ fontSize:13, fontWeight:700, color:"#111" }}>9:41</span>
      <div style={{ display:"flex", gap:5, alignItems:"center" }}>
        <div style={{ display:"flex", gap:2 }}>{[3,2.5,2,1.5].map((h,i)=><div key={i} style={{ width:3, height:h*3, background:i<3?"#111":"#ccc", borderRadius:1, alignSelf:"flex-end" }}/>)}</div>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 2.5C9.8 2.5 11.4 3.2 12.6 4.4L14 3C12.4 1.4 10.3.5 8 .5 5.7.5 3.6 1.4 2 3L3.4 4.4C4.6 3.2 6.2 2.5 8 2.5Z" fill="#111"/><path d="M8 5.5C9 5.5 9.9 5.9 10.6 6.6L12 5.2C10.9 4.1 9.5 3.5 8 3.5 6.5 3.5 5.1 4.1 4 5.2L5.4 6.6C6.1 5.9 7 5.5 8 5.5Z" fill="#111"/><circle cx="8" cy="9.5" r="1.5" fill="#111"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke="#111" strokeOpacity=".35"/><rect x="2" y="2" width="16" height="8" rx="2" fill="#111"/><path d="M23 4.5V7.5C23.8 7.2 24.5 6.4 24.5 6 24.5 5.6 23.8 4.8 23 4.5Z" fill="#111" fillOpacity=".4"/></svg>
      </div>
    </div>
  );
}

function Shell({ children, bg="#F8F9FA" }: { children:React.ReactNode; bg?:string }) {
  return (
    <div style={{ width:390, height:844, background:bg, fontFamily:"'Inter',sans-serif", borderRadius:44, boxShadow:"0 32px 80px rgba(0,0,0,.22)", display:"flex", flexDirection:"column", border:"10px solid #1a1a1a", overflow:"hidden", position:"relative" }}>
      {children}
    </div>
  );
}

const PROPERTIES = [
  { id:"p1", title:"Habitación privada Calle Olmedo", address:"Olmedo 245, Manta", price:180, views:234, requests:3, status:"active", gradient:"linear-gradient(135deg,#667eea,#764ba2)" },
  { id:"p2", title:"Mini depa cerca de ULEAM", address:"Av. 4 de Noviembre, Manta", price:250, views:87, requests:1, status:"review", gradient:"linear-gradient(135deg,#f093fb,#f5576c)" },
  { id:"p3", title:"Suite ejecutiva amoblada", address:"Centro, Manta", price:320, views:156, requests:0, status:"occupied", gradient:"linear-gradient(135deg,#4facfe,#00f2fe)" },
];

const STATUS_CONFIG: Record<string, { label:string; bg:string; color:string; dot:string }> = {
  active:   { label:"Activo",      bg:"#ECFDF5", color:"#059669", dot:"#10B981" },
  review:   { label:"En revisión", bg:"#FFFBEB", color:"#D97706", dot:"#F59E0B" },
  occupied: { label:"Ocupado",     bg:"#F5F5F7", color:"#6B7280", dot:"#9CA3AF" },
};

const REQUESTS = [
  { id:"r1", name:"Luis Fernando Reyes", career:"Ing. en Sistemas", year:"4to año", avatar:"LR", sent:"Hace 2 horas", property:"Habitación privada Calle Olmedo", isNew:true, msg:"Buenos días, estoy interesado en el cuarto. Soy estudiante de 4to año. ¿Podría agendar una visita esta semana?" },
  { id:"r2", name:"Valeria Intriago Ponce", career:"Medicina", year:"2do año", avatar:"VI", sent:"Hace 5 horas", property:"Habitación privada Calle Olmedo", isNew:true, msg:"Hola, vi su publicación y me interesa mucho. Tengo referencias del departamento de bienestar estudiantil." },
  { id:"r3", name:"Jorge Tomala Cruz", career:"Administración", year:"3er año", avatar:"JT", sent:"Ayer", property:"Habitación privada Calle Olmedo", isNew:false, msg:"¿El cuarto incluye wifi? Necesito conexión estable para mis clases virtuales." },
];

/* ── Screen 1: My Properties ── */
function MyPropertiesScreen({ onRequestsClick }: { onRequestsClick:()=>void }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const filters = [
    { id:"all", label:"Todas" },
    { id:"active", label:"Activas" },
    { id:"review", label:"En revisión" },
    { id:"occupied", label:"Ocupadas" },
  ];
  const filtered = activeFilter==="all" ? PROPERTIES : PROPERTIES.filter(p=>p.status===activeFilter);

  return (
    <Shell>
      <StatusBar />
      {/* Header */}
      <div style={{ background:"#F8F9FA", padding:"12px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p style={{ margin:0, fontSize:18, fontWeight:800, color:"#111", letterSpacing:"-0.4px" }}>Mis Propiedades</p>
          <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>{PROPERTIES.length} publicaciones activas</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onRequestsClick} style={{ position:"relative", width:40, height:40, background:"#fff", borderRadius:12, border:"1px solid #E5E5EA", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Bell size={18} color="#555"/>
            <div style={{ position:"absolute", top:8, right:8, width:8, height:8, background:WINE, borderRadius:"50%", border:"2px solid #F8F9FA" }}/>
          </button>
          <button style={{ width:40, height:40, background:WINE, borderRadius:12, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Plus size={18} color="#fff"/>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ padding:"14px 20px 0", display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none" }}>
        {filters.map(f=>(
          <button key={f.id} onClick={()=>setActiveFilter(f.id)} style={{ padding:"7px 16px", borderRadius:50, border:`1.5px solid ${activeFilter===f.id?WINE:"#E5E5EA"}`, background:activeFilter===f.id?WINE:"#fff", color:activeFilter===f.id?"#fff":"#555", fontSize:13, fontWeight:activeFilter===f.id?700:500, cursor:"pointer", fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap", transition:"all .2s" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Property list */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px 80px" }}>
        {filtered.map(prop=>{
          const st = STATUS_CONFIG[prop.status];
          return (
            <div key={prop.id} style={{ background:"#fff", borderRadius:18, marginBottom:14, overflow:"hidden", border:"1px solid #F0F0F2", boxShadow:"0 2px 10px rgba(0,0,0,.04)" }}>
              {/* Photo */}
              <div style={{ height:140, background:prop.gradient, position:"relative" }}>
                <div style={{ position:"absolute", inset:0, opacity:0.25 }}>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%", background:"rgba(0,0,0,0.3)" }}/>
                  <div style={{ position:"absolute", top:"20%", left:"10%", width:"30%", height:"25%", background:"rgba(255,255,255,0.1)", borderRadius:4 }}/>
                  <div style={{ position:"absolute", top:"20%", left:"50%", width:"25%", height:"20%", background:"rgba(255,255,255,0.08)", borderRadius:4 }}/>
                </div>
                {/* Status badge */}
                <div style={{ position:"absolute", top:10, left:10, padding:"4px 10px", background:st.bg, borderRadius:20, display:"flex", alignItems:"center", gap:5, border:`1px solid ${st.dot}30` }}>
                  <div style={{ width:6, height:6, background:st.dot, borderRadius:"50%" }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:st.color }}>{st.label}</span>
                </div>
                <button style={{ position:"absolute", top:8, right:8, width:32, height:32, background:"rgba(0,0,0,0.35)", border:"none", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <MoreHorizontal size={16} color="#fff"/>
                </button>
              </div>

              {/* Info */}
              <div style={{ padding:"14px 16px" }}>
                <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:"#111", letterSpacing:"-0.2px" }}>{prop.title}</p>
                <p style={{ margin:"0 0 12px", fontSize:12, color:"#8E8E93" }}>{prop.address}</p>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <span style={{ fontSize:18, fontWeight:800, color:WINE }}>${prop.price}<span style={{ fontSize:12, fontWeight:500, color:"#8E8E93" }}>/mes</span></span>
                  <div style={{ display:"flex", gap:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <Eye size={14} color="#8E8E93"/>
                      <span style={{ fontSize:12, color:"#8E8E93" }}>{prop.views}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <MessageSquare size={14} color={prop.requests>0?WINE:"#8E8E93"}/>
                      <span style={{ fontSize:12, color:prop.requests>0?WINE:"#8E8E93", fontWeight:prop.requests>0?700:400 }}>{prop.requests}</span>
                    </div>
                  </div>
                </div>

                <button style={{ width:"100%", padding:"10px", background:"#F8F9FA", border:"1px solid #E5E5EA", borderRadius:12, fontSize:13, fontWeight:600, color:"#555", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
                  Editar publicación
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"#fff", borderTop:"1px solid #F0F0F2", display:"flex", alignItems:"center", justifyContent:"space-around" }}>
        {[
          { icon:<Home size={22}/>, label:"Propiedades", active:true },
          { icon:<Bell size={22}/>, label:"Solicitudes" },
          { icon:<MessageSquare size={22}/>, label:"Mensajes" },
          { icon:<User size={22}/>, label:"Perfil" },
        ].map(it=>(
          <button key={it.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", color:it.active?WINE:"#8E8E93" }}>
            {it.icon}
            <span style={{ fontSize:10, fontWeight:it.active?700:400 }}>{it.label}</span>
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Screen 2: Requests Inbox ── */
function RequestsInboxScreen({ onSelectRequest }: { onSelectRequest:(req:typeof REQUESTS[0])=>void }) {
  const [activeTab, setActiveTab] = useState("pending");
  const tabs = [
    { id:"pending", label:"Pendientes", count:2 },
    { id:"accepted", label:"Aceptadas", count:1 },
    { id:"rejected", label:"Rechazadas", count:0 },
  ];

  return (
    <Shell>
      <StatusBar />
      <div style={{ background:"#fff", padding:"12px 20px 0", borderBottom:"1px solid #F0F0F2", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <p style={{ margin:0, fontSize:18, fontWeight:800, color:"#111", letterSpacing:"-0.4px", flex:1 }}>Solicitudes</p>
          <div style={{ position:"relative" }}>
            <Bell size={22} color="#555"/>
            <div style={{ position:"absolute", top:-2, right:-2, width:8, height:8, background:WINE, borderRadius:"50%" }}/>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display:"flex", gap:0 }}>
          {tabs.map((tab,i)=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ flex:1, padding:"10px 4px", background:"none", border:"none", borderBottom:`2.5px solid ${activeTab===tab.id?WINE:"transparent"}`, cursor:"pointer", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"border-color .2s" }}>
              <span style={{ fontSize:13, fontWeight:activeTab===tab.id?700:500, color:activeTab===tab.id?WINE:"#8E8E93" }}>{tab.label}</span>
              {tab.count > 0 && (
                <div style={{ padding:"2px 7px", background:activeTab===tab.id?WINE:`${WINE}20`, borderRadius:20 }}>
                  <span style={{ fontSize:10, fontWeight:800, color:activeTab===tab.id?"#fff":WINE }}>{tab.count}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 0 80px" }}>
        {REQUESTS.filter((_,i)=> activeTab==="pending"?i<2 : activeTab==="accepted"?i===2:false).map(req=>(
          <button key={req.id} onClick={()=>onSelectRequest(req)} style={{ width:"100%", padding:"14px 20px", display:"flex", gap:14, alignItems:"flex-start", background:req.isNew&&activeTab==="pending"?"rgba(140,21,21,0.02)":"#fff", border:"none", borderBottom:"1px solid #F5F5F7", cursor:"pointer", fontFamily:"'Inter',sans-serif", textAlign:"left" }}>
            {/* Avatar */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:48, height:48, background:`linear-gradient(135deg,${WINE}20,${WINE}10)`, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:16, fontWeight:800, color:WINE }}>{req.avatar}</span>
              </div>
              {req.isNew && activeTab==="pending" && <div style={{ position:"absolute", top:-2, right:-2, width:10, height:10, background:WINE, borderRadius:"50%", border:"2px solid #fff" }}/>}
            </div>
            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:3 }}>
                <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#111" }}>{req.name}</p>
                <span style={{ fontSize:11, color:"#8E8E93", flexShrink:0, marginLeft:8 }}>{req.sent}</span>
              </div>
              <p style={{ margin:"0 0 4px", fontSize:12, color:"#8E8E93" }}>{req.career} · {req.year}</p>
              <p style={{ margin:"0 0 6px", fontSize:12, color:"#555", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{req.msg.substring(0,55)}…"</p>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Home size={11} color="#8E8E93"/>
                <span style={{ fontSize:11, color:"#8E8E93" }}>{req.property}</span>
              </div>
            </div>
            <ChevronRight size={16} color="#C7C7CC" style={{ flexShrink:0, marginTop:4 }}/>
          </button>
        ))}

        {activeTab !== "pending" && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ width:64, height:64, background:"#F5F5F7", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <Bell size={28} color="#C7C7CC"/>
            </div>
            <p style={{ margin:"0 0 6px", fontSize:15, fontWeight:700, color:"#555" }}>Sin solicitudes {activeTab==="accepted"?"aceptadas":"rechazadas"}</p>
            <p style={{ margin:0, fontSize:13, color:"#8E8E93" }}>Las solicitudes aparecerán aquí</p>
          </div>
        )}
      </div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"#fff", borderTop:"1px solid #F0F0F2", display:"flex", alignItems:"center", justifyContent:"space-around" }}>
        {[
          { icon:<Home size={22}/>, label:"Propiedades" },
          { icon:<Bell size={22}/>, label:"Solicitudes", active:true },
          { icon:<MessageSquare size={22}/>, label:"Mensajes" },
          { icon:<User size={22}/>, label:"Perfil" },
        ].map(it=>(
          <button key={it.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", color:it.active?WINE:"#8E8E93" }}>
            {it.icon}
            <span style={{ fontSize:10, fontWeight:it.active?700:400 }}>{it.label}</span>
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Screen 3: Review Request ── */
function ReviewRequestScreen({ req, onBack }: { req: typeof REQUESTS[0]; onBack:()=>void }) {
  const [decision, setDecision] = useState<"accepted"|"rejected"|null>(null);

  return (
    <Shell>
      <StatusBar />
      <div style={{ background:"#fff", padding:"12px 20px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid #F0F0F2", flexShrink:0 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:12, background:"#F5F5F7", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <ArrowLeft size={18} color="#111"/>
        </button>
        <p style={{ margin:0, fontSize:17, fontWeight:700, color:"#111", letterSpacing:"-0.3px" }}>Revisar solicitud</p>
        <div style={{ marginLeft:"auto", padding:"3px 10px", background:`${WINE}10`, border:`1px solid ${WINE}25`, borderRadius:20 }}>
          <span style={{ fontSize:11, fontWeight:700, color:WINE }}>Pendiente</span>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 120px" }}>
        {/* Student profile */}
        <div style={{ background:"#fff", borderRadius:20, padding:"20px", border:"1px solid #F0F0F2", marginBottom:16, textAlign:"center" }}>
          <div style={{ width:80, height:80, background:`linear-gradient(135deg,${WINE}25,${WINE}10)`, borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
            <span style={{ fontSize:28, fontWeight:800, color:WINE }}>{req.avatar}</span>
          </div>
          <p style={{ margin:"0 0 4px", fontSize:18, fontWeight:800, color:"#111", letterSpacing:"-0.3px" }}>{req.name}</p>
          <p style={{ margin:"0 0 12px", fontSize:13, color:"#8E8E93" }}>{req.career} · ULEAM · {req.year}</p>

          {/* Verified badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", background:"#ECFDF5", borderRadius:20, border:"1px solid #A7F3D0", marginBottom:16 }}>
            <div style={{ width:14, height:14, background:"#10B981", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Check size={9} color="#fff" strokeWidth={3}/>
            </div>
            <span style={{ fontSize:12, fontWeight:700, color:"#059669" }}>Estudiante verificado ULEAM</span>
          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:0, borderTop:"1px solid #F5F5F7", paddingTop:14 }}>
            {[
              { label:"Cédula", value:"1308456789" },
              { label:"Matrícula", value:"2024-2025" },
              { label:"Referencia", value:"Bienestar" },
            ].map((stat,i)=>(
              <div key={stat.label} style={{ flex:1, textAlign:"center", borderRight:i<2?"1px solid #F5F5F7":"none" }}>
                <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:700, color:"#111" }}>{stat.value}</p>
                <p style={{ margin:0, fontSize:11, color:"#8E8E93" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Property interested */}
        <div style={{ background:"#fff", borderRadius:16, padding:"14px", border:"1px solid #F0F0F2", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ width:52, height:52, borderRadius:12, background:"linear-gradient(135deg,#667eea,#764ba2)", flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:700, color:"#111" }}>{req.property}</p>
            <p style={{ margin:"0 0 4px", fontSize:12, color:"#8E8E93" }}>$180/mes · Olmedo 245, Manta</p>
            <div style={{ display:"inline-flex", padding:"2px 8px", background:"#ECFDF5", borderRadius:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:"#059669" }}>Disponible</span>
            </div>
          </div>
        </div>

        {/* Student message */}
        <div style={{ background:"#fff", borderRadius:16, padding:"16px", border:"1px solid #F0F0F2", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <MessageSquare size={15} color="#8E8E93"/>
            <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#8E8E93" }}>Mensaje del estudiante</p>
            <span style={{ marginLeft:"auto", fontSize:11, color:"#C7C7CC" }}>{req.sent}</span>
          </div>
          <p style={{ margin:0, fontSize:14, color:"#111", lineHeight:1.6 }}>"{req.msg}"</p>
        </div>

        {/* Time info */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"#FFFBEB", borderRadius:12, border:"1px solid #FDE68A" }}>
          <Clock size={14} color="#D97706"/>
          <p style={{ margin:0, fontSize:12, color:"#92400E" }}>Solicitud recibida <strong>{req.sent}</strong>. Responde antes de 48 horas.</p>
        </div>

        {/* Decision feedback */}
        {decision && (
          <div style={{ marginTop:14, padding:"14px 16px", background:decision==="accepted"?"#ECFDF5":"#FEF2F2", borderRadius:14, border:`1.5px solid ${decision==="accepted"?"#A7F3D0":"#FECACA"}`, display:"flex", gap:10, alignItems:"center" }}>
            {decision==="accepted" ? <Check size={18} color="#059669"/> : <X size={18} color="#EF4444"/>}
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:decision==="accepted"?"#065F46":"#991B1B" }}>
              {decision==="accepted" ? "¡Solicitud aceptada! El estudiante será notificado." : "Solicitud rechazada. El estudiante será notificado."}
            </p>
          </div>
        )}
      </div>

      {/* Fixed action buttons */}
      {!decision && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"12px 20px 24px", background:"linear-gradient(to top,#F8F9FA 70%,transparent)", display:"flex", gap:12 }}>
          <button onClick={()=>setDecision("rejected")} style={{ flex:1, padding:"15px", background:"#fff", border:"2px solid #E5E5EA", borderRadius:16, fontSize:15, fontWeight:700, color:"#6B7280", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
            Rechazar
          </button>
          <button onClick={()=>setDecision("accepted")} style={{ flex:2, padding:"15px", background:`linear-gradient(135deg,${WINE} 0%,${WINE_DARK} 100%)`, border:"none", borderRadius:16, fontSize:15, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", boxShadow:`0 6px 20px ${WINE}50` }}>
            Aceptar inquilino
          </button>
        </div>
      )}
    </Shell>
  );
}

export function LandlordMobileModule() {
  const [activeScreen, setActiveScreen] = useState<"properties"|"requests"|"review">("properties");
  const [selectedReq, setSelectedReq] = useState(REQUESTS[0]);

  return (
    <div style={{ display:"flex", gap:40, alignItems:"flex-start", flexWrap:"wrap" }}>
      <MyPropertiesScreen onRequestsClick={()=>setActiveScreen("requests")} />
      <RequestsInboxScreen onSelectRequest={req=>{ setSelectedReq(req); setActiveScreen("review"); }} />
      <ReviewRequestScreen req={selectedReq} onBack={()=>setActiveScreen("requests")} />
    </div>
  );
}
