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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export default function UsersPage() {
  // Sample users data
  const users: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@epol.gov.ph",
      role: "Admin",
      department: "EPOL",
      status: "Active",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@epol.gov.ph",
      role: "Officer",
      department: "Field Team",
      status: "Active",
      createdAt: "2024-01-20",
    },
    {
      id: 3,
      name: "James Cruz",
      email: "james@epol.gov.ph",
      role: "Officer",
      department: "Field Team",
      status: "Active",
      createdAt: "2024-02-05",
    },
    {
      id: 4,
      name: "Sarah Reyes",
      email: "sarah@epol.gov.ph",
      role: "Admin",
      department: "EPOL",
      status: "Active",
      createdAt: "2024-02-10",
    },
    {
      id: 5,
      name: "Mike Garcia",
      email: "mike@epol.gov.ph",
      role: "Officer",
      department: "Field Team",
      status: "Inactive",
      createdAt: "2024-03-15",
    },
  ];

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <div className="flex space-x-2">
          <Button>+ Add User</Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Input placeholder="Search users..." />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                All Departments
              </Button>
              <Button variant="outline" size="sm">
                All Roles
              </Button>
              <Button variant="outline" size="sm">
                All Status
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "success" : "secondary"}>
                      {user.status}
                    </Badge>
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
              Showing {users.length} of {users.length} users
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