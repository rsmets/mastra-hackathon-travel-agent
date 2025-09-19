'use client';

import { Location } from '../../store/travel-store';
import { MapPin, Star, ExternalLink } from 'lucide-react';

interface LocationCardProps {
  location: Location;
  onClick: () => void;
}

export function LocationCard({ location, onClick }: LocationCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{location.name}</h4>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {location.location}
          </div>
        </div>
        
        {/* Rating */}
        {location.rating && (
          <div className="flex items-center text-xs">
            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
            <span className="text-gray-600">{location.rating}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {location.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {location.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Price */}
        {location.price && (
          <div className="text-sm font-medium text-green-600">
            {location.currency && `${location.currency} `}
            {location.price}
          </div>
        )}

        {/* Type badge */}
        <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadgeStyle(location.type)}`}>
          {location.type}
        </span>

        {/* External link */}
        {location.url && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(location.url, '_blank');
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function getTypeBadgeStyle(type: Location['type']): string {
  switch (type) {
    case 'hotel':
      return 'bg-blue-100 text-blue-800';
    case 'attraction':
      return 'bg-purple-100 text-purple-800';
    case 'restaurant':
      return 'bg-orange-100 text-orange-800';
    case 'flight':
      return 'bg-green-100 text-green-800';
    case 'activity':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
