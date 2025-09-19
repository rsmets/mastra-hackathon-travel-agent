'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TripDetails {
  destination?: string;
  duration?: string;
  dates?: string;
  name?: string;
  interests?: string[];
  accommodation?: string;
  budget?: string;
  isComplete: boolean;
}

interface ChatInterfaceProps {
  onDestinationChange: (destination: string) => void;
  onCoordinatesChange: (coordinates: { lat: number; lng: number }) => void;
  onItineraryUpdate: (items: any[]) => void;
}

export default function ChatInterface({ 
  onDestinationChange, 
  onCoordinatesChange, 
  onItineraryUpdate 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your travel planning assistant. Tell me where you\'d like to go and for how long, and I\'ll help you plan the perfect trip!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripDetails>({ isComplete: false });
  const [isGatheringDetails, setIsGatheringDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect trip planning intent and extract details
  const detectTripPlanning = (message: string): { isTripPlanning: boolean; extractedDetails: Partial<TripDetails> } => {
    const lowerMessage = message.toLowerCase();
    const isTripPlanning = lowerMessage.includes('plan') && (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('vacation'));
    
    if (!isTripPlanning) {
      return { isTripPlanning: false, extractedDetails: {} };
    }

    const extractedDetails: Partial<TripDetails> = {};

    // Extract destination
    const destinations = ['las vegas', 'new york', 'seattle', 'san francisco', 'london', 'paris', 'tokyo', 'los angeles', 'chicago', 'miami'];
    for (const dest of destinations) {
      if (lowerMessage.includes(dest)) {
        extractedDetails.destination = dest;
        break;
      }
    }

    // Extract duration
    const durationMatch = lowerMessage.match(/(\d+)\s*(day|days)/);
    if (durationMatch) {
      extractedDetails.duration = durationMatch[0];
    }

    // Extract dates
    const dateMatch = lowerMessage.match(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})/i);
    if (dateMatch) {
      extractedDetails.dates = dateMatch[0];
    }

    return { isTripPlanning, extractedDetails };
  };

  // Check what details are missing
  const getMissingDetails = (details: TripDetails): string[] => {
    const missing: string[] = [];
    if (!details.destination) missing.push('destination');
    if (!details.duration) missing.push('duration');
    if (!details.dates) missing.push('travel dates');
    if (!details.name) missing.push('your name');
    if (!details.interests || details.interests.length === 0) missing.push('interests/activities');
    if (!details.accommodation) missing.push('accommodation preferences');
    if (!details.budget) missing.push('budget considerations');
    return missing;
  };

  // Generate follow-up questions
  const generateFollowUpQuestion = (missingDetails: string[]): string => {
    if (missingDetails.length === 0) {
      return "Perfect! I have all the details I need. Let me plan your trip now!";
    }

    const questions: { [key: string]: string } = {
      'destination': "Where would you like to go?",
      'duration': "How many days will you be traveling?",
      'travel dates': "What are your travel dates?",
      'your name': "What's your name?",
      'interests/activities': "What activities interest you? (e.g., shows, dining, outdoor activities, casinos, etc.)",
      'accommodation preferences': "What type of accommodation do you prefer? (luxury, budget-friendly, etc.)",
      'budget considerations': "Do you have any budget considerations for flights and hotels?"
    };

    const nextQuestion = questions[missingDetails[0]];
    return `Great! To plan your perfect trip, I need a few more details. ${nextQuestion}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if this is a trip planning request
      const { isTripPlanning, extractedDetails } = detectTripPlanning(currentInput);
      
      if (isTripPlanning) {
        // Update trip details with extracted information
        const updatedDetails = { ...tripDetails, ...extractedDetails };
        setTripDetails(updatedDetails);
        setIsGatheringDetails(true);

        // Check what details are still missing
        const missingDetails = getMissingDetails(updatedDetails);
        
        if (missingDetails.length === 0) {
          // All details gathered, proceed with trip planning
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: "Perfect! I have all the details I need. Let me plan your trip now!",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          
          // Call backend with complete trip details
          await planTrip(updatedDetails);
          setIsGatheringDetails(false);
          setTripDetails({ isComplete: false });
        } else {
          // Ask for missing details
          const followUpQuestion = generateFollowUpQuestion(missingDetails);
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: followUpQuestion,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else {
        // Regular conversation or direct trip request
        const response = await fetch('/api/travel-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: currentInput }),
        });

        if (response.ok) {
          const data = await response.json();
          
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.response || 'I\'ve updated your travel plan! Check the map and itinerary on the right.',
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);

          // Update destination and coordinates if provided
          if (data.destination) {
            console.log('ChatInterface - Setting destination:', data.destination);
            onDestinationChange(data.destination);
          }
          if (data.coordinates) {
            console.log('ChatInterface - Setting coordinates:', data.coordinates);
            onCoordinatesChange(data.coordinates);
          }
          if (data.itinerary) {
            console.log('ChatInterface - Setting itinerary:', data.itinerary);
            onItineraryUpdate(data.itinerary);
          }
        } else {
          throw new Error('Failed to get response');
        }
      }
    } catch (error) {
      console.error('Error calling travel agent:', error);
      
      // Fallback: Parse the user input for basic travel planning
      const fallbackResponse = generateFallbackResponse(currentInput);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: fallbackResponse.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (fallbackResponse.destination) {
        console.log('ChatInterface - Fallback destination:', fallbackResponse.destination);
        onDestinationChange(fallbackResponse.destination);
      }
      if (fallbackResponse.coordinates) {
        console.log('ChatInterface - Fallback coordinates:', fallbackResponse.coordinates);
        onCoordinatesChange(fallbackResponse.coordinates);
      }
      if (fallbackResponse.itinerary) {
        console.log('ChatInterface - Fallback itinerary:', fallbackResponse.itinerary);
        onItineraryUpdate(fallbackResponse.itinerary);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Plan trip with complete details
  const planTrip = async (details: TripDetails) => {
    try {
      const response = await fetch('/api/travel-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: `Plan a complete trip to ${details.destination} for ${details.duration} starting ${details.dates}. 
                   Name: ${details.name}
                   Interests: ${details.interests?.join(', ')}
                   Accommodation: ${details.accommodation}
                   Budget: ${details.budget}`,
          tripDetails: details
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response || `Perfect! I've planned your ${details.duration} trip to ${details.destination}. Check out the recommendations on the right!`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Update destination and coordinates if provided
        if (data.destination) {
          onDestinationChange(data.destination);
        }
        if (data.coordinates) {
          onCoordinatesChange(data.coordinates);
        }
        if (data.itinerary) {
          onItineraryUpdate(data.itinerary);
        }
      } else {
        throw new Error('Failed to plan trip');
      }
    } catch (error) {
      console.error('Error planning trip:', error);
      
      // Fallback to basic trip planning
      const fallbackResponse = generateFallbackResponse(details.destination || '');
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: fallbackResponse.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (fallbackResponse.destination) {
        onDestinationChange(fallbackResponse.destination);
      }
      if (fallbackResponse.coordinates) {
        onCoordinatesChange(fallbackResponse.coordinates);
      }
      if (fallbackResponse.itinerary) {
        onItineraryUpdate(fallbackResponse.itinerary);
      }
    }
  };

  const generateFallbackResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Extract destination with better parsing
    let destination = "San Francisco, CA";
    let coordinates = { lat: 37.7749, lng: -122.4194 };
    
    if (lowerInput.includes('new york') || lowerInput.includes('nyc') || lowerInput.includes('new york city')) {
      destination = "New York, NY";
      coordinates = { lat: 40.7128, lng: -74.0060 };
    } else if (lowerInput.includes('las vegas') || lowerInput.includes('vegas')) {
      destination = "Las Vegas, NV";
      coordinates = { lat: 36.1699, lng: -115.1398 };
    } else if (lowerInput.includes('seattle')) {
      destination = "Seattle, WA";
      coordinates = { lat: 47.6062, lng: -122.3321 };
    } else if (lowerInput.includes('san francisco') || lowerInput.includes('sf')) {
      destination = "San Francisco, CA";
      coordinates = { lat: 37.7749, lng: -122.4194 };
    } else if (lowerInput.includes('london')) {
      destination = "London, UK";
      coordinates = { lat: 51.5074, lng: -0.1278 };
    } else if (lowerInput.includes('paris')) {
      destination = "Paris, France";
      coordinates = { lat: 48.8566, lng: 2.3522 };
    } else if (lowerInput.includes('tokyo')) {
      destination = "Tokyo, Japan";
      coordinates = { lat: 35.6762, lng: 139.6503 };
    } else if (lowerInput.includes('los angeles') || lowerInput.includes('la')) {
      destination = "Los Angeles, CA";
      coordinates = { lat: 34.0522, lng: -118.2437 };
    } else if (lowerInput.includes('chicago')) {
      destination = "Chicago, IL";
      coordinates = { lat: 41.8781, lng: -87.6298 };
    } else if (lowerInput.includes('miami')) {
      destination = "Miami, FL";
      coordinates = { lat: 25.7617, lng: -80.1918 };
    }

    // Generate sample itinerary based on destination
    const itinerary = generateSampleItinerary(destination);

    return {
      message: `Great! I've planned a trip to ${destination}. I've updated the map and created a sample itinerary for you. Check out the recommendations on the right!`,
      destination,
      coordinates,
      itinerary
    };
  };

  const generateSampleItinerary = (destination: string) => {
    // Generate destination-specific sample data
    if (destination.includes('New York')) {
      return [
        {
          id: '1',
          type: 'hotel',
          title: 'The Plaza New York',
          description: 'Iconic luxury hotel overlooking Central Park',
          location: '768 5th Ave, New York, NY 10019',
          price: '$450/night',
          rating: 4.7,
          image: 'https://images.trvl-media.com/lodging/1000000/20000/19000/18900/18900_1_b.jpg',
          amenities: ['Spa', 'Restaurant', 'WiFi', 'Concierge'],
          availability: 'Available',
          roomsLeft: 3,
          neighborhood: 'Midtown Manhattan',
          checkin: '2025-10-22',
          checkout: '2025-10-25',
          url: 'https://www.expedia.com/New-York-Hotels-The-Plaza.h18900.Hotel-Information'
        },
        {
          id: '2',
          type: 'hotel',
          title: 'The Standard, High Line',
          description: 'Modern hotel with stunning city views',
          location: '848 Washington St, New York, NY 10014',
          price: '$320/night',
          rating: 4.3,
          image: 'https://images.trvl-media.com/lodging/1000000/20000/19000/18900/18900_2_b.jpg',
          amenities: ['Rooftop Bar', 'Fitness Center', 'WiFi'],
          availability: 'Available',
          roomsLeft: 7,
          neighborhood: 'Meatpacking District',
          checkin: '2025-10-22',
          checkout: '2025-10-25',
          url: 'https://www.expedia.com/New-York-Hotels-The-Standard-High-Line.h18901.Hotel-Information'
        },
        {
          id: '3',
          type: 'attraction',
          title: 'Statue of Liberty',
          description: 'Iconic symbol of freedom and democracy',
          time: '3-4 hours',
          location: 'Liberty Island, New York, NY',
          rating: 4.6
        },
        {
          id: '4',
          type: 'attraction',
          title: 'Central Park',
          description: 'Massive park in the heart of Manhattan',
          time: '2-3 hours',
          location: 'Central Park, New York, NY',
          rating: 4.8
        },
        {
          id: '5',
          type: 'flight',
          title: 'Delta Airlines Flight',
          description: 'Round-trip flight to New York',
          time: '6h 30m',
          price: '$380',
          rating: 4.2
        }
      ];
    } else if (destination.includes('Seattle')) {
      return [
        {
          id: '1',
          type: 'hotel',
          title: 'The Westin Seattle',
          description: 'Modern hotel in downtown Seattle with stunning city views',
          location: '1900 5th Ave, Seattle, WA 98101',
          price: '$280/night',
          rating: 4.4,
          image: 'https://images.trvl-media.com/lodging/1000000/20000/19000/18900/18900_1_b.jpg',
          amenities: ['Spa', 'Restaurant', 'WiFi', 'Fitness Center'],
          availability: 'Available',
          roomsLeft: 4,
          neighborhood: 'Downtown Seattle',
          checkin: '2025-10-22',
          checkout: '2025-10-25',
          url: 'https://www.expedia.com/Seattle-Hotels-The-Westin-Seattle.h18900.Hotel-Information'
        },
        {
          id: '2',
          type: 'hotel',
          title: 'Hotel 1000',
          description: 'Luxury boutique hotel in the heart of Seattle',
          location: '1000 1st Ave, Seattle, WA 98104',
          price: '$320/night',
          rating: 4.6,
          image: 'https://images.trvl-media.com/lodging/1000000/20000/19000/18900/18900_2_b.jpg',
          amenities: ['Spa', 'Restaurant', 'WiFi', 'Concierge'],
          availability: 'Available',
          roomsLeft: 2,
          neighborhood: 'Pioneer Square',
          checkin: '2025-10-22',
          checkout: '2025-10-25',
          url: 'https://www.expedia.com/Seattle-Hotels-Hotel-1000.h18901.Hotel-Information'
        },
        {
          id: '3',
          type: 'attraction',
          title: 'Space Needle',
          description: 'Iconic observation tower with panoramic city views',
          time: '2-3 hours',
          location: '400 Broad St, Seattle, WA',
          rating: 4.3
        },
        {
          id: '4',
          type: 'attraction',
          title: 'Pike Place Market',
          description: 'Historic public market with local vendors and restaurants',
          time: '2-4 hours',
          location: '85 Pike St, Seattle, WA',
          rating: 4.5
        },
        {
          id: '5',
          type: 'flight',
          title: 'Alaska Airlines Flight',
          description: 'Round-trip flight to Seattle',
          time: '5h 45m',
          price: '$420',
          rating: 4.1
        }
      ];
    } else if (destination.includes('Las Vegas')) {
      return [
        {
          id: '1',
          type: 'hotel',
          title: 'The Venetian Resort Las Vegas',
          description: 'Luxury resort with gondola rides and world-class entertainment',
          location: '3355 S Las Vegas Blvd, Las Vegas, NV 89109',
          price: '$350/night',
          rating: 4.5,
          image: 'https://images.trvl-media.com/lodging/1000000/20000/19000/18900/18900_1_b.jpg',
          amenities: ['Casino', 'Spa', 'Pool', 'Restaurants', 'Entertainment'],
          availability: 'Available',
          roomsLeft: 8,
          neighborhood: 'The Strip',
          checkin: '2025-10-22',
          checkout: '2025-10-27',
          url: 'https://www.expedia.com/Las-Vegas-Hotels-The-Venetian-Resort.h18900.Hotel-Information'
        },
        {
          id: '2',
          type: 'hotel',
          title: 'Bellagio Las Vegas',
          description: 'Iconic luxury resort famous for its fountains and fine dining',
          location: '3600 S Las Vegas Blvd, Las Vegas, NV 89109',
          price: '$420/night',
          rating: 4.7,
          image: 'https://images.trvl-media.com/lodging/1000000/20000/19000/18900/18900_2_b.jpg',
          amenities: ['Casino', 'Spa', 'Pool', 'Fine Dining', 'Shows'],
          availability: 'Available',
          roomsLeft: 5,
          neighborhood: 'The Strip',
          checkin: '2025-10-22',
          checkout: '2025-10-27',
          url: 'https://www.expedia.com/Las-Vegas-Hotels-Bellagio.h18901.Hotel-Information'
        },
        {
          id: '3',
          type: 'attraction',
          title: 'Fremont Street Experience',
          description: 'Historic downtown Las Vegas with light shows and entertainment',
          time: '2-3 hours',
          location: 'Fremont St, Las Vegas, NV',
          rating: 4.2
        },
        {
          id: '4',
          type: 'attraction',
          title: 'High Roller Observation Wheel',
          description: 'World\'s tallest observation wheel with panoramic city views',
          time: '1-2 hours',
          location: '3545 S Las Vegas Blvd, Las Vegas, NV',
          rating: 4.4
        },
        {
          id: '5',
          type: 'flight',
          title: 'Southwest Airlines Flight',
          description: 'Round-trip flight to Las Vegas',
          time: '4h 15m',
          price: '$280',
          rating: 4.0
        }
      ];
    } else if (destination.includes('San Francisco')) {
      return [
        {
          id: '1',
          type: 'hotel',
          title: 'Marriott Vacation Club®, San Francisco',
          description: 'Family-Friendly Vacation Rentals in Fisherman\'s Wharf',
          location: '2620 Jones St, San Francisco, CA, 94133',
          price: '$234/night',
          rating: 4.2,
          image: 'https://a.travel-assets.com/media/meso_cm/PAPI/Images/lodging/38000000/37390000/37382500/37382494/8dbf930b_b.jpg',
          amenities: ['Pool', 'Fitness Center', 'WiFi'],
          availability: 'Available',
          roomsLeft: 1,
          neighborhood: 'Fisherman\'s Wharf',
          checkin: '2025-10-03',
          checkout: '2025-10-04',
          url: 'https://www.expedia.com/San-Francisco-Hotels-Marriott-Vacation-Club-Pulse.h37382494.Hotel-Information'
        },
        {
          id: '2',
          type: 'hotel',
          title: 'The Westin St. Francis San Francisco on Union Square',
          description: 'Stay in the center of it all, steps away from historic cable cars',
          location: '335 Powell Street, San Francisco, CA, 94102',
          price: '$240/night',
          rating: 4.5,
          image: 'https://a.travel-assets.com/media/meso_cm/PAPI/Images/lodging/1000000/30000/26800/26760/1c60e316_b.jpg',
          amenities: ['Restaurant', 'Meeting Rooms', 'WiFi'],
          availability: 'Available',
          roomsLeft: 5,
          neighborhood: 'Union Square',
          checkin: '2025-10-03',
          checkout: '2025-10-04',
          url: 'https://www.expedia.com/San-Francisco-Hotels-The-Westin-St-Francis-San-Francisco-On-Union-Square.h26760.Hotel-Information'
        }
      ];
    } else {
      // Default fallback
      return [
        {
          id: '1',
          type: 'hotel',
          title: 'Sample Hotel',
          description: 'Comfortable accommodation in the city center',
          location: destination,
          price: '$200/night',
          rating: 4.0,
          amenities: ['WiFi', 'Restaurant'],
          availability: 'Available',
          roomsLeft: 5,
          neighborhood: 'City Center',
          checkin: '2025-10-22',
          checkout: '2025-10-25'
        }
      ];
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="text-sm text-gray-600">Planning your trip...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell me about your travel plans..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
