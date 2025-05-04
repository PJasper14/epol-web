"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Download, Filter, PlusCircle, Search, Boxes, X, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useInventory } from "@/contexts/InventoryContext";
import { generateInventoryPDF } from "@/utils/pdfExport";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Use the inventory context
  const { inventoryItems: contextItems } = useInventory();

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
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources Inventory</h1>
        <p className="text-gray-500">Manage equipment and supplies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold">{inventorySummary.totalItems}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Box className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Quantity</p>
                <p className="text-2xl font-bold">{inventorySummary.totalQuantity}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Boxes className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold">{inventorySummary.lowStockItems}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Box className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold">{inventorySummary.outOfStockItems}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Box className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"}
                size="icon" 
                className={`h-10 w-10 relative transition-all duration-200 ${
                  showFilters 
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-md" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className={`h-4 w-4 ${showFilters ? "text-white" : "text-gray-500"}`} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-red-600 text-xs font-semibold flex items-center justify-center shadow-sm">
                    {[selectedStatus].filter(Boolean).length}
                  </span>
                )}
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => {
                    setIsExporting(true);
                    // We need to wait for PDF generation to complete
                    try {
                      generateInventoryPDF(inventoryItems);
                      // The PDF generation itself handles promise resolution
                      // We'll set isExporting back to false after 2 seconds
                      // to give enough time for the browser to process everything
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
                <Link 
                  href="/dashboard/inventory/purchase-order" 
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Request Stock</span>
                </Link>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["In Stock", "Low Stock", "Out of Stock"].map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "outline"}
                        size="sm"
                        className={`${getStatusColor(status)} ${selectedStatus === status ? "ring-2 ring-offset-2" : ""}`}
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

      <Card className="border-red-100">
        <CardHeader className="bg-red-50 rounded-t-lg border-b border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Environmental resources and equipment</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Item Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Unit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Last Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.id}</td>
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4">
                      {item.unit}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                    <td className="py-3 px-4">{item.lastUpdated}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                          asChild
                        >
                          <Link href={`/dashboard/inventory/${item.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">Showing {filteredItems.length} of {inventoryItems.length} items</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 