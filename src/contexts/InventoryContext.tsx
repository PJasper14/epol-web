"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { inventoryApi } from "../services/inventoryApi";

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

  // Load inventory items from API
  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.getInventoryItems();
      setItems(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory items');
      console.error('Error loading inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load inventory items on component mount
  useEffect(() => {
    loadInventoryItems();
  }, []);

  // Add a new inventory item
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.createInventoryItem({
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
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.updateInventoryItem(id, {
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
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.deleteInventoryItem(id);
      
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
    try {
      const response = await inventoryApi.getInventoryItem(id);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get inventory item');
      return null;
    }
  };

  // Get transactions for a specific item
  const getInventoryTransactions = async (itemId: string): Promise<Transaction[]> => {
    try {
      const response = await inventoryApi.getInventoryTransactions(itemId);
      return response.transactions?.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get inventory transactions');
      return [];
    }
  };

  // Adjust stock for an item
  const adjustStock = async (itemId: string, type: 'in' | 'out' | 'adjustment', quantity: number, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.adjustStock(itemId, {
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
    try {
      const response = await inventoryApi.getLowStockItems();
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get low stock items');
      return [];
    }
  };

  // Get out of stock items
  const getOutOfStockItems = async (): Promise<InventoryItem[]> => {
    try {
      const response = await inventoryApi.getInventoryItems({ stock_status: 'out_of_stock' });
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