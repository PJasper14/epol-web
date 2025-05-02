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
    status: "In Progress",
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
    priority: "Critical",
    description: "Tanker truck accident resulting in chemical spill. Emergency response team dispatched."
  },
  {
    id: "INC-2023-005",
    title: "Illegal Fishing",
    location: "East Bay Conservation Area",
    date: "2023-04-14",
    time: "09:30",
    reportedBy: "Taylor Brown",
    status: "In Progress",
    priority: "Medium",
    description: "Multiple individuals observed using prohibited fishing methods in protected waters."
  }
];

export type IncidentContextType = {
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
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

  return (
    <IncidentContext.Provider value={{ incidents, setIncidents, updateIncident }}>
      {children}
    </IncidentContext.Provider>
  );
} 