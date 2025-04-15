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
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Severity = "Low" | "Medium" | "High" | "Critical";
type Status = "Open" | "In Progress" | "Resolved" | "Closed";
type BadgeVariant = NonNullable<BadgeProps["variant"]>;

interface Incident {
  id: number;
  title: string;
  severity: Severity;
  status: Status;
  reporter: string;
  location: string;
  createdAt: string;
}

export default function IncidentsPage() {
  // Sample incidents data
  const incidents: Incident[] = [
    {
      id: 501,
      title: "Water Pollution",
      severity: "High",
      status: "Open",
      reporter: "Maria Santos",
      location: "Industrial Zone, East River",
      createdAt: "2024-05-15T09:45:00",
    },
    {
      id: 500,
      title: "Illegal Dumping",
      severity: "Medium",
      status: "In Progress",
      reporter: "James Cruz",
      location: "Forest Park, South Section",
      createdAt: "2024-05-14T16:22:00",
    },
    {
      id: 499,
      title: "Forest Fire",
      severity: "Critical",
      status: "Resolved",
      reporter: "Sarah Reyes",
      location: "Mountain Ridge, North Area",
      createdAt: "2024-05-10T08:30:00",
    },
    {
      id: 498,
      title: "Wildlife Harm",
      severity: "Low",
      status: "Closed",
      reporter: "Michael Garcia",
      location: "Wildlife Sanctuary, West Entrance",
      createdAt: "2024-05-09T14:15:00",
    },
    {
      id: 497,
      title: "Air Pollution",
      severity: "Medium",
      status: "Open",
      reporter: "John Smith",
      location: "Factory District, North Side",
      createdAt: "2024-05-08T11:20:00",
    },
  ];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getSeverityBadgeVariant = (severity: Severity): BadgeVariant => {
    switch (severity) {
      case "Low":
        return "outline";
      case "Medium":
        return "warning";
      case "High":
        return "destructive";
      case "Critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: Status): BadgeVariant => {
    switch (status) {
      case "Open":
        return "default";
      case "In Progress":
        return "warning";
      case "Resolved":
        return "success";
      case "Closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Incident Reports</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Export</Button>
          <Button>+ Report Incident</Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Input placeholder="Search incidents..." />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                All Severities
              </Button>
              <Button variant="outline" size="sm">
                All Statuses
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{incident.id}</TableCell>
                  <TableCell className="font-medium">
                    {incident.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityBadgeVariant(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{incident.reporter}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(incident.status)}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(incident.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              <div className="flex space-x-2">
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-1"></div>
                  Open: 2
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                  In Progress: 1
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  Resolved: 1
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-500 mr-1"></div>
                  Closed: 1
                </span>
              </div>
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