"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { apiService } from '@/lib/api';
import { useAdmin } from './AdminContext';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female';
  birthday: string;
  homeAddress: string;
  role: 'Admin' | 'Team Leader' | 'EPOL';
  username: string;
  lastUpdated: string;
  createdAt: string;
}

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  addUser: (user: Omit<User, 'id' | 'lastUpdated' | 'createdAt'> & { password: string }) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper function to transform API user data to our User interface
const transformApiUser = (apiUser: any): User => {
  if (!apiUser) {
    throw new Error('Invalid user data received from API');
  }
  
  return {
    id: apiUser.id.toString(),
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    phone: apiUser.phone,
    age: apiUser.age,
    gender: apiUser.gender,
    birthday: apiUser.birthday,
    homeAddress: apiUser.home_address,
    role: apiUser.role === 'admin' ? 'Admin' : apiUser.role === 'team_leader' ? 'Team Leader' : 'EPOL',
    username: apiUser.username || '',
    lastUpdated: new Date(apiUser.updated_at).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    createdAt: new Date(apiUser.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
  };
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: adminLoading } = useAdmin();
  const hasLoadedRef = useRef(false);

  // Load users on component mount or when authenticated (load once)
  useEffect(() => {
    console.log('[UserContext] useEffect - isAuthenticated:', isAuthenticated, 'adminLoading:', adminLoading, 'hasLoaded:', hasLoadedRef.current, 'users.length:', users.length);
    if (isAuthenticated && !adminLoading && !hasLoadedRef.current) {
      console.log('[UserContext] ✅ Loading users for first time');
      hasLoadedRef.current = true;
      refreshUsers();
    }
  }, [isAuthenticated, adminLoading]);

  const refreshUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if admin is authenticated first
      const admin = localStorage.getItem('epol_admin');
      if (!admin) {
        setError('Please log in to view users');
        setLoading(false);
        return;
      }

      // Call the API to get users
      console.log('[UserContext] Fetching users from API...');
      const response = await apiService.getUsers();
      const transformedUsers = response.data?.map(transformApiUser) || [];
      console.log('[UserContext] ✅ Loaded users:', transformedUsers.length, 'users');
      setUsers(transformedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('[UserContext] ❌ Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'lastUpdated' | 'createdAt'> & { password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const apiUserData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username,
        password: userData.password || 'defaultPassword123',
        role: userData.role.toLowerCase().replace(' ', '_'),
        phone: userData.phone,
        age: userData.age,
        gender: userData.gender,
        birthday: userData.birthday,
        home_address: userData.homeAddress,
      };

      const response = await apiService.createUser(apiUserData);
      console.log('Create user response:', response);
      const responseData = response as any;
      const newUser = transformApiUser(responseData.user);
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const apiUserData: any = {};
      if (updates.firstName) apiUserData.first_name = updates.firstName;
      if (updates.lastName) apiUserData.last_name = updates.lastName;
      if (updates.phone) apiUserData.phone = updates.phone;
      if (updates.age) apiUserData.age = updates.age;
      if (updates.gender) apiUserData.gender = updates.gender;
      if (updates.birthday) apiUserData.birthday = updates.birthday;
      if (updates.homeAddress) apiUserData.home_address = updates.homeAddress;
      if (updates.role) apiUserData.role = updates.role.toLowerCase().replace(' ', '_');

      await apiService.updateUser(id, apiUserData);
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, ...updates, lastUpdated: new Date().toLocaleString() }
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      
      // Don't throw the error for "last admin" - just show the message
      if (errorMessage.includes('Cannot delete the last admin user')) {
        console.warn('Last admin user deletion prevented:', errorMessage);
        return; // Don't throw, just show the error message
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  return (
    <UserContext.Provider value={{ 
      users, 
      loading, 
      error, 
      addUser, 
      updateUser, 
      deleteUser, 
      getUserById, 
      refreshUsers 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
