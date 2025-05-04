"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowLeft, ShoppingCart, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInventory, InventoryItem } from "@/contexts/InventoryContext";
import { usePurchaseOrders, PurchaseOrderItem, PurchaseOrder } from "@/contexts/PurchaseOrderContext";
import { generatePurchaseOrderPDF } from "@/utils/pdfExport";

export default function PurchaseOrderPage() {
  const router = useRouter();
  const { inventoryItems, getLowStockItems, getOutOfStockItems } = useInventory();
  const { createPurchaseOrder, getPurchaseOrder, purchaseOrders } = usePurchaseOrders();
  
  // State
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  // Get completed orders
  const completedOrders = purchaseOrders.filter(order => order.status === "Completed");
  
  // Suggested items (low stock + out of stock)
  const suggestedItems = [...getLowStockItems(), ...getOutOfStockItems()];
  
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
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !reason) return;
    setIsSubmitting(true);
    try {
      const newOrder: Omit<PurchaseOrder, "id"> = {
        orderDate: new Date().toISOString().split('T')[0],
        createdBy: "Current User",
        items: items,
        status: "Pending",
        notes: reason
      };
      const orderId = createPurchaseOrder(newOrder);
      setLastOrderId(orderId);
      setShowSuccessModal(true);
      setItems([]);
      setReason("");
    } catch (error) {
      console.error("Error creating purchase order:", error);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Purchase Order Request</h1>
          <p className="text-gray-500">Request new inventory items from suppliers</p>
        </div>
        <Link 
          href="/dashboard/inventory" 
          className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
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
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                disabled={downloading}
                onClick={async () => {
                  if (!lastOrderId) {
                    alert('No purchase order found to download.');
                    return;
                  }
                  setDownloading(true);
                  const order = getPurchaseOrder(lastOrderId);
                  if (!order) {
                    alert('Order not found. Please try again.');
                    setDownloading(false);
                    return;
                  }
                  try {
                    await generatePurchaseOrderPDF(order);
                  } catch (err) {
                    console.error('PDF generation failed:', err);
                    alert('Failed to generate PDF. See console for details.');
                  }
                  setDownloading(false);
                  setShowSuccessModal(false);
                }}
              >
                {downloading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Download Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Provide information about this purchase order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Reason for Request</label>
                  <Textarea 
                    placeholder="Explain why these items are needed..."
                    value={reason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                    required
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Suggested Items</CardTitle>
                <CardDescription>Items that are low or out of stock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedItems.length === 0 ? (
                    <p className="text-gray-500 text-sm">No items are currently low or out of stock.</p>
                  ) : (
                    suggestedItems.map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setQuantity(Math.max(1, item.threshold - item.quantity)); // Suggest quantity to reach threshold
                        }}
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            Current: {item.quantity} {item.unit} (Threshold: {item.threshold})
                          </div>
                        </div>
                        <Badge 
                          className={item.quantity === 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}
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
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add Items</CardTitle>
                <CardDescription>Select items to include in this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Items in this purchase order request</CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-6">
                    <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No items added yet</p>
                    <p className="text-sm text-gray-400">Add items to create your purchase order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2 font-medium text-gray-500">Item</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-500">Quantity</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-2">
                                <div className="font-medium">{item.itemName}</div>
                              </td>
                              <td className="py-2 px-2 text-center">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="py-2 px-2 text-center">
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
                    
                    <div className="flex justify-between pt-3 border-t">
                      <div className="font-medium">Total Items:</div>
                      <div>{totalItems}</div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      disabled={items.length === 0 || !reason || isSubmitting}
                    >
                      {isSubmitting ? 
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : 
                        <ShoppingCart className="h-4 w-4 mr-2" />
                      }
                      {isSubmitting ? "Submitting..." : "Submit Purchase Order Request"}
                    </Button>
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