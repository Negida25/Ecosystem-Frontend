import { useEffect, useState } from "react";
import api from "../api/axios";

const focusColors = {
  WILDLIFE_CONSERVATION:   "bg-green-100 text-green-800",
  FOREST_PROTECTION:       "bg-emerald-100 text-emerald-800",
  OCEAN_CONSERVATION:      "bg-blue-100 text-blue-800",
  CLIMATE_ACTION:          "bg-amber-100 text-amber-800",
  BIODIVERSITY:            "bg-purple-100 text-purple-800",
  POLLUTION_CONTROL:       "bg-red-100 text-red-800",
  SPECIES_RECOVERY:        "bg-orange-100 text-orange-800",
  HABITAT_RESTORATION:     "bg-teal-100 text-teal-800",
  ENVIRONMENTAL_EDUCATION: "bg-indigo-100 text-indigo-800",
  SUSTAINABLE_DEVELOPMENT: "bg-lime-100 text-lime-800",
};

const focusIcons = {
  WILDLIFE_CONSERVATION:   "🐯",
  FOREST_PROTECTION:       "🌲",
  OCEAN_CONSERVATION:      "🌊",
  CLIMATE_ACTION:          "🌡️",
  BIODIVERSITY:            "🦋",
  POLLUTION_CONTROL:       "💨",
  SPECIES_RECOVERY:        "🔄",
  HABITAT_RESTORATION:     "🌱",
  ENVIRONMENTAL_EDUCATION: "📚",
  SUSTAINABLE_DEVELOPMENT: "♻️",
};

