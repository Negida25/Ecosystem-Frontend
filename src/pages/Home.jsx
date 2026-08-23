import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import AlertBanner from "../components/AlertBanner";
import NewsCard from "../components/NewsCard";
import SpeciesCard from "../components/SpeciesCard";
// import { Link } from "react-router-dom";

const fallbackAlerts = [
  { id:1, title:"Wildfire spreading in Amazon Basin — 45,000 hectares affected", severity:"CRITICAL", country:"Brazil" },
  { id:2, title:"Air quality hazardous in Delhi. AQI 312. Avoid outdoor activity.", severity:"HIGH", country:"India" },
  { id:3, title:"Coral bleaching detected across Great Barrier Reef.", severity:"HIGH", country:"Australia" },
];

const fallbackSpecies = [
  { id:1, commonName:"Bengal Tiger", scientificName:"Panthera tigris tigris", type:"FAUNA", conservationStatus:"ENDANGERED", imageUrl:"https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&q=80" },
  { id:2, commonName:"Blue Whale", scientificName:"Balaenoptera musculus", type:"FAUNA", conservationStatus:"ENDANGERED", imageUrl:"https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=400&q=80" },
  { id:3, commonName:"African Lion", scientificName:"Panthera leo", type:"FAUNA", conservationStatus:"VULNERABLE", imageUrl:"https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&q=80" },
  { id:4, commonName:"African Elephant", scientificName:"Loxodonta africana", type:"FAUNA", conservationStatus:"VULNERABLE", imageUrl:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80" },
  { id:5, commonName:"Snow Leopard", scientificName:"Panthera uncia", type:"FAUNA", conservationStatus:"VULNERABLE", imageUrl:"https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&q=80" },
  { id:6, commonName:"Giant Panda", scientificName:"Ailuropoda melanoleuca", type:"FAUNA", conservationStatus:"VULNERABLE", imageUrl:"https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&q=80" },
];

function FloatingAlertButton() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get("/alerts")
      .then(r => setAlerts(r.data.filter(a => a.isActive)))
      .catch(() => {});
  }, []);

  const critical = alerts.filter(a => a.severity === "CRITICAL").length;

  const severityColor = {
    CRITICAL: "border-l-red-500 bg-red-50",
    HIGH: "border-l-orange-400 bg-orange-50",
    MEDIUM: "border-l-yellow-400 bg-yellow-50",
    LOW: "border-l-green-400 bg-green-50",
  };

  const severityDot = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-400",
    MEDIUM: "bg-yellow-400",
    LOW: "bg-green-500",
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#052e16] hover:bg-[#0a3d1f] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-green-800 hover:border-green-600 transition-all group"
      >
        {/* Bell icon */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {critical > 0 && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {critical}
            </span>
          )}
        </div>

        <div className="text-left">
          <div className="text-xs font-bold text-white leading-tight">
            Active Alerts
          </div>
          <div className="text-xs text-green-400 leading-tight">
            {alerts.length} active · {critical} critical
          </div>
        </div>

        {/* Arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-green-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Alert panel */}
      {open && (
        <div className="fixed bottom-28 right-8 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-[#052e16] px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-sm">Active Eco Alerts</div>
              <div className="text-green-400 text-xs mt-0.5">
                {alerts.length} active · {critical} critical
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-green-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {alerts.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                No active alerts right now 🌿
              </div>
            ) : (
              alerts.map(a => (
                <div
                  key={a.id}
                  className={`px-4 py-3.5 border-l-4 ${severityColor[a.severity] || "border-l-slate-300 bg-white"}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot[a.severity] || "bg-slate-400"} ${a.severity === "CRITICAL" ? "animate-pulse" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 leading-snug">
                        {a.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <span className="font-medium">{a.severity}</span>
                        <span>·</span>
                        <span>{a.type?.replace(/_/g, " ")}</span>
                        {a.country && (
                          <>
                            <span>·</span>
                            <span>{a.country}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
            <Link
              to="/news"
              onClick={() => setOpen(false)}
              className="text-green-700 text-xs font-semibold hover:underline flex items-center gap-1"
            >
              View all alerts & news →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [alerts, setAlerts] = useState(fallbackAlerts);
  const [species, setSpecies] = useState(fallbackSpecies);
  const [stats, setStats] = useState({ total:0, endangered:0, flora:0, fauna:0 });
  const [airStats, setAirStats] = useState({ totalReadings:0, highPollutionZones:0 });

  useEffect(() => {
    api.get("/alerts").then(r => { if (r.data.length) setAlerts(r.data.slice(0,3)); }).catch(()=>{});
    api.get("/species").then(r => { if (r.data.length) setSpecies(r.data.slice(0,6)); }).catch(()=>{});
    api.get("/species/stats").then(r => setStats(r.data)).catch(()=>{});
    api.get("/air/stats").then(r => setAirStats(r.data)).catch(()=>{});
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[580px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=90"
          alt="Forest"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#052e16cc] via-[#052e1699] to-[#052e16ee]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-green-900/60 text-green-300 text-xs px-3 py-1 rounded-full mb-4 border border-green-700">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Live ecosystem monitoring — 180+ countries
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            EcoSync —<br />
            <span className="text-green-400">Ecosystem Intelligence</span>
          </h1>
          <p className="text-green-200 text-lg mb-8 max-w-2xl">
            Real-time data on flora, fauna, air, water and land across the world.
            Understand our planet. Protect our future.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link to="/map" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors">
              Explore World Map
            </Link>
            <Link to="/species" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-medium transition-colors">
              Browse Species
            </Link>
            <Link to="/ai" className="px-6 py-3 bg-green-900/60 hover:bg-green-900 text-green-300 border border-green-700 rounded-xl font-medium transition-colors">
              Ask AI
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Global stats */}
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Global ecosystem snapshot</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total species tracked" value={stats.total ? stats.total.toLocaleString() : "8.7M"} sub="Known species on Earth" color="text-green-700" />
          <StatCard label="Endangered species" value={stats.endangered ? stats.endangered.toLocaleString() : "44K"} sub="Facing extinction threat" color="text-red-600" />
          <StatCard label="High pollution zones" value={airStats.highPollutionZones || "18"} sub="AQI above 150" color="text-amber-600" />
          <StatCard label="Active eco alerts" value="24" sub="3 critical right now" color="text-red-600" />
        </div>

  
        {/* Floating active alerts button */}
<FloatingAlertButton />

        {/* Category cards */}
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Explore by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { to:"/map", img:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80", label:"World Map", sub:"Interactive ecosystem map" },
            { to:"/species", img:"https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80", label:"Flora & Fauna", sub:"8.7M species worldwide" },
            { to:"/air", img:"https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=80", label:"Air Quality", sub:"Real-time AQI data" },
            { to:"/water-land", img:"https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=600&q=80", label:"Water & Land", sub:"Rivers, oceans, soil" },
          ].map(c => (
            <Link key={c.to} to={c.to} className="relative rounded-xl overflow-hidden h-36 group">
              <img src={c.img} alt={c.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <div className="text-white font-medium text-sm">{c.label}</div>
                <div className="text-white/70 text-xs">{c.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured species */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Featured species</h2>
          <Link to="/species" className="text-green-700 text-sm hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {species.map(s => <SpeciesCard key={s.id} species={s} />)}
        </div>

        {/* Ecosystem regions banner */}
        <div className="relative rounded-2xl overflow-hidden h-52 mb-10">
          <img
            src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=90"
            alt="Amazon"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#052e16ee] via-[#052e1699] to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <h2 className="text-2xl font-bold text-white mb-2">Explore geography & ecosystems</h2>
            <p className="text-green-200 text-sm mb-4 max-w-md">Dive into rainforests, oceans, deserts, mountains and more. See real-time data for every region on Earth.</p>
            <Link to="/geography" className="w-fit px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
              Explore Regions
            </Link>
          </div>
        </div>

        {/* Leaderboard banner */}
<Link to="/leaderboard" className="block relative rounded-2xl overflow-hidden h-36 mb-10 group">
  <img
    src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&q=90"
    alt="Leaderboard"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  />
  <div className="absolute inset-0 bg-gradient-to-r from-[#052e16ee] to-[#052e1666]" />
  <div className="absolute inset-0 flex items-center px-8 justify-between">
    <div>
      <div className="text-green-400 text-xs font-medium mb-1">Live rankings</div>
      <h3 className="text-xl font-bold text-white">🏆 Ecosystem Health Leaderboard</h3>
      <p className="text-green-200 text-sm">See which countries have the healthiest ecosystems</p>
    </div>
    <div className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
      View Rankings →
    </div>
  </div>
</Link>

        {/* AI section */}
        <div className="bg-[#052e16] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 mb-10">
          <div className="flex-1">
            <div className="text-green-400 text-sm font-medium mb-2">Powered by Groq AI</div>
            <h2 className="text-2xl font-bold text-white mb-3">Ask anything about our planet</h2>
            <p className="text-green-200 text-sm mb-4">
              Get instant AI-powered insights about any ecosystem, species, climate event, or environmental issue anywhere on Earth.
            </p>
            <Link to="/ai" className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors inline-block">
              Open AI Insights
            </Link>
          </div>
          <div className="bg-[#0a3d1f] rounded-xl p-4 w-full md:w-80 text-sm">
            <div className="text-green-300 mb-2 text-xs">Example question</div>
            <div className="text-white mb-3 italic">"How is the Amazon rainforest doing in 2026?"</div>
            <div className="text-green-200 text-xs leading-relaxed">
              The Amazon faces serious threats. Over 17,500 sq miles were lost between 2015–2020 — a 19% increase. It stores 140B tons of CO₂ and hosts 10% of all known species...
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}