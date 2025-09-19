'use client';

import { Location } from '../../store/travel-store';
import { Star, ExternalLink, MapPin, DollarSign } from 'lucide-react';

interface LocationPopupProps {
  location: Location;
}

export function LocationPopup({ location }: LocationPopupProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[250px] max-w-[300px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 mr-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {location.name}
          </h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {location.location}
          </div>
        </div>
        
        {/* Type badge */}
        <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getTypeBadgeStyle(location.type)}`}>
          {location.type}
        </span>
      </div>

      {/* Rating and Price */}
      {(location.rating || location.price) && (
        <div className="flex items-center justify-between mb-3">
          {location.rating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium text-gray-700">
                {location.rating}
              </span>
            </div>
          )}
          
          {location.price && (
            <div className="flex items-center text-sm font-semibold text-green-600">
              <DollarSign className="w-4 h-4 mr-1" />
              {location.currency && `${location.currency} `}
              {location.price}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {location.description && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {location.description}
        </p>
      )}

      {/* Image */}
      {location.image && (
        <div className="mb-3">
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-32 object-cover rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={() => {
            // Copy coordinates to clipboard
            navigator.clipboard.writeText(
              `${location.geolocation[0]}, ${location.geolocation[1]}`
            );
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Copy coordinates
        </button>
        
        {location.url && (
          <a
            href={location.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-blue-600 hover:text-blue-800"
          >
            <span className="mr-1">More info</span>
            <ExternalLink className="w-3 h-3" />
          </a>
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
