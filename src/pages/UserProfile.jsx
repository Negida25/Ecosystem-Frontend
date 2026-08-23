import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/axios";
import { logout } from "../store/slices/authSlice";
import SpeciesCard from "../components/SpeciesCard";
import NewsCard from "../components/NewsCard";
import AlertBanner from "../components/AlertBanner";

const avatarColors = [
  "from-green-400 to-green-600",
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-amber-400 to-amber-600",
  "from-red-400 to-red-600",
];

export default function UserProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector(s => s.auth);

  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState(null);
  const [savedSpecies, setSavedSpecies] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [favoriteCountries, setFavoriteCountries] = useState([
    "India", "Brazil", "Australia"
  ]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [preferences, setPreferences] = useState({
    alertNotifications: true,
    emailDigest: false,
    criticalOnly: false,
    darkMode: false,
  });

  // redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, newsRes, speciesRes] = await Promise.all([
        api.get("/alerts"),
        api.get("/news?limit=6"),
        api.get("/species"),
      ]);
      setRecentAlerts(alertsRes.data.slice(0, 5));
      setRecentNews(newsRes.data.slice(0, 3));
      // show first 6 species as "saved" for demo
      setSavedSpecies(speciesRes.data.slice(0, 6));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleSaveName = () => {
    if (!editName.trim()) { toast.error("Name cannot be empty"); return; }
    toast.success("Name updated! (UI only — connect to backend PUT /api/auth/update)");
    setEditMode(false);
  };

  const removeCountry = (country) => {
    setFavoriteCountries(prev => prev.filter(c => c !== country));
    toast.success(`${country} removed from favorites`);
  };

  const addCountry = (country) => {
    if (!favoriteCountries.includes(country)) {
      setFavoriteCountries(prev => [...prev, country]);
      toast.success(`${country} added to favorites`);
    }
  };

  const avatarColor = avatarColors[
    (user?.name?.charCodeAt(0) || 0) % avatarColors.length
  ];

  const joinDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric"
  });

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "saved", label: "Saved Species" },
    { key: "countries", label: "Favorite Countries" },
    { key: "alerts", label: "My Alerts" },
    { key: "news", label: "My News Feed" },
    { key: "settings", label: "Settings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-500 text-sm">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Profile Hero ── */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        {/* Cover image */}
        <div className="h-48 relative">
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=90"
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#052e16cc] to-[#052e1666]" />
        </div>

        {/* Profile info */}
        <div className="bg-white border border-slate-200 rounded-b-3xl px-8 pb-6">
          <div className="flex items-end justify-between gap-4 -mt-12 mb-4 flex-wrap">
            {/* Avatar */}
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-4xl font-extrabold text-white shadow-xl border-4 border-white flex-shrink-0`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-12 flex-wrap">
              <button
                onClick={() => { setEditMode(true); setEditName(user?.name || ""); }}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-sm font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Name and details */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">{user?.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  user?.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}>
                  {user?.role === "ADMIN" ? "⚙️ Admin" : "🌿 Eco Member"}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  📅 Joined {joinDate}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4">
              {[
                { label: "Saved species", value: savedSpecies.length, color: "text-green-700" },
                { label: "Fav countries", value: favoriteCountries.length, color: "text-blue-600" },
                { label: "Alerts tracked", value: recentAlerts.length, color: "text-red-600" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit name modal ── */}
      {editMode && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setEditMode(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-800 text-lg mb-4">Edit Profile</h3>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-600 mb-1 block">
                Display name
              </label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                placeholder="Your name"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-600 mb-1 block">
                Email (read-only)
              </label>
              <input
                value={user?.email}
                disabled
                className="w-full px-4 py-3 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-400"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveName}
                className="flex-1 py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Save changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? "bg-green-700 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Activity summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">Account Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Member since", value: joinDate, icon: "📅", color: "bg-green-50" },
                  { label: "Account role", value: user?.role, icon: "🎯", color: "bg-purple-50" },
                  { label: "Saved species", value: savedSpecies.length, icon: "🌿", color: "bg-emerald-50" },
                  { label: "Fav countries", value: favoriteCountries.length, icon: "🌍", color: "bg-blue-50" },
                ].map(s => (
                  <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="font-bold text-slate-700 text-sm">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent alerts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-slate-800">Recent Alerts</h2>
                <button
                  onClick={() => setActiveTab("alerts")}
                  className="text-green-700 text-sm hover:underline font-medium"
                >
                  View all →
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {recentAlerts.slice(0, 3).map(a => (
                  <AlertBanner key={a.id} alert={a} />
                ))}
              </div>
            </div>

            {/* Favorite countries preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-slate-800">Favorite Countries</h2>
                <button
                  onClick={() => setActiveTab("countries")}
                  className="text-green-700 text-sm hover:underline font-medium"
                >
                  Manage →
                </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {favoriteCountries.map(c => (
                  <Link
                    key={c}
                    to={`/country/${c}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-sm font-semibold text-green-700 transition-colors"
                  >
                    🌍 {c}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">Profile Details</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Full name", value: user?.name, icon: "👤" },
                  { label: "Email", value: user?.email, icon: "📧" },
                  { label: "Role", value: user?.role, icon: "🎯" },
                  { label: "Status", value: "Active member", icon: "✅" },
                ].map(d => (
                  <div key={d.label} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <span className="text-lg">{d.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs text-slate-400">{d.label}</div>
                      <div className="text-sm font-semibold text-slate-700">{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setEditMode(true); setEditName(user?.name || ""); }}
                className="w-full mt-4 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                ✏️ Edit Profile
              </button>
            </div>

            {/* Quick navigation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-800 mb-4">Quick Navigation</h2>
              <div className="flex flex-col gap-2">
                {[
                  { label: "🌍 Earth Explorer", path: "/earth" },
                  { label: "🌿 Flora & Fauna", path: "/species" },
                  { label: "🏆 Leaderboard", path: "/leaderboard" },
                  { label: "🤖 AI Insights", path: "/ai" },
                  { label: "🗺 World Map", path: "/map" },
                  ...(user?.role === "ADMIN" ? [{ label: "⚙️ Admin Dashboard", path: "/admin" }] : []),
                ].map(l => (
                  <Link
                    key={l.path}
                    to={l.path}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-green-50 hover:text-green-700 rounded-xl text-sm font-medium text-slate-600 transition-colors border border-slate-100 hover:border-green-200"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SAVED SPECIES TAB
      ════════════════════════════════════════ */}
      {activeTab === "saved" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Saved Species</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Species you've explored — {savedSpecies.length} total
              </p>
            </div>
            <Link
              to="/species"
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Browse more →
            </Link>
          </div>

          {savedSpecies.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="text-5xl mb-3">🌿</div>
              <div className="text-slate-500 font-medium">No saved species yet</div>
              <div className="text-slate-400 text-sm mt-1">
                Browse species and click to explore them
              </div>
              <Link
                to="/species"
                className="inline-block mt-4 px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold"
              >
                Browse species
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {savedSpecies.map(s => (
                <SpeciesCard
                  key={s.id}
                  species={s}
                  onClick={sp => navigate(`/species/${sp.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          FAVORITE COUNTRIES TAB
      ════════════════════════════════════════ */}
      {activeTab === "countries" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Favorite Countries</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Track ecosystem health for your favorite countries
              </p>
            </div>
          </div>

          {/* Current favorites */}
          <div className="grid md:grid-cols-3 gap-4">
            {favoriteCountries.map(c => (
              <div
                key={c}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-green-300 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
                      🌍
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{c}</div>
                      <div className="text-xs text-slate-400">Country profile</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCountry(c)}
                    className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <Link
                  to={`/country/${c}`}
                  className="block w-full py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-semibold text-center transition-colors"
                >
                  View ecosystem profile →
                </Link>
              </div>
            ))}
          </div>

          {/* Add more countries */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4">Add countries</h3>
            <div className="flex gap-2 flex-wrap">
              {[
                "India","Brazil","China","Australia","Russia","USA",
                "Kenya","Indonesia","Norway","Canada","Germany","France",
                "Japan","UK","South Africa","Nigeria","Mexico","Egypt",
              ]
                .filter(c => !favoriteCountries.includes(c))
                .map(c => (
                  <button
                    key={c}
                    onClick={() => addCountry(c)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-green-50 hover:text-green-700 hover:border-green-300 border border-slate-200 rounded-xl text-sm text-slate-600 transition-all font-medium"
                  >
                    + {c}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          ALERTS TAB
      ════════════════════════════════════════ */}
      {activeTab === "alerts" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Active Eco Alerts</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {recentAlerts.length} active alerts worldwide
              </p>
            </div>
            <Link
              to="/news"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              View all alerts →
            </Link>
          </div>

          <div className="flex flex-col gap-3 max-w-3xl">
            {recentAlerts.map(a => (
              <AlertBanner key={a.id} alert={a} />
            ))}
            {recentAlerts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <div className="text-5xl mb-3">✅</div>
                <div className="text-slate-500 font-medium">No active alerts right now</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          NEWS FEED TAB
      ════════════════════════════════════════ */}
      {activeTab === "news" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Your News Feed</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Latest ecosystem news from around the world
              </p>
            </div>
            <Link
              to="/news"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Full news feed →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNews.map(n => (
              <NewsCard key={n.id} news={n} />
            ))}
            {recentNews.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200">
                <div className="text-5xl mb-3">📰</div>
                <div className="text-slate-500 font-medium">No news available</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SETTINGS TAB
      ════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="max-w-2xl flex flex-col gap-6">

          {/* Notification preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-1">Notification Preferences</h2>
            <p className="text-slate-400 text-sm mb-5">
              Control what alerts and updates you receive
            </p>
            <div className="flex flex-col gap-4">
              {[
                { key: "alertNotifications", label: "Active alert notifications", desc: "Get notified when new eco alerts are posted" },
                { key: "emailDigest", label: "Weekly email digest", desc: "Receive a weekly summary of ecosystem updates" },
                { key: "criticalOnly", label: "Critical alerts only", desc: "Only notify me about CRITICAL severity alerts" },
              ].map(pref => (
                <div key={pref.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{pref.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{pref.desc}</div>
                  </div>
                  <button
                    onClick={() => {
                      setPreferences(prev => ({ ...prev, [pref.key]: !prev[pref.key] }));
                      toast.success("Preference updated");
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                      preferences[pref.key] ? "bg-green-500" : "bg-slate-200"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      preferences[pref.key] ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Account settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-1">Account Settings</h2>
            <p className="text-slate-400 text-sm mb-5">
              Manage your account information
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setEditMode(true); setEditName(user?.name || ""); setActiveTab("overview"); }}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold text-left px-4 transition-colors"
              >
                ✏️ Edit display name
              </button>
              <button
                onClick={() => toast.success("Password reset email sent! (Connect to backend)")}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold text-left px-4 transition-colors"
              >
                🔑 Change password
              </button>
              <button
                onClick={() => toast.success("Data export requested! (Connect to backend)")}
                className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-semibold text-left px-4 transition-colors"
              >
                📥 Export my data
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <h2 className="font-bold text-red-700 mb-1">Danger Zone</h2>
            <p className="text-slate-400 text-sm mb-5">
              Irreversible actions — proceed with caution
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-sm font-semibold text-left px-4 transition-colors"
              >
                🚪 Logout of all devices
              </button>
              <button
                onClick={() => toast.error("Account deletion requires contacting support")}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold text-left px-4 transition-colors"
              >
                🗑️ Delete account
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}