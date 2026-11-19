import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinOff } from 'lucide-react';

// Custom div icon avoids Leaflet's default marker image, which breaks under
// bundlers unless the asset paths are patched.
const pinIcon = L.divIcon({
  className: 'attendance-map-pin',
  html: `<span style="
      display:block;width:18px;height:18px;border-radius:9999px;
      background:#2563eb;border:3px solid #ffffff;
      box-shadow:0 0 0 4px rgba(37,99,235,0.22),0 4px 10px rgba(15,23,42,0.25);
  "></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

function Recenter({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom() || 16, 16));
  }, [latitude, longitude, map]);
  return null;
}

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
  label?: string;
}

export default function LocationMap({
  latitude,
  longitude,
  className = 'h-56',
  label = 'Captured location',
}: LocationMapProps) {
  const valid =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (!valid) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 ${className}`}
      >
        <div className="text-center text-gray-400">
          <MapPinOff className="mx-auto mb-2 h-6 w-6" />
          <p className="text-xs font-medium">Location not available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative z-0 overflow-hidden rounded-xl border border-gray-200 ${className}`}>
      <MapContainer
        center={[latitude as number, longitude as number]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter latitude={latitude as number} longitude={longitude as number} />
        <Marker position={[latitude as number, longitude as number]} icon={pinIcon}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
