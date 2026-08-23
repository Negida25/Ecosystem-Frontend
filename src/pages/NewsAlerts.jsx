import { useEffect, useState } from "react";
import api from "../api/axios";
import NewsCard from "../components/NewsCard";
import AlertBanner from "../components/AlertBanner";

const categories = ["ALL","DEFORESTATION","WILDLIFE","POLLUTION","CLIMATE","OCEAN","CONSERVATION","NATURAL_DISASTER","POLICY"];

const fallbackNews = [
  { id:1, title:"Amazon wildfire spreads to 45,000 hectares", summary:"A massive wildfire has been detected spreading across the northern Amazon basin, destroying critical habitat for thousands of species.", country:"Brazil", category:"DEFORESTATION", impact:"NEGATIVE", sourceName:"NASA FIRMS", imageUrl:"https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=80" },
  { id:2, title:"Tiger population rises to 4,000 in India", summary:"India's tiger conservation efforts have paid off as the latest census shows tiger populations have reached 4,000 for the first time.", country:"India", category:"WILDLIFE", impact:"POSITIVE", sourceName:"WWF", imageUrl:"https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80" },
  { id:3, title:"Great Barrier Reef sees record coral bleaching", summary:"Scientists report the most severe coral bleaching event on record at the Great Barrier Reef, with 91% of reefs showing bleaching symptoms.", country:"Australia", category:"OCEAN", impact:"NEGATIVE", sourceName:"GBIF", imageUrl:"https://images.unsplash.com/photo-1572204292164-b35ba943fca7?w=600&q=80" },
  { id:4, title:"New marine protected area declared in Pacific", summary:"The UN has declared a massive marine protected area covering 4.5 million square kilometres of the South Pacific Ocean.", country:"Pacific", category:"CONSERVATION", impact:"POSITIVE", sourceName:"UN Environment", imageUrl:"https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80" },
  { id:5, title:"Delhi AQI hits 312 — schools shut for third day", summary:"Delhi's air quality has deteriorated to hazardous levels with an AQI of 312, prompting authorities to shut schools and ban construction.", country:"India", category:"POLLUTION", impact:"NEGATIVE", sourceName:"OpenAQ", imageUrl:"https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=80" },
  { id:6, title:"2 million trees planted in Kenya reforestation drive", summary:"A massive community-led reforestation initiative has successfully planted over 2 million trees across Kenya's degraded forests.", country:"Kenya", category:"CONSERVATION", impact:"POSITIVE", sourceName:"UNEP", imageUrl:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80" },
];

const fallbackAlerts = [
  { id:1, title:"Wildfire spreading in Amazon Basin — 45,000 hectares affected", severity:"CRITICAL", country:"Brazil" },
  { id:2, title:"Air quality hazardous in Delhi. AQI 312.", severity:"HIGH", country:"India" },
  { id:3, title:"Coral bleaching detected across Great Barrier Reef.", severity:"HIGH", country:"Australia" },
  { id:4, title:"Flooding reported across Bangladesh delta regions.", severity:"MEDIUM", country:"Bangladesh" },
];

export default function NewsAlerts() {
  const [news, setNews] = useState(fallbackNews);
  const [alerts, setAlerts] = useState(fallbackAlerts);
  const [category, setCategory] = useState("ALL");
  const [tab, setTab] = useState("news");

  useEffect(() => {
    api.get("/news?limit=20").then(r => { if (r.data.length) setNews(r.data); }).catch(()=>{});
    api.get("/alerts").then(r => { if (r.data.length) setAlerts(r.data); }).catch(()=>{});
  }, []);

  const filteredNews = category === "ALL" ? news : news.filter(n => n.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative rounded-2xl overflow-hidden h-48 mb-8">
        <img src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=90" alt="News" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16ee] to-[#052e1688]" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl font-bold text-white mb-1">News & Alerts</h1>
          <p className="text-green-200 text-sm">Latest ecosystem events, conservation news and real-time alerts</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
        <button onClick={() => setTab("news")} className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${tab==="news" ? "bg-green-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>News Feed</button>
        <button onClick={() => setTab("alerts")} className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${tab==="alerts" ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
          Live Alerts
          <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{alerts.length}</span>
        </button>
      </div>

      {tab === "news" && (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${category===c ? "bg-green-700 text-white border-green-700" : "bg-white text-slate-600 border-slate-200 hover:border-green-400"}`}>
                {c.replace(/_/g," ")}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map(n => <NewsCard key={n.id} news={n} />)}
            {filteredNews.length === 0 && <div className="col-span-full text-center py-16 text-slate-400">No news found.</div>}
          </div>
        </>
      )}

      {tab === "alerts" && (
        <div className="flex flex-col gap-3 max-w-3xl">
          {alerts.map(a => <AlertBanner key={a.id} alert={a} />)}
          {alerts.length === 0 && <div className="text-center py-16 text-slate-400">No active alerts.</div>}
        </div>
      )}
    </div>
  );
}