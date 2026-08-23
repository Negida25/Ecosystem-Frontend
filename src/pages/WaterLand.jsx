import { useEffect, useState } from "react";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import AlertBanner from "../components/AlertBanner";

const fallbackWater = [
  { id:1, waterBodyName:"Amazon River", country:"Brazil", waterBodyType:"River", qualityScore:92, level:"EXCELLENT" },
  { id:2, waterBodyName:"Thames", country:"UK", waterBodyType:"River", qualityScore:74, level:"GOOD" },
  { id:3, waterBodyName:"Lake Baikal", country:"Russia", waterBodyType:"Lake", qualityScore:88, level:"EXCELLENT" },
  { id:4, waterBodyName:"Ganges", country:"India", waterBodyType:"River", qualityScore:28, level:"POOR" },
  { id:5, waterBodyName:"Yangtze", country:"China", waterBodyType:"River", qualityScore:48, level:"FAIR" },
  { id:6, waterBodyName:"Mississippi", country:"USA", waterBodyType:"River", qualityScore:62, level:"GOOD" },
];

const fallbackFires = [
  { id:1, country:"Brazil", region:"Amazon", fireBurnedAreaHectares:45000, deforestationRatePercent:4.2 },
  { id:2, country:"Australia", region:"Queensland", fireBurnedAreaHectares:12000, deforestationRatePercent:1.8 },
  { id:3, country:"Russia", region:"Siberia", fireBurnedAreaHectares:8000, deforestationRatePercent:0.9 },
];

const levelColor = { EXCELLENT:"text-green-600 bg-green-50", GOOD:"text-green-500 bg-green-50", FAIR:"text-amber-600 bg-amber-50", POOR:"text-red-600 bg-red-50", VERY_POOR:"text-red-800 bg-red-100" };

export default function WaterLand() {
  const [water, setWater] = useState(fallbackWater);
  const [fires, setFires] = useState(fallbackFires);
  const [deforestation, setDeforestation] = useState([]);

  useEffect(() => {
    api.get("/water").then(r => { if (r.data.length) setWater(r.data); }).catch(()=>{});
    api.get("/land/fires").then(r => { if (r.data.length) setFires(r.data); }).catch(()=>{});
    api.get("/land/deforestation").then(r => { if (r.data.length) setDeforestation(r.data); }).catch(()=>{});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative rounded-2xl overflow-hidden h-48 mb-8">
        <img src="https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1600&q=90" alt="Water" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a2eee] to-[#0c1a2e88]" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl font-bold text-white mb-1">Water & Land Health</h1>
          <p className="text-blue-200 text-sm">Monitor river quality, ocean health, deforestation and wildfires</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Clean water access" value="71%" color="text-blue-600" />
        <StatCard label="Polluted rivers" value="1,240" color="text-red-600" />
        <StatCard label="Active wildfires" value={fires.length || "8"} color="text-orange-600" />
        <StatCard label="Global forest cover" value="31%" sub="↓ 0.4% this year" color="text-green-700" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Water quality — major bodies</h2>
          <div className="flex flex-col gap-3">
            {water.map(w => (
              <div key={w.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">{w.waterBodyName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColor[w.level] || "text-slate-500 bg-slate-50"}`}>
                      {w.level?.replace(/_/g," ") || "Unknown"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${w.qualityScore || 0}%`,
                        background: w.qualityScore > 70 ? "#22c55e" : w.qualityScore > 40 ? "#eab308" : "#ef4444"
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{w.country} · Score: {w.qualityScore}/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="relative h-48">
            <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80" alt="Forest" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <div className="text-sm font-semibold">Global Forest Cover</div>
              <div className="text-3xl font-bold text-green-400">31%</div>
              <div className="text-xs text-white/70">4.06 billion hectares remaining</div>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-red-600">10M ha</div>
              <div className="text-xs text-red-400">Lost per year</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-green-600">5M ha</div>
              <div className="text-xs text-green-400">Reforested per year</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-800 mb-4">Active wildfires & deforestation</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {fires.map(f => (
          <div key={f.id} className="bg-white rounded-xl border border-orange-200 p-4 flex gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔥</div>
            <div>
              <div className="font-medium text-slate-800">{f.region}, {f.country}</div>
              {f.fireBurnedAreaHectares && <div className="text-sm text-slate-500 mt-0.5">Burned area: <span className="text-orange-600 font-medium">{f.fireBurnedAreaHectares.toLocaleString()} ha</span></div>}
              {f.deforestationRatePercent && <div className="text-sm text-slate-500">Deforestation rate: <span className="text-red-600 font-medium">{f.deforestationRatePercent}%</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}