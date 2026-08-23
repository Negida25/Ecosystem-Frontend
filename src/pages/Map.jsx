import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from "react-leaflet";
import api from "../api/axios";

const { Overlay } = LayersControl;

const severityColor = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e"
};

const aqiColor = (aqi) => {
  if (aqi > 300) return "#7c3aed";
  if (aqi > 200) return "#ef4444";
  if (aqi > 150) return "#f97316";
  if (aqi > 100) return "#eab308";
  return "#22c55e";
};

export default function Map() {
  const [alerts, setAlerts] = useState([]);
  const [airData, setAirData] = useState([]);
  const [species, setSpecies] = useState([]);
  const [fires, setFires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/alerts").catch(() => ({ data: [] })),
      api.get("/air").catch(() => ({ data: [] })),
      api.get("/species/locations/bbox?minLat=-90&maxLat=90&minLng=-180&maxLng=180").catch(() => ({ data: [] })),
      api.get("/land/fires").catch(() => ({ data: [] })),
    ]).then(([alertRes, airRes, speciesRes, fireRes]) => {
      setAlerts(alertRes.data);
      setAirData(airRes.data);
      setSpecies(speciesRes.data);
      setFires(fireRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">🗺 World Ecosystem Map</h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time species locations, air quality, wildfires and eco alerts worldwide
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Eco alerts", value: alerts.length, color: "text-red-600", icon: "🚨" },
          { label: "Air readings", value: airData.length, color: "text-amber-600", icon: "💨" },
          { label: "Species locations", value: species.length, color: "text-green-600", icon: "🌿" },
          { label: "Active fires", value: fires.length, color: "text-orange-600", icon: "🔥" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map container — fixed height, proper sizing */}
      <div
        className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm w-full"
        style={{ height: "600px", minHeight: "600px" }}
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <div className="text-slate-500 text-sm">Loading map data...</div>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[20, 10]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            worldCopyJump={false}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
            />

            <LayersControl position="topright">

              {/* Eco Alerts layer */}
              <Overlay checked name="🚨 Eco Alerts">
                <>
                  {alerts
                    .filter(a => a.latitude && a.longitude)
                    .map(a => (
                      <CircleMarker
                        key={`alert-${a.id}`}
                        center={[a.latitude, a.longitude]}
                        radius={10}
                        pathOptions={{
                          color: severityColor[a.severity] || "#ef4444",
                          fillColor: severityColor[a.severity] || "#ef4444",
                          fillOpacity: 0.7,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[180px]">
                            <div className="font-bold text-slate-800 mb-1">{a.title}</div>
                            <div className="text-xs text-slate-500 mb-1">
                              {a.type?.replace(/_/g, " ")} · {a.severity}
                            </div>
                            <div className="text-xs text-slate-500">
                              {a.country}{a.region ? ` · ${a.region}` : ""}
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                </>
              </Overlay>

              {/* Air Quality layer */}
              <Overlay checked name="💨 Air Quality">
                <>
                  {airData
                    .filter(a => a.latitude && a.longitude)
                    .map(a => (
                      <CircleMarker
                        key={`air-${a.id}`}
                        center={[a.latitude, a.longitude]}
                        radius={9}
                        pathOptions={{
                          color: aqiColor(a.aqi),
                          fillColor: aqiColor(a.aqi),
                          fillOpacity: 0.7,
                          weight: 1.5,
                        }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[160px]">
                            <div className="font-bold text-slate-800 mb-1">
                              {a.city}, {a.country}
                            </div>
                            <div className="text-xs">
                              AQI: <strong style={{ color: aqiColor(a.aqi) }}>{a.aqi}</strong>
                              {" — "}{a.level?.replace(/_/g, " ")}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              PM2.5: {a.pm25 ?? "—"} · PM10: {a.pm10 ?? "—"}
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                </>
              </Overlay>

              {/* Species locations layer */}
              <Overlay checked name="🌿 Species Locations">
                <>
                  {species
                    .filter(s => s.latitude && s.longitude)
                    .map(s => (
                      <CircleMarker
                        key={`species-${s.id}`}
                        center={[s.latitude, s.longitude]}
                        radius={7}
                        pathOptions={{
                          color: "#16a34a",
                          fillColor: "#4ade80",
                          fillOpacity: 0.6,
                          weight: 1.5,
                        }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[160px]">
                            <div className="font-bold text-slate-800 mb-1">
                              {s.species?.commonName || "Unknown species"}
                            </div>
                            <div className="text-xs italic text-slate-400 mb-1">
                              {s.species?.scientificName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {s.locationName} · {s.country}
                            </div>
                            {s.populationCount && (
                              <div className="text-xs text-green-700 mt-1">
                                Population: {s.populationCount.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                </>
              </Overlay>

              {/* Active fires layer */}
              <Overlay name="🔥 Active Fires">
                <>
                  {fires
                    .filter(f => f.latitude && f.longitude)
                    .map(f => (
                      <CircleMarker
                        key={`fire-${f.id}`}
                        center={[f.latitude, f.longitude]}
                        radius={10}
                        pathOptions={{
                          color: "#f97316",
                          fillColor: "#fb923c",
                          fillOpacity: 0.8,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <div className="text-sm min-w-[160px]">
                            <div className="font-bold text-slate-800 mb-1">
                              🔥 Active Wildfire
                            </div>
                            <div className="text-xs text-slate-500">
                              {f.region}, {f.country}
                            </div>
                            {f.fireBurnedAreaHectares > 0 && (
                              <div className="text-xs text-orange-600 mt-1">
                                Burned: {f.fireBurnedAreaHectares.toLocaleString()} ha
                              </div>
                            )}
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                </>
              </Overlay>

            </LayersControl>
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {[
          { color: "bg-green-500", label: "Species hotspot" },
          { color: "bg-red-500", label: "Critical alert" },
          { color: "bg-orange-500", label: "Wildfire" },
          { color: "bg-yellow-400", label: "Moderate AQI" },
          { color: "bg-purple-600", label: "Hazardous AQI" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-sm text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Info cards below map */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-700 mb-2 text-sm">How to use</h3>
          <ul className="text-xs text-slate-400 flex flex-col gap-1.5">
            <li>🖱 Scroll to zoom in/out</li>
            <li>🖐 Click and drag to pan</li>
            <li>🔘 Click any marker for details</li>
            <li>🗂 Use layers panel (top right) to toggle data</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-700 mb-2 text-sm">AQI color guide</h3>
          <div className="flex flex-col gap-1.5">
            {[
              { color: "bg-green-500", label: "Good (0–50)" },
              { color: "bg-yellow-400", label: "Moderate (51–100)" },
              { color: "bg-orange-400", label: "Unhealthy (101–150)" },
              { color: "bg-red-500", label: "Very unhealthy (151–200)" },
              { color: "bg-purple-600", label: "Hazardous (300+)" },
            ].map(a => (
              <div key={a.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${a.color}`} />
                <span className="text-xs text-slate-500">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-700 mb-2 text-sm">Data sources</h3>
          <div className="flex flex-col gap-1.5 text-xs text-slate-400">
            <div>🌿 Species — GBIF Global Database</div>
            <div>💨 Air quality — OpenAQ Network</div>
            <div>🔥 Fire data — NASA FIRMS</div>
            <div>🚨 Alerts — EcoSync Monitor</div>
            <div>🗺 Maps — OpenStreetMap</div>
          </div>
        </div>
      </div>

    </div>
  );
}