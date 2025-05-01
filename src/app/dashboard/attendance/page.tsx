import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Filter, Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

// Helper function to calculate hours rendered
function getHoursRendered(record: any) {
  if (!record.clockIn || !record.clockOut) return "-";
  const clockInDate = new Date(`${record.date}T${record.clockIn}`);
  const clockOutDate = new Date(`${record.date}T${record.clockOut}`);
  // If clock out is past midnight, adjust date
  if (clockOutDate < clockInDate) clockOutDate.setDate(clockOutDate.getDate() + 1);
  const diffMs = clockOutDate.getTime() - clockInDate.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return hours.toFixed(2);
}

export default function AttendanceRecordsPage() {
  // Mock data for demonstration
  const attendanceRecords = [
    { id: 1, name: "John Doe", position: "Officer", date: "2023-04-19", clockIn: "08:30:45", clockOut: "17:15:22", status: "Present" },
    { id: 2, name: "Jane Smith", position: "Supervisor", date: "2023-04-19", clockIn: "08:15:30", clockOut: "17:30:10", status: "Present" },
    { id: 3, name: "Alex Johnson", position: "Officer", date: "2023-04-19", clockIn: "08:45:12", clockOut: "17:05:33", status: "Present" },
    { id: 4, name: "Sam Williams", position: "Officer", date: "2023-04-19", clockIn: "09:10:45", clockOut: null, status: "Present" },
    { id: 5, name: "Taylor Brown", position: "Team Lead", date: "2023-04-19", clockIn: null, clockOut: null, status: "Absent" },
    { id: 6, name: "Jordan Lee", position: "Officer", date: "2023-04-18", clockIn: "08:25:18", clockOut: "17:10:05", status: "Present" },
    { id: 7, name: "Casey Green", position: "Officer", date: "2023-04-18", clockIn: "08:50:33", clockOut: "16:45:22", status: "Present" },
    { id: 8, name: "Riley White", position: "Supervisor", date: "2023-04-18", clockIn: "08:05:12", clockOut: "17:30:45", status: "Present" },
    
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Records</h1>
        <p className="text-gray-500">View and manage staff attendance records</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search records..."
              className="pl-8 w-full"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Clock className="h-4 w-4" />
            <span>Date Range</span>
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Card className="border-red-100">
        <CardHeader className="bg-red-50 rounded-t-lg border-b border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Biometric attendance via fingerprint authentication</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Staff Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Clock In</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Clock Out</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Hours Rendered</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{record.name}</td>
                    <td className="py-3 px-4">{record.position}</td>
                    <td className="py-3 px-4">{record.date}</td>
                    <td className="py-3 px-4">
                      {record.clockIn ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-green-600" />
                          {record.clockIn}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not recorded</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {record.clockOut ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          {record.clockOut}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not recorded</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getHoursRendered(record)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                          ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">Showing 8 of 24 records</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 