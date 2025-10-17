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
import { CheckCircle, User, ArrowLeft, Package, Edit3, History } from "lucide-react";
import { useInventory, InventoryItem, Transaction } from "@/contexts/InventoryContext";
import { useAdmin } from "@/contexts/AdminContext";

interface InventoryItemDetailsProps {
  item: InventoryItem;
  transactions: Transaction[];
}

export default function InventoryItemDetails({ item: initialItem, transactions: initialTransactions }: InventoryItemDetailsProps) {
  // Use the inventory context
  const { updateInventoryItem, adjustStock, getInventoryItem, getInventoryTransactions } = useInventory();
  
  // Use the admin context to get current user
  const { admin } = useAdmin();
  
  // State for the item and transactions
  const [item, setItem] = useState<InventoryItem>(initialItem);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
  // Form state
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  
  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    quantity: ""
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({ quantity: "" });
    
    // Validate required fields
    let hasErrors = false;
    const errors = {
      quantity: ""
    };
    
    if (quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0";
      hasErrors = true;
    }
    
    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      // Use the context's adjustStock method which calls the API
      await adjustStock(
        item.id,
        "in", // Only allow adding stock manually
        quantity,
        notes || "Stock added manually"
      );
      
      // Refresh the item and transactions from the API
      const updatedItem = await getInventoryItem(item.id);
      const updatedTransactions = await getInventoryTransactions(item.id);
      
      if (updatedItem) {
        setItem(updatedItem);
      }
      if (updatedTransactions) {
        setTransactions(updatedTransactions);
      }
      
      // Show success message
      setSuccessMessage(`Added ${quantity} ${item.unit} to inventory by ${admin?.name || "Admin User"}`);
      setShowSuccessModal(true);
      
      // Reset form
      setQuantity(1);
      setNotes("");
    } catch (error) {
      console.error('Error adjusting stock:', error);
      // You could add error handling here if needed
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory Item Details</h1>
          <p className="text-gray-600">Detailed information for {item.name}</p>
        </div>
        <Link 
          href="/dashboard/inventory" 
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-md flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Item Details */}
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg border-b border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Item Details</CardTitle>
                <p className="text-base text-gray-600">Detailed information for {item.name}</p>
              </div>
            </div>
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
                <p className="font-semibold text-gray-900">{new Date(item.updated_at).toLocaleDateString()}</p>
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

        {/* Add Stock Form */}
        <Card className="border-l-4 border-l-green-500 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg border-b border-green-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center shadow-md">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Add Stock</CardTitle>
                <p className="text-base text-gray-600">Manually add stock to this item</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
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
                       setValidationErrors({ quantity: "" });
                     }
                   }}
                   className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                     validationErrors.quantity ? 'border-red-500' : ''
                   }`}
                  />
                 {validationErrors.quantity && (
                   <p className="text-sm text-red-600 mt-1">{validationErrors.quantity}</p>
                 )}
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</label>
                <Input 
                  id="notes" 
                  placeholder="Reason for adding stock" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm" 
                type="submit"
              >
                Add Stock
              </Button>
            </form>
            
            {/* Info note about automatic stock removal */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Stock Removal is Automatic</p>
                  <p>Stock is automatically deducted when you approve inventory requests from team leaders.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-l-4 border-l-purple-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg border-b border-purple-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center shadow-md">
              <History className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Stock History</CardTitle>
              <p className="text-base text-gray-600">{transactions.length} transactions recorded</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Stock Levels
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Distributed To
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Request #
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  // Extract distribution details from reason if it's a distribution
                  const isDistribution = transaction.reason?.includes('Distributed to');
                  const distributedTo = isDistribution 
                    ? transaction.reason?.split('Distributed to ')[1]?.split(' at ')[0] || 'Unknown'
                    : null;
                  const location = isDistribution 
                    ? transaction.reason?.split(' at ')[1] || 'Unknown Location'
                    : null;
                  
                  // Generate request number if available
                  const requestNumber = transaction.inventory_request_id 
                    ? `REQ-${transaction.inventory_request_id.toString().padStart(3, '0')}`
                    : null;

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{new Date(transaction.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {transaction.user ? `${transaction.user.first_name} ${transaction.user.last_name}` : 'Unknown User'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={`px-3 py-1 text-sm font-medium border ${
                          transaction.type === "in" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}>
                          {transaction.type === "in" ? "Add" : transaction.type === "out" ? "Remove" : "Adjustment"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${
                          transaction.type === "in" 
                            ? "text-green-600" 
                            : transaction.type === "out" 
                              ? "text-red-600" 
                              : "text-gray-600"
                        }`}>
                          {transaction.type === "in" 
                            ? `+${transaction.quantity}` 
                            : transaction.type === "out" 
                              ? `-${transaction.quantity}` 
                              : transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          <span className="text-gray-500">{transaction.previous_stock}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="font-semibold">{transaction.new_stock}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {distributedTo ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{distributedTo}</div>
                            {location && (
                              <div className="text-gray-500 text-xs">{location}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {requestNumber ? (
                          <Badge className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {requestNumber}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-xs truncate text-gray-700 text-sm">
                          {transaction.reason || 'No reason provided'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
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