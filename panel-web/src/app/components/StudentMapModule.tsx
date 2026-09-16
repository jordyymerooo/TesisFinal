import { useState } from "react";
import { Search, MapPin, Navigation, X, Star, SlidersHorizontal, Filter, Heart, Compass, MessageCircle, User } from "lucide-react";

const WINE = "#8C1515";
const WINE_DARK = "#6B1010";

function StatusBar() {
  return (
    <div style={{ padding:"14px 24px 0", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
      <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>9:41</span>
      <div style={{ display:"flex", gap:5, alignItems:"center" }}>
        <div style={{ display:"flex", gap:2 }}>{[3,2.5,2,1.5].map((h,i)=><div key={i} style={{ width:3, height:h*3, background:i<3?"#fff":"rgba(255,255,255,0.4)", borderRadius:1, alignSelf:"flex-end" }}/>)}</div>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 2.5C9.8 2.5 11.4 3.2 12.6 4.4L14 3C12.4 1.4 10.3.5 8 .5 5.7.5 3.6 1.4 2 3L3.4 4.4C4.6 3.2 6.2 2.5 8 2.5Z" fill="#fff"/><path d="M8 5.5C9 5.5 9.9 5.9 10.6 6.6L12 5.2C10.9 4.1 9.5 3.5 8 3.5 6.5 3.5 5.1 4.1 4 5.2L5.4 6.6C6.1 5.9 7 5.5 8 5.5Z" fill="#fff"/><circle cx="8" cy="9.5" r="1.5" fill="#fff"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke="#fff" strokeOpacity=".5"/><rect x="2" y="2" width="16" height="8" rx="2" fill="#fff"/><path d="M23 4.5V7.5C23.8 7.2 24.5 6.4 24.5 6 24.5 5.6 23.8 4.8 23 4.5Z" fill="#fff" fillOpacity=".4"/></svg>
      </div>
    </div>
  );
}

function Shell({ children, bg="#fff" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div style={{ width:390, height:844, background:bg, fontFamily:"'Inter',sans-serif", borderRadius:44, boxShadow:"0 32px 80px rgba(0,0,0,.22)", display:"flex", flexDirection:"column", border:"10px solid #1a1a1a", overflow:"hidden", position:"relative" }}>
      {children}
    </div>
  );
}

function BottomNav() {
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)", borderTop:"1px solid rgba(0,0,0,0.06)", display:"flex", alignItems:"center", justifyContent:"space-around", padding:"0 8px" }}>
      {[
        { icon:<Compass size={22}/>, label:"Explorar" },
        { icon:<MapPin size={22}/>, label:"Mapa", active:true },
        { icon:<Heart size={22}/>, label:"Guardados" },
        { icon:<MessageCircle size={22}/>, label:"Mensajes" },
        { icon:<User size={22}/>, label:"Perfil" },
      ].map(it=>(
        <button key={it.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", color:it.active?WINE:"#8E8E93", padding:"6px 10px", position:"relative" }}>
          {it.active && <div style={{ position:"absolute", top:-8, width:24, height:3, background:WINE, borderRadius:"0 0 4px 4px" }}/>}
          {it.icon}
          <span style={{ fontSize:10, fontWeight:it.active?700:400 }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Price Pin ── */
function PricePin({ price, x, y, selected=false, onClick }: { price:string; x:number; y:number; selected?:boolean; onClick?:()=>void }) {
  return (
    <div onClick={onClick} style={{ position:"absolute", left:x, top:y, transform:"translate(-50%,-100%)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", zIndex:selected?10:5 }}>
      <div style={{ background:selected?WINE:"#fff", color:selected?"#fff":"#111", fontSize:selected?12:11, fontWeight:800, padding:`${selected?"6px 12px":"5px 10px"}`, borderRadius:selected?20:16, boxShadow:selected?`0 4px 16px ${WINE}60`:"0 3px 12px rgba(0,0,0,0.18)", border:selected?`2px solid ${WINE}`:"1.5px solid #E5E5EA", transition:"all .2s", whiteSpace:"nowrap", transform:selected?"scale(1.1)":"scale(1)" }}>
        {price}
      </div>
      <div style={{ width:0, height:0, borderLeft:`${selected?6:5}px solid transparent`, borderRight:`${selected?6:5}px solid transparent`, borderTop:`${selected?8:7}px solid ${selected?WINE:"#fff"}`, filter:selected?"drop-shadow(0 2px 4px rgba(140,21,21,0.4))":"drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}/>
    </div>
  );
}

/* ── Map SVG ── */
function MapView({ onPinClick }: { onPinClick?:(pin:number)=>void }) {
  return (
    <div style={{ position:"relative", width:"100%", flex:1, overflow:"hidden" }}>
      <svg width="370" height="100%" viewBox="0 0 370 560" preserveAspectRatio="xMidYMid slice" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
        <rect width="370" height="560" fill="#E8EEE4"/>
        {/* Parks */}
        <rect x="0" y="0" width="370" height="560" fill="#EDF2E8"/>
        {/* H-roads */}
        {[70,150,230,310,420].map(y=><rect key={y} x="0" y={y} width="370" height="16" fill="#fff"/>)}
        {/* V-roads */}
        {[50,120,200,280,350].map(x=><rect key={x} x={x} y="0" width="16" height="560" fill="#fff"/>)}
        {/* Blocks */}
        <rect x="66" y="6" width="54" height="64" rx="2" fill="#D8E4D0"/>
        <rect x="136" y="6" width="64" height="64" rx="2" fill="#C8D8BF"/>
        {/* ULEAM */}
        <rect x="136" y="6" width="64" height="64" rx="3" fill="#B8CEB0"/>
        <text x="168" y="36" textAnchor="middle" fontSize="7" fill="#4A6B41" fontWeight="800" fontFamily="Inter">ULEAM</text>
        <text x="168" y="48" textAnchor="middle" fontSize="6" fill="#5A7B51" fontFamily="Inter">Campus Central</text>
        <rect x="216" y="6" width="64" height="64" rx="2" fill="#D8E4D0"/>
        <rect x="296" y="6" width="70" height="64" rx="2" fill="#D0DCC8"/>
        <rect x="66" y="86" width="54" height="64" rx="2" fill="#D8E4D0"/>
        <rect x="136" y="86" width="64" height="64" rx="2" fill="#DDE7D5"/>
        <rect x="216" y="86" width="64" height="64" rx="2" fill="#D4DFCC"/>
        <rect x="296" y="86" width="70" height="64" rx="2" fill="#D8E4D0"/>
        <rect x="0" y="86" width="50" height="64" rx="2" fill="#CEDBCC"/>
        <rect x="66" y="166" width="54" height="64" rx="2" fill="#D4DFD0"/>
        <rect x="136" y="166" width="64" height="64" rx="2" fill="#D8E4D0"/>
        <rect x="216" y="166" width="64" height="64" rx="2" fill="#D0DCC8"/>
        <rect x="296" y="166" width="70" height="64" rx="2" fill="#D4DFCC"/>
        <rect x="0" y="166" width="50" height="64" rx="2" fill="#D8E4D0"/>
        <rect x="66" y="246" width="54" height="64" rx="2" fill="#DDE7D5"/>
        <rect x="136" y="246" width="64" height="64" rx="2" fill="#D4DFCC"/>
        <rect x="216" y="246" width="64" height="64" rx="2" fill="#D8E4D0"/>
        <rect x="296" y="246" width="70" height="64" rx="2" fill="#CEDBCC"/>
        <rect x="0" y="246" width="50" height="64" rx="2" fill="#D4DFD0"/>
        {/* Road labels */}
        <text x="12" y="147" fontSize="7" fill="#888" fontFamily="Inter" transform="rotate(-90 12 147)">Av. Universitaria</text>
        <text x="170" y="147" fontSize="7" fill="#888" fontFamily="Inter" transform="rotate(-90 170 147)">Av. 4 de Noviembre</text>
        <text x="90" y="225" fontSize="7" fill="#888" fontFamily="Inter">Calle Colón</text>
        <text x="90" y="305" fontSize="7" fill="#888" fontFamily="Inter">Calle 10 de Agosto</text>
        {/* User location dot */}
        <circle cx="168" cy="230" r="8" fill="#4285F4" opacity="0.2"/>
        <circle cx="168" cy="230" r="5" fill="#4285F4"/>
        <circle cx="168" cy="230" r="2" fill="#fff"/>
      </svg>

      {/* Price pins */}
      <PricePin price="$180/mes" x={95} y={200} onClick={()=>onPinClick?.(0)} />
      <PricePin price="$220/mes" x={265} y={120} onClick={()=>onPinClick?.(1)} />
      <PricePin price="$150/mes" x={195} y={290} onClick={()=>onPinClick?.(2)} selected />
      <PricePin price="$195/mes" x={340} y={220} onClick={()=>onPinClick?.(3)} />
      <PricePin price="$210/mes" x={80} y={330} onClick={()=>onPinClick?.(4)} />
    </div>
  );
}

/* ── Screen 1: Map Fullscreen ── */
function MapScreen({ onPinClick }: { onPinClick: ()=>void }) {
  return (
    <Shell>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column" }}>
        <MapView onPinClick={onPinClick} />

        {/* Floating search bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 16px 0" }}>
          <StatusBar />
          <div style={{ marginTop:12, display:"flex", gap:10 }}>
            <div style={{ flex:1, background:"rgba(255,255,255,0.97)", borderRadius:14, display:"flex", alignItems:"center", gap:10, padding:"12px 16px", boxShadow:"0 4px 20px rgba(0,0,0,0.14)", backdropFilter:"blur(8px)" }}>
              <Search size={17} color="#8E8E93" />
              <span style={{ fontSize:14, color:"#8E8E93", flex:1 }}>Buscar cerca de ULEAM…</span>
            </div>
            <button style={{ width:46, height:46, background:"rgba(255,255,255,0.97)", borderRadius:14, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 4px 20px rgba(0,0,0,0.14)", flexShrink:0 }}>
              <SlidersHorizontal size={18} color="#111" />
            </button>
          </div>
          {/* Quick filter chips */}
          <div style={{ display:"flex", gap:8, marginTop:10, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
            {["Todos","< $200","Amoblado","Con wifi","Cerca"].map((chip,i)=>(
              <div key={chip} style={{ background:i===0?"rgba(140,21,21,0.9)":"rgba(255,255,255,0.95)", color:i===0?"#fff":"#333", fontSize:12, fontWeight:i===0?700:500, padding:"6px 14px", borderRadius:20, whiteSpace:"nowrap", backdropFilter:"blur(8px)", border:i===0?"none":"1px solid rgba(255,255,255,0.6)", cursor:"pointer", flexShrink:0 }}>
                {chip}
              </div>
            ))}
          </div>
        </div>

        {/* Zoom + Location controls */}
        <div style={{ position:"absolute", right:16, bottom:130, display:"flex", flexDirection:"column", gap:8 }}>
          {["+","−"].map(btn=>(
            <button key={btn} style={{ width:40, height:40, background:"rgba(255,255,255,0.97)", borderRadius:12, border:"none", cursor:"pointer", fontSize:18, fontWeight:700, color:"#333", boxShadow:"0 3px 12px rgba(0,0,0,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>{btn}</button>
          ))}
          <button style={{ width:40, height:40, background:WINE, borderRadius:12, border:"none", cursor:"pointer", boxShadow:`0 3px 12px ${WINE}50`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Navigation size={17} color="#fff" />
          </button>
        </div>

        <BottomNav />
      </div>
    </Shell>
  );
}

/* ── Screen 2: Bottom Sheet ── */
function BottomSheetScreen() {
  const [saved, setSaved] = useState(false);
  return (
    <Shell>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column" }}>
        {/* Map (reduced) */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          <MapView />
          <div style={{ position:"absolute", top:0, left:0, right:0, padding:"14px 16px 0" }}>
            <StatusBar />
          </div>
        </div>

        {/* Bottom sheet card */}
        <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", padding:"12px 20px 80px", boxShadow:"0 -8px 32px rgba(0,0,0,0.12)" }}>
          {/* Drag handle */}
          <div style={{ width:40, height:4, background:"#E5E5EA", borderRadius:2, margin:"0 auto 16px" }} />

          {/* Property card */}
          <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
            <div style={{ width:96, height:96, borderRadius:14, background:"linear-gradient(135deg,#667eea,#764ba2)", flexShrink:0, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, opacity:0.3 }}>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%", background:"rgba(0,0,0,0.2)" }}/>
                <div style={{ position:"absolute", top:"20%", left:"15%", width:"35%", height:"30%", background:"rgba(255,255,255,0.15)", borderRadius:3 }}/>
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                <div>
                  <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:800, color:"#111", letterSpacing:"-0.3px" }}>Habitación privada luminosa</p>
                  <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>Calle Colón · 180 m de ULEAM</p>
                </div>
                <button onClick={()=>setSaved(!saved)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                  <Heart size={20} color={saved?WINE:"#C7C7CC"} fill={saved?WINE:"none"} />
                </button>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                <div style={{ display:"flex", gap:2 }}>
                  {[1,2,3,4,5].map(s=><Star key={s} size={13} color="#F59E0B" fill={s<=4?"#F59E0B":"none"}/>)}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#111" }}>4.8</span>
                <span style={{ fontSize:11, color:"#8E8E93" }}>· 23 reseñas</span>
              </div>
              <p style={{ margin:0, fontSize:17, fontWeight:800, color:WINE, letterSpacing:"-0.3px" }}>$150<span style={{ fontSize:12, fontWeight:500, color:"#8E8E93" }}>/mes</span></p>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display:"flex", gap:8, marginTop:14, marginBottom:16 }}>
            {["Amoblado","WiFi incluido","1 habitación"].map(tag=>(
              <span key={tag} style={{ fontSize:11, fontWeight:600, padding:"4px 10px", background:"#F5F5F7", borderRadius:8, color:"#555" }}>{tag}</span>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ flex:1, padding:"13px", background:"#fff", border:"1.5px solid #E5E5EA", borderRadius:14, fontSize:14, fontWeight:600, color:"#555", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
              Guardar
            </button>
            <button style={{ flex:2, padding:"13px", background:`linear-gradient(135deg,${WINE} 0%,${WINE_DARK} 100%)`, border:"none", borderRadius:14, fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", boxShadow:`0 4px 16px ${WINE}40` }}>
              Ver detalles
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </Shell>
  );
}

/* ── Screen 3: Filters Modal ── */
function FiltersScreen() {
  const [priceMin, setPriceMin] = useState(80);
  const [priceMax, setPriceMax] = useState(220);
  const [roomType, setRoomType] = useState("Habitación privada");
  const [distance, setDistance] = useState("500 m");
  const [distOpen, setDistOpen] = useState(false);

  const roomTypes = ["Habitación compartida","Habitación privada","Mini departamento","Departamento completo"];
  const distances = ["100 m","300 m","500 m","1 km","2 km","Sin límite"];

  const sliderRange = 350 - 50;
  const minPct = ((priceMin - 50) / sliderRange) * 100;
  const maxPct = ((priceMax - 50) / sliderRange) * 100;

  return (
    <Shell bg="#F8F9FA">
      <div style={{ background:"#fff", padding:"14px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#111", letterSpacing:"-0.4px" }}>Filtros de búsqueda</h2>
          <button style={{ width:34, height:34, background:"#F5F5F7", borderRadius:10, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={16} color="#555" />
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 100px" }}>
        {/* Price range */}
        <div style={{ background:"#fff", borderRadius:16, padding:"18px", marginBottom:14, border:"1px solid #F0F0F2" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#111" }}>Rango de precio</p>
            <span style={{ fontSize:14, fontWeight:800, color:WINE }}>${priceMin} – ${priceMax}</span>
          </div>

          {/* Visual slider track */}
          <div style={{ position:"relative", height:24, marginBottom:16 }}>
            {/* Base track */}
            <div style={{ position:"absolute", top:"50%", left:0, right:0, height:4, background:"#E5E5EA", borderRadius:4, transform:"translateY(-50%)" }}/>
            {/* Active track */}
            <div style={{ position:"absolute", top:"50%", left:`${minPct}%`, right:`${100-maxPct}%`, height:4, background:WINE, borderRadius:4, transform:"translateY(-50%)" }}/>
            {/* Min thumb */}
            <input type="range" min={50} max={priceMax-10} value={priceMin} onChange={e=>setPriceMin(+e.target.value)}
              style={{ position:"absolute", inset:0, width:"100%", opacity:0, cursor:"pointer", zIndex:2 }}/>
            <div style={{ position:"absolute", top:"50%", left:`${minPct}%`, width:22, height:22, background:"#fff", border:`3px solid ${WINE}`, borderRadius:"50%", transform:"translate(-50%,-50%)", boxShadow:`0 2px 8px ${WINE}30`, pointerEvents:"none" }}/>
            {/* Max thumb (overlay on top half) */}
            <input type="range" min={priceMin+10} max={350} value={priceMax} onChange={e=>setPriceMax(+e.target.value)}
              style={{ position:"absolute", inset:0, width:"100%", opacity:0, cursor:"pointer", zIndex:3 }}/>
            <div style={{ position:"absolute", top:"50%", left:`${maxPct}%`, width:22, height:22, background:"#fff", border:`3px solid ${WINE}`, borderRadius:"50%", transform:"translate(-50%,-50%)", boxShadow:`0 2px 8px ${WINE}30`, pointerEvents:"none" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:"#8E8E93" }}>$50 mín.</span>
            <span style={{ fontSize:11, color:"#8E8E93" }}>$350 máx.</span>
          </div>
        </div>

        {/* Room type */}
        <div style={{ background:"#fff", borderRadius:16, padding:"18px", marginBottom:14, border:"1px solid #F0F0F2" }}>
          <p style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:"#111" }}>Tipo de habitación</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {roomTypes.map(type=>{
              const active = roomType === type;
              return (
                <button key={type} onClick={()=>setRoomType(type)} style={{ padding:"9px 16px", borderRadius:50, border:`1.5px solid ${active?WINE:"#E5E5EA"}`, background:active?`${WINE}10`:"#fff", color:active?WINE:"#555", fontSize:13, fontWeight:active?700:500, cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all .2s" }}>
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distance */}
        <div style={{ background:"#fff", borderRadius:16, padding:"18px", border:"1px solid #F0F0F2", position:"relative", zIndex:10 }}>
          <p style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:"#111" }}>Distancia a la universidad</p>
          <button onClick={()=>setDistOpen(!distOpen)} style={{ width:"100%", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#F8F9FA", border:`1.5px solid ${distOpen?WINE:"#E5E5EA"}`, borderRadius:12, cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
            <span style={{ fontSize:14, color:"#111", fontWeight:600 }}>{distance}</span>
            <Filter size={16} color={distOpen?WINE:"#8E8E93"} style={{ transform:distOpen?"rotate(180deg)":"none", transition:"transform .2s" }}/>
          </button>
          {distOpen && (
            <div style={{ position:"absolute", left:18, right:18, top:"100%", marginTop:4, background:"#fff", border:"1.5px solid #E5E5EA", borderRadius:14, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.1)", zIndex:20 }}>
              {distances.map((d,i)=>(
                <button key={d} onClick={()=>{ setDistance(d); setDistOpen(false); }} style={{ width:"100%", padding:"12px 16px", display:"flex", justifyContent:"space-between", background:distance===d?`${WINE}08`:"transparent", border:"none", borderBottom:i<distances.length-1?"1px solid #F5F5F7":"none", cursor:"pointer", fontFamily:"'Inter',sans-serif", alignItems:"center" }}>
                  <span style={{ fontSize:14, color:distance===d?WINE:"#111", fontWeight:distance===d?700:400 }}>{d}</span>
                  {distance===d && <div style={{ width:8, height:8, background:WINE, borderRadius:"50%" }}/>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed footer */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"12px 20px 22px", background:"linear-gradient(to top,#F8F9FA 75%,transparent)", display:"flex", gap:10 }}>
        <button style={{ flex:1, padding:"14px", background:"#fff", border:"1.5px solid #E5E5EA", borderRadius:14, fontSize:14, fontWeight:600, color:"#555", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Limpiar todo</button>
        <button style={{ flex:2, padding:"14px", background:`linear-gradient(135deg,${WINE} 0%,${WINE_DARK} 100%)`, border:"none", borderRadius:14, fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", boxShadow:`0 4px 16px ${WINE}45` }}>
          Aplicar filtros
        </button>
      </div>
    </Shell>
  );
}

/* ── Screen 4: Review Modal ── */
function ReviewScreen() {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Shell bg="#F8F9FA">
      {/* Dimmed backdrop */}
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"flex-end" }}>
        <div style={{ background:"#fff", width:"100%", borderRadius:"24px 24px 0 0", padding:"16px 20px 40px", boxShadow:"0 -8px 32px rgba(0,0,0,0.2)" }}>
          {/* Handle */}
          <div style={{ width:40, height:4, background:"#E5E5EA", borderRadius:2, margin:"0 auto 20px" }}/>

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:"#111", letterSpacing:"-0.3px" }}>Calificar propiedad</h3>
            <button style={{ width:32, height:32, background:"#F5F5F7", borderRadius:10, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={15} color="#555"/>
            </button>
          </div>

          {!sent ? (
            <>
              {/* Property mini card */}
              <div style={{ display:"flex", gap:12, alignItems:"center", padding:"12px", background:"#F8F9FA", borderRadius:14, marginBottom:22 }}>
                <div style={{ width:52, height:52, borderRadius:10, background:"linear-gradient(135deg,#4facfe,#00f2fe)", flexShrink:0 }}/>
                <div>
                  <p style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"#111" }}>Habitación privada luminosa</p>
                  <p style={{ margin:0, fontSize:12, color:"#8E8E93" }}>Calle Colón · Carlos Mendoza</p>
                </div>
              </div>

              {/* Stars */}
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:600, color:"#555" }}>Tu calificación</p>
                <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                  {[1,2,3,4,5].map(s=>(
                    <button key={s} onMouseEnter={()=>setHovered(s)} onMouseLeave={()=>setHovered(0)} onClick={()=>setStars(s)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, transition:"transform .15s", transform:(hovered||stars)>=s?"scale(1.2)":"scale(1)" }}>
                      <Star size={36} color="#F59E0B" fill={(hovered||stars)>=s?"#F59E0B":"none"} strokeWidth={1.5}/>
                    </button>
                  ))}
                </div>
                {stars > 0 && (
                  <p style={{ margin:"8px 0 0", fontSize:12, color:"#F59E0B", fontWeight:700 }}>
                    {["","Muy malo","Malo","Regular","Bueno","Excelente"][stars]}
                  </p>
                )}
              </div>

              {/* Text area */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:8 }}>Comparte tu experiencia</label>
                <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="¿Qué te pareció la propiedad y el arrendador?..." rows={4} style={{ width:"100%", border:"1.5px solid #E5E5EA", borderRadius:14, padding:"12px 14px", fontSize:14, color:"#111", outline:"none", fontFamily:"'Inter',sans-serif", resize:"none", boxSizing:"border-box", background:"#F8F9FA", transition:"border-color .2s" }} onFocus={e=>e.currentTarget.style.borderColor=WINE} onBlur={e=>e.currentTarget.style.borderColor="#E5E5EA"}/>
                <p style={{ margin:"5px 0 0", fontSize:11, color:"#C7C7CC", textAlign:"right" }}>{text.length}/280</p>
              </div>

              <button onClick={()=>{ if(stars>0) setSent(true); }} style={{ width:"100%", padding:"15px", background:stars>0?`linear-gradient(135deg,${WINE} 0%,${WINE_DARK} 100%)`:"#E5E5EA", border:"none", borderRadius:14, color:stars>0?"#fff":"#AEAEB2", fontSize:15, fontWeight:700, cursor:stars>0?"pointer":"default", fontFamily:"'Inter',sans-serif", boxShadow:stars>0?`0 6px 20px ${WINE}40`:"none", transition:"all .3s" }}>
                Enviar calificación
              </button>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"20px 0 10px" }}>
              <div style={{ width:72, height:72, background:"#ECFDF5", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <Star size={32} color="#10B981" fill="#10B981"/>
              </div>
              <h3 style={{ margin:"0 0 8px", fontSize:20, fontWeight:800, color:"#111" }}>¡Gracias por tu reseña!</h3>
              <p style={{ margin:0, fontSize:13, color:"#8E8E93", lineHeight:1.6 }}>Tu opinión ayuda a otros estudiantes a tomar mejores decisiones.</p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

export function StudentMapModule() {
  const [showSheet, setShowSheet] = useState(false);
  return (
    <div style={{ display:"flex", gap:40, alignItems:"flex-start", flexWrap:"wrap" }}>
      <MapScreen onPinClick={()=>setShowSheet(true)} />
      <BottomSheetScreen />
      <FiltersScreen />
      <ReviewScreen />
    </div>
  );
}
