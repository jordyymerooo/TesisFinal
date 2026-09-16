import { useState } from "react";
import { ArrowLeft, ChevronDown, MapPin, Navigation, Compass, Heart, MessageCircle, User, Check } from "lucide-react";

const WINE = "#8C1515";
const WINE_DARK = "#6B1010";

const PROPERTY_TYPES = [
  "Habitación compartida",
  "Habitación privada",
  "Mini departamento",
  "Departamento completo",
  "Casa completa",
  "Suite ejecutiva",
];

export function PropertyPublishStep1Screen() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);

  const isValid = title.trim().length > 0 && propertyType !== "" && price.trim().length > 0 && locationSet;

  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: "#fff",
        fontFamily: "'Inter', sans-serif",
        borderRadius: 44,
        boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        display: "flex",
        flexDirection: "column",
        border: "10px solid #1a1a1a",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Status bar ── */}
      <div
        style={{
          background: "#fff",
          padding: "14px 24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {[3, 2.5, 2, 1.5].map((h, i) => (
              <div key={i} style={{ width: 3, height: h * 3, background: i < 3 ? "#111" : "#ccc", borderRadius: 1, alignSelf: "flex-end" }} />
            ))}
          </div>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2.5C9.8 2.5 11.4 3.2 12.6 4.4L14 3C12.4 1.4 10.3 0.5 8 0.5C5.7 0.5 3.6 1.4 2 3L3.4 4.4C4.6 3.2 6.2 2.5 8 2.5Z" fill="#111" />
            <path d="M8 5.5C9 5.5 9.9 5.9 10.6 6.6L12 5.2C10.9 4.1 9.5 3.5 8 3.5C6.5 3.5 5.1 4.1 4 5.2L5.4 6.6C6.1 5.9 7 5.5 8 5.5Z" fill="#111" />
            <circle cx="8" cy="9.5" r="1.5" fill="#111" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#111" strokeOpacity="0.35" />
            <rect x="2" y="2" width="16" height="8" rx="2" fill="#111" />
            <path d="M23 4.5V7.5C23.8 7.2 24.5 6.4 24.5 6C24.5 5.6 23.8 4.8 23 4.5Z" fill="#111" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* ── Header ── */}
      <div
        style={{
          background: "#fff",
          padding: "12px 20px 0",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "#F5F5F7",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} color="#111" />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111", letterSpacing: "-0.3px" }}>
            Publicar Propiedad
          </p>
        </div>
        {/* Step pill */}
        <div
          style={{
            padding: "4px 12px",
            background: `${WINE}10`,
            border: `1px solid ${WINE}30`,
            borderRadius: 20,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: WINE }}>Paso 1 de 3</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: step === 1 ? WINE : "#E5E5EA",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {["Información", "Fotos", "Detalles"].map((label, i) => (
            <span
              key={label}
              style={{
                fontSize: 10,
                fontWeight: i === 0 ? 700 : 400,
                color: i === 0 ? WINE : "#C7C7CC",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scrollable form ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 20px 110px",
        }}
        onClick={() => setDropdownOpen(false)}
      >
        {/* Section label */}
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 13,
            fontWeight: 700,
            color: "#3C3C43",
            letterSpacing: "0.3px",
            textTransform: "uppercase",
          }}
        >
          Datos del anuncio
        </p>

        {/* ── Campo: Título ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
            Título del anuncio <span style={{ color: WINE }}>*</span>
          </label>
          <div
            style={{
              border: `1.5px solid ${titleFocused ? WINE : title ? "#D1D1D6" : "#E5E5EA"}`,
              borderRadius: 14,
              background: titleFocused ? "#FFFBFB" : "#fff",
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s",
              boxShadow: titleFocused ? `0 0 0 3px ${WINE}12` : "none",
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              placeholder="Ej. Habitación privada cerca de ULEAM"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "13px 16px",
                fontSize: 14,
                color: "#111",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            {title.length > 0 && (
              <div style={{ paddingRight: 12 }}>
                <Check size={16} color="#10B981" />
              </div>
            )}
          </div>
          <p style={{ margin: "5px 0 0 4px", fontSize: 11, color: "#8E8E93" }}>
            Sé descriptivo. Máximo 80 caracteres ({title.length}/80)
          </p>
        </div>

        {/* ── Campo: Tipo de propiedad ── */}
        <div style={{ marginBottom: 16, position: "relative", zIndex: 10 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
            Tipo de propiedad <span style={{ color: WINE }}>*</span>
          </label>
          <button
            onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
            style={{
              width: "100%",
              border: `1.5px solid ${dropdownOpen ? WINE : propertyType ? "#D1D1D6" : "#E5E5EA"}`,
              borderRadius: 14,
              background: dropdownOpen ? "#FFFBFB" : "#fff",
              padding: "13px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s",
              boxShadow: dropdownOpen ? `0 0 0 3px ${WINE}12` : "none",
            }}
          >
            <span style={{ fontSize: 14, color: propertyType ? "#111" : "#C7C7CC" }}>
              {propertyType || "Selecciona una opción"}
            </span>
            <ChevronDown
              size={18}
              color={dropdownOpen ? WINE : "#8E8E93"}
              style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            />
          </button>

          {/* Dropdown options */}
          {dropdownOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1.5px solid #E5E5EA",
                borderRadius: 14,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                overflow: "hidden",
              }}
            >
              {PROPERTY_TYPES.map((type, i) => (
                <button
                  key={type}
                  onClick={() => { setPropertyType(type); setDropdownOpen(false); }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: propertyType === type ? `${WINE}08` : "transparent",
                    border: "none",
                    borderBottom: i < PROPERTY_TYPES.length - 1 ? "1px solid #F5F5F7" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 14, color: propertyType === type ? WINE : "#111", fontWeight: propertyType === type ? 600 : 400 }}>
                    {type}
                  </span>
                  {propertyType === type && <Check size={15} color={WINE} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Campo: Precio mensual ── */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
            Precio mensual <span style={{ color: WINE }}>*</span>
          </label>
          <div
            style={{
              border: `1.5px solid ${priceFocused ? WINE : price ? "#D1D1D6" : "#E5E5EA"}`,
              borderRadius: 14,
              background: priceFocused ? "#FFFBFB" : "#fff",
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s",
              boxShadow: priceFocused ? `0 0 0 3px ${WINE}12` : "none",
              overflow: "hidden",
            }}
          >
            {/* Prefix */}
            <div
              style={{
                padding: "13px 14px 13px 16px",
                background: priceFocused ? `${WINE}08` : "#F5F5F7",
                borderRight: `1.5px solid ${priceFocused ? `${WINE}30` : "#E5E5EA"}`,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: priceFocused ? WINE : "#555" }}>$</span>
            </div>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              onFocus={() => setPriceFocused(true)}
              onBlur={() => setPriceFocused(false)}
              placeholder="0"
              inputMode="numeric"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "13px 16px",
                fontSize: 14,
                color: "#111",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            {price && (
              <span style={{ paddingRight: 14, fontSize: 12, color: "#8E8E93", whiteSpace: "nowrap" }}>
                / mes
              </span>
            )}
          </div>
          {price && parseInt(price) > 0 && (
            <p style={{ margin: "5px 0 0 4px", fontSize: 11, color: "#10B981", fontWeight: 600 }}>
              ${parseInt(price).toLocaleString()} USD al mes
            </p>
          )}
        </div>

        {/* ── Sección Ubicación ── */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: "#F0F0F2",
            marginBottom: 20,
          }}
        />
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 13,
            fontWeight: 700,
            color: "#3C3C43",
            letterSpacing: "0.3px",
            textTransform: "uppercase",
          }}
        >
          Ubicación
        </p>

        {/* Map placeholder */}
        <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 8 }}>
          {/* Map mockup */}
          <div
            style={{
              width: "100%",
              height: 180,
              background: locationSet
                ? "linear-gradient(135deg, #e8f4e8 0%, #d4e8d4 40%, #c8e0c8 100%)"
                : "linear-gradient(135deg, #F0F0F2 0%, #E8E8EC 100%)",
              position: "relative",
              transition: "background 0.4s",
            }}
          >
            {/* Grid lines simulando mapa */}
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: locationSet ? 0.6 : 0.4 }}>
              {/* Horizontal streets */}
              {[30, 65, 100, 135, 165].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="350" y2={y} stroke={locationSet ? "#8BC48B" : "#D1D1D6"} strokeWidth="1.5" />
              ))}
              {/* Vertical streets */}
              {[50, 110, 170, 230, 290].map((x) => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" stroke={locationSet ? "#8BC48B" : "#D1D1D6"} strokeWidth="1.5" />
              ))}
              {/* Block fills */}
              {locationSet && (
                <>
                  <rect x="51" y="31" width="58" height="33" rx="3" fill="#A8D5A8" opacity="0.5" />
                  <rect x="111" y="66" width="58" height="33" rx="3" fill="#A8D5A8" opacity="0.4" />
                  <rect x="171" y="31" width="58" height="33" rx="3" fill="#A8D5A8" opacity="0.5" />
                  <rect x="51" y="101" width="58" height="33" rx="3" fill="#A8D5A8" opacity="0.35" />
                  <rect x="231" y="101" width="58" height="33" rx="3" fill="#A8D5A8" opacity="0.4" />
                </>
              )}
              {!locationSet && (
                <>
                  <rect x="51" y="31" width="58" height="33" rx="3" fill="#E0E0E8" opacity="0.7" />
                  <rect x="111" y="66" width="58" height="33" rx="3" fill="#E0E0E8" opacity="0.7" />
                  <rect x="171" y="31" width="58" height="33" rx="3" fill="#E0E0E8" opacity="0.7" />
                  <rect x="51" y="101" width="58" height="33" rx="3" fill="#E0E0E8" opacity="0.7" />
                  <rect x="231" y="101" width="58" height="33" rx="3" fill="#E0E0E8" opacity="0.7" />
                </>
              )}
            </svg>

            {/* Pin de ubicación */}
            {locationSet ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: WINE,
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(-45deg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 16px ${WINE}60`,
                  }}
                >
                  <MapPin size={18} color="#fff" style={{ transform: "rotate(45deg)" }} />
                </div>
                <div style={{ width: 8, height: 8, background: `${WINE}40`, borderRadius: "50%", marginTop: -2, filter: "blur(2px)" }} />
                {/* Ripple */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "50%",
                    border: `2px solid ${WINE}40`,
                    animation: "none",
                    width: 56,
                    height: 56,
                    marginLeft: -8,
                    marginTop: -8,
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -60%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: 0.4,
                }}
              >
                <MapPin size={36} color="#8E8E93" />
                <div style={{ width: 8, height: 4, background: "#8E8E93", borderRadius: "50%", opacity: 0.4 }} />
              </div>
            )}

            {/* Compass */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 28,
                height: 28,
                background: "rgba(255,255,255,0.9)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Navigation size={14} color="#555" />
            </div>

            {/* Location label when set */}
            {locationSet && (
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fff",
                  borderRadius: 20,
                  padding: "4px 12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>
                  📍 Manta, Manabí, Ecuador
                </span>
              </div>
            )}
          </div>

          {/* "Fijar ubicación" button overlay */}
          <button
            onClick={() => setLocationSet(!locationSet)}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: locationSet ? "#10B981" : "#fff",
              border: `1.5px solid ${locationSet ? "#10B981" : "#E5E5EA"}`,
              borderRadius: 12,
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: locationSet ? "0 4px 20px rgba(16,185,129,0.35)" : "0 4px 20px rgba(0,0,0,0.14)",
              transition: "all 0.3s",
              fontFamily: "'Inter', sans-serif",
              ...(locationSet && { top: "auto", transform: "none", position: "relative", width: "100%", justifyContent: "center", borderRadius: 0 }),
            }}
          >
            {locationSet ? (
              <Check size={16} color="#fff" />
            ) : (
              <MapPin size={16} color={WINE} />
            )}
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: locationSet ? "#fff" : "#111",
              }}
            >
              {locationSet ? "Ubicación fijada" : "Fijar ubicación en el mapa"}
            </span>
          </button>
        </div>

        {!locationSet && (
          <p style={{ margin: "6px 0 0 4px", fontSize: 11, color: "#8E8E93" }}>
            Toca el botón para marcar la ubicación exacta del inmueble
          </p>
        )}
        {locationSet && (
          <p style={{ margin: "6px 0 0 4px", fontSize: 11, color: "#10B981", fontWeight: 600 }}>
            ✓ Manta, Manabí, Ecuador · Toca para cambiar
          </p>
        )}
      </div>

      {/* ── CTA anclado ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 20px 22px",
          background: "linear-gradient(to top, #fff 75%, transparent)",
          flexShrink: 0,
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "15px 24px",
            background: isValid
              ? `linear-gradient(135deg, ${WINE} 0%, ${WINE_DARK} 100%)`
              : "#E5E5EA",
            borderRadius: 16,
            border: "none",
            cursor: isValid ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: isValid ? `0 4px 20px ${WINE}45` : "none",
            transition: "all 0.3s",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: isValid ? "#fff" : "#AEAEB2",
              letterSpacing: "-0.2px",
            }}
          >
            Siguiente paso
          </span>
          {isValid && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        {!isValid && (
          <p style={{ margin: "7px 0 0", textAlign: "center", fontSize: 11, color: "#AEAEB2" }}>
            Completa todos los campos para continuar
          </p>
        )}
      </div>

      {/* ── Bottom nav bar ── */}
      <div style={{ height: 68, flexShrink: 0 }} />
      <div
        style={{
          position: "absolute",
          bottom: 68,
          left: 0,
          right: 0,
          height: 0,
        }}
      />
    </div>
  );
}
