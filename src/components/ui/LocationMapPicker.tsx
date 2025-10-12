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

interface LocationMapPickerProps {
  latitude?: number;
  longitude?: number;
  radius?: number;
  showRadius?: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
  className?: string;
}

export function LocationMapPicker({ 
  latitude, 
  longitude, 
  radius = 100, 
  showRadius = true,
  onLocationSelect,
  className = ""
}: LocationMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  
  // Default to Cabuyao, Laguna, Philippines if no coordinates provided
  const defaultLat = latitude || 14.2782;
  const defaultLng = longitude || 121.1247;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], latitude ? 18 : 15);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add initial marker if coordinates are provided
    if (latitude && longitude) {
      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
      markerRef.current = marker;
      
      marker.bindPopup('Drag me or click on the map!').openPopup();
      
      // Add circle for radius only if showRadius is true
      if (showRadius) {
        const circle = L.circle([latitude, longitude], {
          color: '#dc2626',
          fillColor: '#dc2626',
          fillOpacity: 0.2,
          radius: radius,
          weight: 2,
        }).addTo(map);
        circleRef.current = circle;
      }

      // Handle marker drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onLocationSelect(position.lat, position.lng);
        
        // Update circle position
        if (circleRef.current) {
          circleRef.current.setLatLng(position);
        }
      });
    }

    // Handle map click to add/move marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);

      // Remove existing marker and circle if any
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }

      // Add new marker
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current = marker;
      marker.bindPopup(`<b>Selected Location</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`).openPopup();

      // Add new circle only if showRadius is true
      if (showRadius) {
        const circle = L.circle([lat, lng], {
          color: '#dc2626',
          fillColor: '#dc2626',
          fillOpacity: 0.2,
          radius: radius,
          weight: 2,
        }).addTo(map);
        circleRef.current = circle;
      }

      // Handle marker drag for new marker
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onLocationSelect(position.lat, position.lng);
        
        // Update circle position
        if (circleRef.current) {
          circleRef.current.setLatLng(position);
        }
        
        // Update popup
        marker.setPopupContent(`<b>Selected Location</b><br>Lat: ${position.lat.toFixed(6)}<br>Lng: ${position.lng.toFixed(6)}`);
      });
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update circle radius when radius prop changes (only if showRadius is true)
  useEffect(() => {
    if (circleRef.current && showRadius) {
      circleRef.current.setRadius(radius);
    }
  }, [radius, showRadius]);

  return (
    <div className="space-y-3">
      <div
        ref={mapRef}
        className={`w-full h-[400px] rounded-lg border border-gray-300 ${className}`}
        style={{ zIndex: 0 }}
      />
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          <strong>💡 Tip:</strong> Click anywhere on the map to set the location, or drag the marker to adjust the position.
        </p>
      </div>
    </div>
  );
}

