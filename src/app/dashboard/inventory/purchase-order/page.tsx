"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowLeft, ShoppingCart, Download } from "lucide-react";
import Link from "next/link";
import { useInventory, InventoryItem } from "@/contexts/InventoryContext";
import { generatePurchaseOrderPDF } from "@/utils/pdfExport";

// Simple interface for purchase order items
interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export default function PurchaseOrderPage() {
  const { inventoryItems, getLowStockItems, getOutOfStockItems } = useInventory();
  
  // State for the form
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPdfData, setGeneratedPdfData] = useState<any>(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    reason: ""
  });
  
  // State for suggested items
  const [suggestedItems, setSuggestedItems] = useState<InventoryItem[]>([]);
  
  // Load suggested items on component mount
  useEffect(() => {
    const loadSuggestedItems = async () => {
      try {
        const [lowStockItems, outOfStockItems] = await Promise.all([
          getLowStockItems(),
          getOutOfStockItems()
        ]);
        // Combine and deduplicate items
        const allItems = [...lowStockItems, ...outOfStockItems];
        const uniqueItems = allItems.filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        );
        setSuggestedItems(uniqueItems);
      } catch (error) {
        console.error('Error loading suggested items:', error);
      }
    };
    
    loadSuggestedItems();
  }, [getLowStockItems, getOutOfStockItems]);
  
  // Handle adding an item to the order
  const handleAddItem = () => {
    if (!selectedItemId || quantity <= 0) return;
    
    const inventoryItem = inventoryItems.find(item => item.id === selectedItemId);
    if (!inventoryItem) return;
    
    // Check if item already exists in the list
    const existingIndex = items.findIndex(item => item.itemId === selectedItemId);
    
    if (existingIndex >= 0) {
      // Update existing item
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      setItems(newItems);
    } else {
      // Add new item
      setItems([...items, {
        itemId: inventoryItem.id,
        itemName: inventoryItem.name,
        quantity: quantity,
        unit: inventoryItem.unit
      }]);
    }
    
    // Reset selection
    setSelectedItemId("");
    setQuantity(1);
  };
  
  // Handle removing an item from the order
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  // Handle form submission - Generate PDF only
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({
      reason: ""
    });
    
    // Validate required fields
    let hasErrors = false;
    const errors = {
      reason: ""
    };
    
    if (!reason.trim()) {
      errors.reason = "Reason for request is required";
      hasErrors = true;
    }
    
    if (items.length === 0) {
      return;
    }
    
    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create PDF data structure
      const pdfData = {
        id: `PO-${Date.now()}`,
        po_number: `PO-${Date.now()}`,
        status: 'pending' as const,
        total_amount: 0,
        notes: reason,
        orderDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 1,
        items: items.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit
        }))
      };

      // Store PDF data for download
      setGeneratedPdfData(pdfData);
      setShowSuccessModal(true);
      setItems([]);
      setReason("");
      setValidationErrors({ reason: "" });
    } catch (error) {
      console.error("Error generating purchase order PDF:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate the total number of items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Purchase Order Request</h1>
          <p className="text-gray-500">Request new inventory stocks from City Hall</p>
        </div>
        <Link 
          href="/dashboard/inventory" 
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-md flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full pointer-events-auto">
            <div className="flex flex-col items-center">
              <ShoppingCart className="h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-bold mb-2 text-green-700">Purchase Order Created Successfully</h2>
              <p className="text-gray-600 mb-4">Your purchase order is ready for download.</p>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  onClick={async () => {
                    if (generatedPdfData) {
                      try {
                        await generatePurchaseOrderPDF(generatedPdfData);
                      } catch (error) {
                        console.error('PDF generation failed:', error);
                        alert('Failed to generate PDF. Please try again.');
                      }
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setGeneratedPdfData(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Card className="mb-6 border-l-4 border-l-blue-500 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Order Details</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Provide information about this purchase order
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Reason for Request <span className="text-red-500">*</span></label>
                  <Textarea 
                    placeholder="Explain why these items are needed..."
                    value={reason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setReason(e.target.value);
                      if (validationErrors.reason) {
                        setValidationErrors({ ...validationErrors, reason: "" });
                      }
                    }}
                    className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                      validationErrors.reason ? 'border-red-500' : ''
                    }`}
                    rows={4}
                  />
                  {validationErrors.reason && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.reason}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-t-lg border-b border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-yellow-600 flex items-center justify-center shadow-md">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Suggested Items</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Items that are low or out of stock
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {suggestedItems.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No items are currently low or out of stock.</p>
                    </div>
                  ) : (
                    suggestedItems.map((item, index) => (
                      <div 
                        key={`suggested-${item.id}-${index}`} 
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setQuantity(Math.max(1, item.threshold - item.quantity));
                        }}
                      >
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            Current: {item.quantity} {item.unit} (Threshold: {item.threshold})
                          </div>
                        </div>
                        <Badge 
                          className={item.quantity === 0 ? "bg-red-100 text-red-800 border-red-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}
                        >
                          {item.quantity === 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6 border-l-4 border-l-green-500 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg border-b border-green-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center shadow-md">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Add Items</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Select items to include in this order
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Item</label>
                    <select 
                      className="w-full border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                    >
                      <option value="">Select an item...</option>
                      {inventoryItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddItem}
                  disabled={!selectedItemId || quantity <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Order Summary</CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      Items in this purchase order request
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {items.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No items added yet</p>
                    <p className="text-sm text-gray-400">Add items to create your purchase order</p>
                  </div>
                ) : (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                              Item
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {items.map((item, index) => (
                            <tr key={`order-item-${item.itemId}-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="py-4 px-6">
                                <div className="font-semibold text-gray-900">{item.itemName}</div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="font-medium text-gray-900">{item.quantity} {item.unit}</span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                      <div className="font-semibold text-gray-900">Total Items:</div>
                      <div className="text-lg font-bold text-gray-900">{totalItems}</div>
                    </div>
                    
                    <div className="p-6">
                      <Button 
                        type="submit" 
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        disabled={items.length === 0 || isSubmitting}
                      >
                        {isSubmitting ? 
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div> : 
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        }
                        {isSubmitting ? "Submitting..." : "Submit Purchase Order Request"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

// Helper component for consistent styling
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${className}`}>
    {children}
  </span>
);