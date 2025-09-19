'use client';

import { ChatMessage, useTravelStore } from '../../store/travel-store';
import { LocationCard } from './LocationCard';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { setSelectedLocation, setMapCenter } = useTravelStore();
  const isUser = message.role === 'user';

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location);
    setMapCenter(location.geolocation);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600' : 'bg-gray-300'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-gray-600" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`px-4 py-2 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {/* Main message text */}
          <div className="whitespace-pre-wrap text-sm">
            {formatMessageContent(message.content)}
          </div>

          {/* Location cards if present */}
          {message.locations && message.locations.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onClick={() => handleLocationClick(location)}
                />
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format message content and remove location markers
function formatMessageContent(content: string): string {
  // Remove the location markers from the display text
  return content.replace(/📍\{[^}]+\}\s*-?\s*/g, '').trim();
}
