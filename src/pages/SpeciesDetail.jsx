import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import api from "../api/axios";

const statusColors = {
  EXTINCT: "bg-gray-900 text-white",
  EXTINCT_IN_WILD: "bg-gray-700 text-white",
  CRITICALLY_ENDANGERED: "bg-red-100 text-red-900",
  ENDANGERED: "bg-red-50 text-red-800",
  VULNERABLE: "bg-amber-50 text-amber-800",
  NEAR_THREATENED: "bg-yellow-50 text-yellow-800",
  LEAST_CONCERN: "bg-green-50 text-green-800",
  DATA_DEFICIENT: "bg-slate-50 text-slate-700",
};

const timelineColors = {
  DISCOVERY: "bg-blue-500",
  POPULATION_PEAK: "bg-green-500",
  POPULATION_DECLINE: "bg-red-500",
  CONSERVATION_ACT: "bg-emerald-500",
  THREAT_IDENTIFIED: "bg-orange-500",
  RECOVERY: "bg-teal-500",
  EXTINCTION_RISK: "bg-red-700",
  SCIENTIFIC_STUDY: "bg-purple-500",
  LEGAL_PROTECTION: "bg-indigo-500",
  HABITAT_LOSS: "bg-amber-600",
  BREEDING_PROGRAM: "bg-green-600",
  REINTRODUCTION: "bg-cyan-500",
  OTHER: "bg-slate-500",
};

