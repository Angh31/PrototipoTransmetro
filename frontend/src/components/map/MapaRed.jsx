/**
 * @file components/map/MapaRed.jsx
 * @description Mapa interactivo de la red Transmetro con OpenStreetMap (Leaflet)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';

// Centro aproximado de la Ciudad de Guatemala
const GT_CENTER = [14.62, -90.53];
const GT_ZOOM   = 11;

// Paleta por línea (consistente con la iconografía del sistema)
const LINE_COLORS = {
  L1:  '#FF3B30',
  L2:  '#FF9500',
  L5:  '#00E676', // verde — flota eléctrica BYD
  L6:  '#FFB800',
  L7:  '#00D4FF',
  L12: '#9C27B0',
  L13: '#E91E63',
  L18: '#3F51B5',
  TB1: '#607D8B',
  TB2: '#9E9E9E',
};

const colorLinea = (codigo) => LINE_COLORS[codigo] || '#00D4FF';

export default function MapaRed({ estaciones = [], recorridos = [], alto = 460, tileVariant = 'dark' }) {
  // Filtrar estaciones con coordenadas válidas
  const puntos = useMemo(
    () => estaciones.filter(e => e.lat != null && e.lng != null),
    [estaciones]
  );

  const lineasMap = useMemo(() => {
    return recorridos
      .map(r => ({
        ...r,
        coords: r.puntos
          .filter(p => p.lat != null && p.lng != null)
          .map(p => [parseFloat(p.lat), parseFloat(p.lng)]),
      }))
      .filter(r => r.coords.length >= 2);
  }, [recorridos]);

  const tileUrl = tileVariant === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = tileVariant === 'dark'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  if (puntos.length === 0) {
    return (
      <div style={{
        height: alto, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg3)', border: '1px dashed var(--border2)',
        borderRadius: 'var(--r2)', color: 'var(--text3)', fontSize: '0.88rem',
      }}>
        No hay estaciones geolocalizadas para mostrar.
      </div>
    );
  }

  return (
    <div style={{ height: alto, borderRadius: 'var(--r2)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={GT_CENTER} zoom={GT_ZOOM} scrollWheelZoom style={{ height: '100%', width: '100%', background: 'var(--bg2)' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa oscuro">
            <TileLayer attribution={tileAttribution} url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Polilíneas por línea */}
        {lineasMap.map(linea => (
          <Polyline
            key={linea.id_linea}
            positions={linea.coords}
            pathOptions={{ color: colorLinea(linea.codigo), weight: 5, opacity: 0.85 }}
          >
            <Tooltip sticky>
              <strong style={{ color: colorLinea(linea.codigo) }}>{linea.codigo}</strong> · {linea.puntos.length} estaciones
            </Tooltip>
          </Polyline>
        ))}

        {/* Estaciones */}
        {puntos.map(e => (
          <CircleMarker
            key={e.id_estacion}
            center={[parseFloat(e.lat), parseFloat(e.lng)]}
            radius={7}
            pathOptions={{ fillColor: '#00D4FF', fillOpacity: 1, color: '#0B1520', weight: 2 }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>{e.nombre}</strong><br />
                Capacidad: {e.capacidad_max} pax
                {e.municipio && <><br/>📍 {e.municipio}</>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
