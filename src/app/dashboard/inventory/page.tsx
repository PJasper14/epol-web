import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function InventoryPage() {
  // Sample inventory data
  const inventoryItems = [
    {
      id: 201,
      name: "Safety Helmet",
      quantity: 15,
      threshold: 10,
      category: "Safety Equipment",
      lastUpdated: "2024-05-10",
    },
    {
      id: 202,
      name: "Safety Vest",
      quantity: 8,
      threshold: 10,
      category: "Safety Equipment",
      lastUpdated: "2024-05-12",
    },
    {
      id: 203,
      name: "First Aid Kit",
      quantity: 18,
      threshold: 8,
      category: "Medical Supplies",
      lastUpdated: "2024-05-05",
    },
    {
      id: 204,
      name: "Flashlight",
      quantity: 5,
      threshold: 10,
      category: "Equipment",
      lastUpdated: "2024-04-28",
    },
    {
      id: 205,
      name: "Radio",
      quantity: 12,
      threshold: 5,
      category: "Communication",
      lastUpdated: "2024-05-01",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Export</Button>
          <Button asChild>
            <Link href="/dashboard/inventory/new">+ Add Item</Link>
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Input placeholder="Search inventory..." />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                All Categories
              </Button>
              <Button variant="outline" size="sm">
                Low Stock Only
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/dashboard/inventory/${item.id}`}
                      className="hover:underline text-blue-600"
                    >
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{item.quantity}</TableCell>
                  <TableCell>{item.threshold}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell>
                    {item.quantity <= item.threshold ? (
                      <Badge variant="destructive">LOW STOCK!</Badge>
                    ) : (
                      <Badge variant="outline">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/inventory/${item.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {inventoryItems.length} of 25 items
              {inventoryItems.filter(item => item.quantity <= item.threshold).length > 0 && (
                <span className="ml-2 text-red-600 font-medium">
                  ({inventoryItems.filter(item => item.quantity <= item.threshold).length} low stock items)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 