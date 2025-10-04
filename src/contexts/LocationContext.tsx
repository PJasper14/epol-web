"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { WorkplaceLocation } from '@/types/location';
import { apiService } from '@/lib/api';
import { useAdmin } from './AdminContext';

interface LocationContextType {
  workplaceLocations: WorkplaceLocation[];
  loading: boolean;
  error: string | null;
  addLocation: (location: WorkplaceLocation) => void;
  updateLocation: (updatedLocation: WorkplaceLocation) => void;
  deleteLocation: (locationId: string) => void;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Transform API response to match our interface
const transformApiLocation = (apiLocation: any): WorkplaceLocation => {
  if (!apiLocation || !apiLocation.id) {
    console.error('Invalid location data:', apiLocation);
    throw new Error('Invalid location data received from API');
  }
  
  return {
    id: apiLocation.id.toString(),
    name: apiLocation.name || 'Unknown Location',
    latitude: parseFloat(apiLocation.latitude) || 0,
    longitude: parseFloat(apiLocation.longitude) || 0,
    radius: parseInt(apiLocation.radius) || 100,
    address: apiLocation.description || '',
    createdAt: apiLocation.created_at || new Date().toISOString(),
    updatedAt: apiLocation.updated_at || new Date().toISOString(),
  };
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [workplaceLocations, setWorkplaceLocations] = useState<WorkplaceLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAdmin();

  const refreshLocations = async () => {
    if (!isAuthenticated) {
      return; // Don't make API calls if not authenticated
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getWorkplaceLocations({ per_page: 100 });
      
      // Debug: Log the response structure
      console.log('API Response:', response);
      
      // Handle different response structures (including paginated responses)
      let locationsData = response.data;
      
      // Check if it's a paginated response
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        locationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        locationsData = response.data;
      } else {
        console.error('Unexpected API response structure:', response);
        setError('Invalid API response format');
        return;
      }
      
      const transformedLocations = locationsData.map((location: any) => {
        try {
          return transformApiLocation(location);
        } catch (error) {
          console.error('Error transforming location:', location, error);
          return null;
        }
      }).filter(Boolean); // Remove null values
      
      setWorkplaceLocations(transformedLocations);
    } catch (err) {
      console.error('Error fetching workplace locations:', err);
      setError('Failed to fetch workplace locations');
    } finally {
      setLoading(false);
    }
  };

  const addLocation = (location: WorkplaceLocation) => {
    setWorkplaceLocations(prev => [location, ...prev]);
  };

  const updateLocation = (updatedLocation: WorkplaceLocation) => {
    if (!updatedLocation || !updatedLocation.id) {
      console.error('Invalid updatedLocation provided:', updatedLocation);
      return;
    }
    
    setWorkplaceLocations(prev => 
      prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc)
    );
  };

  const deleteLocation = (locationId: string) => {
    setWorkplaceLocations(prev => prev.filter(loc => loc.id !== locationId));
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshLocations();
    }
  }, [isAuthenticated]);

  return (
    <LocationContext.Provider value={{
      workplaceLocations,
      loading,
      error,
      addLocation,
      updateLocation,
      deleteLocation,
      refreshLocations
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
