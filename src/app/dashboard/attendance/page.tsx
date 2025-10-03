"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Download, 
  Filter, 
  Search, 
  UserCheck, 
  X, 
  Calendar as CalendarIcon, 
  Eye, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Building2,
  Calendar,
  TrendingUp,
  RefreshCw,
  Settings,
  User,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { SingleDatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAttendancePDF } from "@/utils/attendancePdfExport";
import { EmployeeAttendanceModal } from "@/components/ui/EmployeeAttendanceModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { attendanceRecords } from "@/data/attendanceData";

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
    
    // Calculate expected clock out time (4 hours after clock in)
    const clockInTime = record.clockIn;
    const [time, period] = clockInTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
    const clockInMinutes = (hour24 * 60) + minutes;
    const expectedClockOutMinutes = clockInMinutes + (4 * 60); // 4 hours in minutes
    const expectedClockOutHour = Math.floor(expectedClockOutMinutes / 60);
    const expectedClockOutMinute = expectedClockOutMinutes % 60;
    const expectedClockOutTime = expectedClockOutHour + (expectedClockOutMinute / 60);
    
    // If before expected clock out time, show as Present
    if (currentTime < expectedClockOutTime) {
      return "Present";
    } else {
      // After expected clock out time without clocking out, treat as Absent
      return "Absent";
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
    case "Late":
      return "bg-yellow-100 text-yellow-800";
    case "Undertime":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Helper function to get position color
function getPositionColor(position: string) {
  switch (position) {
    case "Admin":
      return "bg-red-100 text-red-800";
    case "Team Leader":
      return "bg-blue-100 text-blue-800";
    case "EPOL":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AttendanceRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ name: string; position: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use shared attendance data
  const [attendanceRecordsState, setAttendanceRecordsState] = useState(attendanceRecords);

  // Get unique positions and statuses for filter options
  const positions = useMemo(() => 
    ["Admin", "Team Leader", "EPOL"],
    []
  );

  const statuses = useMemo(() => 
    Array.from(new Set(attendanceRecordsState.map(record => getAttendanceStatus(record)))),
    [attendanceRecordsState]
  );

  // Filter records based on search query and selected filters
  const filteredRecords = useMemo(() => {
    return attendanceRecordsState.filter(record => {
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
  }, [attendanceRecordsState, searchQuery, selectedPosition, selectedStatus, selectedDate]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const startIndex = filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = filteredRecords.length > 0 ? startIndex + itemsPerPage : 0;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPosition, selectedStatus, selectedDate, searchQuery]);

  // Filter records for selected employee
  const selectedEmployeeRecords = selectedEmployee
    ? attendanceRecordsState.filter((rec) => rec.name === selectedEmployee.name)
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

  const handleDeleteRecord = (recordId: number) => {
    setRecordToDelete(recordId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      // Remove the record from the state
      setAttendanceRecordsState(prevRecords => 
        prevRecords.filter(record => record.id !== recordToDelete)
      );
      // Close the modal and reset the record to delete
      setShowDeleteModal(false);
      setRecordToDelete(null);
    }
  };

  const hasActiveFilters = selectedPosition || selectedStatus;

  // Calculate summary statistics
  const attendanceSummary = {
    totalRecords: attendanceRecordsState.length,
    presentCount: attendanceRecordsState.filter(record => getAttendanceStatus(record) === "Present").length,
    absentCount: attendanceRecordsState.filter(record => getAttendanceStatus(record) === "Absent").length,
    lateCount: attendanceRecordsState.filter(record => getAttendanceStatus(record) === "Late").length,
    undertimeCount: attendanceRecordsState.filter(record => getAttendanceStatus(record) === "Undertime").length,
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Attendance Records</h1>
            <p className="text-gray-500">View and manage staff attendance records</p>
          </div>
          <Link href="/dashboard">
            <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Total Records</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{attendanceSummary.totalRecords}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <UserCheck className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Present</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{attendanceSummary.presentCount}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Absent</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{attendanceSummary.absentCount}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <X className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Late</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{attendanceSummary.lateCount}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Undertime</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{attendanceSummary.undertimeCount}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-md">
                <Clock className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 bg-white shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search records..."
                  className="pl-10 w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button 
                    variant={showFilters ? "default" : "outline"}
                    size="icon" 
                    className={`h-11 w-11 relative transition-all duration-200 ${
                      showFilters 
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-md" 
                        : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className={`h-5 w-5 ${showFilters ? "text-white" : "text-gray-600"}`} />
                    {hasActiveFilters && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
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
                        className={`${
                          position === "Admin" 
                            ? selectedPosition === position 
                              ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-offset-2 ring-red-500 shadow-md" 
                              : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                            : position === "Team Leader"
                            ? selectedPosition === position 
                              ? "bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-offset-2 ring-blue-500 shadow-md" 
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                            : selectedPosition === position 
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md" 
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                        }`}
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
                        className={`${
                          status === "Present" 
                            ? selectedStatus === status 
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md" 
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                            : status === "Absent"
                            ? selectedStatus === status 
                              ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-offset-2 ring-red-500 shadow-md" 
                              : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                            : status === "Late"
                            ? selectedStatus === status 
                              ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-offset-2 ring-yellow-500 shadow-md" 
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                            : selectedStatus === status 
                              ? "bg-orange-600 text-white hover:bg-orange-700 ring-2 ring-offset-2 ring-orange-500 shadow-md" 
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                        }`}
                        onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                      >
                        {status}
                        {selectedStatus === status && <X className="ml-1 h-3 w-3" />}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex gap-2 items-center">
                <SingleDatePicker value={selectedDate} onChange={setSelectedDate} />
                <Button 
                  variant="outline" 
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 flex gap-2 items-center"
                  onClick={() => setShowValidationModal(true)}
                >
                  <FileText className="h-4 w-4" />
                  <span>EPOL Validation</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-black hover:bg-gray-800 text-white border-black hover:border-gray-800 flex gap-2 items-center"
                  onClick={handleExportPDF}
                  disabled={isExporting || filteredRecords.length === 0}
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Attendance Records</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {filteredRecords.length} records • Biometric attendance via fingerprint authentication
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Position
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.length > 0 ? currentRecords.map((record) => {
                  const hoursRendered = getHoursRendered(record);
                  const status = getAttendanceStatus(record);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{record.name}</div>
                        <div className="text-sm text-gray-500">ID: {record.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getPositionColor(record.position)}`}
                        >
                          {record.position}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">{record.date}</span>
                      </td>
                      <td className="py-4 px-6">
                        {record.clockIn ? (
                          <span className={`font-medium ${isLate(record.clockIn) ? 'text-red-600' : 'text-green-600'}`}>
                            {formatTime(record.clockIn)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not recorded</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {record.clockOut ? (
                          <span className="font-medium text-blue-600">
                            {formatTime(record.clockOut)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not recorded</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${isUndertime(hoursRendered) ? 'text-red-600' : 'text-green-600'}`}>
                          {hoursRendered}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${statusColor}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={() => {
                              setSelectedEmployee({ name: record.name, position: record.position });
                              setModalOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserCheck className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No attendance records found</h3>
                          <p className="text-gray-500">Try adjusting your search criteria or date range</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="text-sm text-gray-600 font-medium">
              {filteredRecords.length > 0 
                ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredRecords.length)} of ${filteredRecords.length} records`
                : `Showing 0 of 0 records`
              }
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || filteredRecords.length === 0}
                className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    disabled={totalPages === 1 || filteredRecords.length === 0}
                    className={`h-9 w-9 p-0 font-semibold ${
                      currentPage === page 
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-md" 
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || filteredRecords.length === 0}
                className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
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
        attendanceRecords={attendanceRecordsState}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Attendance Record
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this attendance record? This action cannot be undone and will permanently remove the record from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-gray-300 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-600 hover:border-red-700"
            >
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EPOL Validation Modal */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="sm:max-w-[800px] bg-white border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              EPOL Validation Records
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              View today's validation remarks and evidence photos submitted by team leaders for street sweepers attendance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Current date validation data - filtered to show only team leader validations for street sweepers */}
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">JD</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">John Doe</h3>
                      <p className="text-sm text-gray-600">Street Sweeper</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{new Date().toLocaleDateString()} 2:30 PM</span>
                    <p className="text-xs text-red-600 font-medium">
                      {(() => {
                        try {
                          // In real implementation, this would get the validator name from the validation data
                          const validatorName = null; // This would come from your backend/AsyncStorage
                          if (validatorName) {
                            return `Validated by ${validatorName}`;
                          } else {
                            throw new Error('Validator name not found');
                          }
                        } catch (error) {
                          return 'Coconnect pa';
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Validation Remarks:</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                    Street sweeper arrived on time and completed assigned route. All designated areas were properly cleaned. 
                    Equipment was used correctly and safety protocols were followed. No issues observed during validation.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Evidence Photo:</h4>
                  <div className="flex justify-center">
                    <div className="bg-gray-200 rounded-lg p-4 text-center w-32">
                      <div className="h-20 w-full bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Photo</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Work hours evidence</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">SW</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Sam Williams</h3>
                      <p className="text-sm text-gray-600">Street Sweeper</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{new Date().toLocaleDateString()} 3:45 PM</span>
                    <p className="text-xs text-red-600 font-medium">
                      {(() => {
                        try {
                          // In real implementation, this would get the validator name from the validation data
                          const validatorName = null; // This would come from your backend/AsyncStorage
                          if (validatorName) {
                            return `Validated by ${validatorName}`;
                          } else {
                            throw new Error('Validator name not found');
                          }
                        } catch (error) {
                          return 'Coconnect pa';
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Validation Remarks:</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                    Street sweeper performed excellent work on assigned route. All debris was properly collected and disposed of. 
                    Work quality exceeded expectations. Safety equipment was properly worn throughout the shift.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Evidence Photo:</h4>
                  <div className="flex justify-center">
                    <div className="bg-gray-200 rounded-lg p-4 text-center w-32">
                      <div className="h-20 w-full bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Photo</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Work hours evidence</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">TB</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Taylor Brown</h3>
                      <p className="text-sm text-gray-600">Street Sweeper</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{new Date().toLocaleDateString()} 4:20 PM</span>
                    <p className="text-xs text-red-600 font-medium">
                      {(() => {
                        try {
                          // In real implementation, this would get the validator name from the validation data
                          const validatorName = null; // This would come from your backend/AsyncStorage
                          if (validatorName) {
                            return `Validated by ${validatorName}`;
                          } else {
                            throw new Error('Validator name not found');
                          }
                        } catch (error) {
                          return 'Coconnect pa';
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Validation Remarks:</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                    Street sweeper completed assigned tasks efficiently. Work area was left clean and organized. 
                    All safety protocols were followed correctly. Minor improvement needed in time management.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Evidence Photo:</h4>
                  <div className="flex justify-center">
                    <div className="bg-gray-200 rounded-lg p-4 text-center w-32">
                      <div className="h-20 w-full bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Photo</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Work hours evidence</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowValidationModal(false)} className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 