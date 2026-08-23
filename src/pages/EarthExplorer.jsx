import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, Cell, CartesianGrid
} from "recharts";
import api from "../api/axios";

// ── Tab config ──
const tabs = [
  { key: "overview", label: "🌍 Overview" },
  { key: "protected", label: "🏕️ Protected Areas" },
  { key: "forests", label: "🌲 Forests" },
  { key: "water", label: "💧 Water Bodies" },
  { key: "land", label: "⛰️ Land Zones" },
  { key: "atmosphere", label: "🌫️ Atmosphere & Ozone" },
  { key: "hotspots", label: "🦋 Biodiversity Hotspots" },
];

// ── Color maps ──
const forestColors = {
  TROPICAL_RAINFOREST: "#15803d",
  TEMPERATE_FOREST: "#16a34a",
  BOREAL_TAIGA: "#166534",
  MANGROVE: "#065f46",
  CLOUD_FOREST: "#0d9488",
  DRY_DECIDUOUS: "#ca8a04",
  MEDITERRANEAN: "#b45309",
  FLOODED_FOREST: "#0369a1",
  MONTANE_FOREST: "#4338ca",
};

const waterColors = {
  OCEAN: "#1d4ed8",
  SEA: "#2563eb",
  RIVER: "#0284c7",
  LAKE: "#0369a1",
  WETLAND: "#0891b2",
  GLACIER: "#93c5fd",
  CORAL_REEF: "#f97316",
  ESTUARY: "#0e7490",
  WATERFALL: "#6366f1",
  HOT_SPRING: "#dc2626",
};

const landColors = {
  MOUNTAIN: "#78716c",
  GRASSLAND: "#84cc16",
  DESERT: "#d97706",
  TUNDRA: "#94a3b8",
  SAVANNA: "#ca8a04",
  PLATEAU: "#a16207",
  VOLCANIC: "#dc2626",
  ICELAND: "#bfdbfe",
  POLAR: "#e0f2fe",
  CAVE_SYSTEM: "#374151",
};

const atmosphereColors = [
  "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"
];

const threatColors = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  MODERATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LOW: "bg-green-100 text-green-800 border-green-200",
  RECOVERING: "bg-blue-100 text-blue-800 border-blue-200",
  STABLE: "bg-slate-100 text-slate-700 border-slate-200",
};

