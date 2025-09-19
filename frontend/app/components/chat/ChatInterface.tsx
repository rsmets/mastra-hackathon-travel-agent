'use client';

import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { MastraClient } from '@mastra/client-js';
import { useTravelStore } from '../../store/travel-store';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SuggestedActions } from './SuggestedActions';
import { useState } from 'react';

export function ChatInterface() {
  const { messages, addMessage, setLoading, isLoading, recommendations, setRecommendations } = useTravelStore();
  const [lastMessageId, setLastMessageId] = useState<string>('');
  const [threadId] = useState<string>('travel-chat-' + Date.now());
  
  // Initialize Mastra client
  const mastraClient = new MastraClient({
    baseUrl: process.env.NEXT_PUBLIC_MASTRA_URL || 'http://localhost:4111',
  });

  // Make travel recommendations readable by CopilotKit
  useCopilotReadable({
    description: 'Current travel recommendations and locations on the map',
    value: recommendations,
  });

  // Define action for adding travel recommendations
  useCopilotAction({
    name: 'addTravelRecommendation',
    description: 'Add a travel recommendation with location data to be displayed on the map',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the place',
        required: true,
      },
      {
        name: 'location',
        type: 'string', 
        description: 'Location string (city, country)',
        required: true,
      },
      {
        name: 'latitude',
        type: 'number',
        description: 'Latitude coordinate',
        required: true,
      },
      {
        name: 'longitude',
        type: 'number',
        description: 'Longitude coordinate',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the place',
        required: true,
      },
      {
        name: 'type',
        type: 'string',
        description: 'Type of location (hotel, attraction, restaurant, flight, activity)',
        required: true,
      },
      {
        name: 'rating',
        type: 'number',
        description: 'Rating if available',
        required: false,
      },
      {
        name: 'price',
        type: 'number',
        description: 'Price if available',
        required: false,
      },
      {
        name: 'currency',
        type: 'string',
        description: 'Currency for price',
        required: false,
      },
      {
        name: 'url',
        type: 'string',
        description: 'URL for more information or booking',
        required: false,
      },
    ],
    handler: async (args: {
      name: string;
      location: string;
      latitude: number;
      longitude: number;
      description: string;
      type: string;
      rating?: number;
      price?: number;
      currency?: string;
      url?: string;
    }) => {
      const location = {
        id: Date.now().toString(),
        name: args.name,
        location: args.location,
        geolocation: [args.latitude, args.longitude] as [number, number],
        description: args.description,
        type: args.type as any,
        rating: args.rating,
        price: args.price,
        currency: args.currency,
        url: args.url,
      };

      setRecommendations([...recommendations, location]);
      return `Added ${args.name} to the map at coordinates ${args.latitude}, ${args.longitude}`;
    },
  });

  // Action to handle conversation flow
  useCopilotAction({
    name: 'processUserMessage',
    description: 'Process user travel queries and provide recommendations',
    parameters: [
      {
        name: 'userMessage',
        type: 'string',
        description: 'The user message to process',
        required: true,
      },
      {
        name: 'response',
        type: 'string',
        description: 'The AI response to the user',
        required: true,
      },
    ],
    handler: async (args: { userMessage: string; response: string }) => {
      // Add the user message and AI response to our store
      const userMsgId = Date.now().toString();
      const aiMsgId = (Date.now() + 1).toString();
      
      addMessage({
        role: 'user',
        content: args.userMessage,
      });
      
      addMessage({
        role: 'assistant',
        content: args.response,
      });

      setLastMessageId(aiMsgId);
      return 'Messages processed and added to chat';
    },
  });

  const handleSendMessage = async (content: string) => {
    // Add user message immediately
    addMessage({
      role: 'user',
      content,
    });

    setLoading(true);

    try {
      // Use Mastra client SDK to call the travel agent
      const agent = mastraClient.getAgent('travelAgent');
      
      const conversationMessages = [
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: content,
        }
      ];

      // Stream the response from the agent
      const response = await agent.stream({
        messages: conversationMessages,
      });

      let aiResponse = '';

      // Check if this is a streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim()) {
              try {
                // Handle different streaming formats
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'textDelta' && data.textDelta) {
                    aiResponse += data.textDelta;
                  }
                } else if (line.startsWith('0:')) {
                  // Handle Mastra streaming format: 0:"text"
                  const text = line.slice(2);
                  if (text.startsWith('"') && text.endsWith('"')) {
                    aiResponse += text.slice(1, -1);
                  }
                } else if (line.startsWith('f:')) {
                  // Message metadata, ignore for now
                  continue;
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      } else {
        // Fallback to text response
        aiResponse = await response.text?.() || 'No response received';
      }

      // Parse locations from the AI response
      const locations = parseLocationsFromMessage(aiResponse);
      
      // Add locations to the map if found
      if (locations.length > 0) {
        setRecommendations([...recommendations, ...locations]);
      }

      // Add AI response to chat
      addMessage({
        role: 'assistant',
        content: aiResponse,
        locations,
      });

    } catch (error) {
      console.error('Error calling Mastra backend:', error);
      // Fallback to demo implementation
      handleFallbackMessage(content);
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackMessage = (content: string) => {
    addMessage({
      role: 'user',
      content,
    });

    setLoading(true);
    
    // Add some sample recommendations for testing when backend isn't available
    if (content.toLowerCase().includes('paris') || content.toLowerCase().includes('france')) {
      const sampleLocations = [
        {
          id: '1',
          name: 'Eiffel Tower',
          location: 'Paris, France',
          geolocation: [48.8584, 2.2945] as [number, number],
          description: 'Iconic iron lattice tower and symbol of Paris',
          type: 'attraction' as const,
          rating: 4.6,
        },
        {
          id: '2',
          name: 'Hotel Ritz Paris',
          location: 'Paris, France',
          geolocation: [48.8677, 2.3281] as [number, number],
          description: 'Luxury hotel in the heart of Paris',
          type: 'hotel' as const,
          rating: 4.8,
          price: 800,
          currency: 'EUR',
        },
        {
          id: '3',
          name: 'Le Comptoir Relais',
          location: 'Paris, France',
          geolocation: [48.8533, 2.3389] as [number, number],
          description: 'Traditional French bistro with authentic cuisine',
          type: 'restaurant' as const,
          rating: 4.4,
        },
      ];
      
      setRecommendations([...recommendations, ...sampleLocations]);
      
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: `Great choice! Paris is an amazing destination. I've found some wonderful recommendations for you, including the iconic Eiffel Tower, luxury accommodations, and authentic French dining. Check them out on the map!`,
          locations: sampleLocations,
        });
        setLoading(false);
      }, 1500);
    } else {
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: `I understand you're interested in "${content}". Let me help you with that! (Note: This is a fallback response - please ensure the backend is running)`,
        });
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      {/* <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Travel Assistant</h2>
        <p className="text-sm text-gray-500">Plan your perfect trip with AI</p>
        {messages.length === 0 && (
          <div className="mt-2 text-xs text-green-600">
            ✅ Connected via Mastra Client SDK
          </div>
        )}
      </div> */}

      {/* Suggested Actions - shown when no messages */}
      {messages.length === 0 && (
        <div className="p-4">
          <SuggestedActions onAction={handleSendMessage} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

// Helper function to parse location data from travel agent responses
function parseLocationsFromMessage(content: string) {
  const locationRegex = /📍\{([^}]+)\}/g;
  const locations = [];
  let match;

  while ((match = locationRegex.exec(content)) !== null) {
    try {
      const locationData = match[1];
      // Parse the location data - this is a simplified parser
      // In a real implementation, you'd want more robust parsing
      const nameMatch = locationData.match(/"name":\s*"([^"]+)"/);
      const geolocationMatch = locationData.match(/"geolocation":\s*"([^"]+)"/);
      const locationMatch = locationData.match(/"location":\s*"([^"]+)"/);
      const descriptionMatch = locationData.match(/"description":\s*"([^"]+)"/);

      if (nameMatch && geolocationMatch) {
        const [lat, lng] = geolocationMatch[1].split(',').map(s => parseFloat(s.trim()));
        
        locations.push({
          id: Date.now().toString() + Math.random(),
          name: nameMatch[1],
          geolocation: [lat, lng] as [number, number],
          location: locationMatch?.[1] || '',
          description: descriptionMatch?.[1] || '',
          type: 'attraction' as const,
        });
      }
    } catch (error) {
      console.warn('Failed to parse location from message:', error);
    }
  }

  return locations;
}
