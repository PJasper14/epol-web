"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/api';

export interface AdminUser {
  id: string;
  name: string;
  role: 'Admin';
  department: 'Office';
}

interface AdminContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Admin authentication now uses API service

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load (only for refresh scenarios)
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedAdmin = localStorage.getItem('epol_admin');
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
        }
      } catch (error) {
        console.error('Failed to load admin from storage', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Listen for admin data updates from other components
  useEffect(() => {
    const handleAdminDataUpdate = (event: CustomEvent) => {
      const updatedAdmin = event.detail;
      setAdmin(updatedAdmin);
    };

    window.addEventListener('adminDataUpdated', handleAdminDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('adminDataUpdated', handleAdminDataUpdate as EventListener);
    };
  }, []);

  // Simplified: Only listen for custom events from dashboard
  useEffect(() => {
    const handleAdminDataUpdate = (event: CustomEvent) => {
      const updatedAdmin = event.detail;
      setAdmin(updatedAdmin);
    };

    window.addEventListener('adminDataUpdated', handleAdminDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('adminDataUpdated', handleAdminDataUpdate as EventListener);
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Use API service for authentication
      const response = await apiService.login(username, password);
      
      if (response.data?.user && response.data?.token) {
        const user = response.data.user;
        
        // Check if user is admin
        if (user.role !== 'admin') {
          return false;
        }
        
        const adminUser: AdminUser = {
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name}`,
          role: 'Admin',
          department: 'Office'
        };
        
        localStorage.setItem('epol_admin', JSON.stringify(adminUser));
        setAdmin(adminUser);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call API logout
      await apiService.logout();
      localStorage.removeItem('epol_admin');
      localStorage.removeItem('auth_token');
      setAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('epol_admin');
      localStorage.removeItem('auth_token');
      setAdmin(null);
    }
  };

  const value: AdminContextType = {
    admin,
    isAuthenticated: !!admin,
    login,
    logout,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
