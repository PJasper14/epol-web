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
import { CheckCircle, User, ArrowLeft } from "lucide-react";
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
  const [user, setUser] = useState(""); // New user input field
  
  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    user: "",
    quantity: ""
  });

  const handleActionChange = (newAction: "Add" | "Remove") => {
    setAction(newAction);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({ user: "", quantity: "" });
    
    // Validate all required fields
    let hasErrors = false;
    const errors = {
      user: "",
      quantity: ""
    };
    
    if (!user.trim()) {
      errors.user = "User name is required";
      hasErrors = true;
    }
    
    if (quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0";
      hasErrors = true;
    }
    
    if (hasErrors) {
      setValidationErrors(errors);
      return;
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
      user: user.trim(), // Use the user input instead of hardcoded value
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
    setSuccessMessage(`${action === "Add" ? "Added" : "Removed"} ${quantity} ${item.unit} ${action === "Add" ? "to" : "from"} inventory by ${user.trim()}`);
    setShowSuccessModal(true);
    
    // Reset form
    setQuantity(1);
    setNotes("");
    setUser(""); // Reset user field
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Item Details</h1>
          <p className="text-gray-600">Detailed information for {item.name}</p>
        </div>
        <Link 
          href="/dashboard/inventory" 
          className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Item Details */}
        <Card className="bg-white shadow-md border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg border-b border-blue-200">
            <CardTitle className="text-xl font-semibold text-gray-900">Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Item Name</p>
                <p className="text-lg font-semibold text-gray-900">{item.name}</p>
              </div>
              <Badge 
                className={`ml-auto px-3 py-1 text-sm font-medium ${
                  item.quantity === 0 
                    ? "bg-red-100 text-red-800 border border-red-200" 
                    : item.quantity < item.threshold 
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                      : "bg-green-100 text-green-800 border border-green-200"
                }`}
              >
                {item.quantity === 0 ? "OUT OF STOCK" : item.quantity < item.threshold ? "LOW STOCK" : "IN STOCK"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">ID</p>
                <p className="font-semibold text-gray-900">{item.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-900">{item.lastUpdated}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Current Quantity</p>
                  <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Unit</p>
                  <p className="text-lg font-semibold text-gray-900">{item.unit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Threshold</p>
                  <p className="text-lg font-semibold text-gray-900">{item.threshold}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Remove Stock Form */}
        <Card className="bg-white shadow-md border-gray-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg border-b border-green-200">
            <CardTitle className="text-xl font-semibold text-gray-900">Update Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Action</label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    className={`flex-1 ${action === "Add" ? "bg-green-600 hover:bg-green-700 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"}`}
                    onClick={() => handleActionChange("Add")}
                  >
                    Add Stock
                  </Button>
                  <Button 
                    type="button" 
                    className={`flex-1 ${action === "Remove" ? "bg-red-600 hover:bg-red-700 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"}`}
                    onClick={() => handleActionChange("Remove")}
                  >
                    Remove Stock
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="user" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="user" 
                  type="text" 
                  placeholder="Enter your name" 
                  value={user}
                  onChange={(e) => {
                    setUser(e.target.value);
                                         // Clear validation error when user starts typing
                     if (validationErrors.user) {
                       setValidationErrors({ user: "", quantity: validationErrors.quantity });
                     }
                  }}
                  className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                    validationErrors.user ? 'border-red-500' : ''
                  }`}
                  required
                />
                {validationErrors.user && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.user}</p>
                )}
              </div>

                             <div className="space-y-2">
                 <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity ({item.unit}) <span className="text-red-500">*</span></label>
                                 <Input 
                   id="quantity" 
                   type="number" 
                   min="1" 
                   value={quantity} 
                   onChange={(e) => {
                     const newQuantity = parseInt(e.target.value) || 1;
                     setQuantity(newQuantity);
                     // Clear validation error when user starts typing
                     if (validationErrors.quantity) {
                       setValidationErrors({ user: validationErrors.user, quantity: "" });
                     }
                   }}
                   className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                     validationErrors.quantity ? 'border-red-500' : ''
                   }`}
                                  />
                 {validationErrors.quantity && (
                   <p className="text-sm text-red-600 mt-1">{validationErrors.quantity}</p>
                 )}
                 {action === "Remove" && quantity > item.quantity && (
                   <p className="text-sm text-red-600 mt-1">
                     Cannot remove more than current quantity ({item.quantity} {item.unit})
                   </p>
                 )}
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</label>
                <Input 
                  id="notes" 
                  placeholder="Reason for addition/removal" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

                             <Button 
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                 type="submit"
                 disabled={action === "Remove" && quantity > item.quantity}
               >
                 Update Inventory
               </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-white shadow-md border-gray-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg border-b border-purple-200">
          <CardTitle className="text-xl font-semibold text-gray-900">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Action</TableHead>
                <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                <TableHead className="font-semibold text-gray-700">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{transaction.date}</TableCell>
                  <TableCell className="font-medium text-gray-900">{transaction.user}</TableCell>
                  <TableCell>
                    <Badge className={`px-3 py-1 text-sm font-medium border ${
                      transaction.action === "Add" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}>
                      {transaction.action}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-semibold ${transaction.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-700">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl border border-gray-200">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Success!</h3>
              <p className="text-gray-600 mb-6 text-center">{successMessage}</p>
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md"
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