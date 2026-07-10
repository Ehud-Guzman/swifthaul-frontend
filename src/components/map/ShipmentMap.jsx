import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker images don't resolve under Vite's bundler — build
// markers from inline HTML/CSS instead of shipping image assets.
const pinIcon = (color, pulse = false) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px;">
        ${pulse ? `<div style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:0.4;animation:shipment-pulse 1.6s ease-out infinite;"></div>` : ''}
        <div style="position:relative;width:20px;height:20px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>
      </div>
      <style>
        @keyframes shipment-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const PICKUP_ICON = pinIcon('#22c55e');
const DROPOFF_ICON = pinIcon('#1e293b');
const TRUCK_ICON = pinIcon('#f97316', true);

// Re-fits the map viewport whenever the set of points changes (e.g. a live
// location update arrives).
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
  }, [map, JSON.stringify(points)]);
  return null;
};

const ShipmentMap = ({ pickupCoords, dropoffCoords, currentLocation }) => {
  const pickup = pickupCoords?.lat != null ? [pickupCoords.lat, pickupCoords.lng] : null;
  const dropoff = dropoffCoords?.lat != null ? [dropoffCoords.lat, dropoffCoords.lng] : null;
  const live = currentLocation?.lat != null ? [currentLocation.lat, currentLocation.lng] : null;

  const points = [pickup, dropoff, live].filter(Boolean);
  if (points.length === 0) return null;

  const routeLine = [pickup, dropoff].filter(Boolean);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 relative" style={{ height: 320 }}>
      <MapContainer
        center={points[0]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routeLine.length === 2 && (
          <Polyline positions={routeLine} pathOptions={{ color: '#f97316', weight: 2, dashArray: '6 8', opacity: 0.6 }} />
        )}
        {pickup && <Marker position={pickup} icon={PICKUP_ICON} />}
        {dropoff && <Marker position={dropoff} icon={DROPOFF_ICON} />}
        {live && <Marker position={live} icon={TRUCK_ICON} />}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
};

export default ShipmentMap;
