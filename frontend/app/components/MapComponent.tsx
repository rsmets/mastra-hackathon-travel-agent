'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Create custom hotel icon
const createHotelIcon = () => {
  if (typeof window !== 'undefined' && window.L) {
    return window.L.divIcon({
      html: `
        <div style="
          background-color: #dc2626;
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-45deg);
        ">
          <div style="
            color: white;
            font-size: 14px;
            transform: rotate(45deg);
            font-weight: bold;
          ">🏨</div>
        </div>
      `,
      className: 'custom-hotel-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  }
  return null;
};

interface Hotel {
  id: string;
  title: string;
  coordinates?: { lat: number; lng: number };
  price?: string;
  rating?: number;
  neighborhood?: string;
  description?: string;
  amenities?: string[];
}

interface MapComponentProps {
  destination?: string;
  coordinates?: { lat: number; lng: number };
  hotels?: Hotel[];
}

export default function MapComponent({ destination, coordinates, hotels = [] }: MapComponentProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => {
      clearTimeout(timer);
      document.head.removeChild(link);
    };
  }, []);

  // Default to San Francisco if no destination provided
  const defaultDestination = destination || "San Francisco, CA";
  const defaultCoords = coordinates || { lat: 37.7749, lng: -122.4194 };

  // Debug logging and force map update
  useEffect(() => {
    console.log('MapComponent - Destination:', defaultDestination);
    console.log('MapComponent - Coordinates:', defaultCoords);
    // Force map re-render when coordinates change
    setMapKey(prev => prev + 1);
  }, [defaultDestination, defaultCoords]);

  // Generate hotel coordinates if not provided
  const hotelsWithCoords = hotels.map((hotel, index) => {
    if (hotel.coordinates) {
      return hotel;
    }
    
    // Generate nearby coordinates for hotels without coordinates
    const offset = 0.01; // Small offset for each hotel
    const latOffset = (index % 2 === 0 ? 1 : -1) * offset * (Math.floor(index / 2) + 1);
    const lngOffset = (index % 2 === 0 ? 1 : -1) * offset * (Math.floor(index / 2) + 1);
    
    return {
      ...hotel,
      coordinates: {
        lat: defaultCoords.lat + latOffset,
        lng: defaultCoords.lng + lngOffset
      }
    };
  });

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Interactive Map</h2>
            <p className="text-sm text-gray-600">{defaultDestination}</p>
            {hotels.length > 0 && (
              <p className="text-xs text-blue-600 font-medium">
                🏨 {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} marked
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {mapLoaded ? (
          <div className="h-full w-full">
            <MapContainer
              key={`map-${mapKey}-${defaultCoords.lat}-${defaultCoords.lng}`}
              center={[defaultCoords.lat, defaultCoords.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Hotel Markers */}
              {hotelsWithCoords.map((hotel) => (
                <Marker
                  key={hotel.id}
                  position={[hotel.coordinates!.lat, hotel.coordinates!.lng]}
                  icon={createHotelIcon()}
                >
                  <Popup>
                    <div className="p-2 min-w-48">
                      <h3 className="font-semibold text-gray-900 mb-2">{hotel.title}</h3>
                      {hotel.description && (
                        <p className="text-sm text-gray-600 mb-2">{hotel.description}</p>
                      )}
                      {hotel.neighborhood && (
                        <p className="text-xs text-blue-600 mb-1">📍 {hotel.neighborhood}</p>
                      )}
                      {hotel.price && (
                        <p className="text-sm font-medium text-green-600 mb-1">{hotel.price}</p>
                      )}
                      {hotel.rating && (
                        <p className="text-sm text-yellow-600 mb-1">⭐ {hotel.rating}</p>
                      )}
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {hotel.amenities.slice(0, 3).map((amenity, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {amenity}
                              </span>
                            ))}
                            {hotel.amenities.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                +{hotel.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading interactive map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