export default function SpeciesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setLoading(true);
    api.get(`/species/${id}/full-detail`)
      .then(r => setData(r.data))
      .catch(() => {
        // Fallback to basic species
        api.get(`/species/${id}`)
          .then(r => setData({ species: r.data }))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnrich = async () => {
    setEnriching(true);
    try {
      await api.post(`/species/${id}/enrich`);
      // Reload data
      const r = await api.get(`/species/${id}/full-detail`);
      setData(r.data);
    } catch (e) {
      console.error(e);
    }
    setEnriching(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-500 text-sm">Loading species data...</div>
        </div>
      </div>
    );
  }

  if (!data?.species) return (
    <div className="text-center py-20">Species not found.</div>
  );

  const species = data.species;
  const detail = data.detail;
  const popHistory = data.populationHistory || [];
  const timeline = data.timeline || [];

  const statusColor = statusColors[species.conservationStatus] || statusColors.DATA_DEFICIENT;
  const chartData = popHistory.map(p => ({
    year: p.year.toString(),
    population: p.estimatedPopulation,
  }));

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "biology", label: "Biology" },
    { key: "population", label: "Population" },
    { key: "timeline", label: "History Timeline" },
    { key: "threats", label: "Threats" },
    { key: "conservation", label: "Conservation" },
    { key: "map", label: "Distribution" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Back */}
      <button
        onClick={() => navigate("/species")}
        className="flex items-center gap-2 text-green-700 text-sm font-semibold mb-6 hover:underline"
      >
        ← Back to Flora & Fauna
      </button>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden h-80 mb-8">
        <img
          src={species.imageUrl || "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1600&q=90"}
          alt={species.commonName}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1600&q=90"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#052e16f0] via-[#052e1655] to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize mb-3 inline-block ${statusColor}`}>
            {species.conservationStatus?.replace(/_/g, " ").toLowerCase()}
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-1">{species.commonName}</h1>
          <p className="text-green-200 italic text-lg">{species.scientificName}</p>
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{species.type}</span>
            {species.nativeRegion && (
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                📍 {species.nativeRegion}
              </span>
            )}
            {detail?.populationCurrent && (
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                👥 {detail.populationCurrent}
              </span>
            )}
          </div>
        </div>

        {/* Enrich button if not enriched */}
        {!detail && (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleEnrich}
              disabled={enriching}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-colors disabled:bg-slate-400"
            >
              {enriching ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enriching...
                </span>
              ) : "🔍 Load Full Encyclopedia"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap border-b border-slate-200 pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? "bg-green-700 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 text-lg mb-3">About</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {species.description || detail?.wikipediaSummary || "No description available."}
              </p>
              {detail?.ecologicalRole && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="font-semibold text-green-800 text-sm mb-1">
                    🌿 Ecological Role
                  </div>
                  <div className="text-green-700 text-sm">{detail.ecologicalRole}</div>
                </div>
              )}
            </div>

            {/* Origin and evolutionary history */}
            {detail?.originHistory && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-800 text-lg mb-3">
                  🌍 Origin & Evolutionary History
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  {detail.originHistory}
                </p>
                {detail.evolutionaryHistory && (
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {detail.evolutionaryHistory}
                  </p>
                )}
              </div>
            )}

            {/* Quick facts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 text-lg mb-4">Quick Facts</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Type", value: species.type },
                  { label: "Habitat", value: species.habitat || detail?.habitatDescription?.slice(0, 60) },
                  { label: "Diet", value: species.diet || detail?.dietDetails?.slice(0, 60) },
                  { label: "Lifespan", value: detail?.averageLifespanYears },
                  { label: "Weight", value: detail?.averageWeightKg },
                  { label: "Native region", value: species.nativeRegion },
                  { label: "First discovered", value: detail?.firstDiscoveredYear },
                  { label: "Discovered by", value: detail?.discoveredBy },
                  { label: "IUCN assessed", value: detail?.iucnAssessmentYear },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-1">{f.label}</div>
                    <div className="text-sm font-semibold text-slate-700 line-clamp-2">
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural significance */}
            {detail?.culturalSignificance && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-800 text-lg mb-3">
                  🏛️ Cultural Significance
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {detail.culturalSignificance}
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Taxonomy */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">Taxonomy</h2>
              <div className="flex flex-col gap-2">
                {[
                  { rank: "Kingdom", value: species.kingdom },
                  { rank: "Phylum", value: species.phylum },
                  { rank: "Class", value: species.speciesClass },
                  { rank: "Order", value: species.order },
                  { rank: "Family", value: species.family },
                  { rank: "Genus", value: species.genus },
                  { rank: "Species", value: species.scientificName },
                ].map(t => (
                  <div key={t.rank} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-400 font-medium">{t.rank}</span>
                    <span className="text-sm text-slate-700 italic">{t.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* IUCN scale */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">IUCN Red List</h2>
              {[
                { label: "Least Concern", color: "bg-green-500", key: "LEAST_CONCERN" },
                { label: "Near Threatened", color: "bg-yellow-400", key: "NEAR_THREATENED" },
                { label: "Vulnerable", color: "bg-amber-500", key: "VULNERABLE" },
                { label: "Endangered", color: "bg-orange-500", key: "ENDANGERED" },
                { label: "Critically Endangered", color: "bg-red-600", key: "CRITICALLY_ENDANGERED" },
                { label: "Extinct in Wild", color: "bg-gray-600", key: "EXTINCT_IN_WILD" },
                { label: "Extinct", color: "bg-gray-900", key: "EXTINCT" },
              ].map(s => (
                <div key={s.key} className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${species.conservationStatus === s.key ? "bg-slate-100 ring-1 ring-slate-300" : ""}`}>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.color}`} />
                  <span className={`text-xs ${species.conservationStatus === s.key ? "font-bold text-slate-800" : "text-slate-500"}`}>
                    {s.label} {species.conservationStatus === s.key && "← this species"}
                  </span>
                </div>
              ))}
            </div>

            {/* Future outlook */}
            {detail?.futureOutlook && (
              <div className="bg-[#052e16] rounded-2xl p-6">
                <h2 className="text-white font-bold mb-3">🔮 Future Outlook</h2>
                <p className="text-green-200 text-sm leading-relaxed mb-3">
                  {detail.futureOutlook}
                </p>
                {detail.extinctionRisk && (
                  <div className="bg-red-900/30 border border-red-700/30 rounded-xl p-3">
                    <div className="text-red-300 text-xs font-semibold mb-1">Extinction risk</div>
                    <div className="text-red-200 text-xs">{detail.extinctionRisk}</div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── BIOLOGY TAB ── */}
      {activeTab === "biology" && (
        <div className="grid md:grid-cols-2 gap-6">
          {!detail ? (
            <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-slate-500 font-medium mb-3">
                Detailed biology not yet loaded
              </div>
              <button
                onClick={handleEnrich}
                disabled={enriching}
                className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold"
              >
                {enriching ? "Loading..." : "Load Full Encyclopedia"}
              </button>
            </div>
          ) : (
            <>
              {[
                { title: "Physical Description", content: detail.physicalDescription, icon: "🔬" },
                { title: "Diet & Feeding", content: detail.dietDetails, icon: "🍖" },
                { title: "Reproduction", content: detail.reproductionInfo, icon: "🥚" },
                { title: "Behavior", content: detail.behaviorDescription, icon: "🧠" },
                { title: "Habitat", content: detail.habitatDescription, icon: "🌿" },
                { title: "Migration", content: detail.migrationPattern, icon: "✈️" },
              ].filter(s => s.content).map(s => (
                <div key={s.title} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-3">{s.icon} {s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.content}</p>
                </div>
              ))}

              {/* Biology quick stats */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">📊 Physical Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Lifespan", value: detail.averageLifespanYears },
                    { label: "Weight", value: detail.averageWeightKg },
                    { label: "Height", value: detail.averageHeightCm },
                    { label: "Gestation", value: detail.gestationPeriod },
                    { label: "Offspring", value: detail.offspringPerBirth },
                    { label: "Social structure", value: detail.socialStructure },
                    { label: "Predators", value: detail.predators },
                    { label: "Prey", value: detail.prey },
                  ].filter(s => s.value).map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                      <div className="text-xs text-slate-400">{s.label}</div>
                      <div className="text-sm font-medium text-slate-700 mt-0.5 line-clamp-2">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── POPULATION TAB ── */}
      {activeTab === "population" && (
        <div className="flex flex-col gap-6">
          {chartData.length > 0 ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-800 text-lg mb-2">
                  Population History
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Estimated {species.commonName} population from historical records to present day
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={v => v >= 1000000
                        ? `${(v/1000000).toFixed(1)}M`
                        : v >= 1000
                        ? `${(v/1000).toFixed(0)}K`
                        : v}
                    />
                    <Tooltip
                      formatter={v => [v.toLocaleString(), "Population"]}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="population"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#16a34a" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Population table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800">Population by Year</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="text-left px-4 py-3">Year</th>
                      <th className="text-left px-4 py-3">Estimated Population</th>
                      <th className="text-left px-4 py-3">Trend</th>
                      <th className="text-left px-4 py-3">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popHistory.map((p, i) => {
                      const prev = i > 0 ? popHistory[i-1].estimatedPopulation : p.estimatedPopulation;
                      const trend = p.estimatedPopulation > prev ? "↑" : p.estimatedPopulation < prev ? "↓" : "→";
                      const trendColor = trend === "↑" ? "text-green-600" : trend === "↓" ? "text-red-600" : "text-slate-500";
                      return (
                        <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{p.year}</td>
                          <td className="px-4 py-3">{p.estimatedPopulation?.toLocaleString()}</td>
                          <td className={`px-4 py-3 font-bold ${trendColor}`}>{trend}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{p.source}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Population summary */}
              {detail && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-800 text-lg mb-4">Population Summary</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {detail.populationHistory}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { year: "~1900", value: detail.populationIn1900 },
                      { year: "~1950", value: detail.populationIn1950 },
                      { year: "~2000", value: detail.populationIn2000 },
                      { year: "~2020", value: detail.populationIn2020 },
                      { year: "Current", value: detail.populationCurrent },
                    ].filter(p => p.value).map(p => (
                      <div key={p.year} className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-slate-400 mb-1">{p.year}</div>
                        <div className="text-sm font-bold text-green-700">{p.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    detail.populationTrend === "INCREASING"
                      ? "bg-green-50 text-green-700"
                      : detail.populationTrend === "DECREASING"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    Trend: {detail.populationTrend || "Unknown"}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-slate-500 font-medium mb-3">No population data yet</div>
              <button onClick={handleEnrich} disabled={enriching}
                className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold">
                {enriching ? "Loading..." : "Load Population Data"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TIMELINE TAB ── */}
      {activeTab === "timeline" && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-2">
            <h2 className="font-bold text-slate-800 text-lg mb-1">
              History Timeline — {species.commonName}
            </h2>
            <p className="text-slate-400 text-sm">
              Key events from discovery to the present day
            </p>
          </div>

          {timeline.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-slate-500 font-medium mb-3">No timeline yet</div>
              <button onClick={handleEnrich} disabled={enriching}
                className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold">
                {enriching ? "Loading..." : "Generate Timeline"}
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

              <div className="flex flex-col gap-4">
                {timeline.map((event, i) => (
                  <div key={event.id} className="flex gap-4 relative">
                    {/* Dot */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 z-10 shadow-md ${timelineColors[event.eventType] || "bg-slate-500"}`}>
                      {event.year}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 mb-2">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-slate-800 text-sm">{event.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full text-white flex-shrink-0 ${timelineColors[event.eventType] || "bg-slate-500"}`}>
                          {event.eventType?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {event.description}
                      </p>
                      {event.source && (
                        <div className="text-xs text-slate-400 mt-2">
                          Source: {event.source}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── THREATS TAB ── */}
      {activeTab === "threats" && (
        <div className="grid md:grid-cols-2 gap-6">
          {!detail ? (
            <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200">
              <button onClick={handleEnrich} disabled={enriching}
                className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold">
                {enriching ? "Loading..." : "Load Threats Data"}
              </button>
            </div>
          ) : (
            <>
              {[
                { title: "Major Threats", content: detail.majorThreats, icon: "⚠️", color: "border-red-200 bg-red-50" },
                { title: "Human Impact", content: detail.humanImpact, icon: "👤", color: "border-orange-200 bg-orange-50" },
                { title: "Climate Change Impact", content: detail.climateChangeImpact, icon: "🌡️", color: "border-amber-200 bg-amber-50" },
                { title: "Habitat Loss", content: detail.habitatDescription, icon: "🌲", color: "border-yellow-200 bg-yellow-50" },
              ].filter(s => s.content).map(s => (
                <div key={s.title} className={`rounded-2xl border p-6 ${s.color}`}>
                  <h3 className="font-bold text-slate-800 mb-3">{s.icon} {s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.content}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── CONSERVATION TAB ── */}
      {activeTab === "conservation" && (
        <div className="grid md:grid-cols-2 gap-6">
          {!detail ? (
            <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200">
              <button onClick={handleEnrich} disabled={enriching}
                className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold">
                {enriching ? "Loading..." : "Load Conservation Data"}
              </button>
            </div>
          ) : (
            <>
              {[
                { title: "Conservation Efforts", content: detail.conservationEfforts, icon: "🌿" },
                { title: "Legal Protection", content: detail.legalProtection, icon: "⚖️" },
                { title: "Protected Areas", content: detail.protectedAreas, icon: "🏕️" },
                { title: "Recovery Plan", content: detail.recoveryPlan, icon: "📋" },
                { title: "Economic Importance", content: detail.economicImportance, icon: "💰" },
              ].filter(s => s.content).map(s => (
                <div key={s.title} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-3">{s.icon} {s.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{s.content}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── MAP TAB ── */}
      {activeTab === "map" && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-4">Global Distribution Map</h2>
            <div className="rounded-xl overflow-hidden" style={{ height: 400 }}>
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {data.speciesLocations?.map(loc => (
                  <CircleMarker
                    key={loc.id}
                    center={[loc.latitude, loc.longitude]}
                    radius={10}
                    pathOptions={{ color: "#16a34a", fillOpacity: 0.7 }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-bold">{loc.locationName}</div>
                        <div className="text-xs text-gray-500">{loc.country}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            {detail?.geographicRange && (
              <p className="text-slate-500 text-sm mt-3">{detail.geographicRange}</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom links */}
      <div className="mt-8 flex gap-3 flex-wrap">
        <Link to="/species" className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors">
          Browse all species
        </Link>
        <Link to="/ai" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
          Ask AI about this species
        </Link>
        <Link to="/map" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
          View on world map
        </Link>
        {detail?.wikipediaUrl && (
          <a href={detail.wikipediaUrl} target="_blank" rel="noreferrer"
            className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition-colors">
            📖 Wikipedia source
          </a>
        )}
      </div>

    </div>
  );
}