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
import { useAttendance } from "@/contexts/AttendanceContext";
import { apiService } from "@/lib/api";

// Helper function to calculate hours rendered
function getHoursRendered(record: any) {
  if (!record.time_in || !record.time_out) return "-";
  
  // Parse time strings - handle both ISO format and time-only format
  const parseTime = (timeStr: string) => {
    if (timeStr.includes('T')) {
      // ISO format like "2025-10-05T23:17:59.000000Z"
      return new Date(timeStr);
    } else {
      // Time format like "23:17:59"
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds || 0, 0);
      return date;
    }
  };

  const clockInTime = parseTime(record.time_in);
  const clockOutTime = parseTime(record.time_out);
  
  // Calculate difference in milliseconds, then convert to minutes
  const diffMs = clockOutTime.getTime() - clockInTime.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
}

// Helper function to check if within allowable clock-in time
function isAllowableClockIn(clockIn: string | null) {
  if (!clockIn) return false;
  
  // Parse time - handle both ISO format and time-only format
  let timeDate: Date;
  if (clockIn.includes('T')) {
    timeDate = new Date(clockIn);
  } else {
    const [hours, minutes] = clockIn.split(':').map(Number);
    timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
  }
  
  const hours = timeDate.getHours();
  const minutes = timeDate.getMinutes();
  
  // Check if clock-in is between 2:20 PM and 2:30 PM (14:20 to 14:30)
  if (hours === 14) {
    return minutes >= 20 && minutes <= 30;
  }
  return false;
}

// Helper function to check if late
function isLate(clockIn: string | null) {
  if (!clockIn) return false;
  
  // Parse time - handle both ISO format and time-only format
  let timeDate: Date;
  if (clockIn.includes('T')) {
    timeDate = new Date(clockIn);
  } else {
    const [hours, minutes] = clockIn.split(':').map(Number);
    timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
  }
  
  const hours = timeDate.getHours();
  const minutes = timeDate.getMinutes();
  
  // Check if clock-in is after 2:30 PM (14:30)
  return hours > 14 || (hours === 14 && minutes > 30);
}

// Helper function to check if undertime (31 minutes or more short)
function isUndertime(hoursRendered: string, requiredHours: number = 6) {
  if (hoursRendered === "-") return false;
  const [hoursStr, minutesStr] = hoursRendered.split('h ');
  const hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);
  
  // Convert to total minutes for comparison
  const totalMinutes = (hours * 60) + minutes;
  const requiredMinutes = requiredHours * 60;
  
  // Undertime: 31 minutes or more short of required hours
  const shortfall = requiredMinutes - totalMinutes;
  return shortfall >= 31;
}

// Helper function to check if late (15-30 minutes short of required hours)
function isLateByHours(hoursRendered: string, requiredHours: number = 4) {
  if (hoursRendered === "-") return false;
  const [hoursStr, minutesStr] = hoursRendered.split('h ');
  const hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);
  
  // Convert to total minutes for comparison
  const totalMinutes = (hours * 60) + minutes;
  const requiredMinutes = requiredHours * 60;
  
  // Late: 15 to 30 minutes short of required hours
  const shortfall = requiredMinutes - totalMinutes;
  return shortfall >= 15 && shortfall <= 30;
}

