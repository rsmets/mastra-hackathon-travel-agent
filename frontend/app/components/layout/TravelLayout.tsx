'use client';

import { ReactNode } from 'react';

interface TravelLayoutProps {
  children?: ReactNode;
  chatPanel: ReactNode;
  mapPanel: ReactNode;
}

export function TravelLayout({ children, chatPanel, mapPanel }: TravelLayoutProps) {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-gray-900">
            W<span className="text-red-500">a</span>nderful
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Plan your perfect trip</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Left Side */}
        <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
          {chatPanel}
        </div>

        {/* Map Panel - Right Side */}
        <div className="w-1/2 bg-gray-100 relative">
          {mapPanel}
        </div>
      </div>

      {/* Additional content if needed */}
      {children}
    </div>
  );
}
