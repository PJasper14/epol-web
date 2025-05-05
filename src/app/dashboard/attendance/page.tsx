"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Filter, Search, UserCheck, X, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { SingleDatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAttendancePDF } from "@/utils/attendancePdfExport";
import { EmployeeAttendanceModal } from "@/components/ui/EmployeeAttendanceModal";

// Helper function to calculate hours rendered
function getHoursRendered(record: any) {
  if (!record.clockIn || !record.clockOut) return "-";
  
  // Convert 12-hour format to 24-hour format for calculation
  const convertTo24Hour = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
    return { hours: hour24, minutes };
  };

  const clockIn = convertTo24Hour(record.clockIn);
  const clockOut = convertTo24Hour(record.clockOut);
  
  // Calculate total minutes
  const clockInMinutes = (clockIn.hours * 60) + clockIn.minutes;
  const clockOutMinutes = (clockOut.hours * 60) + clockOut.minutes;
  
  const totalMinutes = clockOutMinutes - clockInMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
}

// Helper function to check if within allowable clock-in time
function isAllowableClockIn(clockIn: string | null) {
  if (!clockIn) return false;
  const [time, period] = clockIn.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
  
  // Check if clock-in is between 2:20 PM and 2:30 PM
  if (hour24 === 14) {
    return minutes >= 20 && minutes <= 30;
  }
  return false;
}

// Helper function to check if late
function isLate(clockIn: string | null) {
  if (!clockIn) return false;
  const [time, period] = clockIn.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
  
  // Check if clock-in is after 2:30 PM
  return hour24 > 14 || (hour24 === 14 && minutes > 30);
}

// Helper function to check if undertime
function isUndertime(hoursRendered: string) {
  if (hoursRendered === "-") return false;
  const [hoursStr, minutesStr] = hoursRendered.split('h ');
  const hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);
  
  // Convert to total minutes for comparison
  const totalMinutes = (hours * 60) + minutes;
  // 3 hours and 30 minutes = 210 minutes
  return totalMinutes < 210;
}

// Helper function to format time to 12-hour format
function formatTime(time: string | null) {
  if (!time) return "Not recorded";
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper function to determine attendance status
function getAttendanceStatus(record: any) {
  if (!record.clockIn && !record.clockOut) return "Absent";
  const hoursRendered = getHoursRendered(record);
  // If clocked in but not yet clocked out
  if (record.clockIn && !record.clockOut) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);
    // If before 6:30 PM, show as On Duty
    if (currentTime < 18.5) {
      return "On Duty";
    } else {
      // After 6:30 PM, treat as Late
      return "Late";
    }
  }
  if (isUndertime(hoursRendered)) {
    return "Undertime";
  }
  if (isLate(record.clockIn)) {
    return "Late";
  }
  if (isAllowableClockIn(record.clockIn)) {
    return "Present";
  }
  return "Present";
}

