import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import api from "../api/axios";
import SpeciesCard from "../components/SpeciesCard";
import AlertBanner from "../components/AlertBanner";
import NewsCard from "../components/NewsCard";


// Country hero images mapped by country name
const countryImages = {
  "India": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=90",
  "Brazil": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=90",
  "China": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600&q=90",
  "Australia": "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=1600&q=90",
  "Russia": "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1600&q=90",
  "USA": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600&q=90",
  "Kenya": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=90",
  "Indonesia": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=90",
  "Norway": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=90",
  "Canada": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1600&q=90",
  "default": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&q=90",
};

// Calculate ecosystem health score 0-100
const calcHealthScore = (airData, waterData, landData, alerts) => {
  let score = 100;

  // Air quality penalty
  if (airData.length > 0) {
    const avgAqi = airData.reduce((s, a) => s + (a.aqi || 0), 0) / airData.length;
    if (avgAqi > 300) score -= 30;
    else if (avgAqi > 200) score -= 22;
    else if (avgAqi > 150) score -= 15;
    else if (avgAqi > 100) score -= 8;
    else if (avgAqi > 50) score -= 3;
  }

  // Water quality bonus/penalty
  if (waterData.length > 0) {
    const avgWater = waterData.reduce((s, w) => s + (w.qualityScore || 0), 0) / waterData.length;
    if (avgWater < 30) score -= 20;
    else if (avgWater < 50) score -= 12;
    else if (avgWater < 70) score -= 5;
    else score += 5;
  }

  // Land/deforestation penalty
  if (landData.length > 0) {
    const avgDeforest = landData.reduce((s, l) => s + (l.deforestationRatePercent || 0), 0) / landData.length;
    if (avgDeforest > 4) score -= 20;
    else if (avgDeforest > 2) score -= 12;
    else if (avgDeforest > 1) score -= 6;
  }

  // Alert penalty
  const criticalAlerts = alerts.filter(a => a.severity === "CRITICAL").length;
  const highAlerts = alerts.filter(a => a.severity === "HIGH").length;
  score -= criticalAlerts * 8;
  score -= highAlerts * 4;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const scoreColor = (score) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-600";
};

const scoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Critical";
};

const scoreBg = (score) => {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-yellow-50 border-yellow-200";
  if (score >= 40) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
};

