// Shared attendance data source
export interface AttendanceRecord {
  id: number;
  name: string;
  position: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
}

export const attendanceRecords: AttendanceRecord[] = [
  { id: 1, name: "John Doe", position: "Admin", date: "2023-04-19", clockIn: "02:30:45 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 2, name: "Jane Smith", position: "Team Leader", date: "2023-04-19", clockIn: "02:20:30 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 3, name: "Alex Johnson", position: "EPOL", date: "2023-04-19", clockIn: "02:45:12 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 4, name: "Sam Williams", position: "EPOL", date: "2023-04-19", clockIn: "03:10:45 PM", clockOut: null, status: "Present" },
  { id: 5, name: "Taylor Brown", position: "Team Leader", date: "2023-04-19", clockIn: null, clockOut: null, status: "Absent" },
  { id: 6, name: "Jordan Lee", position: "EPOL", date: "2023-04-18", clockIn: "02:25:18 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 7, name: "Casey Green", position: "EPOL", date: "2023-04-18", clockIn: "03:00:33 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 8, name: "Riley White", position: "Team Leader", date: "2023-04-18", clockIn: "02:05:12 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 9, name: "Michael Chen", position: "EPOL", date: "2023-04-18", clockIn: "03:30:00 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 10, name: "Sarah Wilson", position: "EPOL", date: "2023-04-18", clockIn: "03:45:00 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 11, name: "David Martinez", position: "EPOL", date: "2023-04-17", clockIn: "02:15:20 PM", clockOut: "06:15:00 PM", status: "Present" },
  { id: 12, name: "Lisa Anderson", position: "Admin", date: "2023-04-17", clockIn: "02:35:45 PM", clockOut: "06:45:00 PM", status: "Present" },
  { id: 13, name: "Robert Taylor", position: "EPOL", date: "2023-04-17", clockIn: "03:20:10 PM", clockOut: "06:30:00 PM", status: "Present" },
  { id: 14, name: "Maria Garcia", position: "Team Leader", date: "2023-04-17", clockIn: "02:50:30 PM", clockOut: "06:20:00 PM", status: "Present" },
  { id: 15, name: "James Wilson", position: "EPOL", date: "2023-04-17", clockIn: null, clockOut: null, status: "Absent" },
  { id: 16, name: "Jennifer Davis", position: "EPOL", date: "2023-04-16", clockIn: "02:40:15 PM", clockOut: "06:35:00 PM", status: "Present" },
  { id: 17, name: "Christopher Brown", position: "Team Leader", date: "2023-04-16", clockIn: "02:25:50 PM", clockOut: "06:25:00 PM", status: "Present" },
  { id: 18, name: "Amanda Miller", position: "EPOL", date: "2023-04-16", clockIn: "03:15:25 PM", clockOut: "06:40:00 PM", status: "Present" },
  { id: 19, name: "Daniel Rodriguez", position: "EPOL", date: "2023-04-16", clockIn: "02:55:40 PM", clockOut: "06:15:00 PM", status: "Present" },
  { id: 20, name: "Michelle Thompson", position: "Admin", date: "2023-04-16", clockIn: "02:30:00 PM", clockOut: "06:30:00 PM", status: "Present" },
];

// Helper function to determine attendance status
export function getAttendanceStatus(record: AttendanceRecord): string {
  if (!record.clockIn && !record.clockOut) return "Absent";
  
  // If clocked in but not yet clocked out
  if (record.clockIn && !record.clockOut) {
    return "Present";
  }
  
  // If both clock in and clock out exist, consider as Present
  if (record.clockIn && record.clockOut) {
    return "Present";
  }
  
  return "Absent";
}

// Calculate attendance statistics
export function calculateAttendanceStats() {
  const totalRecords = attendanceRecords.length;
  const presentRecords = attendanceRecords.filter(record => {
    const status = getAttendanceStatus(record);
    return status === "Present";
  }).length;
  
  const percentage = Math.round((presentRecords / totalRecords) * 100);
  
  return {
    total: totalRecords,
    present: presentRecords,
    absent: totalRecords - presentRecords,
    percentage: percentage
  };
}
