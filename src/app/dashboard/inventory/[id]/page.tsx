"use client";

import React from "react";
import { Box } from "lucide-react";
import Link from "next/link";
import InventoryItemDetails from "./components/InventoryItemDetails";
import { useInventory } from "@/contexts/InventoryContext";

// Create a type-safe wrapper for React.use
function useParams<T>(params: T | Promise<T>): T {
  return React.use(params as any);
}

export default function InventoryDetailsPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Use our type-safe wrapper
  const { id } = useParams(params);
  
  // Use the inventory context
  const { getInventoryItem, getInventoryTransactions } = useInventory();
  
  // Find the item by ID
  const item = getInventoryItem(id);
  
  // Get the transactions for this item
  const transactions = getInventoryTransactions(id);
  
  // If item not found, return 404
  if (!item) {
  return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-4">
        <Box className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Item Not Found</h2>
        <p className="text-gray-500 mb-6 text-center">
          The inventory item you are looking for could not be found.
        </p>
        <Link 
          href="/dashboard/inventory" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Inventory
          </Link>
    </div>
  );
  }

  // Use the InventoryItemDetails component with our data
  return <InventoryItemDetails item={item} transactions={transactions} />;
} 