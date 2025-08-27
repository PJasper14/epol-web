"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Download, Filter, PlusCircle, Search, Boxes, X, ShoppingCart, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useInventory } from "@/contexts/InventoryContext";
import { generateInventoryPDF } from "@/utils/pdfExport";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Form state for adding new item
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 0,
    unit: "",
    threshold: 0
  });
  
  // Use the inventory context
  const { inventoryItems: contextItems, addInventoryItem, deleteInventoryItem } = useInventory();

  // Check if any filters are active (but don't include search)
  const hasActiveFilters = selectedStatus !== null;
  
  // Check if any search or filters are active (for UI purposes)
  const hasAnyFiltering = hasActiveFilters || searchQuery !== "";

  // Apply status logic based on quantity
  const inventoryItems = contextItems.map(item => ({
    ...item,
    status: item.quantity === 0 
      ? "Out of Stock" 
      : item.quantity < item.threshold 
        ? "Low Stock" 
        : "In Stock"
  }));

  // Filter inventory items based on selected criteria
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [inventoryItems, selectedStatus, searchQuery]);

  // Summary data
  const inventorySummary = {
    totalItems: inventoryItems.length,
    totalQuantity: inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
    lowStockItems: inventoryItems.filter(item => item.status === "Low Stock").length,
    outOfStockItems: inventoryItems.filter(item => item.status === "Out of Stock").length,
    categories: 7,
  };

  // Get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Out of Stock":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Handle adding new item
  const handleAddItem = () => {
    if (newItem.name && newItem.unit && newItem.quantity >= 0 && newItem.threshold >= 0) {
      addInventoryItem(newItem);
      setNewItem({ name: "", quantity: 0, unit: "", threshold: 0 });
      setShowAddModal(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (itemToDelete) {
      deleteInventoryItem(itemToDelete);
      setItemToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources Inventory</h1>
        <p className="text-gray-600">Manage equipment and supplies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-red-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventorySummary.totalItems}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                <Box className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{inventorySummary.totalQuantity}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                <Boxes className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventorySummary.lowStockItems}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center shadow-sm">
                <Box className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inventorySummary.outOfStockItems}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                <Box className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 bg-white shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-10 w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"}
                size="icon" 
                className={`h-11 w-11 relative transition-all duration-200 ${
                  showFilters 
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-md" 
                    : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className={`h-5 w-5 ${showFilters ? "text-white" : "text-gray-600"}`} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white text-red-600 text-xs font-semibold flex items-center justify-center shadow-sm border border-red-200">
                    {[selectedStatus].filter(Boolean).length}
                  </span>
                )}
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  onClick={() => {
                    setIsExporting(true);
                    try {
                      generateInventoryPDF(inventoryItems);
                      setTimeout(() => setIsExporting(false), 2000);
                    } catch (error) {
                      console.error("Error exporting PDF:", error);
                      alert("There was an error generating the PDF. Please try again.");
                      setIsExporting(false);
                    }
                  }}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </>
                  )}
                </Button>
                
                {/* Add New Item Modal */}
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400">
                      <Plus className="h-4 w-4" />
                      <span>Add Item</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 shadow-xl">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="text-xl font-semibold text-gray-900">Add New Inventory Item</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Add a new item to the inventory. Fill in all required fields.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right font-medium text-gray-700">
                          Name *
                        </Label>
                        <Input
                          id="name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500"
                          placeholder="Enter item name"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right font-medium text-gray-700">
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                          className="col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500"
                          placeholder="0"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right font-medium text-gray-700">
                          Unit *
                        </Label>
                        <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                          <SelectTrigger className="col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="Pcs">Pieces</SelectItem>
                            <SelectItem value="Pairs">Pairs</SelectItem>
                            <SelectItem value="Bundles">Bundles</SelectItem>
                            <SelectItem value="Boxes">Boxes</SelectItem>
                            <SelectItem value="Liters">Liters</SelectItem>
                            <SelectItem value="Kg">Kilograms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="threshold" className="text-right font-medium text-gray-700">
                          Threshold
                        </Label>
                        <Input
                          id="threshold"
                          type="number"
                          value={newItem.threshold}
                          onChange={(e) => setNewItem({ ...newItem, threshold: parseInt(e.target.value) || 0 })}
                          className="col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <DialogFooter className="pt-4 border-t border-gray-200">
                      <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-gray-300 hover:bg-gray-50">
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddItem} 
                        disabled={!newItem.name || !newItem.unit}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Add Item
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Link 
                  href="/dashboard/inventory/purchase-order" 
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Request Stock</span>
                </Link>
                <Link 
                  href="/dashboard/inventory/requests" 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Box className="h-4 w-4" />
                  <span>Manage Requests</span>
                </Link>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["In Stock", "Low Stock", "Out of Stock"].map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "outline"}
                        size="sm"
                        className={`${getStatusColor(status)} ${selectedStatus === status ? "ring-2 ring-offset-2 ring-red-500 shadow-md" : "border-gray-300 hover:bg-gray-50"}`}
                        onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                      >
                        {status}
                        {selectedStatus === status && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md border-gray-200">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Inventory Items</CardTitle>
              <CardDescription className="text-gray-600">Environmental resources and equipment</CardDescription>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
              <Boxes className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Item Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Unit</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Last Updated</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{item.id}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-4 px-4 text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {item.unit}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                          item.status === "In Stock"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : item.status === "Low Stock"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{item.lastUpdated}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-9 px-3 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          asChild
                        >
                          <Link href={`/dashboard/inventory/${item.id}`}>View Details</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-9 px-3 font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-600 hover:border-red-700"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 font-medium">Showing {filteredItems.length} of {inventoryItems.length} items</div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Inventory Item
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this item? This action cannot be undone and will permanently remove the item from the inventory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-gray-300 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-600 hover:border-red-700"
            >
              Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 