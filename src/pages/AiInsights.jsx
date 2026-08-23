import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const suggestions = [
  "How is the Amazon rainforest doing in 2026?",
  "Which are the most endangered species right now?",
  "What is causing ocean acidification?",
  "How can individuals help reduce deforestation?",
  "Why is the Great Barrier Reef bleaching?",
  "What is the current state of air pollution in India?",
  "How does climate change affect biodiversity?",
  "What are the biggest threats to the Himalayas?",
];

export default function AiInsights() {
  const [messages, setMessages] = useState([
    { role:"ai", text:"Hello! I am EcoSync AI. Ask me anything about global ecosystems, biodiversity, climate, air quality, deforestation, or any species on Earth. I'm here to help you understand and protect our planet." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
   const [sources, setSources] = useState([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

 

const ask = async (question) => {
  const q = question || input.trim();
  if (!q) return;
  setMessages(prev => [...prev, { role: "user", text: q }]);
  setInput("");
  setLoading(true);
  setSources([]);
  try {
    const res = await api.post("/ai/ask-rag", { question: q });
    setMessages(prev => [...prev, {
      role: "ai",
      text: res.data.answer,
      sources: res.data.sourcesUsed || [],
      dbDataFound: res.data.dbDataFound,
      wikiDataFound: res.data.wikiDataFound,
    }]);
    setSources(res.data.sourcesUsed || []);
  } catch {
    setMessages(prev => [...prev, {
      role: "ai",
      text: "Sorry, I am having trouble connecting right now.",
      sources: [],
    }]);
  }
  setLoading(false);
};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="relative rounded-2xl overflow-hidden h-40 mb-8">
        <img src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&q=90" alt="Earth" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#052e16ee] to-[#052e1688]" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="text-green-400 text-xs font-medium mb-1">Powered by Groq AI (Llama 3.1)</div>
          <h1 className="text-2xl font-bold text-white">EcoSync AI Insights</h1>
          <p className="text-green-200 text-sm">Ask anything about our planet's ecosystems</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <div className="h-[420px] overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((m, i) => (
  <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${m.role === "ai" ? "bg-green-700 text-white" : "bg-slate-200 text-slate-700"}`}>
      {m.role === "ai" ? "E" : "U"}
    </div>
    <div className={`max-w-[80%] flex flex-col gap-1`}>
      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === "ai" ? "bg-slate-50 text-slate-700 rounded-tl-none" : "bg-green-700 text-white rounded-tr-none"}`}>
        {m.text}
      </div>
      {/* Sources */}
      {m.sources && m.sources.length > 0 && (
        <div className="flex gap-1.5 flex-wrap px-1">
          {m.sources.map((s, si) => (
            <span key={si} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
              📚 {s}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-sm">E</div>
              <div className="bg-slate-50 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay:"0ms" }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay:"150ms" }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay:"300ms" }}></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-slate-100 p-3 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && ask()}
            placeholder="Ask about any ecosystem, species, or climate event..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-400"
            disabled={loading}
          />
          <button onClick={() => ask()} disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-medium transition-colors">
            Ask
          </button>
        </div>
      </div>

      <h2 className="text-slate-700 font-medium mb-3 text-sm">Suggested questions</h2>
      <div className="grid md:grid-cols-2 gap-2">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => ask(s)}
            className="text-left px-4 py-3 bg-white border border-slate-200 hover:border-green-400 rounded-xl text-sm text-slate-700 transition-colors">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}