// Helper function to get status color
function getStatusColor(status: string) {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-800";
    case "Absent":
      return "bg-red-100 text-red-800";
    case "On Duty":
      return "bg-blue-100 text-blue-800";
    case "Late":
      return "bg-yellow-100 text-yellow-800";
    case "Undertime":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AttendanceRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ name: string; position: string } | null>(null);

  // Mock data for demonstration with updated schedule
  const attendanceRecords = [
    { id: 1, name: "John Doe", position: "Officer", date: "2023-04-19", clockIn: "02:30:45 PM", clockOut: "06:30:00 PM", status: "Present" },
    { id: 2, name: "Jane Smith", position: "Supervisor", date: "2023-04-19", clockIn: "02:20:30 PM", clockOut: "06:30:00 PM", status: "Present" },
    { id: 3, name: "Alex Johnson", position: "Officer", date: "2023-04-19", clockIn: "02:45:12 PM", clockOut: "06:30:00 PM", status: "Present" },
    { id: 4, name: "Sam Williams", position: "Officer", date: "2023-04-19", clockIn: "03:10:45 PM", clockOut: null, status: "Present" },
    { id: 5, name: "Taylor Brown", position: "Team Lead", date: "2023-04-19", clockIn: null, clockOut: null, status: "Absent" },
    { id: 6, name: "Jordan Lee", position: "Officer", date: "2023-04-18", clockIn: "02:25:18 PM", clockOut: "06:30:00 PM", status: "Present" },
    { id: 7, name: "Casey Green", position: "Officer", date: "2023-04-18", clockIn: "03:00:33 PM", clockOut: "06:30:00 PM", status: "Present" },
    { id: 8, name: "Riley White", position: "Supervisor", date: "2023-04-18", clockIn: "02:05:12 PM", clockOut: "06:30:00 PM", status: "Present" },
    { id: 9, name: "Michael Chen", position: "Officer", date: "2023-04-18", clockIn: "03:30:00 PM", clockOut: "06:30:00 PM", status: "Present" },
    { id: 10, name: "Sarah Wilson", position: "Officer", date: "2023-04-18", clockIn: "03:45:00 PM", clockOut: "06:30:00 PM", status: "Present" },
  ];

  // Get unique positions and statuses for filter options
  const positions = useMemo(() => 
    Array.from(new Set(attendanceRecords.map(record => record.position))),
    [attendanceRecords]
  );

  const statuses = useMemo(() => 
    Array.from(new Set(attendanceRecords.map(record => getAttendanceStatus(record)))),
    [attendanceRecords]
  );

  // Filter records based on search query and selected filters
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const matchesSearch = !searchQuery || 
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.position.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPosition = !selectedPosition || record.position === selectedPosition;
      
      const recordStatus = getAttendanceStatus(record);
      const matchesStatus = !selectedStatus || recordStatus === selectedStatus;
      
      // Check if record date matches selected date
      const recordDate = new Date(record.date);
      const matchesDate = !selectedDate || (
        recordDate.getFullYear() === selectedDate.getFullYear() &&
        recordDate.getMonth() === selectedDate.getMonth() &&
        recordDate.getDate() === selectedDate.getDate()
      );
      
      return matchesSearch && matchesPosition && matchesStatus && matchesDate;
    });
  }, [attendanceRecords, searchQuery, selectedPosition, selectedStatus, selectedDate]);

  // Filter records for selected employee
  const selectedEmployeeRecords = selectedEmployee
    ? attendanceRecords.filter((rec) => rec.name === selectedEmployee.name)
    : [];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generateAttendancePDF(filteredRecords);
      // Set a timeout to reset the isExporting state to allow time for PDF generation
      setTimeout(() => setIsExporting(false), 2000);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setIsExporting(false);
    }
  };

  const hasActiveFilters = selectedPosition || selectedStatus;

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button 
                variant={showFilters ? "default" : "outline"}
                size="icon" 
                className={`h-10 w-10 relative transition-all duration-200 ${
                  showFilters 
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-md" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className={`h-4 w-4 ${showFilters ? "text-white" : "text-gray-500"}`} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-red-600 text-xs font-semibold flex items-center justify-center shadow-sm">
                    {[selectedPosition, selectedStatus].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white z-50 shadow-lg border">
              <div className="font-semibold mb-2">Position</div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {positions.map((position) => (
                  <Button
                    key={position}
                    variant={selectedPosition === position ? "default" : "outline"}
                    size="sm"
                    className={selectedPosition === position ? "ring-2 ring-offset-2" : ""}
                    onClick={() => setSelectedPosition(selectedPosition === position ? null : position)}
                  >
                    {position}
                    {selectedPosition === position && <X className="ml-1 h-3 w-3" />}
                  </Button>
                ))}
              </div>
              <div className="font-semibold mb-2">Status</div>
              <div className="flex gap-2 flex-wrap">
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
                    size="sm"
                    className={`${getStatusColor(status)} ${selectedStatus === status ? "ring-2 ring-offset-2" : ""}`}
                    onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  >
                    {status}
                    {selectedStatus === status && <X className="ml-1 h-3 w-3" />}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2 items-start">
          <SingleDatePicker value={selectedDate} onChange={setSelectedDate} />
          <Button 
            variant="outline" 
            className="hover:bg-gray-100 flex gap-2 items-center"
            onClick={handleExportPDF}
            disabled={isExporting || filteredRecords.length === 0}
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export</span>
              </>
            )}
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Clock In</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Clock Out</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Hours Rendered</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const hoursRendered = getHoursRendered(record);
                  const status = getAttendanceStatus(record);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{record.name}</td>
                      <td className="py-3 px-4">{record.position}</td>
                      <td className="py-3 px-4">{record.date}</td>
                      <td className="py-3 px-4">
                        {record.clockIn ? (
                          <span className={`inline-flex items-center gap-1.5 ${isLate(record.clockIn) ? 'text-red-600' : 'text-green-600'}`}>
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(record.clockIn)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not recorded</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.clockOut ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-blue-600" />
                            {formatTime(record.clockOut)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not recorded</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={isUndertime(hoursRendered) ? 'text-red-600' : ''}>
                          {hoursRendered}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setSelectedEmployee({ name: record.name, position: record.position });
                            setModalOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">Showing {filteredRecords.length} of {attendanceRecords.length} records</div>
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
      <EmployeeAttendanceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeName={selectedEmployee?.name || ""}
        employeePosition={selectedEmployee?.position || ""}
        attendanceRecords={attendanceRecords}
      />
    </div>
  );
} 