import { useState } from "react";
import { Search, Bell, ChevronDown, Eye, Ban, CheckCircle, AlertTriangle, MessageSquare, Send, Home, Users, FileText, BarChart2, Settings, LogOut, MoreHorizontal, ExternalLink } from "lucide-react";

const WINE = "#8C1515";
const SIDEBAR_BG = "#1E1E2E";

/* ── Shared Sidebar ── */
function Sidebar({ active }: { active: string }) {
  const navItems = [
    { id:"dashboard", icon:<BarChart2 size={18}/>, label:"Dashboard" },
    { id:"properties", icon:<Home size={18}/>, label:"Propiedades", badge:12 },
    { id:"users", icon:<Users size={18}/>, label:"Usuarios" },
    { id:"reports", icon:<FileText size={18}/>, label:"Reportes", badge:5 },
    { id:"settings", icon:<Settings size={18}/>, label:"Configuración" },
  ];
  return (
    <div style={{ width:220, background:SIDEBAR_BG, display:"flex", flexDirection:"column", flexShrink:0, height:"100%" }}>
      {/* Logo */}
      <div style={{ padding:"22px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:WINE, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#fff", fontSize:15, fontWeight:800 }}>U</span>
          </div>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#fff" }}>ULEAM Rental</p>
            <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.35)" }}>Panel Administrativo</p>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 10px" }}>
        {navItems.map(item=>(
          <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, marginBottom:2, background:active===item.id?"rgba(255,255,255,0.08)":"transparent", cursor:"pointer", position:"relative" }}>
            <span style={{ color:active===item.id?WINE==="#8C1515"?"#ff9090":"#ff8080":active===item.id?"#ff8080":"rgba(255,255,255,0.45)" }}>{item.icon}</span>
            <span style={{ fontSize:13, fontWeight:active===item.id?600:400, color:active===item.id?"#fff":"rgba(255,255,255,0.45)", flex:1 }}>{item.label}</span>
            {item.badge && <span style={{ fontSize:10, fontWeight:700, padding:"2px 6px", background:WINE, color:"#fff", borderRadius:20 }}>{item.badge}</span>}
            {active===item.id && <div style={{ position:"absolute", left:0, top:"20%", bottom:"20%", width:3, background:WINE, borderRadius:"0 2px 2px 0" }}/>}
          </div>
        ))}
      </nav>
      {/* User */}
      <div style={{ padding:"16px 14px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, background:`${WINE}50`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:12, fontWeight:700, color:"#ff9090" }}>AD</span>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#fff" }}>Admin ULEAM</p>
          <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.35)" }}>Superadministrador</p>
        </div>
        <LogOut size={15} color="rgba(255,255,255,0.35)" style={{ cursor:"pointer" }}/>
      </div>
    </div>
  );
}

