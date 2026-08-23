import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const categoryColors = {
  species: "bg-green-50 text-green-700 border-green-200",
  news: "bg-blue-50 text-blue-700 border-blue-200",
  alert: "bg-red-50 text-red-700 border-red-200",
  region: "bg-purple-50 text-purple-700 border-purple-200",
};

const categoryIcons = {
  species: "🌿",
  news: "📰",
  alert: "🚨",
  region: "🗺",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const search = async (q) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    try {
      const [speciesRes, newsRes, alertsRes, regionsRes] = await Promise.allSettled([
        api.get(`/species/search?query=${q}`),
        api.get(`/news?limit=50`),
        api.get(`/alerts`),
        api.get(`/geography`),
      ]);

      const combined = [];
      const lq = q.toLowerCase();

      // Species results
      if (speciesRes.status === "fulfilled") {
        speciesRes.value.data.slice(0, 4).forEach(s => {
          combined.push({
            id: `species-${s.id}`,
            type: "species",
            title: s.commonName,
            subtitle: s.scientificName,
            meta: s.conservationStatus?.replace(/_/g, " ").toLowerCase(),
            image: s.imageUrl,
            path: `/species/${s.id}`,
          });
        });
      }

      // News results
      if (newsRes.status === "fulfilled") {
        newsRes.value.data
          .filter(n =>
            n.title?.toLowerCase().includes(lq) ||
            n.summary?.toLowerCase().includes(lq) ||
            n.country?.toLowerCase().includes(lq)
          )
          .slice(0, 3)
          .forEach(n => {
            combined.push({
              id: `news-${n.id}`,
              type: "news",
              title: n.title,
              subtitle: n.summary?.slice(0, 80) + "...",
              meta: n.country,
              image: n.imageUrl,
              path: `/news`,
            });
          });
      }

      // Alert results
      if (alertsRes.status === "fulfilled") {
        alertsRes.value.data
          .filter(a =>
            a.title?.toLowerCase().includes(lq) ||
            a.country?.toLowerCase().includes(lq) ||
            a.type?.toLowerCase().includes(lq)
          )
          .slice(0, 3)
          .forEach(a => {
            combined.push({
              id: `alert-${a.id}`,
              type: "alert",
              title: a.title,
              subtitle: `${a.type?.replace(/_/g, " ")} · ${a.severity}`,
              meta: a.country,
              image: null,
              path: `/news`,
            });
          });
      }

      // Region results
      if (regionsRes.status === "fulfilled") {
        regionsRes.value.data
          .filter(r =>
            r.name?.toLowerCase().includes(lq) ||
            r.country?.toLowerCase().includes(lq) ||
            r.continent?.toLowerCase().includes(lq) ||
            r.type?.toLowerCase().includes(lq)
          )
          .slice(0, 3)
          .forEach(r => {
            combined.push({
              id: `region-${r.id}`,
              type: "region",
              title: r.name,
              subtitle: r.description?.slice(0, 80) + "...",
              meta: `${r.continent} · ${r.type?.replace(/_/g, " ").toLowerCase()}`,
              image: null,
              path: `/geography`,
            });
          });
      }

      // Also add country profile link if query matches a country
      const countryMatch = [
        "India", "Brazil", "China", "Australia", "Russia",
        "USA", "Kenya", "Indonesia", "Norway", "Canada",
        "Germany", "France", "Japan", "UK", "South Africa",
        "Nigeria", "Mexico", "Bangladesh", "Pakistan", "Egypt"
      ].find(c => c.toLowerCase().includes(lq));

      if (countryMatch) {
        combined.unshift({
          id: `country-${countryMatch}`,
          type: "region",
          title: `${countryMatch} — Country Profile`,
          subtitle: `View full ecosystem profile for ${countryMatch}`,
          meta: "Country profile",
          image: null,
          path: `/country/${countryMatch}`,
        });
      }

      setResults(combined);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (item) => {
    navigate(item.path);
    setOpen(false);
    setQuery("");
  };

  const grouped = {
    region: results.filter(r => r.type === "region"),
    species: results.filter(r => r.type === "species"),
    news: results.filter(r => r.type === "news"),
    alert: results.filter(r => r.type === "alert"),
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Search input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">
          🔍
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onFocus={() => query && setOpen(true)}
          placeholder="Search species, countries, news..."
          className="w-full pl-8 pr-16 py-2 bg-green-900/60 border border-green-700 rounded-xl text-sm text-white placeholder-green-400 focus:outline-none focus:border-green-400 focus:bg-green-900 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs hidden md:block">
          Ctrl+K
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[480px] overflow-y-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 px-4 py-3 text-slate-500 text-sm">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              Searching...
            </div>
          )}

          {/* No results */}
          {!loading && results.length === 0 && query.trim() && (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">🔍</div>
              No results for "<strong>{query}</strong>"
              <div className="text-xs mt-1">Try species name, country, or ecosystem type</div>
            </div>
          )}

          {/* Results grouped by type */}
          {!loading && results.length > 0 && (
            <div>
              {Object.entries(grouped).map(([type, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={type}>
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {categoryIcons[type]} {type === "region" ? "Countries & Regions" : type}
                      </span>
                    </div>
                    {items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                      >
                        {/* Image or icon */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <span className="text-lg">{categoryIcons[type]}</span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 text-sm truncate">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-xs text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          )}
                        </div>

                        {/* Badge */}
                        {item.meta && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 capitalize ${categoryColors[type]}`}>
                            {item.meta}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}

              {/* Bottom hint */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">{results.length} results found</span>
                <span className="text-xs text-slate-400">Press Esc to close</span>
              </div>
            </div>
          )}

          {/* Quick links when empty */}
          {!query.trim() && (
            <div className="p-4">
              <div className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wide">
                Quick links
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "🌿 Flora & Fauna", path: "/species" },
                  { label: "🏆 Leaderboard", path: "/leaderboard" },
                  { label: "💨 Air Quality", path: "/air" },
                  { label: "🗺 World Map", path: "/map" },
                  { label: "🤖 AI Insights", path: "/ai" },
                  { label: "📰 News & Alerts", path: "/news" },
                ].map(l => (
                  <button
                    key={l.path}
                    onClick={() => { navigate(l.path); setOpen(false); }}
                    className="text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs text-slate-600 transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}