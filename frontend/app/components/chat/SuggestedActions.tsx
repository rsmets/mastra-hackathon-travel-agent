'use client';

import { Plane, Hotel, MapPin, Compass } from 'lucide-react';

interface SuggestedActionsProps {
  onAction: (message: string) => void;
}

export function SuggestedActions({ onAction }: SuggestedActionsProps) {
  const suggestions = [
    {
      icon: MapPin,
      title: 'Try Paris Demo',
      description: 'See sample recommendations for Paris',
      action: "I want to visit Paris, France. What do you recommend?",
    },
    {
      icon: Hotel,
      title: 'Book Hotels',
      description: 'Discover great places to stay',
      action: "I need help finding hotels for my trip. What are some good options?",
    },
    {
      icon: Plane,
      title: 'Find Flights',
      description: 'Search for flights to your destination',
      action: "I'm looking for flights. Can you help me find the best options?",
    },
    {
      icon: Compass,
      title: 'Plan Itinerary',
      description: 'Create a detailed travel plan',
      action: "Help me plan a complete itinerary for my trip including activities and attractions.",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Get started with these suggestions:
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={index}
              onClick={() => onAction(suggestion.action)}
              className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {suggestion.title}
                </div>
                <div className="text-xs text-gray-500">
                  {suggestion.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
