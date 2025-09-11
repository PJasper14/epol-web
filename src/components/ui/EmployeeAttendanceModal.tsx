import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exportEmployeeDTR } from "@/utils/employeeDtrPdfExport";
import { 
  Clock, 
  User, 
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
  const convertTo24Hour = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
    return { hours: hour24, minutes };
  };
  const clockIn = convertTo24Hour(record.clockIn);
  const clockOut = convertTo24Hour(record.clockOut);
  const clockInMinutes = (clockIn.hours * 60) + clockIn.minutes;
  const clockOutMinutes = (clockOut.hours * 60) + clockOut.minutes;
  const totalMinutes = clockOutMinutes - clockInMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

// Helper for status
function isAllowableClockIn(clockIn: string | null) {
  if (!clockIn) return false;
  const [time, period] = clockIn.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
  if (hour24 === 14) {
    return minutes >= 20 && minutes <= 30;
  }
  return false;
}

function isLate(clockIn: string | null) {
  if (!clockIn) return false;
  const [time, period] = clockIn.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
  return hour24 > 14 || (hour24 === 14 && minutes > 30);
}

function isUndertime(hoursRendered: string) {
  if (hoursRendered === "-") return false;
  const [hoursStr, minutesStr] = hoursRendered.split('h ');
  const hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);
  const totalMinutes = (hours * 60) + minutes;
  return totalMinutes < 210;
}

function getAttendanceStatus(record: AttendanceRecord) {
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

// Helper function to format time to 12-hour format
function formatTime(time: string | null) {
  if (!time) return "Not recorded";
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export const EmployeeAttendanceModal: React.FC<EmployeeAttendanceModalProps> = ({
  open,
  onClose,
  employeeName,
  employeePosition,
  attendanceRecords,
}) => {
  // Filter and calculate records for the selected employee
  const records = attendanceRecords
    .filter((rec) => rec.name === employeeName)
    .map((rec) => ({
      ...rec,
      status: getAttendanceStatus(rec),
      hoursRendered: getHoursRendered(rec),
    }));

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
      <DialogContent className="w-[90vw] max-w-[1400px] h-[600px] bg-white rounded-lg shadow-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between mt-0 mb-2">
          <div>
            <div className="font-semibold text-lg">{employeeName}</div>
            <div className="text-gray-500 text-sm">{employeePosition}</div>
          </div>
          <Button
            className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-md"
            onClick={handleExportDTR}
          >
            Export DTR
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Clock In</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Clock Out</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Hours Rendered</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">{rec.date}</td>
                  <td className="py-2 px-3">{rec.clockIn || <span className="text-gray-400">Not recorded</span>}</td>
                  <td className="py-2 px-3">{rec.clockOut || <span className="text-gray-400">Not recorded</span>}</td>
                  <td className="py-2 px-3">{rec.hoursRendered}</td>
                  <td className="py-2 px-3">{rec.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 