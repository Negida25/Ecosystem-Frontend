import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const categoryColors = {
  SPECIES:      "bg-green-100 text-green-800 border-green-200",
  GEOGRAPHY:    "bg-blue-100 text-blue-800 border-blue-200",
  CLIMATE:      "bg-amber-100 text-amber-800 border-amber-200",
  POLLUTION:    "bg-red-100 text-red-800 border-red-200",
  CONSERVATION: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DISASTER:     "bg-orange-100 text-orange-800 border-orange-200",
  POLICY:       "bg-purple-100 text-purple-800 border-purple-200",
  GENERAL:      "bg-slate-100 text-slate-700 border-slate-200",
};

const categoryIcons = {
  SPECIES:      "🌿",
  GEOGRAPHY:    "🗺️",
  CLIMATE:      "🌡️",
  POLLUTION:    "💨",
  CONSERVATION: "♻️",
  DISASTER:     "🔥",
  POLICY:       "⚖️",
  GENERAL:      "🧠",
};

export default function KnowledgeBase() {
  const [knowledge, setKnowledge] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = knowledge;
    if (activeCategory !== "ALL") {
      result = result.filter(k => k.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(k =>
        k.topic?.toLowerCase().includes(q) ||
        k.question?.toLowerCase().includes(q) ||
        k.answer?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, knowledge, activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [knowledgeRes, statsRes] = await Promise.all([
        api.get("/ai/knowledge"),
        api.get("/ai/knowledge/stats"),
      ]);
      setKnowledge(knowledgeRes.data);
      setFiltered(knowledgeRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleEnrich = async () => {
    setEnriching(true);
    try {
      await api.post("/ai/knowledge/enrich");
      setTimeout(() => {
        fetchData();
        setEnriching(false);
      }, 5000);
    } catch {
      setEnriching(false);
    }
  };

  const formatAnswer = (answer) => {
    if (!answer) return "";
    return answer
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>');
  };

  const categories = ["ALL", ...(stats?.categories || [])];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-500 text-sm">Loading knowledge base...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden h-56 mb-8">
        <img
          src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&q=90"
          alt="Knowledge"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16f0] to-[#052e1655]" />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <div className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            Self-Learning AI Database
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            🧠 EcoSync Knowledge Base
          </h1>
          <p className="text-green-100 text-sm max-w-xl">
            Every question asked on EcoSync is automatically researched
            and saved here — building a growing encyclopedia of ecosystem knowledge.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              🧠 {stats?.total || 0} Topics saved
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              📚 {stats?.categories?.length || 0} Categories
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-4 py-2 rounded-full">
              ✅ {stats?.verified || 0} Verified
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search topics, questions, answers..."
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 hover:border-green-400 focus:border-green-500 rounded-xl text-sm focus:outline-none"
          />
        </div>

        {/* Enrich button */}
        <button
          onClick={handleEnrich}
          disabled={enriching}
          className="px-5 py-3 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {enriching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enriching...
            </>
          ) : "🧠 Auto-Enrich"}
        </button>

        {/* Refresh */}
        <button
          onClick={fetchData}
          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeCategory === cat
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-slate-600 border-slate-200 hover:border-green-400"
            }`}
          >
            {cat !== "ALL" ? categoryIcons[cat] : "📋"} {cat}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total topics", value: stats?.total || 0, icon: "🧠", color: "text-green-700" },
          { label: "Categories", value: stats?.categories?.length || 0, icon: "📚", color: "text-blue-600" },
          { label: "Showing", value: filtered.length, icon: "👁️", color: "text-purple-600" },
          { label: "Auto-saved today", value: knowledge.filter(k => {
            const today = new Date().toDateString();
            return new Date(k.createdAt).toDateString() === today;
          }).length, icon: "💾", color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Knowledge cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-3">🔍</div>
          <div className="text-slate-500 font-medium">No topics found</div>
          <p className="text-slate-400 text-sm mt-1">
            Ask a question on the AI page — it will be saved here automatically
          </p>
          <Link
            to="/ai"
            className="inline-block mt-4 px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold"
          >
            Ask AI →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${categoryColors[item.category] || categoryColors.GENERAL}`}>
                      {categoryIcons[item.category]} {item.category}
                    </span>
                    {item.viewCount > 0 && (
                      <span className="text-xs text-slate-400">
                        👁 {item.viewCount} views
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm capitalize">
                    {item.topic}
                  </h3>
                </div>
              </div>

              {/* Question */}
              <p className="text-xs text-green-700 font-medium mb-2 line-clamp-2">
                Q: {item.question}
              </p>

              {/* Summary */}
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                {item.summary || item.answer?.slice(0, 150) + "..."}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.relatedSpecies && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      🌿 {item.relatedSpecies}
                    </span>
                  )}
                  {item.relatedRegion && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      🗺 {item.relatedRegion}
                    </span>
                  )}
                  {item.relatedCountry && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                      🌍 {item.relatedCountry}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              {/* Source */}
              {item.source && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <div className="text-xs text-slate-400">
                    📚 Source: {item.source.replace(/[\[\]]/g, "")}
                  </div>
                </div>
              )}
            </div>
          ))}
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
            {/* Modal header */}
            <div className="bg-[#052e16] p-6 rounded-t-3xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${categoryColors[selected.category] || categoryColors.GENERAL} mb-2 inline-block`}>
                    {categoryIcons[selected.category]} {selected.category}
                  </span>
                  <h2 className="text-xl font-bold text-white capitalize mt-1">
                    {selected.topic}
                  </h2>
                  <p className="text-green-300 text-sm mt-1">{selected.question}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Meta */}
              <div className="flex gap-3 flex-wrap mb-5">
                {selected.relatedSpecies && (
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-medium">
                    🌿 {selected.relatedSpecies}
                  </span>
                )}
                {selected.relatedRegion && (
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
                    🗺 {selected.relatedRegion}
                  </span>
                )}
                {selected.relatedCountry && (
                  <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-medium">
                    🌍 {selected.relatedCountry}
                  </span>
                )}
                <span className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-full">
                  👁 {selected.viewCount} views
                </span>
                <span className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-full">
                  📅 {new Date(selected.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              {/* Answer */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Answer
                </div>
                <div
                  className="text-sm text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: `<p class="mb-3">${formatAnswer(selected.answer)}</p>`
                  }}
                />
              </div>

              {/* Source */}
              {selected.source && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                  <div className="text-xs font-bold text-green-700 mb-1">
                    📚 Sources
                  </div>
                  <div className="text-xs text-green-600">
                    {selected.source.replace(/[\[\]]/g, "")}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link
                  to="/ai"
                  className="flex-1 py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-semibold text-center transition-colors"
                >
                  Ask follow-up →
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}