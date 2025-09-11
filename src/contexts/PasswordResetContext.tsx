"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PasswordResetRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  adminNotes?: string;
}

interface PasswordResetContextType {
  requests: PasswordResetRequest[];
  setRequests: (requests: PasswordResetRequest[]) => void;
  addRequest: (request: PasswordResetRequest) => void;
  updateRequest: (id: string, updates: Partial<PasswordResetRequest>) => void;
  deleteRequest: (id: string) => void;
  getPendingCount: () => number;
}

const PasswordResetContext = createContext<PasswordResetContextType | undefined>(undefined);

// Mock data - in a real app, this would come from an API
const initialRequests: PasswordResetRequest[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@epol.com',
    userPhone: '+63 912 345 6789',
    requestedAt: '2024-01-15 14:30:00',
    status: 'Pending',
    reason: 'Forgot password, unable to access account'
  },
  {
    id: '2',
    userId: '3',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@epol.com',
    userPhone: '+63 923 456 7890',
    requestedAt: '2024-01-15 10:15:00',
    status: 'Approved',
    reason: 'Account locked due to multiple failed login attempts',
    adminNotes: 'Approved after verifying user identity via phone call'
  },
  {
    id: '3',
    userId: '4',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@epol.com',
    userPhone: '+63 934 567 8901',
    requestedAt: '2024-01-14 16:45:00',
    status: 'Rejected',
    reason: 'Suspicious activity detected',
    adminNotes: 'Request denied due to security concerns. User contacted for verification.'
  },
  {
    id: '4',
    userId: '5',
    userName: 'Alex Rodriguez',
    userEmail: 'alex.rodriguez@epol.com',
    userPhone: '+63 945 678 9012',
    requestedAt: '2024-01-16 09:20:00',
    status: 'Pending',
    reason: 'Password expired, need to reset for security compliance'
  },
  {
    id: '5',
    userId: '6',
    userName: 'Maria Garcia',
    userEmail: 'maria.garcia@epol.com',
    userPhone: '+63 956 789 0123',
    requestedAt: '2024-01-16 11:45:00',
    status: 'Approved',
    reason: 'Unable to remember password after vacation',
    adminNotes: 'Identity verified through company directory'
  }
];

export function PasswordResetProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<PasswordResetRequest[]>(initialRequests);

  const addRequest = (request: PasswordResetRequest) => {
    setRequests(prev => [...prev, request]);
  };

  const updateRequest = (id: string, updates: Partial<PasswordResetRequest>) => {
    setRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, ...updates } : request
      )
    );
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(request => request.id !== id));
  };

  const getPendingCount = () => {
    return requests.filter(request => request.status === 'Pending').length;
  };

  const value: PasswordResetContextType = {
    requests,
    setRequests,
    addRequest,
    updateRequest,
    deleteRequest,
    getPendingCount
  };

  return (
    <PasswordResetContext.Provider value={value}>
      {children}
    </PasswordResetContext.Provider>
  );
}

export function usePasswordReset() {
  const context = useContext(PasswordResetContext);
  if (context === undefined) {
    throw new Error('usePasswordReset must be used within a PasswordResetProvider');
  }
  return context;
}
