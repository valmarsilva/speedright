import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom pulsing marker icon
const pulsingIcon = L.divIcon({
  className: "pulsing-marker",
  html: `
    <div class="marker-pin"></div>
    <div class="marker-pulse"></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapUpdaterProps {
  latitude: number;
  longitude: number;
}

const MapUpdater = ({ latitude, longitude }: MapUpdaterProps) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true });
  }, [latitude, longitude, map]);
  
  return null;
};

interface MiniMapProps {
  latitude: number | null;
  longitude: number | null;
  isTracking: boolean;
}

const MiniMap = ({ latitude, longitude, isTracking }: MiniMapProps) => {
  if (!isTracking || latitude === null || longitude === null) {
    return (
      <div className="w-full h-40 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Inicie o rastreamento para ver o mapa
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-40 rounded-xl overflow-hidden border border-primary/30 shadow-lg">
      <style>{`
        .pulsing-marker {
          position: relative;
        }
        .marker-pin {
          width: 14px;
          height: 14px;
          background: hsl(180 100% 50%);
          border: 3px solid white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px hsl(180 100% 50% / 0.6);
          z-index: 10;
        }
        .marker-pulse {
          width: 30px;
          height: 30px;
          background: hsl(180 100% 50% / 0.3);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s ease-out infinite;
        }
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        .leaflet-container {
          background: hsl(220 20% 10%);
        }
      `}</style>
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[latitude, longitude]} icon={pulsingIcon} />
        <MapUpdater latitude={latitude} longitude={longitude} />
      </MapContainer>
    </div>
  );
};

export default MiniMap;
