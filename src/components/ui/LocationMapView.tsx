'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapViewProps {
  latitude: number;
  longitude: number;
  radius: number;
  locationName: string;
}

export function LocationMapView({ latitude, longitude, radius, locationName }: LocationMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([latitude, longitude], 18);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker for the location
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`<b>${locationName}</b><br>Geofence Center`).openPopup();

    // Add red circle for the radius
    const circle = L.circle([latitude, longitude], {
      color: '#dc2626', // red-600
      fillColor: '#dc2626',
      fillOpacity: 0.2,
      radius: radius,
      weight: 2,
    }).addTo(map);

    // Add tooltip to circle
    circle.bindTooltip(`Geofence Radius: ${radius}m`, {
      permanent: false,
      direction: 'center'
    });

    // Fit map bounds to show the entire circle
    map.fitBounds(circle.getBounds(), { padding: [50, 50] });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, radius, locationName]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[280px] rounded-lg border border-gray-300"
      style={{ zIndex: 0 }}
    />
  );
}

