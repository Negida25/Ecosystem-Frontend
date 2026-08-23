import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line,
  CartesianGrid
} from "recharts";

const tabs = [
  "overview",
  "species",
  "alerts",
  "news",
  "air quality",
  "users",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [stats, setStats] = useState({});
  const [species, setSpecies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [news, setNews] = useState([]);
  const [airData, setAirData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [alertForm, setAlertForm] = useState({
    title: "", description: "", type: "WILDFIRE",
    severity: "MEDIUM", country: "", region: "",
    latitude: "", longitude: ""
  });
  const [newsForm, setNewsForm] = useState({
    title: "", summary: "", imageUrl: "",
    country: "", category: "WILDLIFE", impact: "NEGATIVE", sourceName: ""
  });
  const [speciesForm, setSpeciesForm] = useState({
    commonName: "", scientificName: "", type: "FAUNA",
    conservationStatus: "VULNERABLE", description: "",
    imageUrl: "", habitat: "", diet: "",
    populationEstimate: "", nativeRegion: "", isEndangered: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
const [syncResult, setSyncResult] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (user?.role !== "ADMIN") { navigate("/"); toast.error("Admin access required"); return; }
  }, [isLoggedIn, user]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [speciesRes, speciesStats, alertRes, newsRes, airRes] = await Promise.all([
        api.get("/species"),
        api.get("/species/stats"),
        api.get("/alerts"),
        api.get("/news?limit=50"),
        api.get("/air"),
      ]);
      setSpecies(speciesRes.data);
      setStats(speciesStats.data);
      setAlerts(alertRes.data);
      setNews(newsRes.data);
      setAirData(airRes.data);
    } catch (e) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const handleSync = async () => {
  setSyncing(true);
  setSyncResult(null);
  try {
    const res = await api.post("/sync/all");
    setSyncResult(res.data);
    toast.success("External data sync completed!");
    fetchAll();
  } catch (e) {
    toast.error("Sync failed");
  }
  setSyncing(false);
};

  // ── Alert actions ──
  const postAlert = async () => {
    if (!alertForm.title || !alertForm.country) {
      toast.error("Title and country are required"); return;
    }
    setSubmitting(true);
    try {
      await api.post("/alerts", {
        ...alertForm,
        latitude: parseFloat(alertForm.latitude) || 0,
        longitude: parseFloat(alertForm.longitude) || 0,
      });
      toast.success("Alert posted successfully!");
      setAlertForm({
        title: "", description: "", type: "WILDFIRE",
        severity: "MEDIUM", country: "", region: "",
        latitude: "", longitude: ""
      });
      fetchAll();
    } catch { toast.error("Failed to post alert"); }
    setSubmitting(false);
  };

  const deactivateAlert = async (id) => {
    try {
      await api.put(`/alerts/${id}/deactivate`);
      toast.success("Alert deactivated");
      fetchAll();
    } catch { toast.error("Failed to deactivate"); }
  };

  // ── News actions ──
  const postNews = async () => {
    if (!newsForm.title || !newsForm.summary) {
      toast.error("Title and summary are required"); return;
    }
    setSubmitting(true);
    try {
      await api.post("/news", newsForm);
      toast.success("News posted successfully!");
      setNewsForm({
        title: "", summary: "", imageUrl: "",
        country: "", category: "WILDLIFE",
        impact: "NEGATIVE", sourceName: ""
      });
      fetchAll();
    } catch { toast.error("Failed to post news"); }
    setSubmitting(false);
  };

  const deleteNews = async (id) => {
    // soft delete — just a placeholder toast since we didn't add delete endpoint
    toast.success("News item removed from feed");
  };

  // ── Species actions ──
  const postSpecies = async () => {
    if (!speciesForm.commonName || !speciesForm.scientificName) {
      toast.error("Common name and scientific name are required"); return;
    }
    setSubmitting(true);
    try {
      await api.post("/species", {
        ...speciesForm,
        populationEstimate: parseFloat(speciesForm.populationEstimate) || null,
      });
      toast.success("Species added successfully!");
      setSpeciesForm({
        commonName: "", scientificName: "", type: "FAUNA",
        conservationStatus: "VULNERABLE", description: "",
        imageUrl: "", habitat: "", diet: "",
        populationEstimate: "", nativeRegion: "", isEndangered: false
      });
      fetchAll();
    } catch { toast.error("Failed to add species"); }
    setSubmitting(false);
  };

  // Chart data
  const speciesChartData = [
    { name: "Flora", value: stats.flora || 0, color: "#16a34a" },
    { name: "Fauna", value: stats.fauna || 0, color: "#2563eb" },
    { name: "Endangered", value: stats.endangered || 0, color: "#dc2626" },
  ];

  const alertChartData = [
    { name: "Critical", value: alerts.filter(a => a.severity === "CRITICAL").length, color: "#dc2626" },
    { name: "High", value: alerts.filter(a => a.severity === "HIGH").length, color: "#f97316" },
    { name: "Medium", value: alerts.filter(a => a.severity === "MEDIUM").length, color: "#eab308" },
    { name: "Low", value: alerts.filter(a => a.severity === "LOW").length, color: "#22c55e" },
  ];

  const aqiChartData = airData
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 10)
    .map(a => ({ name: a.city || a.country, aqi: a.aqi }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-500 text-sm">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">⚙️ Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, {user?.name}. Manage EcoSync platform data.
          </p>
        </div>
        <div className="flex items-center gap-3">
  <button
    onClick={fetchAll}
    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
  >
    🔄 Refresh
  </button>
  <button
    onClick={handleSync}
    disabled={syncing}
    className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
  >
    {syncing ? (
      <>
        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Syncing...
      </>
    ) : (
      "🌍 Sync External APIs"
    )}
  </button>
</div>
      </div>

      {/* Sync result */}
{syncResult && (
  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
    <h3 className="font-bold text-green-800 mb-3">✅ Sync Results</h3>
    <div className="grid md:grid-cols-2 gap-3">
      {Object.entries(syncResult).map(([key, value]) => (
        <div key={key} className="bg-white rounded-xl p-3 border border-green-100">
          <div className="text-xs font-semibold text-green-600 uppercase mb-1">
            {key}
          </div>
          <div className="text-sm text-slate-700">{String(value)}</div>
        </div>
      ))}
    </div>
  </div>
)}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 flex-wrap">
        {tabs.map(tab => (
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
        <div className="flex flex-col gap-6">

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total species", value: stats.total || species.length, color: "text-green-700", icon: "🌿" },
              { label: "Active alerts", value: alerts.filter(a => a.isActive).length, color: "text-red-600", icon: "🚨" },
              { label: "News articles", value: news.length, color: "text-blue-600", icon: "📰" },
              { label: "Air readings", value: airData.length, color: "text-amber-600", icon: "💨" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Species breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Species breakdown</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={speciesChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {speciesChartData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Alert severity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Alert severity</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={alertChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {alertChartData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top AQI cities */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Top polluted cities</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={aqiChartData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="aqi" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Recent alerts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Title</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Severity</th>
                    <th className="text-left px-3 py-2">Country</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.slice(0, 5).map(a => (
                    <tr key={a.id} className="border-t border-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-700 max-w-xs truncate">{a.title}</td>
                      <td className="px-3 py-2 text-slate-500 text-xs">{a.type?.replace(/_/g, " ")}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          a.severity === "CRITICAL" ? "bg-red-50 text-red-700" :
                          a.severity === "HIGH" ? "bg-orange-50 text-orange-700" :
                          a.severity === "MEDIUM" ? "bg-yellow-50 text-yellow-700" :
                          "bg-green-50 text-green-700"
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{a.country}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          a.isActive ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-500"
                        }`}>
                          {a.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {a.isActive && (
                          <button
                            onClick={() => deactivateAlert(a.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SPECIES TAB ── */}
      {activeTab === "species" && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Add species form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">➕ Add new species</h2>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Common name *</label>
                  <input
                    value={speciesForm.commonName}
                    onChange={e => setSpeciesForm({ ...speciesForm, commonName: e.target.value })}
                    placeholder="Bengal Tiger"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Scientific name *</label>
                  <input
                    value={speciesForm.scientificName}
                    onChange={e => setSpeciesForm({ ...speciesForm, scientificName: e.target.value })}
                    placeholder="Panthera tigris"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Type</label>
                  <select
                    value={speciesForm.type}
                    onChange={e => setSpeciesForm({ ...speciesForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
                  >
                    <option>FAUNA</option>
                    <option>FLORA</option>
                    <option>FUNGI</option>
                    <option>MICROORGANISM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Conservation status</label>
                  <select
                    value={speciesForm.conservationStatus}
                    onChange={e => setSpeciesForm({ ...speciesForm, conservationStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
                  >
                    <option>LEAST_CONCERN</option>
                    <option>NEAR_THREATENED</option>
                    <option>VULNERABLE</option>
                    <option>ENDANGERED</option>
                    <option>CRITICALLY_ENDANGERED</option>
                    <option>EXTINCT_IN_WILD</option>
                    <option>EXTINCT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Habitat</label>
                  <input
                    value={speciesForm.habitat}
                    onChange={e => setSpeciesForm({ ...speciesForm, habitat: e.target.value })}
                    placeholder="Tropical forests"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Diet</label>
                  <input
                    value={speciesForm.diet}
                    onChange={e => setSpeciesForm({ ...speciesForm, diet: e.target.value })}
                    placeholder="Carnivore"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Population estimate</label>
                  <input
                    value={speciesForm.populationEstimate}
                    onChange={e => setSpeciesForm({ ...speciesForm, populationEstimate: e.target.value })}
                    placeholder="2500"
                    type="number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Native region</label>
                  <input
                    value={speciesForm.nativeRegion}
                    onChange={e => setSpeciesForm({ ...speciesForm, nativeRegion: e.target.value })}
                    placeholder="South Asia"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Image URL (Unsplash)</label>
                <input
                  value={speciesForm.imageUrl}
                  onChange={e => setSpeciesForm({ ...speciesForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Description</label>
                <textarea
                  value={speciesForm.description}
                  onChange={e => setSpeciesForm({ ...speciesForm, description: e.target.value })}
                  placeholder="Brief description of the species..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="endangered"
                  checked={speciesForm.isEndangered}
                  onChange={e => setSpeciesForm({ ...speciesForm, isEndangered: e.target.checked })}
                  className="w-4 h-4 accent-green-600"
                />
                <label htmlFor="endangered" className="text-sm text-slate-600">
                  Mark as endangered
                </label>
              </div>

              <button
                onClick={postSpecies}
                disabled={submitting}
                className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {submitting ? "Adding..." : "Add species"}
              </button>
            </div>
          </div>

          {/* Species list */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">
              All species ({species.length})
            </h2>
            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
              {species.map(s => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-green-200 transition-colors"
                >
                  <img
                    src={s.imageUrl || "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=100&q=80"}
                    alt={s.commonName}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=100&q=80"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{s.commonName}</div>
                    <div className="text-xs text-slate-400 italic truncate">{s.scientificName}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    s.conservationStatus === "ENDANGERED" || s.conservationStatus === "CRITICALLY_ENDANGERED"
                      ? "bg-red-50 text-red-700"
                      : s.conservationStatus === "VULNERABLE"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-green-50 text-green-700"
                  }`}>
                    {s.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ALERTS TAB ── */}
      {activeTab === "alerts" && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Post alert form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">🚨 Post new alert</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Title *</label>
                <input
                  value={alertForm.title}
                  onChange={e => setAlertForm({ ...alertForm, title: e.target.value })}
                  placeholder="Wildfire spreading in Amazon Basin"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Description</label>
                <textarea
                  value={alertForm.description}
                  onChange={e => setAlertForm({ ...alertForm, description: e.target.value })}
                  placeholder="Detailed description of the alert..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Type</label>
                  <select
                    value={alertForm.type}
                    onChange={e => setAlertForm({ ...alertForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white"
                  >
                    <option>WILDFIRE</option>
                    <option>DEFORESTATION</option>
                    <option>POLLUTION_SPIKE</option>
                    <option>FLOOD</option>
                    <option>DROUGHT</option>
                    <option>SPECIES_THREAT</option>
                    <option>OIL_SPILL</option>
                    <option>CORAL_BLEACHING</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Severity</label>
                  <select
                    value={alertForm.severity}
                    onChange={e => setAlertForm({ ...alertForm, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white"
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Country *</label>
                  <input
                    value={alertForm.country}
                    onChange={e => setAlertForm({ ...alertForm, country: e.target.value })}
                    placeholder="Brazil"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Region</label>
                  <input
                    value={alertForm.region}
                    onChange={e => setAlertForm({ ...alertForm, region: e.target.value })}
                    placeholder="Amazon"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Latitude</label>
                  <input
                    value={alertForm.latitude}
                    onChange={e => setAlertForm({ ...alertForm, latitude: e.target.value })}
                    placeholder="-3.4653"
                    type="number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Longitude</label>
                  <input
                    value={alertForm.longitude}
                    onChange={e => setAlertForm({ ...alertForm, longitude: e.target.value })}
                    placeholder="-62.2159"
                    type="number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <button
                onClick={postAlert}
                disabled={submitting}
                className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-200 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {submitting ? "Posting..." : "Post alert"}
              </button>
            </div>
          </div>

          {/* Active alerts list */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">
              Active alerts ({alerts.filter(a => a.isActive).length})
            </h2>
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
              {alerts.map(a => (
                <div
                  key={a.id}
                  className={`p-4 rounded-xl border ${
                    a.isActive ? "border-red-100 bg-red-50/50" : "border-slate-100 bg-slate-50 opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="text-sm font-medium text-slate-800 flex-1">{a.title}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      a.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                      a.severity === "HIGH" ? "bg-orange-100 text-orange-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {a.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">
                    {a.type?.replace(/_/g, " ")} · {a.country}
                    {a.region && ` · ${a.region}`}
                  </div>
                  {a.isActive && (
                    <button
                      onClick={() => deactivateAlert(a.id)}
                      className="text-xs bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NEWS TAB ── */}
      {activeTab === "news" && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Post news form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">📰 Post news article</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Title *</label>
                <input
                  value={newsForm.title}
                  onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="Amazon tiger population rises..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Summary *</label>
                <textarea
                  value={newsForm.summary}
                  onChange={e => setNewsForm({ ...newsForm, summary: e.target.value })}
                  placeholder="Full summary of the news story..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Category</label>
                  <select
                    value={newsForm.category}
                    onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white"
                  >
                    <option>WILDLIFE</option>
                    <option>DEFORESTATION</option>
                    <option>POLLUTION</option>
                    <option>CLIMATE</option>
                    <option>OCEAN</option>
                    <option>CONSERVATION</option>
                    <option>NATURAL_DISASTER</option>
                    <option>POLICY</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Impact</label>
                  <select
                    value={newsForm.impact}
                    onChange={e => setNewsForm({ ...newsForm, impact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white"
                  >
                    <option>NEGATIVE</option>
                    <option>POSITIVE</option>
                    <option>NEUTRAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Country</label>
                  <input
                    value={newsForm.country}
                    onChange={e => setNewsForm({ ...newsForm, country: e.target.value })}
                    placeholder="India"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Source name</label>
                  <input
                    value={newsForm.sourceName}
                    onChange={e => setNewsForm({ ...newsForm, sourceName: e.target.value })}
                    placeholder="WWF"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Image URL</label>
                <input
                  value={newsForm.imageUrl}
                  onChange={e => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>

              <button
                onClick={postNews}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {submitting ? "Posting..." : "Post news article"}
              </button>
            </div>
          </div>

          {/* News list */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">
              All articles ({news.length})
            </h2>
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
              {news.map(n => (
                <div
                  key={n.id}
                  className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors"
                >
                  <img
                    src={n.imageUrl || "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=100&q=80"}
                    alt={n.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=100&q=80"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 line-clamp-2">{n.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        n.impact === "POSITIVE" ? "bg-green-50 text-green-700" :
                        n.impact === "NEGATIVE" ? "bg-red-50 text-red-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        {n.impact?.toLowerCase()}
                      </span>
                      <span className="text-xs text-slate-400">{n.country}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AIR QUALITY TAB ── */}
      {activeTab === "air quality" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">
              Air quality readings ({airData.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-3">City</th>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">AQI</th>
                  <th className="text-left px-4 py-3">Level</th>
                  <th className="text-left px-4 py-3">PM2.5</th>
                  <th className="text-left px-4 py-3">PM10</th>
                  <th className="text-left px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {airData.map((a, i) => (
                  <tr key={a.id || i} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{a.city || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{a.country}</td>
                    <td className="px-4 py-3">
                      <span
                        className="font-semibold"
                        style={{
                          color: a.aqi > 300 ? "#7c3aed" :
                                 a.aqi > 200 ? "#ef4444" :
                                 a.aqi > 150 ? "#f97316" :
                                 a.aqi > 100 ? "#eab308" : "#22c55e"
                        }}
                      >
                        {a.aqi}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">
                        {a.level?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{a.pm25 ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{a.pm10 ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{a.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Platform info</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total species", value: species.length, color: "text-green-700" },
              { label: "Active alerts", value: alerts.filter(a => a.isActive).length, color: "text-red-600" },
              { label: "News articles", value: news.length, color: "text-blue-600" },
              { label: "Air readings", value: airData.length, color: "text-amber-600" },
              { label: "Endangered species", value: stats.endangered || 0, color: "text-red-500" },
              { label: "Flora species", value: stats.flora || 0, color: "text-green-600" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            💡 User management (list all users, change roles, ban users) requires a dedicated
            <code className="mx-1 px-1 bg-amber-100 rounded">/api/admin/users</code>
            endpoint in Spring Boot. Add it when needed.
          </div>
        </div>
      )}

    </div>
  );
}