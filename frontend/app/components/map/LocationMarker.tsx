'use client';

import { Marker } from 'react-leaflet';
import { Location } from '../../store/travel-store';
import { MapPin, Hotel, Utensils, Camera, Plane, Star } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import L from 'leaflet';

interface LocationMarkerProps {
  location: Location;
  onClick: () => void;
  isSelected: boolean;
}

export function LocationMarker({ location, onClick, isSelected }: LocationMarkerProps) {
  const getMarkerIcon = (type: Location['type']) => {
    switch (type) {
      case 'hotel':
        return Hotel;
      case 'restaurant':
        return Utensils;
      case 'flight':
        return Plane;
      case 'activity':
        return Star;
      case 'attraction':
      default:
        return Camera;
    }
  };

  const getMarkerColor = (type: Location['type']) => {
    switch (type) {
      case 'hotel':
        return '#2563eb'; // blue-600
      case 'restaurant':
        return '#ea580c'; // orange-600
      case 'flight':
        return '#16a34a'; // green-600
      case 'activity':
        return '#dc2626'; // pink-600
      case 'attraction':
      default:
        return '#9333ea'; // purple-600
    }
  };

  const Icon = getMarkerIcon(location.type);
  const color = getMarkerColor(location.type);

  // Create custom icon with React component
  const iconHtml = renderToString(
    <div className="relative">
      {/* Main marker */}
      <div
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: color,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isSelected 
            ? `0 0 0 4px rgba(255, 255, 255, 0.75), 0 4px 6px -1px rgba(0, 0, 0, 0.1)` 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s',
        }}
      >
        <Icon size={20} color="white" />
      </div>

      {/* Pointer */}
      <div 
        style={{
          position: 'absolute',
          top: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${color}`,
        }}
      />
    </div>
  );

  const customIcon = typeof window !== 'undefined' 
    ? L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      })
    : undefined;

  // Don't render if we don't have a custom icon (server-side)
  if (!customIcon) {
    return null;
  }

  return (
    <Marker
      position={[location.geolocation[0], location.geolocation[1]]}
      icon={customIcon}
      eventHandlers={{
        click: () => onClick(),
      }}
    />
  );
}