// ── Reusable card ──
function EarthCard({ item, colorKey, colorMap, onClick, extra }) {
  const color = colorMap?.[colorKey] || "#16a34a";
  return (
    <div
      onClick={() => onClick?.(item)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-green-300 transition-all group"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={item.imageUrl || "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-white font-bold text-base leading-tight">{item.name}</h3>
          {item.country && (
            <p className="text-white/70 text-xs mt-0.5">{item.country} · {item.continent}</p>
          )}
        </div>
        {colorKey && (
          <div
            className="absolute top-3 right-3 text-xs text-white px-2.5 py-1 rounded-full font-semibold"
            style={{ background: color + "cc" }}
          >
            {colorKey.replace(/_/g, " ")}
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>
        {extra}
      </div>
    </div>
  );
}

// ── Detail Modal ──
function DetailModal({ item, onClose, extraContent }) {
  if (!item) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-64">
          <img
            src={item.imageUrl || "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80"}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="text-2xl font-bold text-white">{item.name}</h2>
            {item.country && (
              <p className="text-white/70 text-sm mt-1">{item.country} · {item.continent}</p>
            )}
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed mb-5">{item.description}</p>
          {extraContent}
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl font-semibold text-sm mt-4 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EarthExplorer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [protectedAreas, setProtectedAreas] = useState([]);
  const [forests, setForests] = useState([]);
  const [waterBodies, setWaterBodies] = useState([]);
  const [landZones, setLandZones] = useState([]);
  const [atmosphere, setAtmosphere] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [continentFilter, setContinentFilter] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/earth/protected-areas").catch(() => ({ data: [] })),
      api.get("/earth/forests").catch(() => ({ data: [] })),
      api.get("/earth/water-bodies").catch(() => ({ data: [] })),
      api.get("/earth/land-zones").catch(() => ({ data: [] })),
      api.get("/earth/atmosphere").catch(() => ({ data: [] })),
      api.get("/earth/hotspots").catch(() => ({ data: [] })),
    ]).then(([pa, f, wb, lz, atm, hs]) => {
      setProtectedAreas(pa.data);
      setForests(f.data);
      setWaterBodies(wb.data);
      setLandZones(lz.data);
      setAtmosphere(atm.data);
      setHotspots(hs.data);
    }).finally(() => setLoading(false));
  }, []);

  // ── Overview stats ──
  const overviewStats = [
    { label: "Protected areas", value: protectedAreas.length, icon: "🏕️", color: "text-green-700" },
    { label: "Forest zones", value: forests.length, icon: "🌲", color: "text-green-600" },
    { label: "Water bodies", value: waterBodies.length, icon: "💧", color: "text-blue-600" },
    { label: "Land zones", value: landZones.length, icon: "⛰️", color: "text-amber-600" },
    { label: "Atm. layers", value: atmosphere.length, icon: "🌫️", color: "text-purple-600" },
    { label: "Bio hotspots", value: hotspots.length, icon: "🦋", color: "text-red-600" },
  ];

  // ── Map markers for overview ──
  const allMarkers = [
    ...protectedAreas.filter(a => a.latitude && a.longitude).map(a => ({
      ...a, markerColor: "#16a34a", markerType: "Protected Area"
    })),
    ...forests.filter(f => f.latitude && f.longitude).map(f => ({
      ...f, markerColor: "#15803d", markerType: "Forest"
    })),
    ...waterBodies.filter(w => w.latitude && w.longitude).map(w => ({
      ...w, markerColor: "#2563eb", markerType: "Water Body"
    })),
    ...landZones.filter(l => l.latitude && l.longitude).map(l => ({
      ...l, markerColor: "#78716c", markerType: "Land Zone"
    })),
    ...hotspots.filter(h => h.latitude && h.longitude).map(h => ({
      ...h, markerColor: "#dc2626", markerType: "Biodiversity Hotspot"
    })),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-600 font-medium">Loading Earth Explorer...</div>
          <div className="text-slate-400 text-sm mt-1">Fetching global ecosystem data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden h-72 mb-8">
        <img
          src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&q=90"
          alt="Earth"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16f0] via-[#052e1688] to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <div className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            Complete Earth Encyclopedia
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">
            🌍 Earth Explorer
          </h1>
          <p className="text-green-100 text-sm max-w-xl leading-relaxed">
            Explore every layer of life on Earth — national parks, forests, oceans,
            mountains, the atmosphere, ozone layer and all biodiversity hotspots.
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              🏕️ {protectedAreas.length} Protected Areas
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              🌲 {forests.length} Forest Types
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              💧 {waterBodies.length} Water Bodies
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              🦋 {hotspots.length} Biodiversity Hotspots
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setTypeFilter("ALL"); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.key
                ? "bg-green-700 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8">

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {overviewStats.map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          {/* World map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4">
              Global Ecosystem Map
            </h2>
            <div className="rounded-xl overflow-hidden" style={{ height: 420 }}>
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {allMarkers.map((m, i) => (
                  <CircleMarker
                    key={`${m.markerType}-${i}`}
                    center={[m.latitude, m.longitude]}
                    radius={7}
                    pathOptions={{
                      color: m.markerColor,
                      fillOpacity: 0.75,
                      weight: 1.5,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-bold">{m.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{m.markerType}</div>
                        {m.country && <div className="text-xs">{m.country}</div>}
                        {m.totalSpeciesCount && (
                          <div className="text-xs mt-1">
                            Species: {m.totalSpeciesCount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { color: "bg-green-600", label: "Protected Areas" },
                { color: "bg-green-800", label: "Forests" },
                { color: "bg-blue-600", label: "Water Bodies" },
                { color: "bg-stone-500", label: "Land Zones" },
                { color: "bg-red-600", label: "Biodiversity Hotspots" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${l.color}`} />
                  <span className="text-xs text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Biosphere layers diagram */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-2">
              Earth's Biosphere — Where Life Exists
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              The biosphere extends from the deepest ocean floor to the highest mountain peak where life can survive.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { name: "Lithosphere", icon: "🪨", desc: "Earth's rocky crust where terrestrial life exists. Extends 0–70km deep.", color: "bg-amber-50 border-amber-200", text: "text-amber-700" },
                { name: "Hydrosphere", icon: "💧", desc: "All water on Earth — oceans, rivers, lakes, glaciers and groundwater.", color: "bg-blue-50 border-blue-200", text: "text-blue-700" },
                { name: "Atmosphere", icon: "🌫️", desc: "Layers of gas surrounding Earth protecting life from UV and meteorites.", color: "bg-purple-50 border-purple-200", text: "text-purple-700" },
                { name: "Cryosphere", icon: "🧊", desc: "All frozen water — ice sheets, sea ice, glaciers and permafrost.", color: "bg-cyan-50 border-cyan-200", text: "text-cyan-700" },
                { name: "Pedosphere", icon: "🌱", desc: "Earth's soil layer — the interface between rock, water, air and life.", color: "bg-green-50 border-green-200", text: "text-green-700" },
              ].map(z => (
                <div key={z.name} className={`rounded-2xl border p-4 text-center ${z.color}`}>
                  <div className="text-4xl mb-2">{z.icon}</div>
                  <div className={`font-bold text-sm mb-2 ${z.text}`}>{z.name}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{z.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick previews */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Top forests */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-4">🌲 Top Forests</h3>
              <div className="flex flex-col gap-3">
                {forests.slice(0, 4).map(f => (
                  <div
                    key={f.id}
                    onClick={() => { setSelected(f); setSelectedType("forest"); }}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-xl p-2 transition-colors"
                  >
                    <img
                      src={f.imageUrl}
                      alt={f.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.target.src = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=100"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{f.name}</div>
                      <div className="text-xs text-slate-400">{f.country}</div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ background: forestColors[f.type] || "#16a34a" }}
                    >
                      {f.threatLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top water bodies */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-4">💧 Major Water Bodies</h3>
              <div className="flex flex-col gap-3">
                {waterBodies.slice(0, 4).map(w => (
                  <div
                    key={w.id}
                    onClick={() => { setSelected(w); setSelectedType("water"); }}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-xl p-2 transition-colors"
                  >
                    <img
                      src={w.imageUrl}
                      alt={w.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.target.src = "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=100"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{w.name}</div>
                      <div className="text-xs text-slate-400">{w.country}</div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ background: waterColors[w.type] || "#2563eb" }}
                    >
                      {w.type?.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotspot bar chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-4">🦋 Hotspot Plant Species</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={hotspots.slice(0, 5).map(h => ({ name: h.name.split(" ")[0], plants: h.totalPlantSpecies }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => [v.toLocaleString(), "Plant species"]} />
                  <Bar dataKey="plants" radius={[4, 4, 0, 0]} fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          PROTECTED AREAS TAB
      ════════════════════════════════════════ */}
      {activeTab === "protected" && (
        <div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL","NATIONAL_PARK","BIOSPHERE_RESERVE","MARINE_PROTECTED_AREA","UNESCO_WORLD_HERITAGE","NATURE_RESERVE","RAMSAR_WETLAND"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  typeFilter === t ? "bg-green-700 text-white border-green-700" : "bg-white text-slate-600 border-slate-200 hover:border-green-400"
                }`}>
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {protectedAreas
              .filter(a => typeFilter === "ALL" || a.type === typeFilter)
              .map(a => (
                <EarthCard
                  key={a.id}
                  item={a}
                  colorKey={a.type}
                  colorMap={{ NATIONAL_PARK:"#16a34a", BIOSPHERE_RESERVE:"#0891b2", MARINE_PROTECTED_AREA:"#2563eb", UNESCO_WORLD_HERITAGE:"#d97706", NATURE_RESERVE:"#059669", RAMSAR_WETLAND:"#0284c7" }}
                  onClick={item => { setSelected(item); setSelectedType("protected"); }}
                  extra={
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-bold text-green-700">{a.totalSpeciesCount?.toLocaleString() || "—"}</div>
                        <div className="text-xs text-slate-400">Species</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-bold text-amber-600">{a.areaSqKm?.toLocaleString() || "—"}</div>
                        <div className="text-xs text-slate-400">km²</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-bold text-blue-600">{a.establishedYear || "—"}</div>
                        <div className="text-xs text-slate-400">Est.</div>
                      </div>
                    </div>
                  }
                />
              ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          FORESTS TAB
      ════════════════════════════════════════ */}
      {activeTab === "forests" && (
        <div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL","TROPICAL_RAINFOREST","TEMPERATE_FOREST","BOREAL_TAIGA","MANGROVE","CLOUD_FOREST","DRY_DECIDUOUS"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  typeFilter === t ? "bg-green-700 text-white border-green-700" : "bg-white text-slate-600 border-slate-200 hover:border-green-400"
                }`}>
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {forests
              .filter(f => typeFilter === "ALL" || f.type === typeFilter)
              .map(f => (
                <EarthCard
                  key={f.id}
                  item={f}
                  colorKey={f.type}
                  colorMap={forestColors}
                  onClick={item => { setSelected(item); setSelectedType("forest"); }}
                  extra={
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-green-700">{f.totalSpeciesCount?.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">Species</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-amber-600">{f.carbonStoredBillionTons}B t</div>
                          <div className="text-xs text-slate-400">Carbon</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-red-600">{f.deforestationRatePercent}%</div>
                          <div className="text-xs text-slate-400">Deforest</div>
                        </div>
                      </div>
                      <div className={`text-xs px-3 py-1.5 rounded-lg border font-semibold text-center ${threatColors[f.threatLevel] || threatColors.MODERATE}`}>
                        Threat: {f.threatLevel}
                      </div>
                    </div>
                  }
                />
              ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          WATER BODIES TAB
      ════════════════════════════════════════ */}
      {activeTab === "water" && (
        <div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL","OCEAN","RIVER","LAKE","WETLAND","CORAL_REEF","GLACIER","WATERFALL"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  typeFilter === t ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                }`}>
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {waterBodies
              .filter(w => typeFilter === "ALL" || w.type === typeFilter)
              .map(w => (
                <EarthCard
                  key={w.id}
                  item={w}
                  colorKey={w.type}
                  colorMap={waterColors}
                  onClick={item => { setSelected(item); setSelectedType("water"); }}
                  extra={
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-blue-700">{w.totalSpeciesCount?.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">Species</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-slate-600">{w.depthMeters ? `${w.depthMeters}m` : "—"}</div>
                          <div className="text-xs text-slate-400">Depth</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-slate-600">{w.waterQualityScore || "—"}</div>
                          <div className="text-xs text-slate-400">Quality</div>
                        </div>
                      </div>
                      {w.isEndangered && (
                        <div className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-semibold text-center">
                          ⚠️ Endangered water body
                        </div>
                      )}
                    </div>
                  }
                />
              ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          LAND ZONES TAB
      ════════════════════════════════════════ */}
      {activeTab === "land" && (
        <div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL","MOUNTAIN","GRASSLAND","DESERT","TUNDRA","SAVANNA","POLAR","VOLCANIC","ICELAND"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  typeFilter === t ? "bg-amber-700 text-white border-amber-700" : "bg-white text-slate-600 border-slate-200 hover:border-amber-400"
                }`}>
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {landZones
              .filter(l => typeFilter === "ALL" || l.type === typeFilter)
              .map(l => (
                <EarthCard
                  key={l.id}
                  item={l}
                  colorKey={l.type}
                  colorMap={landColors}
                  onClick={item => { setSelected(item); setSelectedType("land"); }}
                  extra={
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-bold text-amber-600">{l.elevationMeters ? `${l.elevationMeters}m` : "—"}</div>
                        <div className="text-xs text-slate-400">Elevation</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-bold text-green-600">{l.totalSpeciesCount?.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">Species</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="text-sm font-bold text-slate-600">{l.areaSqKm ? `${(l.areaSqKm/1000).toFixed(0)}K` : "—"}</div>
                        <div className="text-xs text-slate-400">km²</div>
                      </div>
                    </div>
                  }
                />
              ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          ATMOSPHERE & OZONE TAB
      ════════════════════════════════════════ */}
      {activeTab === "atmosphere" && (
        <div className="flex flex-col gap-8">

          {/* Atmosphere diagram */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-2">
              🌫️ Earth's Atmospheric Layers
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              From ground level to outer space — each layer plays a critical role in protecting and supporting life.
            </p>

            <div className="flex flex-col gap-3">
              {atmosphere.map((layer, i) => (
                <div
                  key={layer.id}
                  onClick={() => { setSelected(layer); setSelectedType("atmosphere"); }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all border border-slate-100"
                  style={{
                    background: `linear-gradient(135deg, ${atmosphereColors[i]}22, ${atmosphereColors[i]}44)`,
                    borderLeft: `4px solid ${atmosphereColors[i]}`,
                  }}
                >
                  <div className="p-5 flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-md"
                      style={{ background: atmosphereColors[i] }}
                    >
                      {layer.layerOrder}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-bold text-slate-800 text-base">{layer.name}</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                          {layer.altitudeRange}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${threatColors[layer.currentStatus] || threatColors.STABLE}`}>
                          {layer.currentStatus}
                        </span>
                        {layer.containsOzone && (
                          <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-semibold">
                            🛡️ Ozone Layer
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed mb-3">
                        {layer.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-white/60 rounded-xl p-3">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Key characteristics</div>
                          <div className="text-xs text-slate-600">{layer.keyCharacteristics}</div>
                        </div>
                        <div className="bg-white/60 rounded-xl p-3">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Life support role</div>
                          <div className="text-xs text-slate-600">{layer.lifeSupport}</div>
                        </div>
                      </div>
                      {layer.threats && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                          ⚠️ Threats: {layer.threats}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-slate-700">
                        {layer.avgTemperatureCelsius > 0 ? "+" : ""}{layer.avgTemperatureCelsius}°C
                      </div>
                      <div className="text-xs text-slate-400">Avg temp</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ozone layer special section */}
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 text-white">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl">🛡️</div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Ozone Layer (O₃)</h2>
                <p className="text-purple-200 text-sm">Located 15–35km in the Stratosphere</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-purple-200 mb-3 text-sm uppercase tracking-wide">
                  What is it?
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  The ozone layer is a region of Earth's stratosphere containing high concentrations
                  of ozone (O₃) — a molecule made of three oxygen atoms. It absorbs 97–99% of the
                  Sun's harmful ultraviolet radiation, especially UV-B and UV-C.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-purple-200 mb-3 text-sm uppercase tracking-wide">
                  Why it matters
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Without the ozone layer, UV radiation would destroy DNA in living cells,
                  cause widespread skin cancers, damage crops and phytoplankton, and make
                  much of Earth uninhabitable for complex life.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Altitude", value: "15–35 km", icon: "📏" },
                { label: "UV absorbed", value: "97–99%", icon: "☀️" },
                { label: "Ozone density", value: "~300 DU", icon: "🧪" },
                { label: "Recovery by", value: "~2066", icon: "🔄" },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-purple-300 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Montreal Protocol", year: "1987", desc: "Historic global agreement to phase out ozone-depleting substances like CFCs and HCFCs.", icon: "📜", color: "border-green-400/30 bg-green-400/10" },
                { title: "Ozone Hole", location: "Antarctica", desc: "Annual ozone hole over Antarctica discovered in 1985. Now slowly recovering thanks to global action.", icon: "🕳️", color: "border-red-400/30 bg-red-400/10" },
                { title: "Current Status", status: "Recovering", desc: "The ozone layer is on track to recover to 1980 levels by around 2066 over Antarctica.", icon: "✅", color: "border-blue-400/30 bg-blue-400/10" },
              ].map(c => (
                <div key={c.title} className={`rounded-xl p-4 border ${c.color}`}>
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">{c.title}</div>
                  <div className="text-xs text-white/70 leading-relaxed">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* UV Index info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4">☀️ UV Index Scale</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { range: "0–2", label: "Low", color: "bg-green-500", desc: "No protection needed" },
                { range: "3–5", label: "Moderate", color: "bg-yellow-400", desc: "Wear sunscreen" },
                { range: "6–7", label: "High", color: "bg-orange-500", desc: "Protective clothing" },
                { range: "8–10", label: "Very High", color: "bg-red-500", desc: "Extra protection" },
                { range: "11+", label: "Extreme", color: "bg-purple-600", desc: "Stay indoors" },
              ].map(u => (
                <div key={u.range} className="text-center">
                  <div className={`${u.color} text-white text-xl font-bold py-3 rounded-xl mb-2`}>
                    {u.range}
                  </div>
                  <div className="font-semibold text-slate-700 text-sm">{u.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{u.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          BIODIVERSITY HOTSPOTS TAB
      ════════════════════════════════════════ */}
      {activeTab === "hotspots" && (
        <div className="flex flex-col gap-6">

          {/* Intro */}
          <div className="bg-gradient-to-r from-green-900 to-emerald-800 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">🦋 What are Biodiversity Hotspots?</h2>
            <p className="text-green-100 text-sm leading-relaxed max-w-3xl">
              A biodiversity hotspot is a biogeographic region that is both a significant reservoir
              of biodiversity and is threatened with destruction. To qualify, a region must contain
              at least <strong>1,500 endemic plant species</strong> and have lost
              at least <strong>70% of its original habitat</strong>. There are 36 recognized hotspots
              covering just 2.4% of Earth's land surface but containing over 50% of all plant species
              and 43% of all vertebrate species.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total hotspots", value: "36", color: "text-green-700", icon: "🌍" },
              { label: "Land area covered", value: "2.4%", color: "text-amber-600", icon: "📏" },
              { label: "Plant species", value: "50%+", color: "text-green-600", icon: "🌱" },
              { label: "Vertebrate species", value: "43%", color: "text-blue-600", icon: "🐾" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Hotspot map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-4">Global Hotspot Distribution</h2>
            <div className="rounded-xl overflow-hidden" style={{ height: 320 }}>
              <MapContainer center={[10, 20]} zoom={2} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {hotspots.filter(h => h.latitude && h.longitude).map(h => (
                  <CircleMarker
                    key={h.id}
                    center={[h.latitude, h.longitude]}
                    radius={Math.max(8, Math.min(20, h.totalPlantSpecies / 1000))}
                    pathOptions={{ color: "#dc2626", fillOpacity: 0.6, weight: 2 }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-bold">{h.name}</div>
                        <div className="text-xs text-gray-500">{h.country}</div>
                        <div className="text-xs mt-1">Plants: {h.totalPlantSpecies?.toLocaleString()}</div>
                        <div className="text-xs">Endemic: {h.endemicPlantSpecies?.toLocaleString()}</div>
                        <div className="text-xs text-red-500">Habitat lost: {h.habitatLostPercent}%</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Hotspot cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotspots.map(h => (
              <EarthCard
                key={h.id}
                item={h}
                colorKey={h.conservationStatus}
                colorMap={{ CRITICAL: "#dc2626", HIGH: "#f97316", MODERATE: "#ca8a04" }}
                onClick={item => { setSelected(item); setSelectedType("hotspot"); }}
                extra={
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-green-700">{h.totalPlantSpecies?.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">Plant species</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-red-600">{h.endemicPlantSpecies?.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">Endemic plants</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-blue-600">{h.totalVertebrates?.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">Vertebrates</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-orange-600">{h.habitatLostPercent}%</div>
                        <div className="text-xs text-slate-400">Habitat lost</div>
                      </div>
                    </div>
                    <div className={`text-xs px-3 py-1.5 rounded-lg border font-semibold text-center ${threatColors[h.conservationStatus] || threatColors.HIGH}`}>
                      {h.conservationStatus} — {h.threatenedSpecies} threatened species
                    </div>
                  </div>
                }
              />
            ))}
          </div>

          {/* Biodiversity types */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-5">
              Types of Biodiversity
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  type: "Genetic Diversity",
                  icon: "🧬",
                  color: "bg-purple-50 border-purple-200",
                  text: "text-purple-700",
                  desc: "Variation in genes within species. Enables adaptation and evolution. A population with more genetic diversity is more resilient to disease and environmental change.",
                  example: "Wild rice varieties have more genetic diversity than cultivated rice.",
                },
                {
                  type: "Species Diversity",
                  icon: "🦎",
                  color: "bg-green-50 border-green-200",
                  text: "text-green-700",
                  desc: "The variety of different species in an ecosystem. Measured by species richness (number) and species evenness (abundance distribution).",
                  example: "Tropical rainforests have the highest species diversity on Earth.",
                },
                {
                  type: "Ecosystem Diversity",
                  icon: "🌏",
                  color: "bg-blue-50 border-blue-200",
                  text: "text-blue-700",
                  desc: "The variety of ecosystems in a region — from coral reefs to deserts, forests to wetlands. Each provides unique services to the biosphere.",
                  example: "Costa Rica has 6 different ecosystem types in a tiny area.",
                },
                {
                  type: "Functional Diversity",
                  icon: "⚙️",
                  color: "bg-amber-50 border-amber-200",
                  text: "text-amber-700",
                  desc: "The variety of roles organisms play in ecosystems — producers, consumers, decomposers. Each function is essential to ecosystem stability.",
                  example: "Bees provide pollination; fungi provide decomposition.",
                },
              ].map(b => (
                <div key={b.type} className={`rounded-2xl border p-5 ${b.color}`}>
                  <div className="text-4xl mb-3">{b.icon}</div>
                  <h3 className={`font-bold text-sm mb-2 ${b.text}`}>{b.type}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-3">{b.desc}</p>
                  <div className="text-xs text-slate-500 italic border-t border-slate-200 pt-2 mt-2">
                    Example: {b.example}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════
          DETAIL MODAL
      ════════════════════════════════════════ */}
      {selected && selectedType === "protected" && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          extraContent={
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Type", value: selected.type?.replace(/_/g, " ") },
                { label: "Established", value: selected.establishedYear },
                { label: "Area", value: `${selected.areaSqKm?.toLocaleString()} km²` },
                { label: "Total species", value: selected.totalSpeciesCount?.toLocaleString() },
                { label: "Endangered species", value: selected.endangeredSpeciesCount },
                { label: "Climate", value: selected.climateType },
                { label: "Vegetation", value: selected.dominantVegetation },
                { label: "Managed by", value: selected.managedBy },
              ].map(f => (
                <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-400">{f.label}</div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">{f.value || "—"}</div>
                </div>
              ))}
              {selected.isUnescoListed && (
                <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center text-amber-700 font-semibold text-sm">
                  🏛️ UNESCO World Heritage Site
                </div>
              )}
            </div>
          }
        />
      )}

      {selected && selectedType === "forest" && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          extraContent={
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Forest type", value: selected.type?.replace(/_/g, " ") },
                { label: "Area", value: `${selected.areaSqKm?.toLocaleString()} km²` },
                { label: "Annual rainfall", value: `${selected.annualRainfallMm} mm` },
                { label: "Avg temperature", value: `${selected.avgTemperatureCelsius}°C` },
                { label: "Total species", value: selected.totalSpeciesCount?.toLocaleString() },
                { label: "Carbon stored", value: `${selected.carbonStoredBillionTons}B tons` },
                { label: "Deforestation rate", value: `${selected.deforestationRatePercent}%/yr` },
                { label: "Dominant trees", value: selected.dominantTrees },
              ].map(f => (
                <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-400">{f.label}</div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">{f.value || "—"}</div>
                </div>
              ))}
              <div className={`col-span-2 rounded-xl p-3 border text-center font-semibold text-sm ${threatColors[selected.threatLevel] || threatColors.MODERATE}`}>
                Threat level: {selected.threatLevel}
              </div>
            </div>
          }
        />
      )}

      {selected && selectedType === "water" && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          extraContent={
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Type", value: selected.type?.replace(/_/g, " ") },
                { label: "Area", value: `${selected.areaSqKm?.toLocaleString()} km²` },
                { label: "Max depth", value: selected.depthMeters ? `${selected.depthMeters}m` : "—" },
                { label: "Length", value: selected.lengthKm ? `${selected.lengthKm} km` : "—" },
                { label: "Species", value: selected.totalSpeciesCount?.toLocaleString() },
                { label: "Quality score", value: `${selected.waterQualityScore}/100` },
                { label: "Status", value: selected.conservationStatus },
                { label: "Major threats", value: selected.majorThreats },
              ].map(f => (
                <div key={f.label} className={`bg-slate-50 rounded-xl p-3 ${f.label === "Major threats" ? "col-span-2" : ""}`}>
                  <div className="text-xs text-slate-400">{f.label}</div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">{f.value || "—"}</div>
                </div>
              ))}
              {selected.isEndangered && (
                <div className="col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 text-center text-red-700 font-semibold text-sm">
                  ⚠️ This water body is endangered
                </div>
              )}
            </div>
          }
        />
      )}

      {selected && selectedType === "land" && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          extraContent={
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Zone type", value: selected.type?.replace(/_/g, " ") },
                { label: "Elevation", value: selected.elevationMeters ? `${selected.elevationMeters}m` : "—" },
                { label: "Area", value: `${selected.areaSqKm?.toLocaleString()} km²` },
                { label: "Climate", value: selected.climateType },
                { label: "Species", value: selected.totalSpeciesCount?.toLocaleString() },
                { label: "Soil type", value: selected.soilType },
                { label: "Vegetation", value: selected.dominantVegetation },
                { label: "Threats", value: selected.majorThreats },
              ].map(f => (
                <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-400">{f.label}</div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">{f.value || "—"}</div>
                </div>
              ))}
            </div>
          }
        />
      )}

      {selected && selectedType === "hotspot" && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          extraContent={
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Total plant species", value: selected.totalPlantSpecies?.toLocaleString() },
                { label: "Endemic plants", value: selected.endemicPlantSpecies?.toLocaleString() },
                { label: "Total vertebrates", value: selected.totalVertebrates?.toLocaleString() },
                { label: "Endemic vertebrates", value: selected.endemicVertebrates?.toLocaleString() },
                { label: "Threatened species", value: selected.threatenedSpecies?.toLocaleString() },
                { label: "Habitat lost", value: `${selected.habitatLostPercent}%` },
                { label: "Original area", value: `${selected.originalAreaSqKm?.toLocaleString()} km²` },
                { label: "Remaining area", value: `${selected.areaSqKm?.toLocaleString()} km²` },
              ].map(f => (
                <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-400">{f.label}</div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">{f.value || "—"}</div>
                </div>
              ))}
              <div className="col-span-2 bg-slate-50 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Major threats</div>
                <div className="text-sm text-slate-700">{selected.majorThreats}</div>
              </div>
            </div>
          }
        />
      )}

    </div>
  );
}