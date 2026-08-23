import { useEffect, useState } from "react";
import api from "../api/axios";
import SpeciesCard from "../components/SpeciesCard";
import StatCard from "../components/StatCard";
import { useNavigate } from "react-router-dom";

const filters = ["ALL","FLORA","FAUNA","FUNGI"];
const statusFilters = ["ALL","ENDANGERED","CRITICALLY_ENDANGERED","VULNERABLE","LEAST_CONCERN"];

const fallback = [
  { id:1, commonName:"Bengal Tiger", scientificName:"Panthera tigris tigris", type:"FAUNA", conservationStatus:"ENDANGERED", imageUrl:"https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&q=80" },
  { id:2, commonName:"Blue Whale", scientificName:"Balaenoptera musculus", type:"FAUNA", conservationStatus:"ENDANGERED", imageUrl:"https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=400&q=80" },
  { id:3, commonName:"African Lion", scientificName:"Panthera leo", type:"FAUNA", conservationStatus:"VULNERABLE", imageUrl:"https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&q=80" },
  { id:4, commonName:"African Elephant", scientificName:"Loxodonta africana", type:"FAUNA", conservationStatus:"VULNERABLE", imageUrl:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80" },
  { id:5, commonName:"Snow Leopard", scientificName:"Panthera uncia", type:"FAUNA", conservationStatus:"VULNERABLE", imageUrl:"https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&q=80" },
  { id:6, commonName:"Giant Panda", scientificName:"Ailuropoda melanoleuca", type:"FAUNA", conservationStatus:"VULNERABLE", imageUrl:"https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&q=80" },
  { id:7, commonName:"Green Sea Turtle", scientificName:"Chelonia mydas", type:"FAUNA", conservationStatus:"ENDANGERED", imageUrl:"https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400&q=80" },
  { id:8, commonName:"Amazon Water Lily", scientificName:"Victoria amazonica", type:"FLORA", conservationStatus:"LEAST_CONCERN", imageUrl:"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80" },
  { id:9, commonName:"Coral Reef", scientificName:"Acropora palmata", type:"FAUNA", conservationStatus:"CRITICALLY_ENDANGERED", imageUrl:"https://images.unsplash.com/photo-1572204292164-b35ba943fca7?w=400&q=80" },
];

export default function Species() {
  const [species, setSpecies] = useState(fallback);
  const [stats, setStats] = useState({});
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/species").then(r => { if (r.data.length) setSpecies(r.data); }).catch(()=>{});
    api.get("/species/stats").then(r => setStats(r.data)).catch(()=>{});
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) { api.get("/species").then(r => setSpecies(r.data)).catch(()=>{}); return; }
    setLoading(true);
    try { const r = await api.get(`/species/search?query=${query}`); setSpecies(r.data); }
    catch(e) {
      e
    }
    setLoading(false);
  };

  const filtered = species.filter(s => {
    if (typeFilter !== "ALL" && s.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && s.conservationStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative rounded-2xl overflow-hidden h-48 mb-8">
        <img src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1600&q=90" alt="Wildlife" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16ee] to-[#052e1688]" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl font-bold text-white mb-1">Flora & Fauna Explorer</h1>
          <p className="text-green-200 text-sm">Browse and search species from across the world</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total species" value={stats.total?.toLocaleString() || "8.7M"} color="text-green-700" />
        <StatCard label="Flora" value={stats.flora?.toLocaleString() || "391K"} color="text-green-600" />
        <StatCard label="Fauna" value={stats.fauna?.toLocaleString() || "1.2M"} color="text-blue-600" />
        <StatCard label="Endangered" value={stats.endangered?.toLocaleString() || "44K"} color="text-red-600" />
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search species by name..."
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-400"
        />
        <button onClick={handleSearch} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors">
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setTypeFilter(f)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${typeFilter===f ? "bg-green-700 text-white border-green-700" : "bg-white text-slate-600 border-slate-200 hover:border-green-400"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statusFilters.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${statusFilter===f ? "bg-red-700 text-white border-red-700" : "bg-white text-slate-600 border-slate-200 hover:border-red-400"}`}>
            {f.replace(/_/g," ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(s => <SpeciesCard key={s.id} species={s} onClick={(s) => navigate(`/species/${s.id}`)} />)}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">No species found.</div>
        )}
      </div>

      {/* Species detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={selected.imageUrl || "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80"} alt={selected.commonName} className="w-full h-52 object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-800">{selected.commonName}</h2>
              <p className="text-sm italic text-slate-400 mb-3">{selected.scientificName}</p>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-400">Type</div><div className="font-medium">{selected.type}</div></div>
                <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-400">Status</div><div className="font-medium text-red-600">{selected.conservationStatus?.replace(/_/g," ")}</div></div>
                <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-400">Habitat</div><div className="font-medium">{selected.habitat || "—"}</div></div>
                <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs text-slate-400">Region</div><div className="font-medium">{selected.nativeRegion || "—"}</div></div>
              </div>
              {selected.description && <p className="text-sm text-slate-600 leading-relaxed mb-4">{selected.description}</p>}
              <button onClick={() => setSelected(null)} className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}