/* ── Shared Top Header ── */
function TopHeader({ title, subtitle, actions }: { title:string; subtitle:string; actions?: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 32px", borderBottom:"1px solid #F0F0F2", background:"#fff", flexShrink:0 }}>
      <div>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#111", letterSpacing:"-0.4px" }}>{title}</h1>
        <p style={{ margin:0, fontSize:13, color:"#8E8E93" }}>{subtitle}</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#F8F9FA", border:"1px solid #E5E5EA", borderRadius:10, padding:"8px 14px" }}>
          <Search size={15} color="#8E8E93"/>
          <input placeholder="Buscar…" style={{ border:"none", background:"transparent", outline:"none", fontSize:13, color:"#111", width:160, fontFamily:"'Inter',sans-serif" }}/>
        </div>
        <div style={{ position:"relative" }}>
          <button style={{ width:38, height:38, background:"#F8F9FA", border:"1px solid #E5E5EA", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Bell size={17} color="#555"/>
          </button>
          <div style={{ position:"absolute", top:8, right:8, width:8, height:8, background:WINE, borderRadius:"50%" }}/>
        </div>
        <div style={{ width:36, height:36, background:`${WINE}20`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:13, fontWeight:800, color:WINE }}>AD</span>
        </div>
        {actions}
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  pending:   { label:"Pendiente",  bg:"#FFFBEB", color:"#D97706", border:"#FDE68A" },
  approved:  { label:"Aprobada",   bg:"#ECFDF5", color:"#059669", border:"#A7F3D0" },
  rejected:  { label:"Rechazada",  bg:"#FEF2F2", color:"#EF4444", border:"#FECACA" },
  active:    { label:"Activo",     bg:"#ECFDF5", color:"#059669", border:"#A7F3D0" },
  suspended: { label:"Suspendido", bg:"#FEF2F2", color:"#EF4444", border:"#FECACA" },
  review:    { label:"En revisión",bg:"#FFFBEB", color:"#D97706", border:"#FDE68A" },
};

function Badge({ type }: { type: keyof typeof STATUS_BADGE }) {
  const s = STATUS_BADGE[type];
  return (
    <span style={{ padding:"3px 10px", background:s.bg, color:s.color, fontSize:11, fontWeight:700, borderRadius:20, border:`1px solid ${s.border}`, whiteSpace:"nowrap" }}>{s.label}</span>
  );
}

/* ── View 1: Property Approval ── */
const PROPERTIES_DATA = [
  { id:"PR001", photo:"linear-gradient(135deg,#667eea,#764ba2)", title:"Habitación privada Calle Olmedo", landlord:"Carlos Mendoza", address:"Olmedo 245, Manta", date:"2026-05-20", status:"pending" as const },
  { id:"PR002", photo:"linear-gradient(135deg,#f093fb,#f5576c)", title:"Mini depa 2 ambientes amoblado", landlord:"Rosa Vera Ponce", address:"Av. Universitaria 890", date:"2026-05-19", status:"review" as const },
  { id:"PR003", photo:"linear-gradient(135deg,#4facfe,#00f2fe)", title:"Suite ejecutiva con vista al mar", landlord:"Andrés Mora", address:"Malecón 456, Manta", date:"2026-05-18", status:"pending" as const },
  { id:"PR004", photo:"linear-gradient(135deg,#43e97b,#38f9d7)", title:"Habitación compartida económica", landlord:"Elena Chávez", address:"Calle 10 de Agosto 123", date:"2026-05-17", status:"approved" as const },
  { id:"PR005", photo:"linear-gradient(135deg,#fa709a,#fee140)", title:"Departamento 3 hab. zona tranquila", landlord:"Manuel Ponce", address:"Av. 4 de Noviembre 789", date:"2026-05-16", status:"rejected" as const },
];

function PropertyApprovalView() {
  const [selected, setSelected] = useState<string|null>(null);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <TopHeader title="Aprobación de Propiedades" subtitle="Revisa y aprueba los nuevos anuncios publicados"/>
      {/* Stats */}
      <div style={{ display:"flex", gap:16, padding:"20px 32px", flexShrink:0 }}>
        {[
          { label:"Pendientes", value:12, color:WINE, bg:`${WINE}10`, border:`${WINE}20` },
          { label:"En revisión", value:5, color:"#D97706", bg:"#FFFBEB", border:"#FDE68A" },
          { label:"Aprobadas hoy", value:8, color:"#059669", bg:"#ECFDF5", border:"#A7F3D0" },
          { label:"Rechazadas", value:3, color:"#EF4444", bg:"#FEF2F2", border:"#FECACA" },
        ].map(s=>(
          <div key={s.label} style={{ flex:1, background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:"14px 18px" }}>
            <p style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:s.color }}>{s.value}</p>
            <p style={{ margin:0, fontSize:12, color:s.color, fontWeight:500, opacity:0.8 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 32px 32px" }}>
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #F0F0F2", overflow:"hidden" }}>
          {/* Table header */}
          <div style={{ display:"grid", gridTemplateColumns:"60px 1fr 160px 180px 110px 110px 180px", gap:0, padding:"12px 20px", background:"#F8F9FA", borderBottom:"1px solid #F0F0F2" }}>
            {["Foto","Título del anuncio","Arrendador","Dirección","Fecha","Estado","Acciones"].map(col=>(
              <p key={col} style={{ margin:0, fontSize:11, fontWeight:700, color:"#8E8E93", textTransform:"uppercase", letterSpacing:"0.4px" }}>{col}</p>
            ))}
          </div>
          {PROPERTIES_DATA.map((prop,i)=>(
            <div key={prop.id} style={{ display:"grid", gridTemplateColumns:"60px 1fr 160px 180px 110px 110px 180px", gap:0, padding:"14px 20px", borderBottom:i<PROPERTIES_DATA.length-1?"1px solid #F5F5F7":"none", alignItems:"center", background:selected===prop.id?`${WINE}04`:"transparent", transition:"background .15s" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:prop.photo, flexShrink:0 }}/>
              <div>
                <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:700, color:"#111" }}>{prop.title}</p>
                <p style={{ margin:0, fontSize:11, color:"#8E8E93" }}>ID: {prop.id}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:28, background:`${WINE}15`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:WINE }}>{prop.landlord.split(" ").map(w=>w[0]).join("").slice(0,2)}</span>
                </div>
                <span style={{ fontSize:12, color:"#555", fontWeight:500 }}>{prop.landlord}</span>
              </div>
              <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>{prop.address}</p>
              <p style={{ margin:0, fontSize:12, color:"#555" }}>{prop.date.slice(5)}</p>
              <Badge type={prop.status}/>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setSelected(selected===prop.id?null:prop.id)} style={{ padding:"7px 14px", background:`${WINE}10`, border:`1px solid ${WINE}30`, borderRadius:8, fontSize:12, fontWeight:700, color:WINE, cursor:"pointer", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                  <Eye size={13}/> Revisar
                </button>
                <button style={{ width:32, height:32, background:"#F5F5F7", border:"1px solid #E5E5EA", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <MoreHorizontal size={14} color="#555"/>
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16 }}>
          <p style={{ margin:0, fontSize:13, color:"#8E8E93" }}>Mostrando 1–5 de 12 resultados</p>
          <div style={{ display:"flex", gap:6 }}>
            {["←","1","2","3","→"].map((p,i)=>(
              <button key={i} style={{ width:32, height:32, borderRadius:8, border:"1px solid #E5E5EA", background:p==="1"?WINE:"#fff", color:p==="1"?"#fff":"#555", fontSize:13, fontWeight:p==="1"?700:400, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── View 2: User Management ── */
const USERS_DATA = [
  { id:"U001", name:"Andrea Murillo López", email:"a.murillo@uleam.edu.ec", role:"Estudiante", status:"active" as const, joined:"2026-02-14", avatar:"AM" },
  { id:"U002", name:"Carlos Mendoza Torres", email:"cmendoza@gmail.com", role:"Arrendador", status:"active" as const, joined:"2026-01-08", avatar:"CM" },
  { id:"U003", name:"Valeria Intriago Ponce", email:"v.intriago@uleam.edu.ec", role:"Estudiante", status:"active" as const, joined:"2026-03-22", avatar:"VI" },
  { id:"U004", name:"José Párraga Cumbicus", email:"jparraga@gmail.com", role:"Arrendador", status:"suspended" as const, joined:"2025-11-15", avatar:"JP" },
  { id:"U005", name:"Luisa Moreira Flor", email:"l.moreira@uleam.edu.ec", role:"Estudiante", status:"active" as const, joined:"2026-04-01", avatar:"LM" },
  { id:"U006", name:"Roberto Chávez Vera", email:"rchavez@gmail.com", role:"Arrendador", status:"suspended" as const, joined:"2026-01-30", avatar:"RC" },
];

const ROLE_COLORS: Record<string,{ bg:string; color:string }> = {
  "Estudiante":    { bg:"#EFF6FF", color:"#3B82F6" },
  "Arrendador":   { bg:"#F5F3FF", color:"#8B5CF6" },
  "Administrador":{ bg:`${WINE}10`, color:WINE },
};

function UserManagementView() {
  const [users, setUsers] = useState(USERS_DATA);

  const toggleStatus = (id:string) => {
    setUsers(prev=>prev.map(u=>u.id===id ? { ...u, status: u.status==="active"?"suspended":"active" as const } : u));
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <TopHeader title="Gestión de Usuarios" subtitle="Administra las cuentas registradas en la plataforma"
        actions={
          <button style={{ padding:"9px 18px", background:`linear-gradient(135deg,${WINE},#6B1010)`, border:"none", borderRadius:10, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
            + Añadir usuario
          </button>
        }
      />
      {/* Summary */}
      <div style={{ display:"flex", gap:16, padding:"20px 32px", flexShrink:0 }}>
        {[
          { label:"Total usuarios", value:users.length },
          { label:"Estudiantes", value:users.filter(u=>u.role==="Estudiante").length },
          { label:"Arrendadores", value:users.filter(u=>u.role==="Arrendador").length },
          { label:"Suspendidos", value:users.filter(u=>u.status==="suspended").length },
        ].map(s=>(
          <div key={s.label} style={{ flex:1, background:"#fff", border:"1px solid #F0F0F2", borderRadius:12, padding:"14px 18px" }}>
            <p style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:"#111" }}>{s.value}</p>
            <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 32px 32px" }}>
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #F0F0F2", overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 180px 120px 110px 110px 200px", gap:0, padding:"12px 20px", background:"#F8F9FA", borderBottom:"1px solid #F0F0F2" }}>
            {["Usuario","Correo electrónico","Rol","Estado","Registro","Acciones"].map(col=>(
              <p key={col} style={{ margin:0, fontSize:11, fontWeight:700, color:"#8E8E93", textTransform:"uppercase", letterSpacing:"0.4px" }}>{col}</p>
            ))}
          </div>
          {users.map((u,i)=>{
            const rolStyle = ROLE_COLORS[u.role] || ROLE_COLORS["Estudiante"];
            return (
              <div key={u.id} style={{ display:"grid", gridTemplateColumns:"1fr 180px 120px 110px 110px 200px", gap:0, padding:"14px 20px", borderBottom:i<users.length-1?"1px solid #F5F5F7":"none", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, background:u.status==="suspended"?"#F5F5F7":`${WINE}15`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:u.status==="suspended"?"#9CA3AF":WINE }}>{u.avatar}</span>
                  </div>
                  <div>
                    <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:u.status==="suspended"?"#9CA3AF":"#111" }}>{u.name}</p>
                    <p style={{ margin:0, fontSize:11, color:"#C7C7CC" }}>ID: {u.id}</p>
                  </div>
                </div>
                <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>{u.email}</p>
                <span style={{ padding:"3px 10px", background:rolStyle.bg, color:rolStyle.color, fontSize:11, fontWeight:700, borderRadius:20, display:"inline-block" }}>{u.role}</span>
                <Badge type={u.status}/>
                <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>{u.joined.slice(5)}/{u.joined.slice(0,4)}</p>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>toggleStatus(u.id)} style={{ padding:"7px 14px", background:u.status==="active"?"#FEF2F2":"#ECFDF5", border:`1px solid ${u.status==="active"?"#FECACA":"#A7F3D0"}`, borderRadius:8, fontSize:12, fontWeight:700, color:u.status==="active"?"#EF4444":"#059669", cursor:"pointer", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                    {u.status==="active" ? <><Ban size={13}/>Suspender</> : <><CheckCircle size={13}/>Activar</>}
                  </button>
                  <button style={{ width:32, height:32, background:"#F5F5F7", border:"1px solid #E5E5EA", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <ExternalLink size={13} color="#555"/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── View 3: Reports Center ── */
const REPORTS_DATA = [
  { id:"R001", reporter:"Luis Reyes Espinoza", category:"Publicación falsa", time:"Hace 1 h", preview:"El anuncio no corresponde a la realidad…", isNew:true, full:"El anuncio del mini departamento muestra fotos que no corresponden a la propiedad real. Cuando visité, el inmueble estaba en mal estado. Solicito que se retire la publicación.", property:"Mini depa Av. Universitaria", status:"open" },
  { id:"R002", reporter:"Camila Moreira Solano", category:"Arrendador irrespetuoso", time:"Hace 3 h", preview:"El propietario no respeta los términos…", isNew:true, full:"El arrendador intentó cobrar un valor diferente al anunciado. Además no responde mensajes a tiempo y falta a las citas de visita acordadas.", property:"Habitación privada Olmedo 245", status:"open" },
  { id:"R003", reporter:"Marco Intriago Vera", category:"Precio desactualizado", time:"Ayer 14:30", preview:"El precio real es diferente al mostrado…", isNew:false, full:"El precio en la plataforma dice $180 pero el arrendador cobra $220. Hay una diferencia significativa que confunde a los estudiantes.", property:"Suite ejecutiva Centro", status:"in_review" },
  { id:"R004", reporter:"Sofía Ponce Alcívar", category:"Fotos engañosas", time:"Hace 2 días", preview:"Las fotos no corresponden al inmueble…", isNew:false, full:"Las fotos muestran un departamento completamente diferente al que visité. Es publicidad engañosa.", property:"Depa 3 hab. Av. 4 Nov.", status:"open" },
];

function ReportsCenterView() {
  const [selected, setSelected] = useState(REPORTS_DATA[0]);
  const [note, setNote] = useState("");
  const [resolved, setResolved] = useState<string[]>([]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <TopHeader title="Centro de Reportes" subtitle="Gestiona las quejas y reportes enviados por los usuarios"/>
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Left panel – list */}
        <div style={{ width:340, borderRight:"1px solid #F0F0F2", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid #F0F0F2", background:"#F8F9FA" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #E5E5EA", borderRadius:10, padding:"8px 12px" }}>
              <Search size={14} color="#8E8E93"/>
              <input placeholder="Buscar reportes…" style={{ border:"none", background:"transparent", outline:"none", fontSize:13, color:"#111", fontFamily:"'Inter',sans-serif", flex:1 }}/>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {REPORTS_DATA.map(r=>(
              <button key={r.id} onClick={()=>setSelected(r)} style={{ width:"100%", padding:"14px 20px", display:"flex", gap:12, alignItems:"flex-start", background:selected.id===r.id?`${WINE}06`:r.isNew?"rgba(140,21,21,0.02)":"#fff", border:"none", borderBottom:"1px solid #F5F5F7", cursor:"pointer", textAlign:"left", fontFamily:"'Inter',sans-serif" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:36, height:36, background:resolved.includes(r.id)?"#ECFDF5":`${WINE}15`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <AlertTriangle size={16} color={resolved.includes(r.id)?"#10B981":WINE}/>
                  </div>
                  {r.isNew && !resolved.includes(r.id) && <div style={{ position:"absolute", top:-2, right:-2, width:8, height:8, background:WINE, borderRadius:"50%" }}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:selected.id===r.id?WINE:"#111" }}>{r.reporter.split(" ")[0]}</p>
                    <span style={{ fontSize:11, color:"#C7C7CC" }}>{r.time}</span>
                  </div>
                  <p style={{ margin:"0 0 3px", fontSize:12, fontWeight:600, color:"#8E8E93" }}>{r.category}</p>
                  <p style={{ margin:0, fontSize:12, color:"#C7C7CC", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.preview}</p>
                </div>
                {selected.id===r.id && <div style={{ width:3, height:"100%", background:WINE, borderRadius:2, position:"absolute", right:0, top:0 }}/>}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel – detail */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Report header */}
          <div style={{ padding:"20px 28px", borderBottom:"1px solid #F0F0F2", background:"#fff" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ padding:"3px 10px", background:`${WINE}10`, color:WINE, fontSize:11, fontWeight:700, borderRadius:20, border:`1px solid ${WINE}25` }}>{selected.category}</span>
                  <span style={{ fontSize:12, color:"#8E8E93" }}>{selected.id} · {selected.time}</span>
                  {resolved.includes(selected.id) && <span style={{ padding:"3px 10px", background:"#ECFDF5", color:"#059669", fontSize:11, fontWeight:700, borderRadius:20, border:"1px solid #A7F3D0" }}>Resuelto</span>}
                </div>
                <h3 style={{ margin:"0 0 4px", fontSize:16, fontWeight:800, color:"#111" }}>Reporte de: {selected.reporter}</h3>
                <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>Propiedad: {selected.property}</p>
              </div>
              <button style={{ padding:"8px 16px", background:`${WINE}10`, border:`1px solid ${WINE}25`, borderRadius:10, fontSize:13, fontWeight:600, color:WINE, cursor:"pointer", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                <ExternalLink size={13}/> Ver propiedad
              </button>
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
            {/* Full description */}
            <div style={{ background:"#F8F9FA", borderRadius:14, padding:"18px", marginBottom:20, border:"1px solid #F0F0F2" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <MessageSquare size={15} color="#8E8E93"/>
                <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#8E8E93", textTransform:"uppercase", letterSpacing:"0.4px" }}>Descripción del reporte</p>
              </div>
              <p style={{ margin:0, fontSize:14, color:"#333", lineHeight:1.7 }}>{selected.full}</p>
            </div>

            {/* Reporter info */}
            <div style={{ background:"#fff", borderRadius:14, padding:"16px", marginBottom:20, border:"1px solid #F0F0F2", display:"flex", gap:14, alignItems:"center" }}>
              <div style={{ width:44, height:44, background:`${WINE}15`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:14, fontWeight:700, color:WINE }}>{selected.reporter.split(" ").map(w=>w[0]).join("").slice(0,2)}</span>
              </div>
              <div>
                <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"#111" }}>{selected.reporter}</p>
                <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>Estudiante verificado · ULEAM</p>
              </div>
              <div style={{ marginLeft:"auto", padding:"4px 12px", background:"#ECFDF5", borderRadius:20, border:"1px solid #A7F3D0" }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#059669" }}>Verificado</span>
              </div>
            </div>

            {/* Resolution note */}
            <div style={{ background:"#fff", borderRadius:14, padding:"18px", border:"1px solid #F0F0F2", marginBottom:16 }}>
              <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:700, color:"#111" }}>Añadir nota de resolución</p>
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe las acciones tomadas para resolver este reporte…" rows={4} style={{ width:"100%", border:"1.5px solid #E5E5EA", borderRadius:12, padding:"12px", fontSize:14, color:"#111", outline:"none", fontFamily:"'Inter',sans-serif", resize:"vertical", boxSizing:"border-box", background:"#F8F9FA", lineHeight:1.6 }} onFocus={e=>e.currentTarget.style.borderColor=WINE} onBlur={e=>e.currentTarget.style.borderColor="#E5E5EA"}/>
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button style={{ flex:1, padding:"12px", background:"#fff", border:"1.5px solid #E5E5EA", borderRadius:12, fontSize:14, fontWeight:600, color:"#555", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
                Escalar a dirección
              </button>
              <button onClick={()=>{ if(!resolved.includes(selected.id)) setResolved([...resolved,selected.id]); }} style={{ flex:2, padding:"12px", background:resolved.includes(selected.id)?"#10B981":`linear-gradient(135deg,${WINE},#6B1010)`, border:"none", borderRadius:12, fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <Send size={15}/>
                {resolved.includes(selected.id) ? "Marcado como resuelto" : "Marcar como resuelto"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
const VIEWS = [
  { id:"properties", label:"Aprobación de Propiedades" },
  { id:"users", label:"Gestión de Usuarios" },
  { id:"reports", label:"Centro de Reportes" },
];

export function AdminExtendedModule() {
  const [activeView, setActiveView] = useState("properties");

  return (
    <div style={{ width:1440, fontFamily:"'Inter',sans-serif" }}>
      {/* Sub-view selector */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:"rgba(255,255,255,0.05)", padding:4, borderRadius:14, border:"1px solid rgba(255,255,255,0.07)", width:"fit-content" }}>
        {VIEWS.map(v=>(
          <button key={v.id} onClick={()=>setActiveView(v.id)} style={{ padding:"8px 18px", borderRadius:10, border:"none", background:activeView===v.id?WINE:"transparent", color:activeView===v.id?"#fff":"rgba(255,255,255,0.45)", fontSize:12, fontWeight:activeView===v.id?700:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all .2s", fontFamily:"'Inter',sans-serif" }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Desktop frame */}
      <div style={{ width:"100%", height:700, background:"#F8F9FA", borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 24px 80px rgba(0,0,0,0.4)", display:"flex" }}>
        <Sidebar active={activeView==="properties"?"properties":activeView==="users"?"users":"reports"}/>
        {activeView==="properties" && <PropertyApprovalView/>}
        {activeView==="users" && <UserManagementView/>}
        {activeView==="reports" && <ReportsCenterView/>}
      </div>
    </div>
  );
}
