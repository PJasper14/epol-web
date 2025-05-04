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
  orderDate: string;
  createdBy: string;
  items: PurchaseOrderItem[];
  status: "Pending" | "Completed";
  notes?: string;
  completedDate?: string;
  supplier?: string;
}

interface PurchaseOrderContextType {
  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (order: Omit<PurchaseOrder, "id">) => string;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  getPurchaseOrder: (id: string) => PurchaseOrder | undefined;
  deletePurchaseOrder: (id: string) => void;
}

// Create the context
const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

// Mock data for initial orders
const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2023-001",
    orderDate: "2023-05-10",
    createdBy: "Admin User",
    items: [
      {
        itemId: "INV-007",
        itemName: "Sickle (Karit) RS Brand",
        quantity: 50,
        unit: "Pcs"
      },
      {
        itemId: "INV-008",
        itemName: "Panabas (Itak) RS Brand",
        quantity: 50,
        unit: "Pcs"
      }
    ],
    status: "Pending",
    supplier: "ABC Hardware Supply"
  },
  {
    id: "PO-2023-002",
    orderDate: "2023-05-05",
    createdBy: "Admin User",
    items: [
      {
        itemId: "INV-009",
        itemName: "Hasaan (WhetStone)",
        quantity: 30,
        unit: "Pcs"
      }
    ],
    status: "Completed",
    supplier: "XYZ Tools Inc.",
    completedDate: "2023-05-15",
    notes: "Order received and added to inventory"
  },
  {
    id: "PO-2023-003",
    orderDate: "2023-04-28",
    createdBy: "Admin User",
    items: [
      {
        itemId: "INV-001",
        itemName: "Sako",
        quantity: 1000,
        unit: "Bundles"
      }
    ],
    status: "Completed",
    supplier: "Cleaning Supplies Co.",
    completedDate: "2023-05-05",
    notes: "Order received and added to inventory"
  }
];

// Create the provider component
export function PurchaseOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);

  // Generate a new PO ID
  const generateOrderId = (): string => {
    const year = new Date().getFullYear();
    const existingOrders = orders.filter(o => o.id.includes(`PO-${year}`));
    const lastNumber = existingOrders.length > 0
      ? Math.max(...existingOrders.map(o => parseInt(o.id.split('-')[2])))
      : 0;
    return `PO-${year}-${(lastNumber + 1).toString().padStart(3, '0')}`;
  };

  // Create a new purchase order
  const createPurchaseOrder = (order: Omit<PurchaseOrder, "id">): string => {
    const newId = generateOrderId();
    const newOrder = { ...order, id: newId };
    setOrders(prev => [...prev, newOrder]);
    return newId;
  };

  // Update an existing purchase order
  const updatePurchaseOrder = (id: string, updates: Partial<PurchaseOrder>) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === id ? { ...order, ...updates } : order
      )
    );
  };

  // Get a specific purchase order by ID
  const getPurchaseOrder = (id: string) => {
    return orders.find(order => order.id === id);
  };

  // Delete a purchase order
  const deletePurchaseOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  return (
    <PurchaseOrderContext.Provider
      value={{
        purchaseOrders: orders,
        createPurchaseOrder,
        updatePurchaseOrder,
        getPurchaseOrder,
        deletePurchaseOrder
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