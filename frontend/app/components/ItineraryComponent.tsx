'use client';

import { useState } from 'react';

interface ItineraryItem {
  id: string;
  type: 'attraction' | 'hotel' | 'flight' | 'restaurant';
  title: string;
  description: string;
  time?: string;
  location?: string;
  price?: string;
  rating?: number;
  image?: string;
  amenities?: string[];
  availability?: string;
  roomsLeft?: number;
  discount?: string;
  coordinates?: { lat: number; lng: number };
  neighborhood?: string;
  checkin?: string;
  checkout?: string;
  url?: string;
  gallery?: Array<{ name: string; url: string }>;
}

interface ItineraryComponentProps {
  items?: ItineraryItem[];
}

export default function ItineraryComponent({ items }: ItineraryComponentProps) {
  const [activeTab, setActiveTab] = useState<'attractions' | 'hotels' | 'flights'>('attractions');

  // Use provided items or empty array
  const sampleItems: ItineraryItem[] = items || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'attraction':
        return '🏛️';
      case 'hotel':
        return '🏨';
      case 'flight':
        return '✈️';
      case 'restaurant':
        return '🍽️';
      default:
        return '📍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'attraction':
        return 'bg-blue-100 text-blue-800';
      case 'hotel':
        return 'bg-green-100 text-green-800';
      case 'flight':
        return 'bg-purple-100 text-purple-800';
      case 'restaurant':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = sampleItems.filter(item => {
    if (activeTab === 'attractions') return item.type === 'attraction';
    if (activeTab === 'hotels') return item.type === 'hotel';
    if (activeTab === 'flights') return item.type === 'flight';
    return true;
  });

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">📋 Travel Itinerary</h2>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
          {[
            { key: 'attractions', label: 'Attractions', count: sampleItems.filter(i => i.type === 'attraction').length, icon: '🏛️' },
            { key: 'hotels', label: 'Hotels', count: sampleItems.filter(i => i.type === 'hotel').length, icon: '🏨' },
            { key: 'flights', label: 'Flights', count: sampleItems.filter(i => i.type === 'flight').length, icon: '✈️' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Itinerary Items */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200">
                <div className="flex items-start space-x-4">
                  {/* Image or Icon */}
                  <div className="flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl ${item.image ? 'hidden' : ''}`}>
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate text-lg">{item.title}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                          {item.discount && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              {item.discount}
                            </span>
                          )}
                        </div>
                        {item.neighborhood && (
                          <p className="text-sm text-blue-600 font-medium mb-1">📍 {item.neighborhood}</p>
                        )}
                      </div>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          View
                        </a>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.description}</p>
                    
                    {/* Amenities for hotels */}
                    {item.amenities && item.amenities.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {item.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                              {amenity}
                            </span>
                          ))}
                          {item.amenities.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                              +{item.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3 text-xs">
                      {item.time && (
                        <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {item.time}
                        </span>
                      )}
                      {item.location && (
                        <span className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-md">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {item.location}
                        </span>
                      )}
                      {item.price && (
                        <span className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          {item.price}
                        </span>
                      )}
                      {item.rating && (
                        <span className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md">
                          <svg className="w-3 h-3 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {item.rating}
                        </span>
                      )}
                      {item.availability && (
                        <span className={`flex items-center px-2 py-1 rounded-md ${
                          item.availability === 'Available' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item.availability}
                        </span>
                      )}
                      {item.roomsLeft && (
                        <span className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded-md">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                          {item.roomsLeft} rooms left
                        </span>
                      )}
                    </div>
                    
                    {/* Check-in/Check-out dates for hotels */}
                    {item.checkin && item.checkout && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Check-in: {new Date(item.checkin).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>Check-out: {new Date(item.checkout).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
              <p className="text-sm text-gray-500">Start a conversation to get personalized recommendations!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
