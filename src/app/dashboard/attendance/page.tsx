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

export default function AttendancePage() {
  // Sample attendance data
  const attendanceRecords = [
    {
      id: 1,
      name: "John Smith",
      position: "Team Leader",
      date: "2024-05-01",
      timeIn: "08:01",
      timeOut: "17:05",
      status: "On Time",
    },
    {
      id: 2,
      name: "Maria Santos",
      position: "Officer",
      date: "2024-05-01",
      timeIn: "07:55",
      timeOut: "17:00",
      status: "On Time",
    },
    {
      id: 3,
      name: "James Rodriguez",
      position: "Officer",
      date: "2024-05-01",
      timeIn: "08:15",
      timeOut: "17:03",
      status: "Late",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      position: "Officer",
      date: "2024-05-01",
      timeIn: "08:02",
      timeOut: "16:30",
      status: "On Time",
    },
    {
      id: 5,
      name: "Michael Chen",
      position: "Team Leader",
      date: "2024-05-01",
      timeIn: "08:30",
      timeOut: "17:10",
      status: "Late",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Staff Attendance</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Export</Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Today</Button>
              <Button variant="outline" size="sm">This Week</Button>
              <Button variant="outline" size="sm">This Month</Button>
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
                <TableHead>Position</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.position}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.timeIn}</TableCell>
                  <TableCell>{record.timeOut}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      record.status === "On Time" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 