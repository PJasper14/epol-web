"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Download, Filter, PlusCircle, Search, Boxes, X, ShoppingCart, Trash2, Plus, CheckCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
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
  
  // Success message state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Form state for adding new item
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 0,
    unit: "",
    threshold: 0
  });
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    unit: "",
    quantity: "",
    threshold: ""
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

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  // Summary data
  const inventorySummary = {
    totalItems: inventoryItems.length,
    totalQuantity: inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
    inStockItems: inventoryItems.filter(item => item.status === "In Stock").length,
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
    // Reset validation errors
    setValidationErrors({
      name: "",
      unit: "",
      quantity: "",
      threshold: ""
    });
    
    // Validate all required fields
    let hasErrors = false;
    const errors = {
      name: "",
      unit: "",
      quantity: "",
      threshold: ""
    };
    
    if (!newItem.name.trim()) {
      errors.name = "Item name is required";
      hasErrors = true;
    }
    
    if (!newItem.unit) {
      errors.unit = "Unit is required";
      hasErrors = true;
    }
    
    if (newItem.quantity === undefined || newItem.quantity === null || newItem.quantity <= 0) {
      errors.quantity = "Quantity is required and must be greater than 0";
      hasErrors = true;
    }
    
    if (newItem.threshold === undefined || newItem.threshold === null || newItem.threshold <= 0) {
      errors.threshold = "Threshold is required and must be greater than 0";
      hasErrors = true;
    }
    
    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }
    
    // If validation passes, add the item
    addInventoryItem(newItem);
    
    // Show success message
    setSuccessMessage(`${newItem.name} has been successfully added to inventory with ${newItem.quantity} ${newItem.unit}`);
    setShowSuccessModal(true);
    
    // Reset form and close modal
    setNewItem({ name: "", quantity: 0, unit: "", threshold: 0 });
    setShowAddModal(false);
    setValidationErrors({ name: "", unit: "", quantity: "", threshold: "" });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">Manage equipment and supplies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{inventorySummary.totalItems}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <Boxes className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">In Stock Items</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{inventorySummary.inStockItems}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <Box className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Low Stock Items</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{inventorySummary.lowStockItems}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">
                <Box className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Out of Stock</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{inventorySummary.outOfStockItems}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <Box className="h-7 w-7 text-red-600" />
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
                  className="gap-2 h-11 px-4 bg-black hover:bg-gray-800 text-white border-black hover:border-gray-800"
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
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"></div>
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
                <Dialog open={showAddModal} onOpenChange={(open) => {
                  if (!open) {
                    // Clear validation errors when closing modal
                    setValidationErrors({ name: "", unit: "", quantity: "", threshold: "" });
                  }
                  setShowAddModal(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 h-11 px-4 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700">
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
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={newItem.name}
                          onChange={(e) => {
                            setNewItem({ ...newItem, name: e.target.value });
                            if (validationErrors.name) {
                              setValidationErrors({ ...validationErrors, name: "" });
                            }
                          }}
                          className={`col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                            validationErrors.name ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter item name"
                        />
                        {validationErrors.name && (
                          <div className="col-span-3 col-start-2">
                            <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right font-medium text-gray-700">
                          Quantity <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          step="1"
                          value={newItem.quantity === 0 ? '' : newItem.quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setNewItem({ ...newItem, quantity: 0 });
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue) && numValue >= 0) {
                                setNewItem({ ...newItem, quantity: numValue });
                              }
                            }
                            if (validationErrors.quantity) {
                              setValidationErrors({ ...validationErrors, quantity: "" });
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              setNewItem({ ...newItem, quantity: 0 });
                            }
                          }}
                          className={`col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                            validationErrors.quantity ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter quantity"
                        />
                        {validationErrors.quantity && (
                          <div className="col-span-3 col-start-2">
                            <p className="text-sm text-red-600 mt-1">{validationErrors.quantity}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right font-medium text-gray-700">
                          Unit <span className="text-red-500">*</span>
                        </Label>
                        <Select value={newItem.unit} onValueChange={(value) => {
                          setNewItem({ ...newItem, unit: value });
                          if (validationErrors.unit) {
                            setValidationErrors({ ...validationErrors, unit: "" });
                          }
                        }}>
                          <SelectTrigger className={`col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                            validationErrors.unit ? 'border-red-500' : ''
                          }`}>
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
                        {validationErrors.unit && (
                          <div className="col-span-3 col-start-2">
                            <p className="text-sm text-red-600 mt-1">{validationErrors.unit}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="threshold" className="text-right font-medium text-gray-700">
                          Threshold <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="threshold"
                          type="number"
                          min="0"
                          step="1"
                          value={newItem.threshold === 0 ? '' : newItem.threshold}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setNewItem({ ...newItem, threshold: 0 });
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue) && numValue >= 0) {
                                setNewItem({ ...newItem, threshold: numValue });
                              }
                            }
                            if (validationErrors.threshold) {
                              setValidationErrors({ ...validationErrors, threshold: "" });
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              setNewItem({ ...newItem, threshold: 0 });
                            }
                          }}
                          className={`col-span-3 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                            validationErrors.threshold ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter threshold"
                        />
                        {validationErrors.threshold && (
                          <div className="col-span-3 col-start-2">
                            <p className="text-sm text-red-600 mt-1">{validationErrors.threshold}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter className="pt-4 border-t border-gray-200">
                      <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-gray-300 hover:bg-gray-50">
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddItem} 
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Add Item
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Link 
                  href="/dashboard/inventory/purchase-order" 
                  className="flex items-center gap-2 h-11 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Create Order Request</span>
                </Link>
                <Link 
                  href="/dashboard/inventory/requests" 
                  className="flex items-center gap-2 h-11 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Box className="h-4 w-4" />
                  <span>Inventory Requests</span>
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

      <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
              <Boxes className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Inventory Items</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {filteredItems.length} items • Environmental resources and equipment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{item.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{item.quantity}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{item.unit}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                          item.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Low Stock"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{item.lastUpdated}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          asChild
                        >
                          <Link href={`/dashboard/inventory/${item.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Boxes className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No inventory items found</h3>
                          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 font-medium">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 border-gray-300 hover:bg-gray-50"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    disabled={totalPages === 1}
                    className={`h-8 w-8 p-0 ${
                      currentPage === page 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 border-gray-300 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
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

             {/* Success Message Modal */}
       <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
         <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 shadow-xl [&>button]:hidden">
           <DialogHeader className="pb-4">
             <DialogTitle className="text-xl font-semibold text-green-900 flex items-center gap-2">
               <CheckCircle className="h-5 w-5 text-green-600" />
               Success!
             </DialogTitle>
             <DialogDescription className="text-gray-600">
               {successMessage}
             </DialogDescription>
           </DialogHeader>
           <DialogFooter className="pt-4 border-t border-gray-200">
             <Button onClick={() => setShowSuccessModal(false)} className="bg-red-600 hover:bg-red-700 text-white">
               Close
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
} 