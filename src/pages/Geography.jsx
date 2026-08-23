import { useEffect, useState } from "react";
import api from "../api/axios";
import RegionCard from "../components/RegionCard";

const types = ["ALL","RAINFOREST","OCEAN","DESERT","MOUNTAIN","GRASSLAND","WETLAND","CORAL_REEF","SAVANNA","TAIGA"];
const continents = ["ALL","Africa","Asia","Europe","North America","South America","Australia","Antarctica"];

const fallback = [
  { id:1, name:"Amazon Rainforest", country:"Brazil", continent:"South America", type:"RAINFOREST", totalSpeciesCount:40000, avgAqi:18, forestCoverPercent:78, description:"World's largest tropical rainforest, home to 10% of all species." },
  { id:2, name:"Congo Basin", country:"DRC", continent:"Africa", type:"RAINFOREST", totalSpeciesCount:10000, avgAqi:22, forestCoverPercent:70, description:"Africa's largest rainforest and second largest in the world." },
  { id:3, name:"Great Barrier Reef", country:"Australia", continent:"Australia", type:"CORAL_REEF", totalSpeciesCount:1500, avgAqi:15, forestCoverPercent:0, description:"World's largest coral reef system with over 2,900 individual reefs." },
  { id:4, name:"Himalayas", country:"Nepal/India", continent:"Asia", type:"MOUNTAIN", totalSpeciesCount:3500, avgAqi:28, forestCoverPercent:35, description:"World's highest mountain range, home to snow leopards and red pandas." },
  { id:5, name:"Sahara Desert", country:"Multiple", continent:"Africa", type:"DESERT", totalSpeciesCount:2800, avgAqi:45, forestCoverPercent:0, description:"World's largest hot desert covering 9.2 million square kilometres." },
  { id:6, name:"Siberian Taiga", country:"Russia", continent:"Asia", type:"TAIGA", totalSpeciesCount:3000, avgAqi:12, forestCoverPercent:85, description:"World's largest forest biome, stretching across northern Russia." },
  { id:7, name:"Pantanal Wetlands", country:"Brazil", continent:"South America", type:"WETLAND", totalSpeciesCount:4700, avgAqi:14, forestCoverPercent:55, description:"World's largest tropical wetland, a haven for caimans and jaguars." },
  { id:8, name:"African Savanna", country:"Kenya/Tanzania", continent:"Africa", type:"SAVANNA", totalSpeciesCount:5000, avgAqi:20, forestCoverPercent:15, description:"Home to the great migration of wildebeest and Africa's big five." },
];

export default function Geography() {
  const [regions, setRegions] = useState(fallback);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [continentFilter, setContinentFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/geography").then(r => { if (r.data.length) setRegions(r.data); }).catch(()=>{});
  }, []);

  const filtered = regions.filter(r => {
    if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
    if (continentFilter !== "ALL" && r.continent !== continentFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative rounded-2xl overflow-hidden h-48 mb-8">
        <img src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1600&q=90" alt="Geography" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16ee] to-[#052e1688]" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl font-bold text-white mb-1">Geography & Ecosystems</h1>
          <p className="text-green-200 text-sm">Explore rainforests, oceans, deserts, mountains and more</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${typeFilter===t ? "bg-green-700 text-white border-green-700" : "bg-white text-slate-600 border-slate-200 hover:border-green-400"}`}>
            {t.replace(/_/g," ")}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {continents.map(c => (
          <button key={c} onClick={() => setContinentFilter(c)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${continentFilter===c ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(r => <RegionCard key={r.id} region={r} onClick={setSelected} />)}
        {filtered.length === 0 && <div className="col-span-full text-center py-16 text-slate-400">No regions found.</div>}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={`https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80`} alt={selected.name} className="w-full h-52 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-slate-800">{selected.name}</h2>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{selected.type?.replace(/_/g," ")}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">{selected.continent} · {selected.country}</p>
              {selected.description && <p className="text-sm text-slate-600 leading-relaxed mb-4">{selected.description}</p>}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold text-green-700">{selected.totalSpeciesCount?.toLocaleString() || "—"}</div><div className="text-xs text-slate-400">Species</div></div>
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold text-amber-600">{selected.avgAqi || "—"}</div><div className="text-xs text-slate-400">Avg AQI</div></div>
                <div className="bg-slate-50 rounded-xl p-3 text-center"><div className="font-semibold text-green-700">{selected.forestCoverPercent ? `${selected.forestCoverPercent}%` : "—"}</div><div className="text-xs text-slate-400">Forest</div></div>
              </div>
              <button onClick={() => setSelected(null)} className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}