const statusColors = {
  ENDANGERED: "bg-red-50 text-red-800",
  CRITICALLY_ENDANGERED: "bg-red-100 text-red-900",
  VULNERABLE: "bg-amber-50 text-amber-800",
  LEAST_CONCERN: "bg-green-50 text-green-800",
  NEAR_THREATENED: "bg-yellow-50 text-yellow-800",
};

const defaultImages = {
  FAUNA: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&q=80",
  FLORA: "https://images.unsplash.com/photo-1559827291-72416316e8a8?w=400&q=80",
  FUNGI: "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&q=80",
};

export default function SpeciesCard({ species, onClick }) {
  const statusLabel = species.conservationStatus?.replace(/_/g, " ").toLowerCase();
  const colorClass = statusColors[species.conservationStatus] || "bg-slate-50 text-slate-700";
  const img = species.imageUrl || defaultImages[species.type] || defaultImages.FAUNA;

  return (
    <div
      onClick={() => onClick && onClick(species)}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
    >
      <img
        src={img}
        alt={species.commonName}
        className="w-full h-40 object-cover"
        onError={(e) => { e.target.src = defaultImages.FAUNA; }}
      />
      <div className="p-3">
        <div className="font-medium text-slate-800 text-sm">{species.commonName}</div>
        <div className="text-xs text-slate-400 italic mb-2">{species.scientificName}</div>
        {species.conservationStatus && (
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${colorClass}`}>
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
}