export default function Ngos() {
  const [ngos, setNgos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [focusFilter, setFocusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/ngos")
      .then(r => {
        setNgos(r.data);
        setFiltered(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

useEffect(() => {
    const timer = setTimeout(() => {
      let result = ngos;
      if (focusFilter !== "ALL")
        result = result.filter(n => n.focusArea === focusFilter);
      if (typeFilter !== "ALL")
        result = result.filter(n => n.type === typeFilter);
      if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter(n =>
          n.name?.toLowerCase().includes(q) ||
          n.mission?.toLowerCase().includes(q) ||
          n.country?.toLowerCase().includes(q) ||
          n.relatedSpecies?.toLowerCase().includes(q)
        );
      }
      setFiltered(result);
    }, 0);
    return () => clearTimeout(timer);
  }, [search, focusFilter, typeFilter, ngos]);

  const focuses = ["ALL", ...new Set(ngos.map(n => n.focusArea).filter(Boolean))];
  const types = ["ALL", ...new Set(ngos.map(n => n.type).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-500 text-sm">Loading NGOs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden h-64 mb-8">
        <img
          src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1600&q=90"
          alt="NGOs"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16f0] to-[#052e1666]" />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <div className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            Conservation Organizations
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            🌿 NGO Directory
          </h1>
          <p className="text-green-100 text-sm max-w-xl leading-relaxed">
            Discover the world's leading conservation organizations protecting
            wildlife, forests, oceans and our climate.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              🌍 {ngos.length} Organizations
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              💚 {ngos.filter(n => n.acceptsDonations).length} Accepting donations
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              🌐 100+ Countries covered
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search NGOs by name, country, species..."
          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 hover:border-green-400 focus:border-green-500 rounded-xl text-sm focus:outline-none"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold self-center">
            Focus:
          </span>
          {focuses.map(f => (
            <button
              key={f}
              onClick={() => setFocusFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                focusFilter === f
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-green-400"
              }`}
            >
              {f !== "ALL" ? focusIcons[f] : "📋"} {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold self-center">
            Type:
          </span>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                typeFilter === t
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
              }`}
            >
              {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total NGOs", value: ngos.length, color: "text-green-700", icon: "🌿" },
          { label: "International", value: ngos.filter(n => n.type === "INTERNATIONAL").length, color: "text-blue-600", icon: "🌍" },
          { label: "Showing", value: filtered.length, color: "text-purple-600", icon: "👁️" },
          { label: "Accepting donations", value: ngos.filter(n => n.acceptsDonations).length, color: "text-amber-600", icon: "💚" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* NGO Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(ngo => (
          <div
            key={ngo.id}
            onClick={() => setSelected(ngo)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-green-300 transition-all group"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={ngo.logoUrl || "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=80"}
                alt={ngo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => {
                  e.target.src = "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="bg-white/90 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                  {ngo.acronym || ngo.name.split(" ").map(w => w[0]).join("").slice(0, 4)}
                </span>
              </div>
              {ngo.isVerified && (
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                  ✓ Verified
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-slate-800 text-sm leading-tight flex-1">
                  {ngo.name}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${focusColors[ngo.focusArea] || "bg-slate-100 text-slate-600"}`}>
                  {focusIcons[ngo.focusArea]} {ngo.focusArea?.replace(/_/g, " ")}
                </span>
              </div>

              <div className="text-xs text-slate-400 mb-3">
                📍 {ngo.headquarters} · Founded {ngo.foundedYear}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                {ngo.mission}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-slate-700">
                    {ngo.staffCount?.toLocaleString() || "—"}
                  </div>
                  <div className="text-xs text-slate-400">Staff</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-slate-700 truncate">
                    {ngo.size || "—"}
                  </div>
                  <div className="text-xs text-slate-400">Size</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-slate-700 truncate">
                    {ngo.type?.replace(/_/g, " ") || "—"}
                  </div>
                  <div className="text-xs text-slate-400">Type</div>
                </div>
              </div>

              {ngo.relatedSpecies && (
                <div className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3 line-clamp-1">
                  🌿 Protects: {ngo.relatedSpecies}
                </div>
              )}

              <div className="flex gap-2">
                {ngo.donateUrl && (
                  
                   <a href={ngo.donateUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-semibold text-center transition-colors"
                  >
                    💚 Donate
                  </a>
                )}
                {ngo.website && (
                  <a
                  
                    href={ngo.website}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold text-center transition-colors"
                  >
                    🌐 Visit
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-3">🔍</div>
          <div className="text-slate-500 font-medium">No NGOs found</div>
          <p className="text-slate-400 text-sm mt-1">
            Try a different search or filter
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-52 overflow-hidden rounded-t-3xl">
              <img
                src={selected.logoUrl || "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80"}
                alt={selected.name}
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.src = "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold mb-2 inline-block ${focusColors[selected.focusArea] || "bg-slate-100 text-slate-600"}`}>
                  {focusIcons[selected.focusArea]} {selected.focusArea?.replace(/_/g, " ")}
                </span>
                <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                <p className="text-white/70 text-sm">
                  {selected.headquarters} · Est. {selected.foundedYear}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Staff", value: selected.staffCount?.toLocaleString() || "—" },
                  { label: "Budget", value: selected.annualBudget || "—" },
                  { label: "Countries", value: selected.operatingCountries ? selected.operatingCountries.split(",").length + "+" : "—" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-sm font-bold text-slate-700">{s.value}</div>
                    <div className="text-xs text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-slate-800 mb-2">🎯 Mission</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selected.mission}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-slate-800 mb-2">📖 About</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selected.description}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-slate-800 mb-2">🚀 Current Projects</h3>
                <div className="flex flex-col gap-1.5">
                  {selected.currentProjects?.split(",").map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      {p.trim()}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-slate-800 mb-2">🏆 Key Achievements</h3>
                <div className="flex flex-col gap-1.5">
                  {selected.achievements?.split(",").map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-green-600">✓</span>
                      {a.trim()}
                    </div>
                  ))}
                </div>
              </div>

              {selected.relatedSpecies && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-green-800 mb-2 text-sm">
                    🌿 Species they protect
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {selected.relatedSpecies.split(",").map((s, i) => (
                      <span key={i} className="text-xs bg-white text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.relatedRegions && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                  <h3 className="font-bold text-blue-800 mb-2 text-sm">
                    🗺 Regions they operate in
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {selected.relatedRegions.split(",").map((r, i) => (
                      <span key={i} className="text-xs bg-white text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                        {r.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                {selected.donateUrl && (
                  
                   <a href={selected.donateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-bold text-center transition-colors"
                  >
                    💚 Donate to {selected.acronym || selected.name}
                  </a>
                )}
                {selected.volunteerUrl && (
                  
                  <a  href={selected.volunteerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold text-center transition-colors"
                  >
                    🙋 Volunteer
                  </a>
                )}
                {selected.website && (
                  
                  <a  href={selected.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold text-center transition-colors"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}