import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import api from "../api/axios";

// Calculate health score for a country
const calcScore = (airReadings, waterReadings, landReadings, alerts) => {
  let score = 100;

  if (airReadings.length > 0) {
    const avgAqi = airReadings.reduce((s, a) => s + (a.aqi || 0), 0) / airReadings.length;
    if (avgAqi > 300) score -= 30;
    else if (avgAqi > 200) score -= 22;
    else if (avgAqi > 150) score -= 15;
    else if (avgAqi > 100) score -= 8;
    else if (avgAqi > 50) score -= 3;
  }

  if (waterReadings.length > 0) {
    const avgWater = waterReadings.reduce((s, w) => s + (w.qualityScore || 0), 0) / waterReadings.length;
    if (avgWater < 30) score -= 20;
    else if (avgWater < 50) score -= 12;
    else if (avgWater < 70) score -= 5;
    else score += 5;
  }

  if (landReadings.length > 0) {
    const avgDeforest = landReadings.reduce((s, l) => s + (l.deforestationRatePercent || 0), 0) / landReadings.length;
    if (avgDeforest > 4) score -= 20;
    else if (avgDeforest > 2) score -= 12;
    else if (avgDeforest > 1) score -= 6;
  }

  const critical = alerts.filter(a => a.severity === "CRITICAL").length;
  const high = alerts.filter(a => a.severity === "HIGH").length;
  score -= critical * 8;
  score -= high * 4;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const scoreColor = (score) => {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#ca8a04";
  if (score >= 40) return "#ea580c";
  return "#dc2626";
};

const scoreLabel = (score) => {
  if (score >= 80) return { text: "Excellent", bg: "bg-green-50 text-green-700 border-green-200" };
  if (score >= 60) return { text: "Good", bg: "bg-yellow-50 text-yellow-700 border-yellow-200" };
  if (score >= 40) return { text: "Fair", bg: "bg-orange-50 text-orange-700 border-orange-200" };
  if (score >= 20) return { text: "Poor", bg: "bg-red-50 text-red-700 border-red-200" };
  return { text: "Critical", bg: "bg-red-100 text-red-900 border-red-300" };
};

const medalColors = {
  0: "🥇",
  1: "🥈",
  2: "🥉",
};

const countryFlags = {
  "Norway": "🇳🇴", "Canada": "🇨🇦", "Australia": "🇦🇺", "Finland": "🇫🇮",
  "New Zealand": "🇳🇿", "Germany": "🇩🇪", "France": "🇫🇷", "Japan": "🇯🇵",
  "UK": "🇬🇧", "USA": "🇺🇸", "Brazil": "🇧🇷", "Russia": "🇷🇺",
  "China": "🇨🇳", "India": "🇮🇳", "Indonesia": "🇮🇩", "Kenya": "🇰🇪",
  "South Africa": "🇿🇦", "Nigeria": "🇳🇬", "Mexico": "🇲🇽",
  "Bangladesh": "🇧🇩", "Pakistan": "🇵🇰", "Egypt": "🇪🇬",
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("score");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [view, setView] = useState("table");

  useEffect(() => {
    const buildLeaderboard = async () => {
      setLoading(true);
      try {
        const [airRes, waterRes, landRes, alertRes] = await Promise.all([
          api.get("/air"),
          api.get("/water"),
          api.get("/land"),
          api.get("/alerts"),
        ]);

        const airData = airRes.data;
        const waterData = waterRes.data;
        const landData = landRes.data;
        const alertData = alertRes.data;

        // Get unique countries
        const allCountries = new Set([
          ...airData.map(a => a.country),
          ...waterData.map(w => w.country),
          ...landData.map(l => l.country),
          ...alertData.map(a => a.country),
        ]);

        const leaderboard = Array.from(allCountries)
          .filter(Boolean)
          .map(country => {
            const air = airData.filter(a => a.country === country);
            const water = waterData.filter(w => w.country === country);
            const land = landData.filter(l => l.country === country);
            const alerts = alertData.filter(a => a.country === country);
            const score = calcScore(air, water, land, alerts);
            const avgAqi = air.length > 0
              ? Math.round(air.reduce((s, a) => s + (a.aqi || 0), 0) / air.length)
              : null;
            const avgWater = water.length > 0
              ? Math.round(water.reduce((s, w) => s + (w.qualityScore || 0), 0) / water.length)
              : null;
            const avgForest = land.length > 0
              ? Math.round(land.reduce((s, l) => s + (l.forestCoverPercent || 0), 0) / land.length)
              : null;

            return {
              country,
              score,
              avgAqi,
              avgWater,
              avgForest,
              alertCount: alerts.length,
              criticalAlerts: alerts.filter(a => a.severity === "CRITICAL").length,
              flag: countryFlags[country] || "🌍",
            };
          });

        setCountries(leaderboard);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    buildLeaderboard();
  }, []);

  const sorted = [...countries]
    .filter(c => {
      if (filterStatus === "ALL") return true;
      if (filterStatus === "EXCELLENT") return c.score >= 80;
      if (filterStatus === "GOOD") return c.score >= 60 && c.score < 80;
      if (filterStatus === "FAIR") return c.score >= 40 && c.score < 60;
      if (filterStatus === "POOR") return c.score < 40;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "aqi") return (a.avgAqi || 999) - (b.avgAqi || 999);
      if (sortBy === "water") return (b.avgWater || 0) - (a.avgWater || 0);
      if (sortBy === "forest") return (b.avgForest || 0) - (a.avgForest || 0);
      if (sortBy === "alerts") return a.alertCount - b.alertCount;
      return 0;
    });

  const top10 = [...countries].sort((a, b) => b.score - a.score).slice(0, 10);
  const bottom10 = [...countries].sort((a, b) => a.score - b.score).slice(0, 10);
  const chartData = top10.map(c => ({ name: c.country, score: c.score }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-500 text-sm">Calculating ecosystem health scores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-52 mb-8">
        <img
          src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&q=90"
          alt="Earth"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16f0] to-[#052e1677]" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🏆 Ecosystem Health Leaderboard
          </h1>
          <p className="text-green-200 text-sm max-w-xl">
            Countries ranked by ecosystem health score — calculated from air quality,
            water purity, forest cover, and active environmental alerts.
          </p>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Countries tracked",
            value: countries.length,
            color: "text-green-700",
            icon: "🌍"
          },
          {
            label: "Excellent ecosystems",
            value: countries.filter(c => c.score >= 80).length,
            color: "text-green-600",
            icon: "✅"
          },
          {
            label: "At-risk countries",
            value: countries.filter(c => c.score < 40).length,
            color: "text-red-600",
            icon: "⚠️"
          },
          {
            label: "Avg global score",
            value: countries.length > 0
              ? Math.round(countries.reduce((s, c) => s + c.score, 0) / countries.length)
              : 0,
            color: "text-amber-600",
            icon: "📊"
          },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top 10 chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-6">
          Top 10 healthiest ecosystems
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={100}
            />
            <Tooltip
              formatter={v => [`${v}/100`, "Health Score"]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={scoreColor(d.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 3 podium */}
      <h2 className="font-semibold text-slate-800 mb-4">🏆 Top 3 countries</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {top10.slice(0, 3).map((c, i) => (
          <div
            key={c.country}
            onClick={() => navigate(`/country/${c.country}`)}
            className={`bg-white rounded-2xl border-2 p-6 cursor-pointer hover:shadow-lg transition-all ${
              i === 0 ? "border-yellow-400" : i === 1 ? "border-slate-300" : "border-amber-600"
            }`}
          >
            <div className="text-4xl mb-2">{medalColors[i]}</div>
            <div className="text-3xl mb-1">{c.flag}</div>
            <h3 className="text-lg font-bold text-slate-800">{c.country}</h3>
            <div
              className="text-4xl font-bold mt-2 mb-1"
              style={{ color: scoreColor(c.score) }}
            >
              {c.score}
            </div>
            <div className="text-xs text-slate-400 mb-3">/ 100</div>
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${scoreLabel(c.score).bg}`}>
              {scoreLabel(c.score).text}
            </span>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="text-xs font-medium text-amber-600">{c.avgAqi ?? "—"}</div>
                <div className="text-xs text-slate-400">AQI</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="text-xs font-medium text-blue-600">{c.avgWater ?? "—"}</div>
                <div className="text-xs text-slate-400">Water</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="text-xs font-medium text-green-600">{c.avgForest ?? "—"}%</div>
                <div className="text-xs text-slate-400">Forest</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-slate-500 self-center">Filter:</span>
          {["ALL", "EXCELLENT", "GOOD", "FAIR", "POOR"].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-colors ${
                filterStatus === f
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-green-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-slate-500 self-center">Sort by:</span>
          {[
            { key: "score", label: "Health score" },
            { key: "aqi", label: "Best air" },
            { key: "water", label: "Best water" },
            { key: "forest", label: "Most forest" },
            { key: "alerts", label: "Fewest alerts" },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                sortBy === s.key
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              view === "table" ? "bg-green-700 text-white border-green-700" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              view === "grid" ? "bg-green-700 text-white border-green-700" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Table view */}
      {view === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">Health score</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Avg AQI</th>
                  <th className="text-left px-4 py-3">Water score</th>
                  <th className="text-left px-4 py-3">Forest cover</th>
                  <th className="text-left px-4 py-3">Alerts</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => {
                  const label = scoreLabel(c.score);
                  const rank = countries
                    .sort((a, b) => b.score - a.score)
                    .findIndex(x => x.country === c.country) + 1;
                  return (
                    <tr
                      key={c.country}
                      className="border-t border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/country/${c.country}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-slate-400 font-medium">
                          {rank <= 3 ? medalColors[rank - 1] : `#${rank}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.flag}</span>
                          <span className="font-medium text-slate-800">{c.country}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-20">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${c.score}%`,
                                background: scoreColor(c.score)
                              }}
                            />
                          </div>
                          <span
                            className="font-semibold text-sm w-8"
                            style={{ color: scoreColor(c.score) }}
                          >
                            {c.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${label.bg}`}>
                          {label.text}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ color: scoreColor(Math.max(0, 100 - (c.avgAqi || 50))) }}>
                          {c.avgAqi ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{c.avgWater ?? "—"}/100</td>
                      <td className="px-4 py-3 text-slate-600">{c.avgForest != null ? `${c.avgForest}%` : "—"}</td>
                      <td className="px-4 py-3">
                        {c.alertCount > 0 ? (
                          <span className="text-red-600 font-medium">{c.alertCount}</span>
                        ) : (
                          <span className="text-green-600">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-700 text-xs hover:underline">View →</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {sorted.map((c, i) => {
            const label = scoreLabel(c.score);
            const rank = countries
              .sort((a, b) => b.score - a.score)
              .findIndex(x => x.country === c.country) + 1;
            return (
              <div
                key={c.country}
                onClick={() => navigate(`/country/${c.country}`)}
                className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{c.country}</div>
                      <div className="text-xs text-slate-400">
                        {rank <= 3 ? medalColors[rank - 1] : `Rank #${rank}`}
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: scoreColor(c.score) }}
                  >
                    {c.score}
                  </div>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${c.score}%`, background: scoreColor(c.score) }}
                  />
                </div>

                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${label.bg}`}>
                  {label.text}
                </span>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <div className="text-xs font-medium text-amber-600">{c.avgAqi ?? "—"}</div>
                    <div className="text-xs text-slate-400">AQI</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <div className="text-xs font-medium text-blue-600">{c.avgWater ?? "—"}</div>
                    <div className="text-xs text-slate-400">Water</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <div className="text-xs font-medium text-red-500">{c.alertCount}</div>
                    <div className="text-xs text-slate-400">Alerts</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom 5 — most at risk */}
      <h2 className="font-semibold text-slate-800 mb-4">⚠️ Most at-risk ecosystems</h2>
      <div className="flex flex-col gap-3 mb-8">
        {bottom10.slice(0, 5).map((c, i) => (
          <div
            key={c.country}
            onClick={() => navigate(`/country/${c.country}`)}
            className="bg-white rounded-xl border border-red-100 p-4 flex items-center gap-4 cursor-pointer hover:border-red-300 hover:shadow-sm transition-all"
          >
            <div className="text-2xl font-bold text-red-400 w-8">#{i + 1}</div>
            <div className="text-2xl">{c.flag}</div>
            <div className="flex-1">
              <div className="font-medium text-slate-800">{c.country}</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 w-48">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.score}%`, background: scoreColor(c.score) }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: scoreColor(c.score) }}>
                {c.score}
              </div>
              <div className="text-xs text-slate-400">/ 100</div>
            </div>
            {c.criticalAlerts > 0 && (
              <div className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full border border-red-200">
                {c.criticalAlerts} critical
              </div>
            )}
            <span className="text-green-700 text-xs">View →</span>
          </div>
        ))}
      </div>

      {/* Add to home page link */}
      <div className="bg-[#052e16] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold mb-1">Explore any country in detail</h3>
          <p className="text-green-300 text-sm">Click any country to see its full ecosystem profile, species, alerts and AI summary.</p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
        >
          Back to home
        </Link>
      </div>

    </div>
  );
}