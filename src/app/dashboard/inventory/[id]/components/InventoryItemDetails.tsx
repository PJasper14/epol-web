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

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  threshold: number;
  category: string;
  lastUpdated: string;
}

interface Transaction {
  id: number;
  date: string;
  user: string;
  action: string;
  quantity: number;
  notes: string;
}

interface InventoryItemDetailsProps {
  item: InventoryItem;
  transactions: Transaction[];
}

export default function InventoryItemDetails({ item, transactions }: InventoryItemDetailsProps) {
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
              {transactions.map((transaction) => (
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