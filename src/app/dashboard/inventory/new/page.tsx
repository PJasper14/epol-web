import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function NewInventoryItemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/dashboard/inventory" className="text-sm text-muted-foreground hover:text-foreground mr-4">
          ← Back to Inventory
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Add New Inventory Item</h2>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="Enter item name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Enter item description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input id="quantity" type="number" min="0" defaultValue="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold (Low Stock Alert)</Label>
                <Input id="threshold" type="number" min="0" defaultValue="10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a category</option>
                <option value="Safety Equipment">Safety Equipment</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Communication">Communication</option>
                <option value="Equipment">Equipment</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Additional information (optional)" />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/inventory">Cancel</Link>
              </Button>
              <Button type="submit">Save Item</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}