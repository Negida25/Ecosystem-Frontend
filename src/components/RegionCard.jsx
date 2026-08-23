const regionImages = {
  RAINFOREST: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80",
  OCEAN: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80",
  DESERT: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80",
  MOUNTAIN: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80",
  GRASSLAND: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  WETLAND: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=600&q=80",
  CORAL_REEF: "https://images.unsplash.com/photo-1572204292164-b35ba943fca7?w=600&q=80",
  TUNDRA: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
  SAVANNA: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80",
  TAIGA: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600&q=80",
};

export default function RegionCard({ region, onClick }) {
  const img = regionImages[region.type] || regionImages.RAINFOREST;

  return (
    <div
      onClick={() => onClick && onClick(region)}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
    >
      <img
        src={img}
        alt={region.name}
        className="w-full h-36 object-cover"
        onError={(e) => { e.target.src = regionImages.RAINFOREST; }}
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-slate-800 text-sm">{region.name}</h3>
            <p className="text-xs text-slate-500">{region.continent} · {region.country}</p>
          </div>
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">
            {region.type?.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="text-sm font-medium text-green-700">{region.totalSpeciesCount || "—"}</div>
            <div className="text-xs text-slate-500">Species</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="text-sm font-medium text-amber-600">{region.avgAqi || "—"}</div>
            <div className="text-xs text-slate-500">Avg AQI</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="text-sm font-medium text-green-700">{region.forestCoverPercent ? `${region.forestCoverPercent}%` : "—"}</div>
            <div className="text-xs text-slate-500">Forest</div>
          </div>
        </div>
      </div>
    </div>
  );
}