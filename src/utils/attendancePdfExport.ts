import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Use interface augmentation for jspdf
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
}

interface AttendanceRecord {
  id: number;
  name: string;
  position: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
}

// Helper function to get status color in RGB format
function getStatusColor(status: string): [number, number, number] {
  switch (status) {
    case "Present":
      return [220, 252, 231]; // Light green
    case "Absent":
      return [254, 226, 226]; // Light red
    case "On Duty":
      return [219, 234, 254]; // Light blue
    case "Late":
      return [254, 249, 195]; // Light yellow
    case "Undertime":
      return [255, 237, 213]; // Light orange
    default:
      return [243, 244, 246]; // Light gray
  }
}

// Helper function to get status text color in RGB format
function getStatusTextColor(status: string): [number, number, number] {
  switch (status) {
    case "Present":
      return [22, 163, 74]; // Dark green
    case "Absent":
      return [220, 38, 38]; // Dark red
    case "On Duty":
      return [37, 99, 235]; // Dark blue
    case "Late":
      return [161, 98, 7]; // Dark yellow
    case "Undertime":
      return [234, 88, 12]; // Dark orange
    default:
      return [31, 41, 55]; // Dark gray
  }
}

// Function to load logos
function loadLogos(cabuyaoLogoPath: string, epolLogoPath: string): Promise<[HTMLImageElement, HTMLImageElement]> {
  return new Promise((resolve, reject) => {
    const cabuyaoLogo = new Image();
    const epolLogo = new Image();
    let loadedCount = 0;
    
    const checkCompletion = () => {
      loadedCount++;
      if (loadedCount === 2) {
        resolve([cabuyaoLogo, epolLogo]);
      }
    };
    
    cabuyaoLogo.onload = checkCompletion;
    epolLogo.onload = checkCompletion;
    
    cabuyaoLogo.onerror = () => reject(new Error('Failed to load Cabuyao logo'));
    epolLogo.onerror = () => reject(new Error('Failed to load EPOL logo'));
    
    cabuyaoLogo.src = cabuyaoLogoPath;
    epolLogo.src = epolLogoPath;
  });
}

// Generate PDF with logos
function generatePDFWithLogos(
  doc: jsPDF,
  pageWidth: number,
  cabuyaoLogo: HTMLImageElement,
  epolLogo: HTMLImageElement,
  records: AttendanceRecord[]
) {
  try {
    // Calculate logo dimensions while maintaining aspect ratio
    const logoWidth = 30;
    
    // Add Cabuyao logo on the left
    const cabuyaoLogoHeight = cabuyaoLogo.height * (logoWidth / cabuyaoLogo.width);
    doc.addImage(cabuyaoLogo, 'JPEG', 15, 10, logoWidth, cabuyaoLogoHeight);
    
    // Add EPOL logo on the right
    const epolLogoHeight = epolLogo.height * (logoWidth / epolLogo.width);
    doc.addImage(epolLogo, 'JPEG', pageWidth - logoWidth - 15, 10, logoWidth, epolLogoHeight);
    
    // Continue with the rest of the PDF content
    generatePDFContent(doc, pageWidth, records, Math.max(cabuyaoLogoHeight, epolLogoHeight));
  } catch (error) {
    console.error('Error adding logos to PDF:', error);
    generatePDFWithoutLogos(doc, pageWidth, records);
  }
}

// Generate PDF without logos if loading fails
function generatePDFWithoutLogos(doc: jsPDF, pageWidth: number, records: AttendanceRecord[]) {
  // Left logo placeholder
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, 10, 30, 30, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('CABUYAO LOGO', 30, 25, { align: 'center' });
  
  // Right logo placeholder
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(pageWidth - 45, 10, 30, 30, 3, 3, 'F');
  doc.text('EPOL LOGO', pageWidth - 30, 25, { align: 'center' });
  
  // Continue with the rest of the PDF content
  generatePDFContent(doc, pageWidth, records, 30);
}