// Helper function to format time to 12-hour format with seconds
function formatTime(time: string | null) {
  if (!time) return "Not recorded";
  
  // Handle different time formats
  let dateTime: Date;
  if (time.includes('T')) {
    // ISO format like "2025-10-05T23:17:59.000000Z"
    dateTime = new Date(time);
  } else if (time.includes(':')) {
    // Time format like "23:17:59"
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const sec = seconds !== undefined ? seconds : 0;
    return `${hour12}:${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')} ${period}`;
  } else {
    return time;
  }
  
  return dateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// Helper function to determine attendance status
function getAttendanceStatus(record: any, requiredHours: number = 4, workEndTime?: string) {
  // Use stored work hours settings if available, otherwise use current settings
  const recordWorkHours = record.required_work_hours || requiredHours;
  const recordWorkEndTime = record.work_end_time || workEndTime;
  // 1. ABSENT: No clock in and clock out at all
  if (!record.time_in && !record.time_out) {
    return "Absent";
  }
  
  // 2. Clocked in but not yet clocked out - check if work hours are finished
  if (record.time_in && !record.time_out) {
    // Check if work hours have ended
    if (recordWorkEndTime) {
      const recordDate = new Date(record.date);
      const today = new Date();
      
      // Only check if record is for today
      const isToday = recordDate.getFullYear() === today.getFullYear() &&
                      recordDate.getMonth() === today.getMonth() &&
                      recordDate.getDate() === today.getDate();
      
      if (isToday) {
        // Parse work end time (e.g., "16:30")
        const [endHours, endMinutes] = recordWorkEndTime.split(':').map(Number);
        const workEnd = new Date();
        workEnd.setHours(endHours, endMinutes, 0, 0);
        
        const now = new Date();
        
        // If current time is past work end time, mark as Absent (forgot to clock out)
        if (now > workEnd) {
          return "Absent";
        }
      }
    }
    
    // Work hours not finished yet or not today's record - still working
    return "Present";
  }
  
  // Calculate hours rendered
  const hoursRendered = getHoursRendered(record);
  
  if (hoursRendered === "-") {
    return "Absent";
  }
  
  // 3. UNDERTIME: More than 1 hour short of required hours
  if (isUndertime(hoursRendered, recordWorkHours)) {
    return "Undertime";
  }
  
  // 4. LATE: 15-60 minutes short of required hours
  if (isLateByHours(hoursRendered, recordWorkHours)) {
    return "Late";
  }
  
  // 5. PRESENT: Rendered full hours or within 15 minutes of required hours
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Start with no date selected
  const [isExporting, setIsExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ name: string; position: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [requiredWorkHours, setRequiredWorkHours] = useState<number>(6); // Default 6 hours
  const [workEndTime, setWorkEndTime] = useState<string>("16:30"); // Default work end time
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use real attendance data from API
  const { attendanceRecords: attendanceRecordsState, loading: attendanceLoading, loadAttendanceRecords } = useAttendance();
  
  // State to store all records for modal display
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<any[]>([]);
  
  // Function to load all attendance records for modal
  const loadAllRecordsForModal = async () => {
    try {
      console.log('[AttendancePage] Loading all records for modal...');
      const response = await apiService.getAttendanceRecords({});
      if (response.data) {
        const allRecords = response.data.data || response.data;
        console.log('[AttendancePage] Loaded all records for modal:', allRecords.length);
        setAllAttendanceRecords(allRecords);
      }
    } catch (error) {
      console.error('[AttendancePage] Failed to load all records for modal:', error);
    }
  };

  // Load work hours settings to calculate required work hours
  useEffect(() => {
    const fetchWorkHours = async () => {
      try {
        const response = await apiService.getWorkHours();
        if (response.data) {
          const data = response.data;
          // Calculate required work hours from work_start to work_end
          const workStart = data.work_start; // e.g., "10:30"
          const workEnd = data.work_end; // e.g., "16:30"
          
          const [startHours, startMinutes] = workStart.split(':').map(Number);
          const [endHours, endMinutes] = workEnd.split(':').map(Number);
          
          const startTotalMinutes = (startHours * 60) + startMinutes;
          const endTotalMinutes = (endHours * 60) + endMinutes;
          
          const requiredMinutes = endTotalMinutes - startTotalMinutes;
          const requiredHours = requiredMinutes / 60;
          
          setRequiredWorkHours(requiredHours);
          setWorkEndTime(workEnd); // Save work end time for status calculation
        }
      } catch (error) {
        console.error('Failed to fetch work hours:', error);
        // Keep default 6 hours if fetch fails
      }
    };
    
    fetchWorkHours();
  }, []);

  // Load attendance records when date changes
  useEffect(() => {
    if (selectedDate) {
      // Format date as YYYY-MM-DD in LOCAL timezone (not UTC) to avoid timezone shifts
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('[AttendancePage] Selected date object:', selectedDate);
      console.log('[AttendancePage] Loading records for date:', dateString);
      
      // Try both date range and single date approaches to handle timezone issues
      loadAttendanceRecords({ 
        date: dateString,
        date_from: dateString, 
        date_to: dateString 
      });
    } else {
      // If no date is selected, load all records
      console.log('[AttendancePage] No date selected, loading all records');
      loadAttendanceRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]); // Only depend on selectedDate, not loadAttendanceRecords to prevent infinite loops

  // Get unique positions and statuses for filter options
  const positions = useMemo(() => 
    ["Team Leader", "EPOL"],
    []
  );

  const statuses = useMemo(() => {
    // Always show all possible status options
    const allStatusOptions = ["Present", "Absent", "Late", "Undertime"];
    
    // Get unique statuses from actual data
    const dataStatuses = Array.from(new Set(attendanceRecordsState.map(record => getAttendanceStatus(record, requiredWorkHours, workEndTime))));
    console.log('Data statuses:', dataStatuses);
    console.log('Attendance records count:', attendanceRecordsState.length);
    
    // Return all possible status options
    return allStatusOptions;
  }, [attendanceRecordsState, requiredWorkHours, workEndTime]);

  // Filter records based on search query and selected filters
  const filteredRecords = useMemo(() => {
    console.log('[AttendancePage] Filtering records...');
    console.log('[AttendancePage] Total records in state:', attendanceRecordsState.length);
    console.log('[AttendancePage] Selected date:', selectedDate);
    if (attendanceRecordsState.length > 0) {
      console.log('[AttendancePage] First record:', attendanceRecordsState[0]);
    }
    
    const filtered = attendanceRecordsState.filter(record => {
      const employeeName = `${record.user?.first_name || ''} ${record.user?.last_name || ''}`.trim();
      const employeeRole = record.user?.role || '';
      
      const matchesSearch = !searchQuery || 
        employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employeeRole.toLowerCase().includes(searchQuery.toLowerCase());
      
      const positionMap: Record<string, string> = {
        'epol': 'EPOL',
        'team_leader': 'Team Leader',
        'street_sweeper': 'Street Sweeper',
        'admin': 'Admin'
      };
      const recordPosition = positionMap[employeeRole] || employeeRole;
      const matchesPosition = !selectedPosition || recordPosition === selectedPosition;
      
      const recordStatus = getAttendanceStatus(record, requiredWorkHours, workEndTime);
      const matchesStatus = !selectedStatus || recordStatus === selectedStatus;
      
      // Check if record date matches selected date (convert to Manila timezone first)
      const recordDate = new Date(record.date);
      const recordDateInManila = new Date(recordDate.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
      const recordDateString = `${recordDateInManila.getFullYear()}-${String(recordDateInManila.getMonth() + 1).padStart(2, '0')}-${String(recordDateInManila.getDate()).padStart(2, '0')}`;
      
      // Format selected date in LOCAL timezone (not UTC) to avoid timezone shifts
      const selectedDateString = selectedDate 
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        : null;
      
      // Debug logging for date comparison
      if (selectedDate && record === attendanceRecordsState[0]) {
        console.log('[AttendancePage] Date comparison debug:', {
          recordDate: record.date,
          recordDateInManila: recordDateInManila.toISOString(),
          recordDateString,
          selectedDate: selectedDate.toISOString(),
          selectedDateString,
          match: recordDateString === selectedDateString
        });
      }
      
      // If no date is selected, don't show any records
      const matchesDate = selectedDateString ? recordDateString === selectedDateString : false;
      
      if (selectedDate && record === attendanceRecordsState[0]) {
        console.log('[AttendancePage] Date comparison - Record:', recordDateString, '| Selected:', selectedDateString, '| Matches:', matchesDate);
      }
      
      const recordMatches = matchesSearch && matchesPosition && matchesStatus && matchesDate;
      
      if (selectedDate && record === attendanceRecordsState[0]) {
        console.log('[AttendancePage] Filter results:', {
          employeeName: `${record.user?.first_name || ''} ${record.user?.last_name || ''}`.trim(),
          matchesSearch,
          matchesPosition,
          matchesStatus,
          matchesDate,
          recordMatches
        });
      }
      
      return matchesSearch && matchesPosition && matchesStatus && matchesDate;
    });
    
    console.log('[AttendancePage] Filtered records count:', filtered.length);
    return filtered;
  }, [attendanceRecordsState, searchQuery, selectedPosition, selectedStatus, selectedDate, requiredWorkHours, workEndTime]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const startIndex = filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = filteredRecords.length > 0 ? startIndex + itemsPerPage : 0;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPosition, selectedStatus, selectedDate, searchQuery]);

  // Filter records for selected employee - get ALL records for this employee, not just filtered ones
  const selectedEmployeeRecords = selectedEmployee
    ? (allAttendanceRecords.length > 0 ? allAttendanceRecords : attendanceRecordsState).filter((rec) => {
        const employeeName = `${rec.user?.first_name || ''} ${rec.user?.last_name || ''}`.trim();
        return employeeName === selectedEmployee.name;
      })
    : [];


  // Transform API records to the format expected by PDF export
  const transformRecordsForExport = (records: any[]) => {
    return records.map(record => ({
      id: record.id,
      name: `${record.user?.first_name || ''} ${record.user?.last_name || ''}`.trim(),
      position: record.user?.role === 'epol' ? 'EPOL Officer' : 
               record.user?.role === 'team_leader' ? 'Team Leader' : 
               record.user?.role === 'street_sweeper' ? 'Street Sweeper' : 
               record.user?.role || 'Officer',
      date: record.date,
      clockIn: record.time_in,
      clockOut: record.time_out,
      status: record.status || 'Present',
      work_start_time: record.work_start_time,
      work_end_time: record.work_end_time,
      required_work_hours: record.required_work_hours,
      work_hours_metadata: record.work_hours_metadata,
    }));
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generateAttendancePDF(transformRecordsForExport(filteredRecords));
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
      // Note: In a real implementation, you would call an API to delete the record
      // For now, we'll just close the modal
      setShowDeleteModal(false);
      setRecordToDelete(null);
      // Refresh the attendance records from the API
      loadAttendanceRecords();
    }
  };

  const hasActiveFilters = selectedPosition || selectedStatus;

  // Calculate summary statistics based on selected date and filtered records
  const attendanceSummary = useMemo(() => {
    return {
      totalRecords: filteredRecords.length,
      presentCount: filteredRecords.filter(record => getAttendanceStatus(record, requiredWorkHours, workEndTime) === "Present").length,
      absentCount: filteredRecords.filter(record => getAttendanceStatus(record, requiredWorkHours, workEndTime) === "Absent").length,
      lateCount: filteredRecords.filter(record => getAttendanceStatus(record, requiredWorkHours, workEndTime) === "Late").length,
      undertimeCount: filteredRecords.filter(record => getAttendanceStatus(record, requiredWorkHours, workEndTime) === "Undertime").length,
    };
  }, [filteredRecords, requiredWorkHours, workEndTime]);

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
                  const status = getAttendanceStatus(record, requiredWorkHours, workEndTime);
                  const statusColor = getStatusColor(status);
                  const employeeName = `${record.user?.first_name || ''} ${record.user?.last_name || ''}`.trim();
                  const positionMap: Record<string, string> = {
                    'epol': 'EPOL',
                    'team_leader': 'Team Leader',
                    'street_sweeper': 'Street Sweeper',
                    'admin': 'Admin'
                  };
                  const recordPosition = positionMap[record.user?.role || ''] || record.user?.role || '';
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{employeeName}</div>
                        <div className="text-sm text-gray-500">ID: {record.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getPositionColor(recordPosition)}`}
                        >
                          {recordPosition}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {record.time_in ? (
                          <span className={`font-medium ${isLate(record.time_in) ? 'text-red-600' : 'text-green-600'}`}>
                            {formatTime(record.time_in)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not recorded</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {record.time_out ? (
                          <span className="font-medium text-blue-600">
                            {formatTime(record.time_out)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not recorded</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${isUndertime(hoursRendered, requiredWorkHours) || isLateByHours(hoursRendered, requiredWorkHours) ? 'text-red-600' : 'text-green-600'}`}>
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
                            onClick={async () => {
                              setSelectedEmployee({ name: employeeName, position: recordPosition });
                              await loadAllRecordsForModal();
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
        attendanceRecords={transformRecordsForExport(selectedEmployeeRecords)}
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
              {selectedDate 
                ? `View validation remarks and evidence photos for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                : "Please select a date from the date picker to view validation records."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <ValidationDataComponent selectedDate={selectedDate} />
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

// Validation Data Component
function ValidationDataComponent({ selectedDate }: { selectedDate: Date | null }) {
  const [validations, setValidations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchValidations = async () => {
      try {
        setLoading(true);
        
        // If no date is selected, don't fetch anything
        if (!selectedDate) {
          setValidations([]);
          setLoading(false);
          return;
        }
        
        // Format date in local timezone to avoid timezone conversion issues
        const formatLocalDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        const date = formatLocalDate(selectedDate);
        const response = await apiService.getAttendanceValidations({ date });
        
        if (response.data) {
          // Laravel pagination response structure
          const validationData = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setValidations(validationData);
        }
      } catch (err) {
        console.error('[ValidationDataComponent] Error fetching validations:', err);
        setError('Failed to load validation data');
      } finally {
        setLoading(false);
      }
    };

    fetchValidations();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading validations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (validations.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          {selectedDate 
            ? "No validation records found for the selected date."
            : "Please select a date to view validation records."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {validations.map((validation, index) => {
        const employee = validation.attendance_record?.user;
        const validator = validation.validated_by;
        const initials = employee ? 
          `${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}` : '??';
        
        return (
          <div key={validation.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{initials}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {employee?.role === 'epol' ? 'Street Sweeper' : employee?.role || 'Employee'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">
                  {new Date(validation.validated_at).toLocaleDateString()} {new Date(validation.validated_at).toLocaleTimeString()}
                </span>
                <p className="text-xs text-blue-600 font-medium">
                  Validated by {validator ? `${validator.first_name} ${validator.last_name}` : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-2">Validation Remarks:</h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                {validation.notes || 'No remarks provided'}
              </p>
            </div>
            {validation.evidence && validation.evidence.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Evidence Photos:</h4>
                <div className="flex gap-3 flex-wrap">
                  {validation.evidence.map((evidencePath: string, evidenceIndex: number) => {
                    // Construct full URL to Laravel backend
                    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                    const BACKEND_URL = API_BASE.replace('/api', ''); // Remove /api to get base URL
                    
                    const imageUrl = evidencePath.startsWith('http') 
                      ? evidencePath 
                      : `${BACKEND_URL}/storage/${evidencePath}`;
                    
                    return (
                      <div 
                        key={evidenceIndex} 
                        className="relative group cursor-pointer"
                        onClick={() => window.open(imageUrl, '_blank')}
                      >
                        <img 
                          src={imageUrl}
                          alt={`Evidence ${evidenceIndex + 1}`}
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                        <p className="text-xs text-gray-600 mt-1 text-center">Evidence {evidenceIndex + 1}</p>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">Click to view</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}