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
import { notFound } from "next/navigation";
import Link from "next/link";

export default function InventoryItemPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch this data from an API
  const inventoryItems = [
    {
      id: 201,
      name: "Safety Helmet",
      description: "Standard safety helmet for field operations",
      quantity: 15,
      threshold: 10,
      category: "Safety Equipment",
      lastUpdated: "2024-05-10",
    },
    {
      id: 202,
      name: "Safety Vest",
      description: "High visibility safety vest for field operations",
      quantity: 8,
      threshold: 10,
      category: "Safety Equipment",
      lastUpdated: "2024-05-12",
    },
    {
      id: 203,
      name: "First Aid Kit",
      description: "Basic first aid kit for field operations",
      quantity: 18,
      threshold: 8,
      category: "Medical Supplies",
      lastUpdated: "2024-05-05",
    },
    {
      id: 204,
      name: "Flashlight",
      description: "Heavy-duty waterproof flashlight",
      quantity: 5,
      threshold: 10,
      category: "Equipment",
      lastUpdated: "2024-04-28",
    },
    {
      id: 205,
      name: "Radio",
      description: "Two-way radio for field communication",
      quantity: 12,
      threshold: 5,
      category: "Communication",
      lastUpdated: "2024-05-01",
    },
  ];

  // Find the item by ID
  const item = inventoryItems.find(item => item.id === Number(params.id));
  
  // If item not found, return 404
  if (!item) {
    notFound();
  }

  // Sample transaction history
  const transactionHistory = [
    {
      id: 1,
      date: "2024-05-12",
      user: "John Smith",
      action: "Remove",
      quantity: -2,
      notes: "Used for field operation",
    },
    {
      id: 2,
      date: "2024-05-10",
      user: "Sarah Johnson",
      action: "Add",
      quantity: 5,
      notes: "Restocked from supplier",
    },
    {
      id: 3,
      date: "2024-05-01",
      user: "James Rodriguez",
      action: "Remove",
      quantity: -1,
      notes: "Damaged item",
    },
    {
      id: 4,
      date: "2024-04-15",
      user: "Admin",
      action: "Add",
      quantity: 10,
      notes: "Initial stock",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Inventory
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">
            Inventory Item: {item.name} (#{item.id})
          </h2>
        </div>
        <Button>Edit Item Details</Button>
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
                <p className="text-sm font-medium">Name</p>
                <p>{item.name}</p>
              </div>
              <Badge 
                variant={item.quantity <= item.threshold ? "destructive" : "outline"}
                className="ml-auto"
              >
                {item.quantity <= item.threshold ? "LOW STOCK" : "NORMAL"}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Quantity</p>
                  <p className="text-2xl font-bold">{item.quantity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Threshold</p>
                  <p className="text-2xl font-bold">{item.threshold}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Category</p>
                  <p>{item.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p>{item.lastUpdated}</p>
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
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <div className="flex gap-2">
                  <Button type="button" className="flex-1">Add Stock</Button>
                  <Button type="button" variant="outline" className="flex-1">Remove Stock</Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
                <Input id="quantity" type="number" min="1" defaultValue="1" />
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                <Input id="notes" placeholder="Reason for addition/removal" />
              </div>

              <Button className="w-full" type="submit">Submit</Button>
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
              {transactionHistory.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.action === "Add" ? "default" : "secondary"}>
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
    </div>
  );
} 