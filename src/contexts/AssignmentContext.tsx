"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/api';

export interface EmployeeAssignment {
  id: string;
  user_id: string | number;
  workplace_location_id: string | number;
  assigned_by: string | number;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  workplaceLocation?: {
    id: string;
    name: string;
    address: string;
  };
  assignedBy?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface AssignmentContextType {
  assignments: EmployeeAssignment[];
  loading: boolean;
  error: string | null;
  fetchAssignments: () => Promise<void>;
  createAssignment: (assignmentData: { user_id: string; workplace_location_id: string }) => Promise<any>;
  updateAssignment: (id: string, assignmentData: { workplace_location_id: string }) => Promise<any>;
  deleteAssignment: (id: string) => Promise<any>;
  getAssignmentByUserId: (userId: string) => EmployeeAssignment | null;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getEmployeeAssignments();
      console.log('Fetched assignments:', response);
      setAssignments(response.data || []);
    } catch (err) {
      setError('Failed to fetch assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (assignmentData: { user_id: string; workplace_location_id: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createEmployeeAssignment(assignmentData);
      await fetchAssignments(); // Refresh the list
      return response;
    } catch (err) {
      setError('Failed to create assignment');
      console.error('Error creating assignment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async (id: string, assignmentData: { workplace_location_id: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateEmployeeAssignment(id, assignmentData);
      await fetchAssignments(); // Refresh the list
      return response;
    } catch (err) {
      setError('Failed to update assignment');
      console.error('Error updating assignment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.deleteEmployeeAssignment(id);
      await fetchAssignments(); // Refresh the list
      return response;
    } catch (err) {
      setError('Failed to delete assignment');
      console.error('Error deleting assignment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentByUserId = (userId: string): EmployeeAssignment | null => {
    const assignment = assignments.find(assignment => assignment.user_id.toString() === userId) || null;
    console.log('Looking for assignment for user:', userId, 'Found:', assignment);
    return assignment;
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <AssignmentContext.Provider value={{
      assignments,
      loading,
      error,
      fetchAssignments,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      getAssignmentByUserId
    }}>
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignment() {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
}
