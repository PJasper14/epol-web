import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Download, Filter, PlusCircle, Search, Boxes } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";

export default function InventoryPage() {
  // Mock data for demonstration
  const rawInventoryItems = [
    { 
      id: "INV-001", 
      name: "Sako", 
      quantity: 2000, 
      unit: "Bundles", 
      lastUpdated: "2023-04-18",
    },

    { 
      id: "INV-002", 
      name: "Dust Pan", 
      quantity: 1200, 
      unit: "Pcs", 
      lastUpdated: "2023-04-16",
      location: "Lab Storage"
    },
    { 
      id: "INV-003", 
      name: "Walis Tingting (Kaong)", 
      quantity: 2400, 
      unit: "Pcs", 
      lastUpdated: "2023-04-10",
    },

    { 
      id: "INV-004", 
      name: "Knitted Gloves", 
      quantity: 4000, 
      unit: "Pairs", 
      lastUpdated: "2023-04-15",
    },

    { 
      id: "INV-005", 
      name: "Rubber Gloves", 
      quantity: 400, 
      unit: "Pairs", 
      lastUpdated: "2023-04-12",
    },

    { 
      id: "INV-006", 
      name: "Raincoat", 
      quantity: 500, 
      unit: "Pcs", 
      lastUpdated: "2023-04-05",
    },

    { 
      id: "INV-007", 
      name: "Sickle (Karit) RS Brand", 
      quantity: 0, 
      unit: "Pcs", 
      lastUpdated: "2023-04-14",
    },

    { 
      id: "INV-008", 
      name: "Panabas (Itak) RS Brand", 
      quantity: 0, 
      unit: "Pcs", 
      lastUpdated: "2023-04-14",
    },

    { 
      id: "INV-009", 
      name: "Hasaan (WhetStone)", 
      quantity: 14, 
      unit: "Pcs", 
      lastUpdated: "2023-04-14",
    },

    { 
      id: "INV-010", 
      name: "Boots", 
      quantity: 500, 
      unit: "Pairs", 
      lastUpdated: "2023-04-14",
    },

    { 
      id: "INV-011", 
      name: "Kalaykay", 
      quantity: 20, 
      unit: "Pcs", 
      lastUpdated: "2023-04-14",
    },

    { 
      id: "INV-012", 
      name: "Palang Lapard No.8", 
      quantity: 125, 
      unit: "Pcs", 
      lastUpdated: "2023-04-14",
    },

    { 
      id: "INV-013", 
      name: "Asarol", 
      quantity: 125, 
      unit: "Pcs", 
      lastUpdated: "2023-04-14",
    },
  ];

  // Apply status logic based on quantity
  const inventoryItems = rawInventoryItems.map(item => ({
    ...item,
    status: item.quantity === 0 
      ? "Out of Stock" 
      : item.quantity < 21 
        ? "Low Stock" 
        : "In Stock"
  }));

  // Summary data
  const inventorySummary = {
    totalItems: inventoryItems.length,
    totalQuantity: inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
    lowStockItems: inventoryItems.filter(item => item.status === "Low Stock").length,
    outOfStockItems: inventoryItems.filter(item => item.status === "Out of Stock").length,
    categories: 7,
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

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8 w-full"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button className="gap-1 bg-red-600 hover:bg-red-700">
            <PlusCircle className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

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
                {inventoryItems.map((item) => (
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
                          variant="outline"
                          size="sm"
                          className="h-8 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">Showing {inventoryItems.length} of {inventoryItems.length} items</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 