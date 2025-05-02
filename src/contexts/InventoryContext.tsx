"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

// Define types
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  lastUpdated: string;
  status?: string;
}

export interface Transaction {
  id: number;
  date: string;
  user: string;
  action: string;
  quantity: number;
  notes: string;
}

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  updateInventoryItem: (updatedItem: InventoryItem) => void;
  getInventoryItem: (id: string) => InventoryItem | undefined;
  getInventoryTransactions: (itemId: string) => Transaction[];
  addTransaction: (itemId: string, transaction: Transaction) => void;
}

// Create the context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Initialize with mock data
const initialInventoryItems: InventoryItem[] = [
  { 
    id: "INV-001", 
    name: "Sako", 
    quantity: 2000, 
    unit: "Bundles", 
    threshold: 500,
    lastUpdated: "2023-04-18",
  },
  { 
    id: "INV-002", 
    name: "Dust Pan", 
    quantity: 1200, 
    unit: "Pcs", 
    threshold: 300,
    lastUpdated: "2023-04-16",
  },
  { 
    id: "INV-003", 
    name: "Walis Tingting (Kaong)", 
    quantity: 2400, 
    unit: "Pcs", 
    threshold: 500,
    lastUpdated: "2023-04-10",
  },
  { 
    id: "INV-004", 
    name: "Knitted Gloves", 
    quantity: 4000, 
    unit: "Pairs", 
    threshold: 1000,
    lastUpdated: "2023-04-15",
  },
  { 
    id: "INV-005", 
    name: "Rubber Gloves", 
    quantity: 400, 
    unit: "Pairs", 
    threshold: 100,
    lastUpdated: "2023-04-12",
  },
  { 
    id: "INV-006", 
    name: "Raincoat", 
    quantity: 500, 
    unit: "Pcs", 
    threshold: 100,
    lastUpdated: "2023-04-05",
  },
  { 
    id: "INV-007", 
    name: "Sickle (Karit) RS Brand", 
    quantity: 0, 
    unit: "Pcs", 
    threshold: 50,
    lastUpdated: "2023-04-14",
  },
  { 
    id: "INV-008", 
    name: "Panabas (Itak) RS Brand", 
    quantity: 0, 
    unit: "Pcs", 
    threshold: 50,
    lastUpdated: "2023-04-14",
  },
  { 
    id: "INV-009", 
    name: "Hasaan (WhetStone)", 
    quantity: 14, 
    unit: "Pcs", 
    threshold: 20,
    lastUpdated: "2023-04-14",
  },
  { 
    id: "INV-010", 
    name: "Boots", 
    quantity: 500, 
    unit: "Pairs", 
    threshold: 100,
    lastUpdated: "2023-04-14",
  },
  { 
    id: "INV-011", 
    name: "Kalaykay", 
    quantity: 20, 
    unit: "Pcs", 
    threshold: 30,
    lastUpdated: "2023-04-14",
  },
  { 
    id: "INV-012", 
    name: "Palang Lapad No.8", 
    quantity: 125, 
    unit: "Pcs", 
    threshold: 50,
    lastUpdated: "2023-04-14",
  },
  { 
    id: "INV-013", 
    name: "Asarol", 
    quantity: 125, 
    unit: "Pcs", 
    threshold: 50,
    lastUpdated: "2023-04-14",
  },
];

// Initialize transactions data
const initialTransactions: Record<string, Transaction[]> = {
  "INV-001": [
    {
      id: 1,
      date: "2023-04-18",
      user: "John Smith",
      action: "Remove",
      quantity: -250,
      notes: "Distributed for cleanup operation",
    },
    {
      id: 2,
      date: "2023-04-10",
      user: "Sarah Johnson",
      action: "Add",
      quantity: 1000,
      notes: "Restocked from supplier",
    },
    {
      id: 3,
      date: "2023-04-01",
      user: "James Rodriguez",
      action: "Remove",
      quantity: -50,
      notes: "Damaged items removed from inventory",
    },
    {
      id: 4,
      date: "2023-03-15",
      user: "Admin",
      action: "Add",
      quantity: 1300,
      notes: "Initial stock entry",
    },
  ]
};

// Create the provider component
export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [transactions, setTransactions] = useState<Record<string, Transaction[]>>(initialTransactions);

  // Update an inventory item
  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  // Get a specific inventory item by ID
  const getInventoryItem = (id: string) => {
    return items.find(item => item.id === id);
  };

  // Get transactions for a specific item
  const getInventoryTransactions = (itemId: string) => {
    return transactions[itemId] || [];
  };

  // Add a transaction for an item
  const addTransaction = (itemId: string, transaction: Transaction) => {
    setTransactions(prev => ({
      ...prev,
      [itemId]: [transaction, ...(prev[itemId] || [])]
    }));
  };

  return (
    <InventoryContext.Provider
      value={{
        inventoryItems: items,
        updateInventoryItem,
        getInventoryItem,
        getInventoryTransactions,
        addTransaction
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