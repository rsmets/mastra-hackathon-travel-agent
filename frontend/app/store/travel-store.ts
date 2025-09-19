import { create } from 'zustand';

export interface Location {
  id: string;
  name: string;
  geolocation: [number, number]; // [lat, lng]
  location: string;
  description: string;
  type: 'hotel' | 'attraction' | 'restaurant' | 'flight' | 'activity';
  rating?: number;
  price?: number;
  currency?: string;
  url?: string;
  image?: string;
}

export interface TravelPlan {
  id: string;
  title: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  locations: Location[];
  budget?: number;
  status: 'planning' | 'booked' | 'completed';
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedLocation?: Location;
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  locations?: Location[];
}

export interface TravelState {
  // Chat state
  messages: ChatMessage[];
  isLoading: boolean;
  
  // Map state
  map: MapState;
  
  // Travel data
  currentPlan?: TravelPlan;
  recommendations: Location[];
  searchResults: Location[];
  
  // User preferences
  preferences: {
    budget?: number;
    travelStyle?: 'budget' | 'mid-range' | 'luxury';
    interests?: string[];
    location?: string;
  };
}

export interface TravelActions {
  // Chat actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  
  // Map actions
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  setSelectedLocation: (location: Location | undefined) => void;
  updateViewState: (viewState: Partial<MapState['viewState']>) => void;
  
  // Travel data actions
  addRecommendation: (location: Location) => void;
  setRecommendations: (locations: Location[]) => void;
  setSearchResults: (locations: Location[]) => void;
  createTravelPlan: (plan: Omit<TravelPlan, 'id'>) => void;
  updateTravelPlan: (id: string, updates: Partial<TravelPlan>) => void;
  
  // User preferences
  updatePreferences: (preferences: Partial<TravelState['preferences']>) => void;
}

const initialState: TravelState = {
  messages: [],
  isLoading: false,
  map: {
    center: [40.7128, -74.0060], // NYC default
    zoom: 10,
    viewState: {
      longitude: -74.0060,
      latitude: 40.7128,
      zoom: 10,
    },
  },
  recommendations: [],
  searchResults: [],
  preferences: {},
};

export const useTravelStore = create<TravelState & TravelActions>((set, get) => ({
  ...initialState,
  
  // Chat actions
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
    
    // Extract locations from message if present
    if (newMessage.locations && newMessage.locations.length > 0) {
      get().setRecommendations([...get().recommendations, ...newMessage.locations]);
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearMessages: () => set({ messages: [] }),
  
  // Map actions
  setMapCenter: (center) => 
    set((state) => ({
      map: {
        ...state.map,
        center,
        viewState: {
          ...state.map.viewState,
          longitude: center[1],
          latitude: center[0],
        },
      },
    })),
  
  setMapZoom: (zoom) =>
    set((state) => ({
      map: {
        ...state.map,
        zoom,
        viewState: {
          ...state.map.viewState,
          zoom,
        },
      },
    })),
  
  setSelectedLocation: (location) =>
    set((state) => ({
      map: {
        ...state.map,
        selectedLocation: location,
      },
    })),
  
  updateViewState: (viewState) =>
    set((state) => ({
      map: {
        ...state.map,
        viewState: {
          ...state.map.viewState,
          ...viewState,
        },
        center: viewState.latitude && viewState.longitude 
          ? [viewState.latitude, viewState.longitude] 
          : state.map.center,
        zoom: viewState.zoom ?? state.map.zoom,
      },
    })),
  
  // Travel data actions
  addRecommendation: (location) =>
    set((state) => ({
      recommendations: [...state.recommendations, location],
    })),
  
  setRecommendations: (locations) =>
    set({ recommendations: locations }),
  
  setSearchResults: (locations) =>
    set({ searchResults: locations }),
  
  createTravelPlan: (plan) => {
    const newPlan: TravelPlan = {
      ...plan,
      id: Date.now().toString(),
    };
    set({ currentPlan: newPlan });
  },
  
  updateTravelPlan: (id, updates) =>
    set((state) => ({
      currentPlan: state.currentPlan?.id === id 
        ? { ...state.currentPlan, ...updates }
        : state.currentPlan,
    })),
  
  // User preferences
  updatePreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),
}));
