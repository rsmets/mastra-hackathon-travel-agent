'use client';

import { useState, useEffect } from 'react';
import MapComponent from "./components/MapComponent";
import ItineraryComponent from "./components/ItineraryComponent";
import ChatInterface from "./components/ChatInterface";

export default function Page() {
  const [destination, setDestination] = useState<string>("San Francisco, CA");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 });
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);

  // Debug logging
  useEffect(() => {
    console.log('Main Page - Destination:', destination);
    console.log('Main Page - Coordinates:', coordinates);
  }, [destination, coordinates]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left Side - Chat Interface */}
      <div className="w-1/2 lg:w-2/5 xl:w-1/2 border-r border-gray-200 bg-white shadow-lg">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h1 className="text-2xl font-bold mb-2">🗺️ Travel Planner Assistant</h1>
            <p className="text-blue-100">Plan your perfect trip with AI assistance</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface 
              onDestinationChange={setDestination}
              onCoordinatesChange={setCoordinates}
              onItineraryUpdate={setItineraryItems}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Map and Itinerary */}
      <div className="w-1/2 lg:w-3/5 xl:w-1/2 flex flex-col">
        {/* Map Component - Top Half */}
        <div className="h-1/2 border-b border-gray-200 shadow-sm">
          <MapComponent 
            destination={destination} 
            coordinates={coordinates} 
            hotels={itineraryItems.filter(item => item.type === 'hotel')}
          />
        </div>
        
        {/* Itinerary Component - Bottom Half */}
        <div className="h-1/2 shadow-sm">
          <ItineraryComponent items={itineraryItems} />
        </div>
      </div>
    </div>
  );
}