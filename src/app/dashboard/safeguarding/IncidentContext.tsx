"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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

const initialIncidents: Incident[] = [
  {
    id: "1",
    title: "Illegal Waste Dumping",
    location: "Riverside Park",
    date: "2023-04-19",
    time: "14:30",
    reportedBy: "John Doe",
    status: "Pending",
    priority: "High",
    description: "Large quantities of construction waste dumped near the river bank. Potential contamination risk.",
    lastUpdated: "2023-04-19T15:30:00",
    coordinates: {
      latitude: 14.2723,
      longitude: 121.1234
    },
    actions: [
      { date: "2023-04-19T14:45:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-19T15:00:00", action: "Initial assessment completed", by: "System" }
    ]
  },
  {
    id: "2",
    title: "Air Pollution from Factory",
    location: "Industrial Zone B",
    date: "2023-04-18",
    time: "10:15",
    reportedBy: "Jane Smith",
    status: "Ongoing",
    priority: "Medium",
    description: "Excessive smoke emissions observed from factory chimney. Residents complained about strong odor.",
    lastUpdated: "2023-04-18T16:45:00",
    coordinates: {
      latitude: 14.2856,
      longitude: 121.1456
    },
    actions: [
      { date: "2023-04-18T10:30:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-18T11:00:00", action: "Air quality test conducted", by: "System" }
    ]
  },
  {
    id: "3",
    title: "Wildlife Poaching",
    location: "Northern Forest Reserve",
    date: "2023-04-17",
    time: "07:45",
    reportedBy: "Alex Johnson",
    status: "Resolved",
    priority: "High",
    description: "Evidence of illegal hunting and trapping of protected species found during routine patrol.",
    lastUpdated: "2023-04-17T18:30:00",
    coordinates: {
      latitude: 14.2989,
      longitude: 121.1678
    },
    actions: [
      { date: "2023-04-17T08:00:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-17T09:15:00", action: "Investigation completed", by: "System" },
      { date: "2023-04-17T18:30:00", action: "Case resolved", by: "System" }
    ]
  },
  {
    id: "4",
    title: "Chemical Spill",
    location: "Highway Junction 45",
    date: "2023-04-15",
    time: "16:20",
    reportedBy: "Sam Williams",
    status: "Pending",
    priority: "High",
    description: "Tanker truck accident resulting in chemical spill. Emergency response team dispatched.",
    coordinates: {
      latitude: 14.3122,
      longitude: 121.1899
    }
  },
  {
    id: "5",
    title: "Illegal Fishing",
    location: "East Bay Conservation Area",
    date: "2023-04-14",
    time: "09:30",
    reportedBy: "Taylor Brown",
    status: "Ongoing",
    priority: "Medium",
    description: "Multiple individuals observed using prohibited fishing methods in protected waters.",
    coordinates: {
      latitude: 14.3255,
      longitude: 121.2122
    }
  },
  {
    id: "6",
    title: "Deforestation Activity",
    location: "Mountain Ridge Forest",
    date: "2023-04-13",
    time: "11:45",
    reportedBy: "Maria Garcia",
    status: "Pending",
    priority: "High",
    description: "Unauthorized tree cutting detected in protected forest area. Heavy machinery tracks found.",
    lastUpdated: "2023-04-13T12:15:00",
    coordinates: {
      latitude: 14.3388,
      longitude: 121.2345
    },
    actions: [
      { date: "2023-04-13T12:00:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-13T12:15:00", action: "Field investigation initiated", by: "System" }
    ]
  },
  {
    id: "7",
    title: "Water Contamination",
    location: "Village Water Source",
    date: "2023-04-12",
    time: "08:20",
    reportedBy: "David Chen",
    status: "Ongoing",
    priority: "High",
    description: "Residents reporting unusual taste and color in drinking water. Health concerns raised.",
    lastUpdated: "2023-04-12T14:30:00",
    coordinates: {
      latitude: 14.3521,
      longitude: 121.2568
    },
    actions: [
      { date: "2023-04-12T08:35:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-12T09:00:00", action: "Water samples collected for testing", by: "System" },
      { date: "2023-04-12T14:30:00", action: "Preliminary test results show contamination", by: "System" }
    ]
  },
  {
    id: "8",
    title: "Noise Pollution",
    location: "Residential District A",
    date: "2023-04-11",
    time: "22:15",
    reportedBy: "Lisa Anderson",
    status: "Resolved",
    priority: "Low",
    description: "Excessive noise from construction work during prohibited hours. Multiple complaints received.",
    lastUpdated: "2023-04-11T23:45:00",
    coordinates: {
      latitude: 14.3654,
      longitude: 121.2791
    },
    actions: [
      { date: "2023-04-11T22:30:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-11T22:45:00", action: "Site inspection conducted", by: "System" },
      { date: "2023-04-11T23:45:00", action: "Construction work stopped, case resolved", by: "System" }
    ]
  },
  {
    id: "9",
    title: "Soil Erosion",
    location: "Hillside Development Site",
    date: "2023-04-10",
    time: "13:10",
    reportedBy: "Robert Kim",
    status: "Ongoing",
    priority: "Medium",
    description: "Significant soil erosion observed due to improper land development practices. Risk of landslide.",
    lastUpdated: "2023-04-10T16:20:00",
    coordinates: {
      latitude: 14.3787,
      longitude: 121.3014
    },
    actions: [
      { date: "2023-04-10T13:25:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-10T14:00:00", action: "Geological assessment initiated", by: "System" },
      { date: "2023-04-10T16:20:00", action: "Emergency stabilization measures recommended", by: "System" }
    ]
  },
  {
    id: "10",
    title: "Wildlife Habitat Destruction",
    location: "Wetland Conservation Area",
    date: "2023-04-09",
    time: "15:30",
    reportedBy: "Sarah Wilson",
    status: "Pending",
    priority: "High",
    description: "Construction activities encroaching on protected wetland area. Endangered species habitat at risk.",
    lastUpdated: "2023-04-09T16:00:00",
    coordinates: {
      latitude: 14.3920,
      longitude: 121.3237
    },
    actions: [
      { date: "2023-04-09T15:45:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-09T16:00:00", action: "Environmental impact assessment ordered", by: "System" }
    ]
  }
];

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
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  addMobileIncident: (mobileIncident: any) => void;
};

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export function useIncidentContext() {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error("useIncidentContext must be used within IncidentProvider");
  return ctx;
}

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === id ? { ...incident, ...updates } : incident
      )
    );
  };

  const deleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((incident) => incident.id !== id));
  };

  const addMobileIncident = (mobileIncident: any) => {
    const processedIncident = processMobileIncidentData(mobileIncident);
    setIncidents((prev) => [processedIncident, ...prev]);
  };

  return (
    <IncidentContext.Provider value={{ incidents, setIncidents, updateIncident, deleteIncident, addMobileIncident }}>
      {children}
    </IncidentContext.Provider>
  );
} 