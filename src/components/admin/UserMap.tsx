import { useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Maximize2, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface UserLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  age?: number;
}

interface UserMapProps {
  locations: UserLocation[];
}

function MapView({ locations }: UserMapProps) {
  return (
    <MapContainer
      center={[0, 25]}
      zoom={3}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
      />
      {locations.map((loc) => (
        <CircleMarker
          key={loc.id}
          center={[loc.lat, loc.lng]}
          radius={7}
          pathOptions={{
            color: "#f43f5e",
            fillColor: "#f43f5e",
            fillOpacity: 0.7,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{loc.name}</p>
              {loc.age && <p className="text-gray-500">Age: {loc.age}</p>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default function UserMap({ locations }: UserMapProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      {/* Dashboard card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              User Locations
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Geographic distribution of active users
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="View fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="h-80">
          <MapView locations={locations} />
        </div>
      </div>

      {/* Fullscreen dialog — rendered via portal so it escapes the Leaflet z-index stacking context */}
      {fullscreen &&
        createPortal(
          <div
            className="fixed inset-0 flex flex-col bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
          >
            {/* Inner panel with small margin */}
            <div className="flex flex-col m-3 flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    User Locations
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {locations.length} user
                    {locations.length !== 1 ? "s" : ""} on the map
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Map fills remaining space */}
              <div className="flex-1">
                <MapView locations={locations} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
