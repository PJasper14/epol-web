"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiService } from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";

export type Incident = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  reportedBy: string;
  status: string;
  priority?: string;
  description: string;
  lastUpdated?: string;
  actions?: { date: string; action: string; by: string }[];
  // Mobile-specific fields
  images?: string[];
  videos?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: string;
  watermarkText?: string;
};

// Removed mock data - now using real API data

// Function to process mobile incident data and extract location/time from watermark
const processMobileIncidentData = (mobileIncident: any): Incident => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].substring(0, 5);
  
  // Extract location and coordinates from watermark text if available
  let location = 'Location embedded in media watermarks';
  let coordinates: { latitude: number; longitude: number } | undefined;
  
  if (mobileIncident.watermarkText) {
    const watermarkLines = mobileIncident.watermarkText.split('\n');
    const locationLine = watermarkLines.find((line: string) => line.startsWith('Location:'));
    const coordinatesLine = watermarkLines.find((line: string) => line.startsWith('Coordinates:'));
    
    if (locationLine) {
      location = locationLine.replace('Location: ', '');
    }
    
    if (coordinatesLine) {
      const coordsText = coordinatesLine.replace('Coordinates: ', '');
      const [lat, lng] = coordsText.split(', ').map((coord: string) => parseFloat(coord));
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = { latitude: lat, longitude: lng };
      }
    }
  }
  
  return {
    id: mobileIncident.id.toString(),
    title: mobileIncident.title,
    location,
    date,
    time,
    reportedBy: mobileIncident.reporter || 'Mobile User',
    status: 'Pending', // Always pending for new mobile reports
    priority: mobileIncident.priority || 'Medium',
    description: mobileIncident.description || '',
    lastUpdated: now.toISOString(),
    images: mobileIncident.images || [],
    videos: mobileIncident.videos || [],
    coordinates,
    createdAt: mobileIncident.createdAt || now.toISOString(),
    watermarkText: mobileIncident.watermarkText,
    actions: [
      { 
        date: now.toISOString(), 
        action: 'Report received from mobile app', 
        by: 'System' 
      }
    ]
  };
};

export type IncidentContextType = {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  addMobileIncident: (mobileIncident: any) => void;
  refreshIncidents: () => Promise<void>;
};

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export function useIncidentContext() {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error("useIncidentContext must be used within IncidentProvider");
  return ctx;
}

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAdmin();

  // Load incidents from API
  const loadIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getIncidentReports();
      // Convert API response to Incident format
      const apiIncidents = response.data || response;
      const formattedIncidents = apiIncidents.map((incident: any) => ({
        id: incident.id.toString(),
        title: incident.title || incident.incident_type || 'Incident Report',
        location: incident.location_description || incident.location || 'Location embedded in media watermarks',
        date: incident.incident_date ? incident.incident_date.split('T')[0] : new Date().toISOString().split('T')[0],
        time: incident.incident_time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        reportedBy: incident.reported_by ? `${incident.reported_by.first_name} ${incident.reported_by.last_name}` : 'Unknown Reporter',
        status: incident.status === 'reported' ? 'Pending' : incident.status === 'ongoing' ? 'Ongoing' : incident.status === 'resolved' ? 'Resolved' : 'Pending',
        priority: incident.priority === 'low' ? 'Low' : incident.priority === 'medium' ? 'Medium' : incident.priority === 'high' ? 'High' : 'Medium',
        description: incident.description || '',
        lastUpdated: incident.updated_at || incident.created_at,
        coordinates: incident.latitude && incident.longitude ? {
          latitude: parseFloat(incident.latitude),
          longitude: parseFloat(incident.longitude)
        } : undefined,
        images: incident.media?.filter((m: any) => m.type === 'photo')?.map((m: any) => m.url || `/storage/${m.file_path}`) || [],
        videos: incident.media?.filter((m: any) => m.type === 'video')?.map((m: any) => m.url || `/storage/${m.file_path}`) || [],
        createdAt: incident.created_at,
        actions: [
          {
            date: incident.created_at,
            action: 'Report received from mobile app',
            by: incident.reported_by ? `${incident.reported_by.first_name} ${incident.reported_by.last_name}` : 'System'
          }
        ]
      }));
      setIncidents(formattedIncidents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load incident reports';
      setError(errorMessage);
      console.error('Error loading incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load incidents when authenticated (same pattern as InventoryContext)
  useEffect(() => {
    console.log('[IncidentContext] isAuthenticated changed:', isAuthenticated);
    if (isAuthenticated) {
      console.log('[IncidentContext] Loading incidents');
      loadIncidents();
    }
  }, [isAuthenticated]);

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === id ? { ...incident, ...updates } : incident
      )
    );
  };

  const deleteIncident = async (id: string) => {
    try {
      await apiService.deleteIncidentReport(id);
      setIncidents((prev) => prev.filter((incident) => incident.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete incident report');
    }
  };

  const addMobileIncident = (mobileIncident: any) => {
    const processedIncident = processMobileIncidentData(mobileIncident);
    setIncidents((prev) => [processedIncident, ...prev]);
  };

  const refreshIncidents = async () => {
    await loadIncidents();
  };

  return (
    <IncidentContext.Provider value={{ 
      incidents, 
      loading, 
      error, 
      setIncidents, 
      updateIncident, 
      deleteIncident, 
      addMobileIncident, 
      refreshIncidents 
    }}>
      {children}
    </IncidentContext.Provider>
  );
} 