"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService } from '@/lib/api';

export interface WorkplaceLocation {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  active_assignments?: any[];
}

interface WorkplaceLocationContextType {
  locations: WorkplaceLocation[];
  loading: boolean;
  error: string | null;
  refreshLocations: () => Promise<void>;
  addLocation: (location: WorkplaceLocation) => void;
  updateLocation: (id: string, updates: Partial<WorkplaceLocation>) => void;
  deleteLocation: (id: string) => void;
  getLocationById: (id: string) => WorkplaceLocation | undefined;
}

const WorkplaceLocationContext = createContext<WorkplaceLocationContextType | undefined>(undefined);

// Transform API response to match our interface
const transformApiLocation = (apiLocation: any): WorkplaceLocation => {
  return {
    id: apiLocation.id.toString(),
    name: apiLocation.name,
    description: apiLocation.description,
    latitude: parseFloat(apiLocation.latitude),
    longitude: parseFloat(apiLocation.longitude),
    radius: parseInt(apiLocation.radius),
    is_active: apiLocation.is_active,
    created_at: apiLocation.created_at,
    updated_at: apiLocation.updated_at,
    active_assignments: apiLocation.active_assignments,
  };
};

export function WorkplaceLocationProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<WorkplaceLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getWorkplaceLocations({ per_page: 100 });
      const transformedLocations = response.data.map(transformApiLocation);
      setLocations(transformedLocations);
    } catch (err) {
      console.error('Error fetching workplace locations:', err);
      setError('Failed to fetch workplace locations');
    } finally {
      setLoading(false);
    }
  };

  const addLocation = (location: WorkplaceLocation) => {
    setLocations(prev => [location, ...prev]);
  };

  const updateLocation = (id: string, updates: Partial<WorkplaceLocation>) => {
    setLocations(prev => 
      prev.map(location => 
        location.id === id ? { ...location, ...updates } : location
      )
    );
  };

  const deleteLocation = (id: string) => {
    setLocations(prev => prev.filter(location => location.id !== id));
  };

  const getLocationById = (id: string): WorkplaceLocation | undefined => {
    return locations.find(location => location.id === id);
  };

  useEffect(() => {
    refreshLocations();
  }, []);

  const value: WorkplaceLocationContextType = {
    locations,
    loading,
    error,
    refreshLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    getLocationById,
  };

  return (
    <WorkplaceLocationContext.Provider value={value}>
      {children}
    </WorkplaceLocationContext.Provider>
  );
}

export function useWorkplaceLocation() {
  const context = useContext(WorkplaceLocationContext);
  if (context === undefined) {
    throw new Error('useWorkplaceLocation must be used within a WorkplaceLocationProvider');
  }
  return context;
}
