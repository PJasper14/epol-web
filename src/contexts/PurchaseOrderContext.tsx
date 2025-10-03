"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { inventoryApi } from "../services/inventoryApi";

// Define types
export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  status: "draft" | "pending" | "approved" | "rejected" | "completed";
  notes?: string;
  total_amount: number;
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  items?: PurchaseOrderItem[];
  created_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  approved_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

interface PurchaseOrderContextType {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  createPurchaseOrder: (order: { items: Array<{ inventory_item_id: number; quantity: number; unit_price: number }>; notes?: string }) => Promise<string>;
  updatePurchaseOrder: (id: string, updates: { items: Array<{ inventory_item_id: number; quantity: number; unit_price: number }>; notes?: string }) => Promise<void>;
  getPurchaseOrder: (id: string) => Promise<PurchaseOrder | null>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  approvePurchaseOrder: (id: string) => Promise<void>;
  rejectPurchaseOrder: (id: string) => Promise<void>;
  refreshPurchaseOrders: () => Promise<void>;
}

// Create the context
const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

// Create the provider component
export function PurchaseOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load purchase orders from API
  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.getPurchaseOrders();
      setOrders(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase orders');
      console.error('Error loading purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load purchase orders on component mount
  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  // Create a new purchase order
  const createPurchaseOrder = async (order: { items: Array<{ inventory_item_id: number; quantity: number; unit_price: number }>; notes?: string }): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.createPurchaseOrder(order);
      await loadPurchaseOrders(); // Refresh the list
      return response.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing purchase order
  const updatePurchaseOrder = async (id: string, updates: { items: Array<{ inventory_item_id: number; quantity: number; unit_price: number }>; notes?: string }) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.updatePurchaseOrder(id, updates);
      await loadPurchaseOrders(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a specific purchase order by ID
  const getPurchaseOrder = async (id: string): Promise<PurchaseOrder | null> => {
    try {
      const response = await inventoryApi.getPurchaseOrder(id);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get purchase order');
      return null;
    }
  };

  // Delete a purchase order
  const deletePurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.deletePurchaseOrder(id);
      await loadPurchaseOrders(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve a purchase order
  const approvePurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.approvePurchaseOrder(id);
      await loadPurchaseOrders(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reject a purchase order
  const rejectPurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.rejectPurchaseOrder(id);
      await loadPurchaseOrders(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh purchase orders
  const refreshPurchaseOrders = async () => {
    await loadPurchaseOrders();
  };

  return (
    <PurchaseOrderContext.Provider
      value={{
        purchaseOrders: orders,
        loading,
        error,
        createPurchaseOrder,
        updatePurchaseOrder,
        getPurchaseOrder,
        deletePurchaseOrder,
        approvePurchaseOrder,
        rejectPurchaseOrder,
        refreshPurchaseOrders
      }}
    >
      {children}
    </PurchaseOrderContext.Provider>
  );
}

// Custom hook to use the purchase order context
export function usePurchaseOrders() {
  const context = useContext(PurchaseOrderContext);
  if (context === undefined) {
    throw new Error('usePurchaseOrders must be used within a PurchaseOrderProvider');
  }
  return context;
} 