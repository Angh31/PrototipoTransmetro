/**
 * @file components/map/MapaRed.jsx
 * @description Mapa interactivo de la red Transmetro (Leaflet + OpenStreetMap).
 *              Las rutas siguen las calles reales usando un motor de rutas (OSRM),
 *              con respaldo a línea recta si el servicio no responde.
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';

const GT_CENTER = [14.62, -90.53];
const GT_ZOOM   = 11;

const LINE_COLORS = {
  L1:  '#FF3B30', L2:  '#FF9500', L5:  '#00E676', L6:  '#FFB800', L7:  '#00D4FF',
  L12: '#9C27B0', L13: '#E91E63', L18: '#3F51B5', TB1: '#607D8B', TB2: '#9E9E9E',
};
const colorLinea = (codigo) => LINE_COLORS[codigo] || '#00D4FF';

// ── Simulación de movimiento sobre la geometría real de la ruta ──────────────
const DUR_TICKS = 650;   // ticks para recorrer toda la ruta (~78 s) — velocidad pareja en toda línea
const ESPERA_MS = 3500;  // parada en estación
const TICK_MS   = 120;
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

function BusesAnimados({ rutas }) {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    setBuses(rutas.map(() => ({ pos: 0, dir: 1, fase: 'viaje', restante: 0, ultima: -1 })));
  }, [rutas]);

  useEffect(() => {
    if (rutas.length === 0) return;
    const id = setInterval(() => {
      setBuses(prev => prev.map((b, i) => {
        const g = rutas[i]?.geometria || [];
        const n = g.length;
        if (n < 2) return b;
        let { pos, dir, fase, restante, ultima } = b;
        if (fase === 'espera') {
          restante -= TICK_MS;
          if (restante <= 0) fase = 'viaje';
          return { pos, dir, fase, restante, ultima };
        }
        const paso = (n - 1) / DUR_TICKS;     // velocidad proporcional al largo de la ruta
        const prevPos = pos;
        pos += paso * dir;
        if (pos >= n - 1) { pos = n - 1; dir = -1; }
        else if (pos <= 0) { pos = 0; dir = 1; }
        // ¿cruzó una estación en este paso? (detección por rango, robusta a cualquier velocidad)
        const lo = Math.min(prevPos, pos), hi = Math.max(prevPos, pos);
        const par = rutas[i].paradas.find(p => p.idx >= lo && p.idx <= hi && p.idx !== ultima);
        if (par) { pos = par.idx; fase = 'espera'; restante = ESPERA_MS; ultima = par.idx; }
        return { pos, dir, fase, restante, ultima };
      }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [rutas]);

  return rutas.map((ruta, i) => {
    const b = buses[i];
    const g = ruta.geometria;
    if (!b || g.length < 2) return null;
    const lo = Math.floor(b.pos), hi = Math.min(lo + 1, g.length - 1);
    const f = b.pos - lo;
    const lat = g[lo][0] + (g[hi][0] - g[lo][0]) * f;
    const lng = g[lo][1] + (g[hi][1] - g[lo][1]) * f;
    const color = colorLinea(ruta.codigo);
    const idx = Math.round(b.pos);
    let etiqueta;
    if (b.fase === 'espera') {
      const par = ruta.paradas.find(p => p.idx === idx);
      etiqueta = `${ruta.codigo} · ${par?.nombre || ''} (${Math.ceil(b.restante / 1000)}s)`;
    } else {
      const prox = ruta.paradas
        .filter(p => (b.dir > 0 ? p.idx > idx : p.idx < idx))
        .sort((a, c) => (b.dir > 0 ? a.idx - c.idx : c.idx - a.idx))[0];
      etiqueta = `${ruta.codigo} → ${prox?.nombre || '…'}`;
    }
    return (
      <CircleMarker key={'bus-' + ruta.id_linea} center={[lat, lng]} radius={6}
        pathOptions={{ fillColor: color, fillOpacity: 1, color: '#FFFFFF', weight: 2 }}>
        <Tooltip permanent direction="top" offset={[0, -6]}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{etiqueta}</span>
        </Tooltip>
      </CircleMarker>
    );
  });
}

export default function MapaRed({ estaciones = [], recorridos = [], alto = 460 }) {
  const puntos = useMemo(
    () => estaciones.filter(e => e.lat != null && e.lng != null),
    [estaciones]
  );

  const lineasMap = useMemo(() => recorridos
    .map(r => ({
      ...r,
      coords: r.puntos.filter(p => p.lat != null && p.lng != null).map(p => [parseFloat(p.lat), parseFloat(p.lng)]),
    }))
    .filter(r => r.coords.length >= 2), [recorridos]);

  const [rutas, setRutas] = useState([]);

  // Obtiene la geometría real (por calles) de cada línea desde el motor de rutas OSRM
  useEffect(() => {
    let cancelado = false;
    if (lineasMap.length === 0) { setRutas([]); return; }

    const fallback = (linea) => ({
      id_linea: linea.id_linea, codigo: linea.codigo,
      geometria: linea.coords,
      paradas: linea.coords.map((c, i) => ({ nombre: linea.puntos[i]?.nombre || '', idx: i })),
      real: false,
    });

    (async () => {
      const resultados = await Promise.all(lineasMap.map(async (linea) => {
        const param = linea.coords.map(([la, ln]) => `${ln},${la}`).join(';');
        try {
          const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${param}?overview=full&geometries=geojson`);
          const data = await r.json();
          const coords = data?.routes?.[0]?.geometry?.coordinates;
          if (data.code === 'Ok' && coords?.length) {
            const geometria = coords.map(([ln, la]) => [la, ln]);
            // mapea cada estación al punto más cercano de la geometría
            const paradas = linea.coords.map((c, i) => {
              let best = 0, bd = Infinity;
              geometria.forEach((p, pi) => { const dd = d2(p, c); if (dd < bd) { bd = dd; best = pi; } });
              return { nombre: linea.puntos[i]?.nombre || '', idx: best };
            });
            return { id_linea: linea.id_linea, codigo: linea.codigo, geometria, paradas, real: true };
          }
        } catch (e) { /* sin conexión al motor de rutas → respaldo */ }
        return fallback(linea);
      }));
      if (!cancelado) setRutas(resultados);
    })();

    return () => { cancelado = true; };
  }, [lineasMap]);

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

  // Mientras carga la geometría real, dibuja las líneas rectas como respaldo
  const polilineas = rutas.length
    ? rutas
    : lineasMap.map(l => ({ id_linea: l.id_linea, codigo: l.codigo, geometria: l.coords }));

  return (
    <div style={{ height: alto, borderRadius: 'var(--r2)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={GT_CENTER} zoom={GT_ZOOM} scrollWheelZoom style={{ height: '100%', width: '100%', background: 'var(--bg2)' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa oscuro">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satélite">
            <TileLayer
              attribution='Imágenes &copy; <a href="https://www.esri.com">Esri</a>'
              url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay name="Etiquetas (calles y lugares)">
            <TileLayer
              attribution='Etiquetas &copy; <a href="https://www.esri.com">Esri</a>'
              url='https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}' />
          </LayersControl.Overlay>
        </LayersControl>

        {/* Rutas por las calles */}
        {polilineas.map(r => (
          <Polyline key={r.id_linea} positions={r.geometria}
            pathOptions={{ color: colorLinea(r.codigo), weight: 5, opacity: 0.85 }}>
            <Tooltip sticky>
              <strong style={{ color: colorLinea(r.codigo) }}>{r.codigo}</strong>
            </Tooltip>
          </Polyline>
        ))}

        {/* Estaciones */}
        {puntos.map(e => (
          <CircleMarker key={e.id_estacion} center={[parseFloat(e.lat), parseFloat(e.lng)]} radius={7}
            pathOptions={{ fillColor: '#00D4FF', fillOpacity: 1, color: '#0B1520', weight: 2 }}>
            <Tooltip direction="top" offset={[0, -6]}>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>{e.nombre}</strong><br />
                Capacidad: {e.capacidad_max} pax
                {e.municipio && <><br />📍 {e.municipio}</>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Unidades en movimiento sobre la ruta real */}
        <BusesAnimados rutas={rutas} />
      </MapContainer>
    </div>
  );
}
