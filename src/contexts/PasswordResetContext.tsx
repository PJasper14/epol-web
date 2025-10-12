"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { useAdmin } from './AdminContext';

export interface PasswordResetRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    role?: string;
  };
}

interface PasswordResetContextType {
  requests: PasswordResetRequest[];
  loading: boolean;
  error: string | null;
  setRequests: (requests: PasswordResetRequest[]) => void;
  addRequest: (request: PasswordResetRequest) => void;
  updateRequest: (id: string, updates: Partial<PasswordResetRequest>) => void;
  deleteRequest: (id: string) => void;
  approveRequest: (id: string, adminNotes?: string) => Promise<void>;
  rejectRequest: (id: string, adminNotes: string) => Promise<void>;
  refreshRequests: () => Promise<void>;
  getPendingCount: () => number;
}

const PasswordResetContext = createContext<PasswordResetContextType | undefined>(undefined);

// Transform API response to match our interface
const transformApiRequest = (apiRequest: any): PasswordResetRequest => {
  return {
    id: apiRequest.id.toString(),
    user_id: apiRequest.user_id.toString(),
    user_name: apiRequest.user ? `${apiRequest.user.first_name} ${apiRequest.user.last_name}` : 'Unknown User',
    user_phone: apiRequest.user?.phone || 'N/A',
    requested_at: apiRequest.created_at,
    status: apiRequest.status,
    reason: apiRequest.reason || '',
    admin_notes: apiRequest.admin_notes,
    processed_by: apiRequest.processed_by?.toString(),
    processed_at: apiRequest.processed_at,
    created_at: apiRequest.created_at,
    updated_at: apiRequest.updated_at,
    user: apiRequest.user
  };
};

export function PasswordResetProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: adminLoading } = useAdmin();
  const hasLoadedRef = useRef(false);

  // Load requests on mount only if authenticated (load once)
  useEffect(() => {
    if (isAuthenticated && !adminLoading && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refreshRequests();
    }
  }, [isAuthenticated, adminLoading]);

  const refreshRequests = async () => {
    if (!isAuthenticated) {
      return; // Don't make API calls if not authenticated
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getPasswordResets();
      const transformedRequests = response.data?.map(transformApiRequest) || [];
      setRequests(transformedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load password reset requests');
      console.error('Failed to load password reset requests:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const deleteRequest = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deletePasswordReset(id);
      await refreshRequests(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id: string, adminNotes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.approvePasswordReset(id, adminNotes);
      await refreshRequests(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (id: string, adminNotes: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.rejectPasswordReset(id, adminNotes);
      await refreshRequests(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPendingCount = () => {
    return requests.filter(request => request.status === 'pending').length;
  };

  const value: PasswordResetContextType = {
    requests,
    loading,
    error,
    setRequests,
    addRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
    refreshRequests,
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
