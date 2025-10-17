"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import { useAdmin } from "./AdminContext";
import { apiService } from "@/lib/api";

// Define types
export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  threshold: number;
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface Transaction {
  id: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  user_id: number;
  inventory_request_id?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  // Additional fields for display
  date?: string;
  action?: string;
  notes?: string;
  // Enhanced fields for distribution tracking
  distributed_to?: string;
  location?: string;
  request_number?: string;
}

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  loading: boolean;
  error: string | null;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInventoryItem: (id: string, updatedItem: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  getInventoryItem: (id: string) => Promise<InventoryItem | null>;
  getInventoryTransactions: (itemId: string) => Promise<Transaction[]>;
  adjustStock: (itemId: string, type: 'in' | 'out' | 'adjustment', quantity: number, reason: string) => Promise<void>;
  getLowStockItems: () => Promise<InventoryItem[]>;
  getOutOfStockItems: () => Promise<InventoryItem[]>;
  refreshInventory: () => Promise<void>;
}

// Create the context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Initialize with empty data - will be loaded from API

// Create the provider component
export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: adminLoading } = useAdmin();
  const hasLoadedRef = useRef(false);

  // Load inventory items from API
  const loadInventoryItems = async () => {
    if (!isAuthenticated) {
      return; // Don't make API calls if not authenticated
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('[InventoryContext] Fetching inventory items from API...');
      const response = await apiService.getInventoryItems();
      const items = response.data || [];
      console.log('[InventoryContext] ✅ Loaded inventory items:', items.length, 'items');
      setItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory items');
      console.error('[InventoryContext] ❌ Error loading inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load inventory items on component mount only if authenticated (load once)
  useEffect(() => {
    console.log('[InventoryContext] useEffect - isAuthenticated:', isAuthenticated, 'adminLoading:', adminLoading, 'hasLoaded:', hasLoadedRef.current);
    if (isAuthenticated && !adminLoading && !hasLoadedRef.current) {
      console.log('[InventoryContext] ✅ Loading inventory items for first time');
      hasLoadedRef.current = true;
      loadInventoryItems();
    }
  }, [isAuthenticated, adminLoading]);

  // Add a new inventory item
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to add inventory items');
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createInventoryItem({
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        threshold: item.threshold,
      });
      
      // Refresh the inventory list
      await loadInventoryItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add inventory item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an inventory item
  const updateInventoryItem = async (id: string, updatedItem: Partial<InventoryItem>) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to update inventory items');
    }
    
    try {
      setLoading(true);
      setError(null);
      await apiService.updateInventoryItem(id, {
        name: updatedItem.name!,
        unit: updatedItem.unit!,
        threshold: updatedItem.threshold!,
      });
      
      // Refresh the inventory list
      await loadInventoryItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an inventory item
  const deleteInventoryItem = async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to delete inventory items');
    }
    
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteInventoryItem(id);
      
      // Refresh the inventory list
      await loadInventoryItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inventory item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a specific inventory item by ID
  const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
    if (!isAuthenticated) {
      return null;
    }
    
    try {
      const response = await apiService.getInventoryItem(id);
      // Backend returns the item directly, not wrapped in data
      return response as InventoryItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get inventory item');
      return null;
    }
  };

  // Get transactions for a specific item
  const getInventoryTransactions = async (itemId: string): Promise<Transaction[]> => {
    if (!isAuthenticated) {
      return [];
    }
    
    try {
      const response = await apiService.getInventoryTransactions(itemId);
      // Backend returns { item, transactions } structure
      return (response as any).transactions?.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get inventory transactions');
      return [];
    }
  };

  // Adjust stock for an item
  const adjustStock = async (itemId: string, type: 'in' | 'out' | 'adjustment', quantity: number, reason: string) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to adjust stock');
    }
    
    try {
      setLoading(true);
      setError(null);
      await apiService.adjustStock(itemId, {
        type,
        quantity,
        reason,
      });
      
      // Refresh the inventory list
      await loadInventoryItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust stock');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get low stock items
  const getLowStockItems = async (): Promise<InventoryItem[]> => {
    if (!isAuthenticated) {
      return [];
    }
    
    try {
      const response = await apiService.getLowStockItems();
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get low stock items');
      return [];
    }
  };

  // Get out of stock items
  const getOutOfStockItems = async (): Promise<InventoryItem[]> => {
    if (!isAuthenticated) {
      return [];
    }
    
    try {
      const response = await apiService.getInventoryItems({ stock_status: 'out_of_stock' });
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get out of stock items');
      return [];
    }
  };

  // Refresh inventory
  const refreshInventory = async () => {
    await loadInventoryItems();
  };

  return (
    <InventoryContext.Provider
      value={{
        inventoryItems: items,
        loading,
        error,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        getInventoryItem,
        getInventoryTransactions,
        adjustStock,
        getLowStockItems,
        getOutOfStockItems,
        refreshInventory
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

// Custom hook to use the inventory context
export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
} 