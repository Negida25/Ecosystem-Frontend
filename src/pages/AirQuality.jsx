import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";

const aqiColor = (aqi) => {
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#9333ea";
  return "#7c3aed";
};

const aqiLabel = (aqi) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
};

const fallbackData = [
  { city:"Reykjavik", country:"Iceland", aqi:8, pm25:2, pm10:5 },
  { city:"Helsinki", country:"Finland", aqi:18, pm25:5, pm10:9 },
  { city:"Sydney", country:"Australia", aqi:24, pm25:7, pm10:12 },
  { city:"London", country:"UK", aqi:54, pm25:18, pm10:28 },
  { city:"New York", country:"USA", aqi:72, pm25:22, pm10:35 },
  { city:"Beijing", country:"China", aqi:168, pm25:68, pm10:110 },
  { city:"Mumbai", country:"India", aqi:142, pm25:55, pm10:88 },
  { city:"Cairo", country:"Egypt", aqi:155, pm25:60, pm10:95 },
  { city:"Delhi", country:"India", aqi:312, pm25:185, pm10:290 },
  { city:"Lahore", country:"Pakistan", aqi:380, pm25:210, pm10:340 },
];

export default function AirQuality() {
  const [data, setData] = useState(fallbackData);
  const [stats, setStats] = useState({});
  const [country, setCountry] = useState("");

  useEffect(() => {
    api.get("/air").then(r => { if (r.data.length) setData(r.data); }).catch(()=>{});
    api.get("/air/stats").then(r => setStats(r.data)).catch(()=>{});
  }, []);

  const handleFilter = () => {
    if (!country.trim()) { api.get("/air").then(r => setData(r.data)).catch(()=>{}); return; }
    api.get(`/air/country/${country}`).then(r => setData(r.data)).catch(()=>{});
  };

  const chartData = data.slice(0,10).map(d => ({ name: d.city || d.country, aqi: d.aqi }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative rounded-2xl overflow-hidden h-48 mb-8">
        <img src="https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1600&q=90" alt="Air" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16ee] to-[#052e1688]" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl font-bold text-white mb-1">Air Quality Dashboard</h1>
          <p className="text-green-200 text-sm">Real-time AQI data from 6,200+ cities worldwide</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total readings" value={stats.totalReadings || "6,200+"} color="text-green-700" />
        <StatCard label="High pollution zones" value={stats.highPollutionZones || "18"} sub="AQI above 150" color="text-red-600" />
        <StatCard label="Global avg AQI" value="68" sub="Moderate" color="text-amber-600" />
        <StatCard label="Clean cities" value="42%" sub="AQI below 50" color="text-green-700" />
      </div>

      <div className="flex gap-3 mb-8">
        <input
          value={country}
          onChange={e => setCountry(e.target.value)}
          placeholder="Filter by country (e.g. India, China)..."
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-400"
        />
        <button onClick={handleFilter} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-medium">Filter</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">AQI by city</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" domain={[0,500]} tick={{ fontSize:11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11 }} width={80} />
              <Tooltip formatter={(v) => [`${v} — ${aqiLabel(v)}`, "AQI"]} />
              <Bar dataKey="aqi" radius={[0,4,4,0]}>
                {chartData.map((d,i) => <Cell key={i} fill={aqiColor(d.aqi)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">AQI scale reference</h2>
          {[
            { range:"0–50", label:"Good", color:"bg-green-500", text:"Air quality is satisfactory." },
            { range:"51–100", label:"Moderate", color:"bg-yellow-400", text:"Acceptable but some pollutants may affect a few." },
            { range:"101–150", label:"Unhealthy (sensitive)", color:"bg-orange-400", text:"Sensitive groups may experience effects." },
            { range:"151–200", label:"Unhealthy", color:"bg-red-500", text:"Everyone may begin to experience effects." },
            { range:"201–300", label:"Very unhealthy", color:"bg-purple-500", text:"Health alert — everyone affected." },
            { range:"301+", label:"Hazardous", color:"bg-purple-900", text:"Emergency conditions. Avoid all outdoor activity." },
          ].map(s => (
            <div key={s.range} className="flex items-center gap-3 mb-2.5">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex-shrink-0`}></div>
              <div>
                <div className="text-sm font-medium text-slate-700">{s.range} — {s.label}</div>
                <div className="text-xs text-slate-400">{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">All readings</h2>
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
              </tr>
            </thead>
            <tbody>
              {data.map((d,i) => (
                <tr key={d.id||i} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{d.city || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{d.country}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: aqiColor(d.aqi) }}>{d.aqi}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: aqiColor(d.aqi)+"22", color: aqiColor(d.aqi) }}>
                      {d.level?.replace(/_/g," ") || aqiLabel(d.aqi)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{d.pm25 || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{d.pm10 || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}