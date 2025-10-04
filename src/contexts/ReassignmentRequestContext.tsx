"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { reassignmentApiService, ReassignmentRequest as ApiReassignmentRequest } from '@/services/reassignmentApi';
import { useAdmin } from './AdminContext';

export interface ReassignmentRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  currentLocation: string;
  requestedLocation: string;
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface ReassignmentRequestContextType {
  requests: ReassignmentRequest[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  approveRequest: (id: string, adminNotes?: string) => Promise<void>;
  rejectRequest: (id: string, adminNotes: string) => Promise<void>;
  getPendingCount: () => number;
}

const ReassignmentRequestContext = createContext<ReassignmentRequestContextType | undefined>(undefined);

// Helper function to convert API data to UI format
const convertApiRequestToUI = (apiRequest: ApiReassignmentRequest): ReassignmentRequest => {
  console.log('Converting API request:', apiRequest); // Debug log
  
  return {
    id: apiRequest.id,
    employeeId: apiRequest.user_id,
    employeeName: apiRequest.user ? `${apiRequest.user.first_name} ${apiRequest.user.last_name}` : 'Unknown User',
    employeePosition: 'EPOL', // Default position, could be enhanced with user role
    currentLocation: apiRequest.current_location?.name || 'Unknown Location',
    requestedLocation: apiRequest.requested_location?.name || 'Unknown Location',
    reason: apiRequest.reason,
    requestDate: new Date(apiRequest.created_at).toISOString().split('T')[0],
    status: apiRequest.status,
    reviewNotes: apiRequest.admin_notes,
    reviewedBy: apiRequest.processed_by ? `${apiRequest.processed_by.first_name} ${apiRequest.processed_by.last_name}` : undefined,
    reviewedAt: apiRequest.processed_at ? new Date(apiRequest.processed_at).toLocaleString() : undefined,
  };
};

export function ReassignmentRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ReassignmentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAdmin();

  const fetchRequests = async () => {
    if (!isAuthenticated) {
      return; // Don't make API calls if not authenticated
    }
    
    try {
      setLoading(true);
      setError(null);
      const apiRequests = await reassignmentApiService.getReassignmentRequests();
      console.log('Raw API requests:', apiRequests); // Debug log
      const uiRequests = apiRequests.map(convertApiRequestToUI);
      console.log('Converted UI requests:', uiRequests); // Debug log
      setRequests(uiRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      console.error('Error fetching reassignment requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: string, adminNotes?: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRequest = await reassignmentApiService.approveReassignmentRequest(id, adminNotes);
      const uiRequest = convertApiRequestToUI(updatedRequest);
      
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? uiRequest : request
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
      console.error('Error approving request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (id: string, adminNotes: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRequest = await reassignmentApiService.rejectReassignmentRequest(id, adminNotes);
      const uiRequest = convertApiRequestToUI(updatedRequest);
      
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? uiRequest : request
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
      console.error('Error rejecting request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPendingCount = () => {
    return requests.filter(request => request.status === 'pending').length;
  };

  // Fetch requests on component mount only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated]);

  const value: ReassignmentRequestContextType = {
    requests,
    loading,
    error,
    fetchRequests,
    approveRequest,
    rejectRequest,
    getPendingCount
  };

  return (
    <ReassignmentRequestContext.Provider value={value}>
      {children}
    </ReassignmentRequestContext.Provider>
  );
}

export function useReassignmentRequest() {
  const context = useContext(ReassignmentRequestContext);
  if (context === undefined) {
    throw new Error('useReassignmentRequest must be used within a ReassignmentRequestProvider');
  }
  return context;
}
