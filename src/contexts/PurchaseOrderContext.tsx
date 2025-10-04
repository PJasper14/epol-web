"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

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
  orderDate?: string;
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
  refreshPurchaseOrders: () => Promise<void>;
}

// Create the context
const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

// Create the provider component
export function PurchaseOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh purchase orders (simplified - no database interaction)
  const refreshPurchaseOrders = async () => {
    // This is a simplified version that doesn't interact with database
    // Since we're only generating PDFs, we don't need to store or retrieve data
    setLoading(false);
    setError(null);
  };

  return (
    <PurchaseOrderContext.Provider
      value={{
        purchaseOrders: orders,
        loading,
        error,
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