'use client';

import dynamic from 'next/dynamic';
import { TravelLayout } from './components/layout/TravelLayout';
import { ChatInterface } from './components/chat/ChatInterface';

// Dynamically import TravelMap to avoid SSR issues with Leaflet
const TravelMap = dynamic(
  () => import('./components/map/TravelMap').then((mod) => ({ default: mod.TravelMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function Page() {
  return (
    <TravelLayout
      chatPanel={<ChatInterface />}
      mapPanel={<TravelMap />}
    />
  );
}