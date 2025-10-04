"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useAdmin } from './AdminContext';

export interface Activity {
  id: string;
  user_id?: string;
  module: string;
  action: string;
  description: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  formatted_time?: string;
  module_display_name?: string;
}

interface ActivityContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
  getActivitiesByModule: (module: string) => Activity[];
  getRecentActivities: (limit?: number) => Activity[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Transform API response to match our interface
const transformApiActivity = (apiActivity: any): Activity => {
  return {
    id: apiActivity.id.toString(),
    user_id: apiActivity.user_id?.toString(),
    module: apiActivity.module,
    action: apiActivity.action,
    description: apiActivity.description,
    metadata: apiActivity.metadata,
    ip_address: apiActivity.ip_address,
    user_agent: apiActivity.user_agent,
    created_at: apiActivity.created_at,
    updated_at: apiActivity.updated_at,
    user: apiActivity.user,
    formatted_time: apiActivity.formatted_time,
    module_display_name: apiActivity.module_display_name,
  };
};

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAdmin();

  const refreshActivities = async () => {
    if (!isAuthenticated) {
      return; // Don't make API calls if not authenticated
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getActivities({ limit: 50 });
      const transformedActivities = response.data.map(transformApiActivity);
      setActivities(transformedActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivitiesByModule = (module: string): Activity[] => {
    return activities.filter(activity => activity.module === module);
  };

  const getRecentActivities = (limit: number = 20): Activity[] => {
    return activities.slice(0, limit);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshActivities();
    }
  }, [isAuthenticated]);

  const value: ActivityContextType = {
    activities,
    loading,
    error,
    refreshActivities,
    getActivitiesByModule,
    getRecentActivities,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
