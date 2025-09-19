'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useTravelStore } from '../../store/travel-store';
import { LocationMarker } from './LocationMarker';
import { LocationPopup } from './LocationPopup';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Leaflet only on client-side
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Component to handle map updates
function MapUpdater() {
  const map = useMap();
  const { map: mapState } = useTravelStore();

  useEffect(() => {
    if (mapState.center) {
      map.setView([mapState.center[0], mapState.center[1]], mapState.zoom);
    }
  }, [map, mapState.center, mapState.zoom]);

  return null;
}

// Component to handle map events
function MapEventHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();

  useEffect(() => {
    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onMapClick]);

  return null;
}

export function TravelMap() {
  const [isClient, setIsClient] = useState(false);
  const { 
    map, 
    recommendations, 
    updateViewState, 
    setSelectedLocation 
  } = useTravelStore();
  
  const selectedLocation = map.selectedLocation;

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleMarkerClick = (location: any) => {
    setSelectedLocation(location);
  };

  const handleMapClick = () => {
    setSelectedLocation(undefined);
  };

  // Don't render map on server-side
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[map.center[0], map.center[1]]}
        zoom={map.zoom}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => {
          // Map is ready
        }}
      >
        <MapUpdater />
        <MapEventHandler onMapClick={handleMapClick} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Location Markers */}
        {recommendations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            onClick={() => handleMarkerClick(location)}
            isSelected={selectedLocation?.id === location.id}
          />
        ))}

        {/* Location Popup */}
        {selectedLocation && (
          <Popup
            position={[selectedLocation.geolocation[0], selectedLocation.geolocation[1]]}
            eventHandlers={{
              remove: () => setSelectedLocation(undefined),
            }}
          >
            <LocationPopup location={selectedLocation} />
          </Popup>
        )}
      </MapContainer>

      {/* Map Overlay Info */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-[1000]">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">
          Travel Recommendations
        </h3>
        <p className="text-xs text-gray-600">
          {recommendations.length === 0 
            ? 'Start chatting to see recommendations on the map'
            : `Showing ${recommendations.length} recommendation${recommendations.length > 1 ? 's' : ''}`
          }
        </p>
        
        {recommendations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from(new Set(recommendations.map(r => r.type))).map((type) => (
              <span
                key={type}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {type}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
