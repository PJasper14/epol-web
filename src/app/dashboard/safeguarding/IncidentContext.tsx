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
};

const initialIncidents: Incident[] = [
  {
    id: "INC-2023-001",
    title: "Illegal Waste Dumping",
    location: "Riverside Park",
    date: "2023-04-19",
    time: "14:30",
    reportedBy: "John Doe",
    status: "Pending",
    priority: "High",
    description: "Large quantities of construction waste dumped near the river bank. Potential contamination risk.",
    lastUpdated: "2023-04-19T15:30:00",
    actions: [
      { date: "2023-04-19T14:45:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-19T15:00:00", action: "Initial assessment completed", by: "System" }
    ]
  },
  {
    id: "INC-2023-002",
    title: "Air Pollution from Factory",
    location: "Industrial Zone B",
    date: "2023-04-18",
    time: "10:15",
    reportedBy: "Jane Smith",
    status: "Ongoing",
    priority: "Medium",
    description: "Excessive smoke emissions observed from factory chimney. Residents complained about strong odor.",
    lastUpdated: "2023-04-18T16:45:00",
    actions: [
      { date: "2023-04-18T10:30:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-18T11:00:00", action: "Air quality test conducted", by: "System" }
    ]
  },
  {
    id: "INC-2023-003",
    title: "Wildlife Poaching",
    location: "Northern Forest Reserve",
    date: "2023-04-17",
    time: "07:45",
    reportedBy: "Alex Johnson",
    status: "Resolved",
    priority: "High",
    description: "Evidence of illegal hunting and trapping of protected species found during routine patrol.",
    lastUpdated: "2023-04-17T18:30:00",
    actions: [
      { date: "2023-04-17T08:00:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-17T09:15:00", action: "Investigation completed", by: "System" },
      { date: "2023-04-17T18:30:00", action: "Case resolved", by: "System" }
    ]
  },
  {
    id: "INC-2023-004",
    title: "Chemical Spill",
    location: "Highway Junction 45",
    date: "2023-04-15",
    time: "16:20",
    reportedBy: "Sam Williams",
    status: "Pending",
    priority: "High",
    description: "Tanker truck accident resulting in chemical spill. Emergency response team dispatched."
  },
  {
    id: "INC-2023-005",
    title: "Illegal Fishing",
    location: "East Bay Conservation Area",
    date: "2023-04-14",
    time: "09:30",
    reportedBy: "Taylor Brown",
    status: "Ongoing",
    priority: "Medium",
    description: "Multiple individuals observed using prohibited fishing methods in protected waters."
  },
  {
    id: "INC-2023-006",
    title: "Deforestation Activity",
    location: "Mountain Ridge Forest",
    date: "2023-04-13",
    time: "11:45",
    reportedBy: "Maria Garcia",
    status: "Pending",
    priority: "High",
    description: "Unauthorized tree cutting detected in protected forest area. Heavy machinery tracks found.",
    lastUpdated: "2023-04-13T12:15:00",
    actions: [
      { date: "2023-04-13T12:00:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-13T12:15:00", action: "Field investigation initiated", by: "System" }
    ]
  },
  {
    id: "INC-2023-007",
    title: "Water Contamination",
    location: "Village Water Source",
    date: "2023-04-12",
    time: "08:20",
    reportedBy: "David Chen",
    status: "Ongoing",
    priority: "High",
    description: "Residents reporting unusual taste and color in drinking water. Health concerns raised.",
    lastUpdated: "2023-04-12T14:30:00",
    actions: [
      { date: "2023-04-12T08:35:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-12T09:00:00", action: "Water samples collected for testing", by: "System" },
      { date: "2023-04-12T14:30:00", action: "Preliminary test results show contamination", by: "System" }
    ]
  },
  {
    id: "INC-2023-008",
    title: "Noise Pollution",
    location: "Residential District A",
    date: "2023-04-11",
    time: "22:15",
    reportedBy: "Lisa Anderson",
    status: "Resolved",
    priority: "Low",
    description: "Excessive noise from construction work during prohibited hours. Multiple complaints received.",
    lastUpdated: "2023-04-11T23:45:00",
    actions: [
      { date: "2023-04-11T22:30:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-11T22:45:00", action: "Site inspection conducted", by: "System" },
      { date: "2023-04-11T23:45:00", action: "Construction work stopped, case resolved", by: "System" }
    ]
  },
  {
    id: "INC-2023-009",
    title: "Soil Erosion",
    location: "Hillside Development Site",
    date: "2023-04-10",
    time: "13:10",
    reportedBy: "Robert Kim",
    status: "Ongoing",
    priority: "Medium",
    description: "Significant soil erosion observed due to improper land development practices. Risk of landslide.",
    lastUpdated: "2023-04-10T16:20:00",
    actions: [
      { date: "2023-04-10T13:25:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-10T14:00:00", action: "Geological assessment initiated", by: "System" },
      { date: "2023-04-10T16:20:00", action: "Emergency stabilization measures recommended", by: "System" }
    ]
  },
  {
    id: "INC-2023-010",
    title: "Wildlife Habitat Destruction",
    location: "Wetland Conservation Area",
    date: "2023-04-09",
    time: "15:30",
    reportedBy: "Sarah Wilson",
    status: "Pending",
    priority: "High",
    description: "Construction activities encroaching on protected wetland area. Endangered species habitat at risk.",
    lastUpdated: "2023-04-09T16:00:00",
    actions: [
      { date: "2023-04-09T15:45:00", action: "Report received and logged", by: "System" },
      { date: "2023-04-09T16:00:00", action: "Environmental impact assessment ordered", by: "System" }
    ]
  }
];

export type IncidentContextType = {
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
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

  return (
    <IncidentContext.Provider value={{ incidents, setIncidents, updateIncident, deleteIncident }}>
      {children}
    </IncidentContext.Provider>
  );
} 