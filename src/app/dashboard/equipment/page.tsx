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

export default function EquipmentPage() {
  // Sample equipment data
  const equipmentItems = [
    {
      id: 1,
      name: "9mm Handgun",
      serialNumber: "H9MM-1234",
      assignedTo: "John Smith",
      status: "In Use",
      condition: "Good",
      lastMaintenance: "2024-03-15",
      stockLevel: 12,
    },
    {
      id: 2,
      name: "Body Armor Level III",
      serialNumber: "BA3-5678",
      assignedTo: "Maria Santos",
      status: "In Use",
      condition: "Excellent",
      lastMaintenance: "2024-04-10",
      stockLevel: 8,
    },
    {
      id: 3,
      name: "Taser X26",
      serialNumber: "TX26-9012",
      assignedTo: "James Rodriguez",
      status: "In Use",
      condition: "Fair",
      lastMaintenance: "2024-01-20",
      stockLevel: 5,
    },
    {
      id: 4,
      name: "Police Radio",
      serialNumber: "PR-3456",
      assignedTo: "Unassigned",
      status: "In Storage",
      condition: "Good",
      lastMaintenance: "2024-02-28",
      stockLevel: 3,
    },
    {
      id: 5,
      name: "Handcuffs",
      serialNumber: "HC-7890",
      assignedTo: "Multiple",
      status: "In Use",
      condition: "Good",
      lastMaintenance: "N/A",
      stockLevel: 25,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Equipment Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Export</Button>
          <Button>Add Equipment</Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Input placeholder="Search equipment..." />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="outline" size="sm">Sort</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.serialNumber}</TableCell>
                  <TableCell>{item.assignedTo}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "In Use" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      item.condition === "Excellent" ? "success" :
                      item.condition === "Good" ? "default" :
                      item.condition === "Fair" ? "warning" : "destructive"
                    }>
                      {item.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.lastMaintenance}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      item.stockLevel <= 5 
                        ? "text-red-600" 
                        : item.stockLevel <= 10 
                        ? "text-amber-600" 
                        : "text-green-600"
                    }`}>
                      {item.stockLevel}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing 5 of 25 equipment items
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