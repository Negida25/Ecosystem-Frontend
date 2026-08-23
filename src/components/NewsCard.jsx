const impactColors = {
  NEGATIVE: "bg-red-50 text-red-800",
  POSITIVE: "bg-green-50 text-green-800",
  NEUTRAL: "bg-blue-50 text-blue-800",
};

const categoryImages = {
  DEFORESTATION: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
  WILDLIFE: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80",
  POLLUTION: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=80",
  CLIMATE: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
  OCEAN: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80",
  CONSERVATION: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80",
  NATURAL_DISASTER: "https://images.unsplash.com/photo-1523772721666-22ad3c3b6f90?w=600&q=80",
  POLICY: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80",
};

export default function NewsCard({ news }) {
  const impactClass = impactColors[news.impact] || impactColors.NEUTRAL;
  const img = news.imageUrl || categoryImages[news.category] || categoryImages.CLIMATE;
  const date = news.publishedAt
    ? new Date(news.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={img}
        alt={news.title}
        className="w-full h-40 object-cover"
        onError={(e) => { e.target.src = categoryImages.CLIMATE; }}
      />
      <div className="p-4">
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${impactClass}`}>
          {news.impact?.toLowerCase()} · {news.category?.replace(/_/g, " ").toLowerCase()}
        </span>
        <h3 className="font-medium text-slate-800 text-sm mt-2 leading-snug">
          {news.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{news.summary}</p>
        <div className="text-xs text-slate-400 mt-2">
          {news.country && <span>{news.country} · </span>}
          {news.sourceName && <span>{news.sourceName} · </span>}
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}