export default function CountryProfile() {
  const { name } = useParams();
  const navigate = useNavigate();
  const countryName = decodeURIComponent(name);

  const [airData, setAirData] = useState([]);
  const [waterData, setWaterData] = useState([]);
  const [landData, setLandData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [news, setNews] = useState([]);
  const [species, setSpecies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/air/country/${countryName}`).catch(() => ({ data: [] })),
      api.get(`/water/country/${countryName}`).catch(() => ({ data: [] })),
      api.get(`/land/country/${countryName}`).catch(() => ({ data: [] })),
      api.get(`/alerts/country/${countryName}`).catch(() => ({ data: [] })),
      api.get(`/news/country/${countryName}`).catch(() => ({ data: [] })),
      api.get(`/species`).catch(() => ({ data: [] })),
      api.get(`/geography/country/${countryName}`).catch(() => ({ data: [] })),
    ]).then(([air, water, land, alert, newsRes, speciesRes, regionsRes]) => {
      setAirData(air.data);
      setWaterData(water.data);
      setLandData(land.data);
      setAlerts(alert.data);
      setNews(newsRes.data.slice(0, 4));
      // filter species by native region containing country name
      const filtered = speciesRes.data.filter(s =>
        s.nativeRegion?.toLowerCase().includes(countryName.toLowerCase()) ||
        s.nativeRegion?.toLowerCase().includes("global")
      );
      setSpecies(filtered.slice(0, 6));
      setRegions(regionsRes.data);
      setHealthScore(calcHealthScore(air.data, water.data, land.data, alert.data));
    }).finally(() => setLoading(false));
  }, [countryName]);

  const fetchAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await api.post("/ai/ask", {
        question: `Give a concise ecosystem health summary for ${countryName}. Cover: biodiversity, air quality, major environmental challenges, and conservation highlights. Under 120 words.`
      });
      setAiSummary(res.data.answer);
    } catch {
      setAiSummary("AI summary temporarily unavailable.");
    }
    setAiLoading(false);
  };

  const heroImg = countryImages[countryName] || countryImages.default;

  // Radar chart data
  const radarData = [
    { subject: "Air", value: airData.length > 0 ? Math.max(0, 100 - (airData[0]?.aqi || 50)) : 70 },
    { subject: "Water", value: waterData.length > 0 ? (waterData[0]?.qualityScore || 60) : 60 },
    { subject: "Forest", value: landData.length > 0 ? (landData[0]?.forestCoverPercent || 50) : 50 },
    { subject: "Biodiversity", value: species.length > 0 ? Math.min(100, species.length * 12) : 50 },
    { subject: "Alerts", value: Math.max(0, 100 - alerts.length * 15) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-500 text-sm">Loading {countryName} ecosystem data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-green-700 hover:text-green-600 text-sm font-medium mb-6"
      >
        ← Back
      </button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-72 mb-8">
        <img
          src={heroImg}
          alt={countryName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#052e16f0] via-[#052e1655] to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 flex items-end justify-between w-full">
          <div>
            <div className="text-green-400 text-xs font-medium mb-1 uppercase tracking-wide">
              Country Ecosystem Profile
            </div>
            <h1 className="text-4xl font-bold text-white mb-1">{countryName}</h1>
            <p className="text-green-200 text-sm">
              {regions.length > 0 ? regions.map(r => r.name).join(" · ") : "Ecosystem intelligence report"}
            </p>
          </div>
          {healthScore !== null && (
            <div className={`bg-white/10 backdrop-blur border rounded-2xl p-4 text-center min-w-[100px] ${scoreBg(healthScore)}`}>
              <div className={`text-4xl font-bold ${scoreColor(healthScore)}`}>{healthScore}</div>
              <div className="text-xs text-slate-600 mt-1">Health score</div>
              <div className={`text-xs font-medium mt-0.5 ${scoreColor(healthScore)}`}>{scoreLabel(healthScore)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Air readings", value: airData.length, color: "text-amber-600", icon: "💨" },
          { label: "Water bodies", value: waterData.length, color: "text-blue-600", icon: "💧" },
          { label: "Land zones", value: landData.length, color: "text-green-600", icon: "🌿" },
          { label: "Active alerts", value: alerts.length, color: "text-red-600", icon: "🚨" },
          { label: "Eco regions", value: regions.length, color: "text-purple-600", icon: "🗺" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 flex-wrap">
        {["overview", "air", "water & land", "species", "alerts", "news"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-green-700 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Active alerts preview */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-800 mb-4">Active alerts</h2>
                <div className="flex flex-col gap-3">
                  {alerts.slice(0, 3).map(a => <AlertBanner key={a.id} alert={a} />)}
                </div>
                {alerts.length > 3 && (
                  <button onClick={() => setActiveTab("alerts")} className="text-green-700 text-sm mt-3 hover:underline">
                    View all {alerts.length} alerts →
                  </button>
                )}
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Ecosystem map</h2>
              <div className="rounded-xl overflow-hidden" style={{ height: 300 }}>
                <MapContainer
                  center={[20, 78]}
                  zoom={3}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {airData.filter(a => a.latitude && a.longitude).map(a => (
                    <CircleMarker
                      key={a.id}
                      center={[a.latitude, a.longitude]}
                      radius={8}
                      pathOptions={{ color: a.aqi > 150 ? "#ef4444" : "#f59e0b", fillOpacity: 0.7 }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{a.city}</div>
                          <div className="text-xs">AQI: {a.aqi} — {a.level?.replace(/_/g, " ")}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                  {alerts.filter(a => a.latitude && a.longitude).map(a => (
                    <CircleMarker
                      key={`alert-${a.id}`}
                      center={[a.latitude, a.longitude]}
                      radius={10}
                      pathOptions={{ color: "#ef4444", fillOpacity: 0.6 }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{a.title}</div>
                          <div className="text-xs">{a.severity}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Species preview */}
            {species.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-slate-800">Native species</h2>
                  <button onClick={() => setActiveTab("species")} className="text-green-700 text-sm hover:underline">
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {species.slice(0, 3).map(s => (
                    <SpeciesCard
                      key={s.id}
                      species={s}
                      onClick={sp => navigate(`/species/${sp.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Radar chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Ecosystem balance</h2>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar
                    dataKey="value"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip formatter={v => [`${v}/100`, "Score"]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Health score breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Health score breakdown</h2>
              {[
                {
                  label: "Air quality",
                  value: airData.length > 0 ? Math.max(0, 100 - (airData[0]?.aqi || 50)) : 70,
                  color: "bg-amber-400"
                },
                {
                  label: "Water quality",
                  value: waterData.length > 0 ? (waterData[0]?.qualityScore || 60) : 60,
                  color: "bg-blue-400"
                },
                {
                  label: "Forest cover",
                  value: landData.length > 0 ? (landData[0]?.forestCoverPercent || 50) : 50,
                  color: "bg-green-500"
                },
                {
                  label: "Alert severity",
                  value: Math.max(0, 100 - alerts.length * 15),
                  color: "bg-red-400"
                },
              ].map(item => (
                <div key={item.label} className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{item.label}</span>
                    <span>{Math.round(item.value)}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI summary */}
            <div className="bg-[#052e16] rounded-2xl p-6">
              <div className="text-green-400 text-xs font-medium mb-1">Powered by Groq AI</div>
              <h2 className="text-white font-semibold mb-3">AI Ecosystem Summary</h2>
              {aiSummary ? (
                <p className="text-green-100 text-sm leading-relaxed">{aiSummary}</p>
              ) : (
                <p className="text-green-300 text-sm mb-3">
                  Get an AI-generated ecosystem health summary for {countryName}.
                </p>
              )}
              <button
                onClick={fetchAiSummary}
                disabled={aiLoading}
                className="mt-4 w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {aiLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating...
                  </span>
                ) : aiSummary ? "Regenerate" : "Generate summary"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── AIR TAB ── */}
      {activeTab === "air" && (
        <div className="flex flex-col gap-4">
          {airData.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No air quality data for {countryName}.</div>
          ) : (
            airData.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{a.city}</h3>
                    <p className="text-slate-400 text-sm">{a.country}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{
                      color: a.aqi > 300 ? "#7c3aed" : a.aqi > 200 ? "#ef4444" : a.aqi > 150 ? "#f97316" : a.aqi > 100 ? "#eab308" : "#22c55e"
                    }}>{a.aqi}</div>
                    <div className="text-xs text-slate-400">AQI</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { label: "PM2.5", value: a.pm25, unit: "µg/m³" },
                    { label: "PM10", value: a.pm10, unit: "µg/m³" },
                    { label: "NO₂", value: a.no2, unit: "µg/m³" },
                    { label: "SO₂", value: a.so2, unit: "µg/m³" },
                    { label: "CO", value: a.co, unit: "mg/m³" },
                    { label: "O₃", value: a.o3, unit: "µg/m³" },
                  ].map(p => (
                    <div key={p.label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-sm font-semibold text-slate-700">{p.value ?? "—"}</div>
                      <div className="text-xs text-slate-400">{p.label}</div>
                      <div className="text-xs text-slate-300">{p.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── WATER & LAND TAB ── */}
      {activeTab === "water & land" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-slate-800 mb-4">Water bodies</h2>
            {waterData.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-200">
                No water data for {countryName}.
              </div>
            ) : (
              waterData.map(w => (
                <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-slate-800">{w.waterBodyName}</h3>
                      <p className="text-xs text-slate-400">{w.waterBodyType} · {w.country}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      w.level === "EXCELLENT" ? "bg-green-50 text-green-700" :
                      w.level === "GOOD" ? "bg-green-50 text-green-600" :
                      w.level === "FAIR" ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {w.level?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${w.qualityScore}%`,
                        background: w.qualityScore > 70 ? "#22c55e" : w.qualityScore > 40 ? "#eab308" : "#ef4444"
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-sm font-medium">{w.ph ?? "—"}</div>
                      <div className="text-xs text-slate-400">pH</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-sm font-medium">{w.dissolvedOxygen ?? "—"}</div>
                      <div className="text-xs text-slate-400">DO mg/L</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-sm font-medium">{w.qualityScore ?? "—"}</div>
                      <div className="text-xs text-slate-400">Score</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <h2 className="font-semibold text-slate-800 mb-4">Land health</h2>
            {landData.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-200">
                No land data for {countryName}.
              </div>
            ) : (
              landData.map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-slate-800">{l.region}</h3>
                      <p className="text-xs text-slate-400">{l.country}</p>
                    </div>
                    {l.activeFireDetected && (
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                        🔥 Active fire
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Forest cover", value: `${l.forestCoverPercent ?? "—"}%`, color: "text-green-600" },
                      { label: "Deforestation rate", value: `${l.deforestationRatePercent ?? "—"}%`, color: "text-red-600" },
                      { label: "Soil health", value: `${l.soilHealthScore ?? "—"}/100`, color: "text-amber-600" },
                      { label: "Biodiversity index", value: `${l.biodiversityIndex ?? "—"}/100`, color: "text-blue-600" },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                        <div className={`text-sm font-semibold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-slate-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  {l.fireBurnedAreaHectares > 0 && (
                    <div className="mt-3 bg-orange-50 rounded-xl p-3 text-sm text-orange-700">
                      🔥 Burned area: <strong>{l.fireBurnedAreaHectares?.toLocaleString()} hectares</strong>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── SPECIES TAB ── */}
      {activeTab === "species" && (
        <div>
          {species.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              No species data linked to {countryName} yet.
              <div className="mt-2">
                <Link to="/species" className="text-green-700 hover:underline text-sm">Browse all species →</Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-500 text-sm mb-4">
                Showing species native to or found in {countryName}.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {species.map(s => (
                  <SpeciesCard
                    key={s.id}
                    species={s}
                    onClick={sp => navigate(`/species/${sp.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ALERTS TAB ── */}
      {activeTab === "alerts" && (
        <div className="flex flex-col gap-3 max-w-3xl">
          {alerts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No active alerts for {countryName}.</div>
          ) : (
            alerts.map(a => <AlertBanner key={a.id} alert={a} />)
          )}
        </div>
      )}

      {/* ── NEWS TAB ── */}
      {activeTab === "news" && (
        <div>
          {news.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No news for {countryName}.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map(n => <NewsCard key={n.id} news={n} />)}
            </div>
          )}
        </div>
      )}

    </div>
  );
}