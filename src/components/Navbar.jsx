import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import api from "../api/axios";


const navGroups = [
  {
  label: "🌍 Explore",
  children: [
    { path: "/map", label: "World Map" },
    { path: "/earth", label: "Earth Explorer" },
    { path: "/geography", label: "Geography" },
    { path: "/leaderboard", label: "🏆 Leaderboard" },
    { path: "/ngos", label: "🌿 NGO Directory" },
    { path: "/knowledge", label: "🧠 Knowledge Base" },
  ],
},
  {
    label: "🌿 Species",
    children: [
      { path: "/species", label: "Flora & Fauna" },
    ],
  },
  {
    label: "📊 Environment",
    children: [
      { path: "/air", label: "Air Quality" },
      { path: "/water-land", label: "Water & Land" },
    ],
  },
  {
    label: "📰 Updates",
    children: [
      { path: "/news", label: "News & Alerts" },
      { path: "/ai", label: "AI Insights" },
    ],
  },
];



const allLinks = [
  { path: "/", label: "Home" },
  { path: "/map", label: "World Map" },
  { path: "/earth", label: "Earth Explorer" },
  { path: "/species", label: "Flora & Fauna" },
  { path: "/air", label: "Air Quality" },
  { path: "/water-land", label: "Water & Land" },
  { path: "/geography", label: "Geography" },
  { path: "/ai", label: "AI Insights" },
  { path: "/news", label: "News & Alerts" },
  { path: "/leaderboard", label: "🏆 Leaderboard" },
  { path: "/profile", label: "👤 Profile" },
];



// ── Search Icon ──
function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

