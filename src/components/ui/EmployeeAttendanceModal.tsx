import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exportEmployeeDTR } from "@/utils/employeeDtrPdfExport";
import { apiService } from "@/lib/api";
import { 
  Clock, 
  Calendar, 
  Download, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  Timer,
  TrendingUp,
  FileText
} from "lucide-react";

interface AttendanceRecord {
  id: number;
  name: string;
  position: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
}

interface EmployeeAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  employeePosition: string;
  attendanceRecords: AttendanceRecord[];
}

// Helper for hours rendered
function getHoursRendered(record: AttendanceRecord) {
  if (!record.clockIn || !record.clockOut) return "-";
  
  // Parse time strings - handle both ISO format and time-only format
  const parseTime = (timeStr: string) => {
    if (timeStr.includes('T')) {
      // ISO format like "2025-10-05T23:17:59.000000Z"
      return new Date(timeStr);
    } else if (timeStr.includes(' ')) {
      // 12-hour format like "03:20 PM"
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
      const date = new Date();
      date.setHours(hour24, minutes, 0, 0);
      return date;
    } else {
      // Time format like "23:17:59"
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds || 0, 0);
      return date;
    }
  };

  const clockInTime = parseTime(record.clockIn);
  const clockOutTime = parseTime(record.clockOut);
  
  // Calculate difference in milliseconds, then convert to minutes
  const diffMs = clockOutTime.getTime() - clockInTime.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
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
function isLateByHours(hoursRendered: string, requiredHours: number = 6) {
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

function getAttendanceStatus(record: AttendanceRecord, requiredHours: number = 6, workEndTime?: string) {
  // 1. ABSENT: No clock in and clock out at all
  if (!record.clockIn && !record.clockOut) {
    return "Absent";
  }
  
  // 2. Clocked in but not yet clocked out - check if work hours are finished
  if (record.clockIn && !record.clockOut) {
    // Check if work hours have ended
    if (workEndTime) {
      const recordDate = new Date(record.date);
      const today = new Date();
      
      // Only check if record is for today
      const isToday = recordDate.getFullYear() === today.getFullYear() &&
                      recordDate.getMonth() === today.getMonth() &&
                      recordDate.getDate() === today.getDate();
      
      if (isToday) {
        // Parse work end time (e.g., "16:30")
        const [endHours, endMinutes] = workEndTime.split(':').map(Number);
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
  
  // 3. UNDERTIME: 31 minutes or more short of required hours
  if (isUndertime(hoursRendered, requiredHours)) {
    return "Undertime";
  }
  
  // 4. LATE: 15-30 minutes short of required hours
  if (isLateByHours(hoursRendered, requiredHours)) {
    return "Late";
  }
  
  // 5. PRESENT: Rendered full hours or within 15 minutes of required hours
  return "Present";
}

// Helper function to get status color and icon
function getStatusInfo(status: string) {
  switch (status) {
    case "Present":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        iconColor: "text-green-600"
      };
    case "Absent":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: X,
        iconColor: "text-red-600"
      };
    case "Late":
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertTriangle,
        iconColor: "text-yellow-600"
      };
    case "Undertime":
      return {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: Timer,
        iconColor: "text-orange-600"
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
        iconColor: "text-gray-600"
      };
  }
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

export const EmployeeAttendanceModal: React.FC<EmployeeAttendanceModalProps> = ({
  open,
  onClose,
  employeeName,
  employeePosition,
  attendanceRecords,
}) => {
  const [requiredWorkHours, setRequiredWorkHours] = useState<number>(6); // Default 6 hours
  const [workEndTime, setWorkEndTime] = useState<string>("16:30"); // Default work end time

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
    
    if (open) {
      fetchWorkHours();
    }
  }, [open]);

  // Filter and calculate records for the selected employee (memoized to prevent infinite loops)
  const records = useMemo(() => {
    return attendanceRecords
      .filter((rec) => rec.name === employeeName)
      .map((rec) => ({
        ...rec,
        status: getAttendanceStatus(rec, requiredWorkHours, workEndTime),
        hoursRendered: getHoursRendered(rec),
      }));
  }, [attendanceRecords, employeeName, requiredWorkHours, workEndTime]);

  // Calculate statistics
  const stats = useMemo(() => {
    const present = records.filter(r => r.status === "Present").length;
    const absent = records.filter(r => r.status === "Absent").length;
    const late = records.filter(r => r.status === "Late").length;
    const undertime = records.filter(r => r.status === "Undertime").length;
    const total = records.length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, late, undertime, total, attendanceRate };
  }, [records]);

  // Export DTR handler (to be implemented)
  const handleExportDTR = () => {
    exportEmployeeDTR({
      employeeName,
      employeePosition,
      records: records,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] !max-w-[90vw] max-h-[90vh] bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl p-0 flex flex-col overflow-hidden [&>button]:hidden">
        {/* Header Section - Fixed */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
          <div>
              <DialogTitle className="text-2xl font-bold text-white mb-1">{employeeName}</DialogTitle>
              <div className="flex items-center gap-2 text-red-100">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{employeePosition}</span>
              </div>
          </div>
          <Button
              className="bg-white text-red-600 hover:bg-red-50 font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            onClick={handleExportDTR}
          >
              <Download className="h-4 w-4" />
            Export DTR
          </Button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="grid grid-cols-5 gap-6 mb-8">
            {/* Total Records */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Days</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Present */}
            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Present</p>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Absent */}
            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Late */}
            <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Undertime */}
            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Undertime</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.undertime}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Timer className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card className="shadow-md border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                Attendance Records
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Detailed daily attendance history
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto">
                {records.length > 0 ? (
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider w-[18%]">
                          Date
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider w-[22%]">
                          Clock In
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider w-[22%]">
                          Clock Out
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider w-[18%]">
                          Hours Rendered
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider w-[20%]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records.map((rec) => {
                        const statusInfo = getStatusInfo(rec.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <tr key={rec.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-gray-900">
                                  {new Date(rec.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {rec.clockIn ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-green-500 flex-shrink-0" />
                                  <span className="font-medium text-gray-900">{formatTime(rec.clockIn)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Not recorded</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {rec.clockOut ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                  <span className="font-medium text-gray-900">{formatTime(rec.clockOut)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Not recorded</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-semibold text-gray-900">{rec.hoursRendered}</span>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={`${statusInfo.color} border px-3 py-1.5 font-semibold flex items-center gap-1.5 w-fit`}>
                                <StatusIcon className={`h-4 w-4 ${statusInfo.iconColor}`} />
                                {rec.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Calendar className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
                    <p className="text-gray-500 text-center max-w-md">
                      There are no attendance records available for {employeeName}.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end mt-8">
            <Button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 