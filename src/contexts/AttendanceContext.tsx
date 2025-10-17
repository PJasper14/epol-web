"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { useAdmin } from './AdminContext';

export interface AttendanceRecord {
  id: number;
  user_id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
  workplace_location_id: number;
  workplace_location: {
    id: number;
    name: string;
  };
  date: string;
  time_in: string | null;
  time_out: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  total_hours: number | null;
  notes: string | null;
  work_start_time: string | null;
  work_end_time: string | null;
  required_work_hours: number | null;
  work_hours_metadata: any | null;
  created_at: string;
  updated_at: string;
}

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  loadAttendanceRecords: (params?: Record<string, any>) => Promise<void>;
  refreshAttendanceRecords: () => Promise<void>;
  getAttendanceStats: (date?: string) => {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAdmin();

  const loadAttendanceRecords = useCallback(async (params?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[AttendanceContext] Loading attendance records with params:', params);
      
      const response = await apiService.getAttendanceRecords(params);
      console.log('[AttendanceContext] API response:', response);
      console.log('[AttendanceContext] Request URL params:', params);
      
      if (response.data) {
        const records = response.data.data || response.data;
        console.log('[AttendanceContext] ✅ Setting attendance records:', records);
        console.log('[AttendanceContext] Number of records:', records.length);
        console.log('[AttendanceContext] Request params were:', params);
        if (records.length > 0) {
          console.log('[AttendanceContext] First record date:', records[0].date);
          console.log('[AttendanceContext] Last record date:', records[records.length - 1].date);
        }
        setAttendanceRecords(records);
        
        // If no records found and we're searching for a specific date, try searching without date filter
        if (records.length === 0 && (params?.date || params?.date_from)) {
          console.log('[AttendanceContext] No records found for specific date, trying to load all records...');
          try {
            const allRecordsResponse = await apiService.getAttendanceRecords({});
            if (allRecordsResponse.data) {
              const allRecords = allRecordsResponse.data.data || allRecordsResponse.data;
              console.log('[AttendanceContext] All records loaded:', allRecords.length);
              if (allRecords.length > 0) {
                console.log('[AttendanceContext] Available dates in all records:', 
                  [...new Set(allRecords.map((r: AttendanceRecord) => r.date.split('T')[0]))]);
              }
            }
          } catch (fallbackError) {
            console.log('[AttendanceContext] Fallback search failed:', fallbackError);
          }
        }
      } else {
        console.log('[AttendanceContext] No data in response');
        setError('Failed to load attendance records');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load attendance records';
      console.error('[AttendanceContext] Error loading attendance records:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it only uses setState functions

  const refreshAttendanceRecords = useCallback(async () => {
    await loadAttendanceRecords();
  }, [loadAttendanceRecords]);

  const getAttendanceStats = useCallback((date?: string) => {
    // Use provided date or default to today
    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log('[AttendanceContext] Getting attendance stats for date:', targetDate);
    console.log('[AttendanceContext] Total attendance records in context:', attendanceRecords.length);
    
    // Filter records for the specified date
    // Handle both "2025-10-09" and "2025-10-09T00:00:00.000000Z" formats
    const dateRecords = attendanceRecords.filter(record => {
      const recordDate = record.date.split('T')[0]; // Extract date part only
      console.log('[AttendanceContext] Comparing record.date:', record.date, '(extracted:', recordDate, ') with targetDate:', targetDate, 'Match:', recordDate === targetDate);
      return recordDate === targetDate;
    });
    console.log('[AttendanceContext] Records for target date:', dateRecords.length, dateRecords);
    
    const totalRecords = dateRecords.length;
    const presentRecords = dateRecords.filter(record => {
      return record.status === 'present';
    }).length;
    
    console.log('[AttendanceContext] Stats calculation:', {
      totalRecords,
      presentRecords,
      absent: totalRecords - presentRecords
    });
    
    const percentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
    
    return {
      total: totalRecords,
      present: presentRecords,
      absent: totalRecords - presentRecords,
      percentage: percentage
    };
  }, [attendanceRecords]); // Depends on attendanceRecords

  // Note: Removed automatic loading on authentication to prevent conflicts with page-level date filtering
  // Pages using this context should explicitly call loadAttendanceRecords with their desired parameters

  const value: AttendanceContextType = {
    attendanceRecords,
    loading,
    error,
    loadAttendanceRecords,
    refreshAttendanceRecords,
    getAttendanceStats
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};
