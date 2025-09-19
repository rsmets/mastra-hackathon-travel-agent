import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    // Call your actual Mastra backend
    // Replace this URL with your actual backend endpoint
    // For example: http://localhost:3001/api/travel-agent or your deployed backend URL
    const backendResponse = await fetch('http://localhost:3001/api/travel-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      
      // Extract destination from message
      const destination = extractDestinationFromMessage(message);
      const coordinates = getCoordinatesForDestination(destination);

      // Transform the backend response to match our frontend format
      const transformedResponse = {
        response: `I found ${backendData.hotels?.length || 0} hotel recommendations for your trip to ${destination}! Check out the options below.`,
        destination,
        coordinates,
        itinerary: transformHotelsToItinerary(backendData.hotels || [])
      };

      return NextResponse.json(transformedResponse);
    } else {
      throw new Error('Backend request failed');
    }
  } catch (error) {
    console.error('Error calling backend:', error);
    
    // Fallback to mock data if backend is not available
    const fallbackResponse = {
      response: `I understand you want to plan a trip! I'm processing your request: "${message}". The backend is currently unavailable, but here are some sample recommendations.`,
      destination: "San Francisco, CA",
      coordinates: { lat: 37.7749, lng: -122.4194 },
      itinerary: [
        {
          id: '1',
          type: 'attraction',
          title: 'Golden Gate Bridge',
          description: 'Iconic suspension bridge spanning the Golden Gate strait',
          time: '2-3 hours',
          location: 'San Francisco, CA',
          rating: 4.8
        },
        {
          id: '2',
          type: 'hotel',
          title: 'The Ritz-Carlton San Francisco',
          description: 'Luxury hotel in Nob Hill with stunning city views',
          location: '600 Stockton St, San Francisco',
          price: '$400/night',
          rating: 4.7
        }
      ]
    };

    return NextResponse.json(fallbackResponse);
  }
}

// Extract destination from user message
function extractDestinationFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('new york') || lowerMessage.includes('nyc') || lowerMessage.includes('new york city')) {
    return "New York, NY";
  } else if (lowerMessage.includes('las vegas') || lowerMessage.includes('vegas')) {
    return "Las Vegas, NV";
  } else if (lowerMessage.includes('seattle')) {
    return "Seattle, WA";
  } else if (lowerMessage.includes('san francisco') || lowerMessage.includes('sf')) {
    return "San Francisco, CA";
  } else if (lowerMessage.includes('london')) {
    return "London, UK";
  } else if (lowerMessage.includes('paris')) {
    return "Paris, France";
  } else if (lowerMessage.includes('tokyo')) {
    return "Tokyo, Japan";
  } else if (lowerMessage.includes('los angeles') || lowerMessage.includes('la')) {
    return "Los Angeles, CA";
  } else if (lowerMessage.includes('chicago')) {
    return "Chicago, IL";
  } else if (lowerMessage.includes('miami')) {
    return "Miami, FL";
  }
  
  return "San Francisco, CA"; // Default fallback
}

// Get coordinates for destination
function getCoordinatesForDestination(destination: string): { lat: number; lng: number } {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    "New York, NY": { lat: 40.7128, lng: -74.0060 },
    "Las Vegas, NV": { lat: 36.1699, lng: -115.1398 },
    "Seattle, WA": { lat: 47.6062, lng: -122.3321 },
    "San Francisco, CA": { lat: 37.7749, lng: -122.4194 },
    "London, UK": { lat: 51.5074, lng: -0.1278 },
    "Paris, France": { lat: 48.8566, lng: 2.3522 },
    "Tokyo, Japan": { lat: 35.6762, lng: 139.6503 },
    "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
    "Chicago, IL": { lat: 41.8781, lng: -87.6298 },
    "Miami, FL": { lat: 25.7617, lng: -80.1918 }
  };
  
  return coordinates[destination] || coordinates["San Francisco, CA"];
}

// Transform backend hotel data to our frontend format
function transformHotelsToItinerary(hotels: any[]) {
  return hotels.map((hotel, index) => ({
    id: hotel.id || `hotel-${index}`,
    type: 'hotel',
    title: hotel.name,
    description: hotel.sponsored?.details || `Hotel in ${hotel.neighborhood}`,
    location: hotel.address,
    price: hotel.fees?.length > 0 ? 
      `$${hotel.fees.reduce((sum: number, fee: any) => sum + (fee.price?.amount || 0), 0)}/night` : 
      'Price on request',
    rating: hotel.rating || 4.0,
    image: hotel.gallery?.[0]?.url,
    amenities: hotel.amenities?.map((a: any) => a.name) || [],
    availability: hotel.availability?.available ? 'Available' : 'Unavailable',
    roomsLeft: hotel.availability?.roomsLeft,
    discount: hotel.discount?.percent ? `${hotel.discount.percent}% off` : null,
    coordinates: hotel.coordinate ? {
      lat: hotel.coordinate.latitude,
      lng: hotel.coordinate.longitude
    } : null,
    neighborhood: hotel.neighborhood,
    checkin: hotel.checkin,
    checkout: hotel.checkout,
    url: hotel.url,
    gallery: hotel.gallery || []
  }));
}
