import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#052e16] text-green-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">E</div>
            <span className="font-semibold text-white">EcoSync</span>
          </div>
          <p className="text-sm text-green-400 leading-relaxed">
            Real-time ecosystem intelligence platform for a healthier planet.
          </p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Explore</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/map" className="hover:text-white transition-colors">World Map</Link>
            <Link to="/species" className="hover:text-white transition-colors">Flora & Fauna</Link>
            <Link to="/air" className="hover:text-white transition-colors">Air Quality</Link>
            <Link to="/water-land" className="hover:text-white transition-colors">Water & Land</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Insights</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/geography" className="hover:text-white transition-colors">Geography</Link>
            <Link to="/ai" className="hover:text-white transition-colors">AI Insights</Link>
            <Link to="/news" className="hover:text-white transition-colors">News & Alerts</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3 text-sm">Data sources</h4>
          <div className="flex flex-col gap-2 text-sm">
            <span>NASA FIRMS</span>
            <span>GBIF Species API</span>
            <span>OpenAQ Air Data</span>
            <span>OpenStreetMap</span>
          </div>
        </div>
      </div>
      <div className="border-t border-green-900 text-center py-4 text-xs text-green-600">
        © 2026 EcoSync. Built to protect our planet.
      </div>
    </footer>
  );
}