// --- Attendance status helpers (copied from UI logic) ---
function getHoursRendered(record: AttendanceRecord) {
  if (!record.clockIn || !record.clockOut) return "-";
  const convertTo24Hour = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
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
  if (record.clockIn && !record.clockOut) {
    return "Late"; // In UI, this is "On Duty" if before 6:30 PM, but for PDF, treat as Late for clarity
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
// --- End helpers ---

// Common PDF content generation
function generatePDFContent(doc: jsPDF, pageWidth: number, records: AttendanceRecord[], logoHeight: number) {
  // Position titles to be aligned with the logos vertically
  const titleY = 10 + logoHeight / 2;
  
  // Add title and header text
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('CITY OF CABUYAO', pageWidth / 2, titleY - 5, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Attendance Records Report', pageWidth / 2, titleY + 5, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, titleY + 15, { align: 'center' });
  
  // Add a line to separate header from content
  doc.setDrawColor(220, 53, 69); // Red color
  doc.setLineWidth(0.5);
  doc.line(15, 10 + logoHeight + 15, pageWidth - 15, 10 + logoHeight + 15);
  
  // Add summary information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance Summary:', 15, 10 + logoHeight + 30);
  doc.setFont('helvetica', 'normal');

  // Prepare data for the table using calculated status
  const tableData = records.map(record => {
    const status = getAttendanceStatus(record);
    return [
      record.name,
      record.position,
      record.date,
      record.clockIn || "Not recorded",
      record.clockOut || "Not recorded",
      status
    ];
  });
  
  // Dynamically get unique statuses in the order they appear in the table, using calculated status
  const statusOrder = ["Present", "Late", "Absent", "Undertime", "On Duty"];
  const statusCounts: { [key: string]: number } = {};
  records.forEach(record => {
    const status = getAttendanceStatus(record);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  let summaryY = 10 + logoHeight + 40;
  statusOrder.forEach((status) => {
    if (statusCounts[status]) {
      doc.text(`${status}: ${statusCounts[status]}`, 15, summaryY);
      summaryY += 8;
    }
  });
  Object.keys(statusCounts).forEach((status) => {
    if (!statusOrder.includes(status)) {
      doc.text(`${status}: ${statusCounts[status]}`, 15, summaryY);
      summaryY += 8;
    }
  });
  
  // Add table
  autoTable(doc, {
    startY: 10 + logoHeight + 90,
    head: [['Name', 'Position', 'Date', 'Clock In', 'Clock Out', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 'auto' }, // Name
      1: { cellWidth: 'auto' }, // Position
      2: { cellWidth: 'auto' }, // Date
      3: { cellWidth: 'auto' }, // Clock In
      4: { cellWidth: 'auto' }, // Clock Out
      5: { cellWidth: 'auto', fontStyle: 'bold' } // Status
    },
    didDrawCell: (data) => {
      // Color the status cell based on value
      if (data.column.index === 5 && data.cell.section === 'body') {
        const status = data.cell.raw as string;
        const [r, g, b] = getStatusColor(status);
        doc.setFillColor(r, g, b);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        const [tr, tg, tb] = getStatusTextColor(status);
        doc.setTextColor(tr, tg, tb);
        // Draw the status text centered in the cell
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(
          status,
          data.cell.x + data.cell.width / 2,
          data.cell.y + data.cell.height / 2 + 1, // improved vertical centering
          { align: 'center', baseline: 'middle' }
        );
        data.cell.text = [];
      }
    }
  });
  
  // Add footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('EPOL Attendance System', 15, doc.internal.pageSize.height - 10);
  
  // Current date and time
  const now = new Date();
  doc.text(
    `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 
    pageWidth - 15, 
    doc.internal.pageSize.height - 10, 
    { align: 'right' }
  );
}

export async function generateAttendancePDF(records: AttendanceRecord[]) {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo paths
    const cabuyaoLogoPath = '/images/CABUYAO LOGO.jpg';
    const epolLogoPath = '/images/EPOL LOGO.jpg';
    
    // Load both logos and generate PDF when ready
    loadLogos(cabuyaoLogoPath, epolLogoPath)
      .then(([cabuyaoLogo, epolLogo]) => {
        generatePDFWithLogos(doc, pageWidth, cabuyaoLogo, epolLogo, records);
        doc.save('EPOL_Attendance_Report.pdf');
      })
      .catch((error) => {
        console.error('Error loading logos:', error);
        generatePDFWithoutLogos(doc, pageWidth, records);
        doc.save('EPOL_Attendance_Report.pdf');
      });
      
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
} 