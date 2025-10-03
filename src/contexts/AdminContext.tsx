"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
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

  // Check for existing session on app load
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

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Use API service for authentication
      const response = await apiService.login(username, password);
      
      if (response.data?.user && response.data?.token) {
        const user = response.data.user;
        
        // Check if user is admin
        if (user.role !== 'admin') {
          setLoading(false);
          return false;
        }
        
        const adminUser: AdminUser = {
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: 'Admin',
          department: 'Office'
        };
        
        localStorage.setItem('epol_admin', JSON.stringify(adminUser));
        setAdmin(adminUser);
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call API logout
      await apiService.logout();
      localStorage.removeItem('epol_admin');
      setAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('epol_admin');
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