// ── Dropdown Nav Item ──
function NavDropdown({ group, currentPath }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = group.children.some(c => c.path === currentPath);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
          isActive
            ? "bg-green-600 text-white"
            : "text-green-300 hover:bg-green-800/70 hover:text-white"
        }`}
      >
        {group.label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 min-w-[180px]">
          {group.children.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b border-slate-50 last:border-0 ${
                currentPath === item.path
                  ? "bg-green-50 text-green-700"
                  : "text-slate-700 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {currentPath === item.path && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              )}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Donate Button ──
function DonateButton() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);
    try {
      const orderRes = await api.post("/donation/create-order", { amount });
      const { orderId, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: "INR",
        name: "EcoSync",
        description: "Donate to protect ecosystems",
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post("/donation/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setOpen(false);
            alert(`Thank you for donating ₹${amount} to EcoSync! 🌿`);
          } catch {
            alert("Payment verification failed");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Could not initiate payment. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "10px 18px",
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "white",
          border: "none",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(245,158,11,0.35)",
        }}
      >
        💚 Donate
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#052e16] p-6 text-center">
              <div className="text-4xl mb-2">🌿</div>
              <h2 className="text-2xl font-bold text-white mb-1">Support EcoSync</h2>
              <p className="text-green-300 text-sm">Help us protect Earth's ecosystems</p>
            </div>

            <div className="p-6">
              <div className="mb-5">
                <label className="text-sm font-semibold text-slate-700 mb-3 block">
                  Select amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[100, 500, 1000, 2000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        amount === amt
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-slate-700 border-slate-200 hover:border-green-400"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  placeholder="Custom amount"
                  min={1}
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-green-400 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
                <div className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">
                  Your ₹{amount} helps:
                </div>
                <div className="flex flex-col gap-1.5">
                  {amount >= 100 && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <span>🌱</span> Plant {Math.floor(amount / 100)} trees
                    </div>
                  )}
                  {amount >= 500 && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <span>🐯</span> Fund 1 hour of tiger monitoring
                    </div>
                  )}
                  {amount >= 1000 && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <span>💧</span> Clean 1000L of river water
                    </div>
                  )}
                  {amount >= 2000 && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <span>🛰️</span> Support 1 day of satellite monitoring
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Pay via:</span>
                {["UPI", "Card", "Net Banking", "Wallet"].map(m => (
                  <span key={m} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                    {m}
                  </span>
                ))}
              </div>

              <button
                onClick={handleDonate}
                disabled={loading || amount < 1}
                className="w-full py-3.5 bg-green-700 hover:bg-green-600 disabled:bg-slate-200 text-white rounded-xl font-bold text-base transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening payment...
                  </span>
                ) : (
                  `💚 Donate ₹${amount}`
                )}
              </button>

              <p className="text-xs text-slate-400 text-center mt-3">
                Secured by Razorpay · 100% goes to conservation
              </p>

              <button
                onClick={() => setOpen(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-sm mt-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Search Bar ──
function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const search = async (q) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
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

      if (speciesRes.status === "fulfilled") {
        speciesRes.value.data.slice(0, 4).forEach(s => combined.push({
          id: `species-${s.id}`, type: "species",
          title: s.commonName, subtitle: s.scientificName,
          meta: s.conservationStatus?.replace(/_/g, " ").toLowerCase(),
          image: s.imageUrl, path: `/species/${s.id}`,
        }));
      }
      if (newsRes.status === "fulfilled") {
        newsRes.value.data
          .filter(n => n.title?.toLowerCase().includes(lq) ||
            n.country?.toLowerCase().includes(lq))
          .slice(0, 3).forEach(n => combined.push({
            id: `news-${n.id}`, type: "news",
            title: n.title, subtitle: n.summary?.slice(0, 70) + "...",
            meta: n.country, image: n.imageUrl, path: `/news`,
          }));
      }
      if (alertsRes.status === "fulfilled") {
        alertsRes.value.data
          .filter(a => a.title?.toLowerCase().includes(lq) ||
            a.country?.toLowerCase().includes(lq))
          .slice(0, 3).forEach(a => combined.push({
            id: `alert-${a.id}`, type: "alert",
            title: a.title,
            subtitle: `${a.type?.replace(/_/g, " ")} · ${a.severity}`,
            meta: a.country, image: null, path: `/news`,
          }));
      }
      if (regionsRes.status === "fulfilled") {
        regionsRes.value.data
          .filter(r => r.name?.toLowerCase().includes(lq) ||
            r.country?.toLowerCase().includes(lq))
          .slice(0, 3).forEach(r => combined.push({
            id: `region-${r.id}`, type: "region",
            title: r.name, subtitle: r.description?.slice(0, 70) + "...",
            meta: r.continent, image: null, path: `/geography`,
          }));
      }

      const countries = [
        "India","Brazil","China","Australia","Russia","USA","Kenya",
        "Indonesia","Norway","Canada","Germany","France","Japan",
        "UK","South Africa","Nigeria","Mexico","Bangladesh","Pakistan","Egypt",
      ];
      const match = countries.find(c => c.toLowerCase().includes(lq));
      if (match) {
        combined.unshift({
          id: `country-${match}`, type: "region",
          title: `${match} — Country Profile`,
          subtitle: `Full ecosystem report for ${match}`,
          meta: "Country", image: null, path: `/country/${match}`,
        });
      }

      setResults(combined);
    } catch (e) { console.error(e); }
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

  const typeIcon = { species: "🌿", news: "📰", alert: "🚨", region: "🗺" };
  const typeColor = {
    species: "bg-green-50 text-green-700",
    news: "bg-blue-50 text-blue-700",
    alert: "bg-red-50 text-red-700",
    region: "bg-purple-50 text-purple-700",
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onFocus={() => query && setOpen(true)}
          placeholder="Search species, countries, alerts, news..."
          className="w-full pl-12 pr-28 py-3 bg-white border-2 border-slate-200 hover:border-green-400 focus:border-green-500 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm font-medium shadow-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          ) : query ? (
            <button
              onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
          <kbd className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 font-mono hidden md:block">
            Ctrl K
          </kbd>
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-[460px] overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-3 px-5 py-5 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div className="px-5 py-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-slate-600 font-medium text-sm">
                No results for "<span className="text-green-700">{query}</span>"
              </div>
            </div>
          )}
          {!loading && results.length > 0 && (
            <>
              {results.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.title}
                        className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{typeIcon[item.type]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm truncate">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  {item.meta && (
                    <span className={`text-xs px-2.5 py-1 rounded-full capitalize flex-shrink-0 font-medium ${typeColor[item.type]}`}>
                      {item.meta}
                    </span>
                  )}
                </button>
              ))}
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                <span>{results.length} results</span>
                <span>Esc to close</span>
              </div>
            </>
          )}
          {!query.trim() && (
            <div className="p-5">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">
                Quick navigation
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "🌿 Species", path: "/species" },
                  { label: "🏆 Leaderboard", path: "/leaderboard" },
                  { label: "💨 Air Quality", path: "/air" },
                  { label: "🗺 World Map", path: "/map" },
                  { label: "🤖 AI Insights", path: "/ai" },
                  { label: "📰 News", path: "/news" },
                ].map(l => (
                  <button
                    key={l.path}
                    onClick={() => { navigate(l.path); setOpen(false); }}
                    className="text-left px-3 py-2.5 bg-slate-50 hover:bg-green-50 hover:text-green-700 rounded-xl text-xs text-slate-600 font-medium border border-slate-100 hover:border-green-200 transition-colors"
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

// ── Main Navbar ──
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const visibleLinks = [
    ...allLinks,
    ...(user?.role === "ADMIN"
      ? [{ path: "/admin", label: "⚙️ Admin" }]
      : []),
  ];

  return (
    <nav className="bg-[#052e16] sticky top-0 z-50 shadow-xl">

      {/* ── Row 1: Logo + Nav + Auth ── */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div
            className="group-hover:scale-105 transition-transform"
            style={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
              borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: "white" }}>E</span>
          </div>
          <div className="flex flex-col">
            <span style={{
              fontWeight: 800, fontSize: 20, color: "white",
              letterSpacing: "-0.3px", lineHeight: 1.1
            }}>
              EcoSync
            </span>
            <span style={{
              fontSize: 10, color: "#4ade80",
              fontWeight: 600, letterSpacing: "0.5px"
            }}>
              Ecosystem Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center flex-wrap">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              location.pathname === "/"
                ? "bg-green-600 text-white"
                : "text-green-300 hover:bg-green-800/70 hover:text-white"
            }`}
          >
            Home
          </Link>
          {navGroups.map(group => (
            <NavDropdown
              key={group.label}
              group={group}
              currentPath={location.pathname}
            />
          ))}
        </div>

        {/* Auth + Donate */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <DonateButton />

          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="hidden xl:flex items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: 12, padding: "8px 14px", textDecoration: "none",
                }}
              >
                <div style={{
                  width: 30, height: 30,
                  background: "linear-gradient(135deg,#4ade80,#16a34a)",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 13, fontWeight: 700,
                  color: "white", flexShrink: 0,
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{
                  color: "#d1fae5", fontSize: 13, fontWeight: 500,
                  maxWidth: 100, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  {user?.name}
                </span>
              </Link>

              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  ⚙️ Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 20px", background: "#15803d",
                  color: "white", border: "none", borderRadius: 12,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={e => e.currentTarget.style.background = "#16a34a"}
                onMouseOut={e => e.currentTarget.style.background = "#15803d"}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: "10px 20px", color: "#86efac",
                  border: "1.5px solid rgba(74,222,128,0.3)",
                  borderRadius: 12, fontSize: 13, fontWeight: 600,
                  textDecoration: "none", whiteSpace: "nowrap",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "white", borderRadius: 12, fontSize: 13,
                  fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(22,163,74,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-green-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Row 2: Search bar ── */}
      <div style={{
        borderTop: "1px solid rgba(74,222,128,0.1)",
        background: "rgba(0,0,0,0.2)",
        padding: "10px 24px"
      }}>
        <SearchBar />
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-green-900 bg-[#052e16]">
          <div className="px-4 py-3 flex flex-col gap-1">
            {visibleLinks.map(l => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === l.path
                    ? "bg-green-700 text-white"
                    : "text-green-200 hover:bg-green-800 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}