import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Species from "./pages/Species";
import AirQuality from "./pages/AirQuality";
import WaterLand from "./pages/WaterLand";
import Geography from "./pages/Geography";
import AiInsights from "./pages/AiInsights";
import NewsAlerts from "./pages/NewsAlerts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SpeciesDetail from "./pages/SpeciesDetail";
import CountryProfile from "./pages/CountryProfile";
import Leaderboard from "./pages/Leaderboard";
import AdminDashboard from "./pages/AdminDashboard";
import EarthExplorer from "./pages/EarthExplorer";
import UserProfile from "./pages/UserProfile";
import KnowledgeBase from "./pages/KnowledgeBase";
import Ngos from "./pages/Ngos";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/earth" element={<EarthExplorer />} />
          <Route path="/map" element={<Map />} />
          <Route path="/country/:name" element={<CountryProfile />} />
          <Route path="/species" element={<Species />} />
          <Route path="/species/:id" element={<SpeciesDetail />} />
          <Route path="/air" element={<AirQuality />} />
          <Route path="/water-land" element={<WaterLand />} />
          <Route path="/geography" element={<Geography />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/ai" element={<AiInsights />} />
          <Route path="/news" element={<NewsAlerts />} />
          <Route path="/ngos" element={<Ngos />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}