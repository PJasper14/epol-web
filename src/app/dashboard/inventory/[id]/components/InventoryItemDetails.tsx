"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useInventory, InventoryItem, Transaction } from "@/contexts/InventoryContext";

interface InventoryItemDetailsProps {
  item: InventoryItem;
  transactions: Transaction[];
}

export default function InventoryItemDetails({ item: initialItem, transactions: initialTransactions }: InventoryItemDetailsProps) {
  // Use the inventory context
  const { updateInventoryItem, addTransaction } = useInventory();
  
  // State for the item and transactions
  const [item, setItem] = useState<InventoryItem>(initialItem);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
  // Form state
  const [action, setAction] = useState<"Add" | "Remove">("Add");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  
  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleActionChange = (newAction: "Add" | "Remove") => {
    setAction(newAction);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      return; // Don't allow negative or zero quantities
    }
    
    // Calculate the new quantity
    const changeAmount = action === "Add" ? quantity : -quantity;
    const newQuantity = Math.max(0, item.quantity + changeAmount); // Ensure it doesn't go below 0
    
    // Update the item
    const updatedItem = {
      ...item,
      quantity: newQuantity,
      lastUpdated: new Date().toISOString().split('T')[0] // Update to today's date
    };
    
    // Create a new transaction
    const newTransaction = {
      id: Math.max(0, ...transactions.map(t => t.id)) + 1, // Generate a new ID
      date: new Date().toISOString().split('T')[0],
      user: "Current User", // In a real app, this would be the logged-in user
      action: action,
      quantity: changeAmount,
      notes: notes || (action === "Add" ? "Stock added" : "Stock removed")
    };
    
    // Update local state
    setItem(updatedItem);
    setTransactions([newTransaction, ...transactions]); // Add to the beginning
    
    // Update context state (this will update the main inventory page)
    updateInventoryItem(updatedItem);
    addTransaction(item.id, newTransaction);
    
    // Show success message
    setSuccessMessage(`${action === "Add" ? "Added" : "Removed"} ${quantity} ${item.unit} ${action === "Add" ? "to" : "from"} inventory`);
    setShowSuccessModal(true);
    
    // Reset form
    setQuantity(1);
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Item Details</h1>
          <p className="text-gray-500">Detailed information for {item.name}</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/inventory" 
            className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            ← Back to Inventory
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Item Details */}
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Item Name</p>
                <p>{item.name}</p>
              </div>
              <Badge 
                className={`ml-auto ${
                  item.quantity === 0 
                    ? "bg-red-100 text-red-800" 
                    : item.quantity < item.threshold 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-green-100 text-green-800"
                }`}
              >
                {item.quantity === 0 ? "OUT OF STOCK" : item.quantity < item.threshold ? "LOW STOCK" : "IN STOCK"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p>{item.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p>{item.lastUpdated}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Current Quantity</p>
                  <p className="text-2xl font-bold">{item.quantity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Unit</p>
                  <p className="text-lg">{item.unit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Threshold</p>
                  <p className="text-lg">{item.threshold}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Remove Stock Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Action</label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    className={`flex-1 ${action === "Add" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    onClick={() => handleActionChange("Add")}
                  >
                    Add Stock
                  </Button>
                  <Button 
                    type="button" 
                    className={`flex-1 ${action === "Remove" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    onClick={() => handleActionChange("Remove")}
                  >
                    Remove Stock
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-500">Quantity ({item.unit})</label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                {action === "Remove" && quantity > item.quantity && (
                  <p className="text-sm text-red-600 mt-1">
                    Cannot remove more than current quantity ({item.quantity} {item.unit})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-gray-500">Notes</label>
                <Input 
                  id="notes" 
                  placeholder="Reason for addition/removal" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                type="submit"
                disabled={action === "Remove" && quantity > item.quantity}
              >
                Update
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell>
                    <Badge className={transaction.action === "Add" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {transaction.action}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.quantity > 0 ? "text-green-600" : "text-red-600"}>
                    {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {transaction.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Success!</h3>
              <p className="text-gray-600 mb-6 text-center">{successMessage}</p>
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 