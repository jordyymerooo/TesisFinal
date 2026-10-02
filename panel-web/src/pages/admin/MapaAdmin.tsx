import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { api } from '../../services/api';
import { MapPin, AlertTriangle, Building2, Save, Loader2 } from 'lucide-react';

const WINE = '#8C1515';

// Custom icons
const campusIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const propertyIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const gateIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PointOfInterest {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface PropertyData {
  id: number;
  titulo: string;
  precio: number;
  latitud: number;
  longitud: number;
  arrendador: {
    id_usuario: number;
    nombres: string;
  } | null;
}

function SetViewOnChange({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function MapaAdmin() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [campusPos, setCampusPos] = useState<[number, number]>([-0.9555, -80.7380]);
  const [originalCampusPos, setOriginalCampusPos] = useState<[number, number]>([-0.9555, -80.7380]);
  const [loading, setLoading] = useState(true);
  const [savingCampus, setSavingCampus] = useState(false);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  const markerRef = useRef<L.Marker>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsRes, campusRes, poiRes] = await Promise.all([
        api.get('/admin/map-properties'),
        api.get('/admin/settings/campus-location'),
        api.get('/admin/points-of-interest')
      ]);

      if (propsRes.data?.data) {
        setProperties(propsRes.data.data);
      }
      if (poiRes.data?.data) {
        setPois(poiRes.data.data);
      }
      if (campusRes.data?.status === 'success') {
        const lat = campusRes.data.lat;
        const lng = campusRes.data.lng;
        setCampusPos([lat, lng]);
        setOriginalCampusPos([lat, lng]);
      }
    } catch (err) {
      console.error('[MapaAdmin] Error loading map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setCampusPos([latLng.lat, latLng.lng]);
        }
      },
    }),
    [],
  );

  const hasCampusMoved = campusPos[0] !== originalCampusPos[0] || campusPos[1] !== originalCampusPos[1];

  const handleSaveCampus = async () => {
    setSavingCampus(true);
    try {
      await api.post('/admin/settings/campus-location', {
        lat: campusPos[0],
        lng: campusPos[1]
      });
      setOriginalCampusPos(campusPos);
      alert('Ubicación del campus guardada correctamente.');
    } catch (error) {
      console.error('Error saving campus', error);
      alert('Hubo un error al guardar la ubicación del campus.');
    } finally {
      setSavingCampus(false);
    }
  };

  const handleNotify = async (prop: PropertyData) => {
    if (!prop.arrendador) {
      alert('Esta propiedad no tiene un arrendador asignado.');
      return;
    }

    const confirmMsg = `¿Enviar notificación a ${prop.arrendador.nombres} sobre la ubicación de "${prop.titulo}"?`;
    if (!window.confirm(confirmMsg)) return;

    setNotifyingId(prop.id);
    try {
      await api.post('/admin/usuarios/' + prop.arrendador.id_usuario + '/notificar', {
        titulo: 'Ubicación imprecisa de su propiedad',
        mensaje: `Estimado arrendador, hemos detectado que la ubicación en el mapa de su propiedad "${prop.titulo}" es imprecisa. Por favor, ingrese a la app y corrija el pin en el mapa para no afectar su visibilidad con los estudiantes.`,
        tipo: 'warning',
      });
      
      // Intentar enviar también como aviso global si tienes un endpoint para eso (opcional)
      // await api.post('/avisos', { ... });
      
      alert('Notificación enviada correctamente al arrendador.');
    } catch (error) {
      console.error('Error notifying landlord', error);
      alert('Hubo un error al enviar la notificación.');
    } finally {
      setNotifyingId(null);
    }
  };

  const handlePOIDragEnd = async (poi: PointOfInterest, newLat: number, newLng: number) => {
    try {
      await api.patch(`/admin/points-of-interest/${poi.id}`, {
        latitude: newLat,
        longitude: newLng
      });
      setPois((prev: PointOfInterest[]) => prev.map((p: PointOfInterest) => p.id === poi.id ? { ...p, latitude: newLat, longitude: newLng } : p));
    } catch (err) {
      console.error('Error updating POI', err);
    }
  };

  function MapEvents() {
    useMapEvents({
      dblclick: async (e) => {
        const name = window.prompt('Nombre del nuevo punto (Ej. Puerta 3)');
        if (name) {
          try {
            const res = await api.post('/admin/points-of-interest', {
              name,
              type: 'gate',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            });
            if (res.data?.data) {
              setPois((prev: PointOfInterest[]) => [...prev, res.data.data]);
            }
          } catch (err) {
            console.error('Error creating POI', err);
            alert('Error al crear punto de interés');
          }
        }
      }
    });
    return null;
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={26} color={WINE} />
            Mapa de Alojamientos
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0 0' }}>
            Vista administrativa. Arrastra el marcador rojo para ajustar la posición del campus ULEAM. 
            Haz clic en las propiedades azules para notificar a los arrendadores.
          </p>
        </div>
        
        {hasCampusMoved && (
          <button
            onClick={handleSaveCampus}
            disabled={savingCampus}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: WINE, color: 'white',
              border: 'none', borderRadius: 10,
              padding: '10px 18px', fontSize: 13, fontWeight: 600,
              cursor: savingCampus ? 'not-allowed' : 'pointer',
              opacity: savingCampus ? 0.7 : 1,
              boxShadow: '0 4px 6px -1px rgba(140, 21, 21, 0.2)'
            }}
          >
            {savingCampus ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            Guardar nueva ubicación
          </button>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 600, backgroundColor: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
            <Loader2 size={40} color={WINE} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 600 }}>Cargando mapa...</span>
          </div>
        ) : (
          <MapContainer 
            center={campusPos} 
            zoom={15} 
            style={{ height: '600px', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            <MapEvents />
            
            <SetViewOnChange center={originalCampusPos} />

            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={campusPos}
              ref={markerRef}
              icon={campusIcon}
            >
              <Popup>
                <div style={{ textAlign: 'center', padding: '4px' }}>
                  <h3 style={{ margin: '0 0 4px 0', color: WINE, fontSize: 15, fontWeight: 800 }}>Campus ULEAM</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
                    Arrastra este marcador para ajustar<br/>la ubicación central.
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Puntos de interés */}
            {pois.map((poi: PointOfInterest) => (
              <Marker
                key={`poi-${poi.id}`}
                position={[poi.latitude, poi.longitude]}
                icon={poi.type === 'campus_main' ? campusIcon : gateIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    handlePOIDragEnd(poi, pos.lat, pos.lng);
                  }
                }}
              >
                <Popup>
                  <strong>{poi.name}</strong>
                  <br />
                  <small style={{ color: '#666' }}>Arrastra para mover</small>
                </Popup>
              </Marker>
            ))}

            {properties.map((p: PropertyData) => (
              <Marker
                key={p.id}
                position={[p.latitud, p.longitud]}
                icon={propertyIcon}
              >
                <Popup>
                  <div style={{ width: 220, padding: 2 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#111827', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={14} color={WINE} />
                      {p.titulo}
                    </h4>
                    
                    <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 12 }}>
                      <div style={{ marginBottom: 4 }}><strong>Precio:</strong> ${p.precio}/mes</div>
                      <div><strong>Arrendador:</strong> {p.arrendador?.nombres || 'Desconocido'}</div>
                    </div>

                    <button
                      onClick={() => handleNotify(p)}
                      disabled={notifyingId === p.id}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        backgroundColor: '#FEF2F2', color: '#DC2626',
                        border: '1px solid #FCA5A5', borderRadius: 6,
                        padding: '8px', fontSize: 12, fontWeight: 700,
                        cursor: notifyingId === p.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {notifyingId === p.id ? (
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                      Notificar error de ubicación
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}

export default MapaAdmin;
