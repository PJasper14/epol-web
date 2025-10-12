import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface AttendanceRecord {
  id: number;
  name: string;
  position: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  hoursRendered?: string;
}

// Helper function to format date
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Helper function to format time
function formatTime(timeStr: string | null) {
  if (!timeStr) return "Not recorded";
  
  const date = new Date(timeStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// Helper functions (same as in modal)
function getHoursRendered(record: AttendanceRecord) {
  if (!record.clockIn || !record.clockOut) return "-";
  
  // Parse ISO timestamps
  const clockInTime = new Date(record.clockIn);
  const clockOutTime = new Date(record.clockOut);
  
  // Calculate difference in milliseconds, then convert to minutes
  const diffMs = clockOutTime.getTime() - clockInTime.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
}
function isAllowableClockIn(clockIn: string | null) {
  if (!clockIn) return false;
  const date = new Date(clockIn);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (hours === 14) {
    return minutes >= 20 && minutes <= 30;
  }
  return false;
}
function isLate(clockIn: string | null) {
  if (!clockIn) return false;
  const date = new Date(clockIn);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours > 14 || (hours === 14 && minutes > 30);
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
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);
    if (currentTime < 18.5) {
      return "On Duty";
    } else {
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

export async function exportEmployeeDTR({
  employeeName,
  employeePosition,
  records,
}: {
  employeeName: string;
  employeePosition: string;
  records: AttendanceRecord[];
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Logo paths
  const cabuyaoLogoPath = '/images/CABUYAO LOGO.jpg';
  const epolLogoPath = '/images/EPOL LOGO.jpg';

  // Helper to load an image as base64
  function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  // Load both logos and render the PDF
  try {
    const [cabuyaoLogo, epolLogo] = await Promise.all([
      loadImage(cabuyaoLogoPath),
      loadImage(epolLogoPath),
    ]);
    // Calculate logo dimensions
    const logoWidth = 30;
    const cabuyaoLogoHeight = cabuyaoLogo.height * (logoWidth / cabuyaoLogo.width);
    const epolLogoHeight = epolLogo.height * (logoWidth / epolLogo.width);
    // Add Cabuyao logo (left)
    doc.addImage(cabuyaoLogo, 'JPEG', 15, 10, logoWidth, cabuyaoLogoHeight);
    // Add EPOL logo (right)
    doc.addImage(epolLogo, 'JPEG', pageWidth - logoWidth - 15, 10, logoWidth, epolLogoHeight);
    const maxLogoHeight = Math.max(cabuyaoLogoHeight, epolLogoHeight);
    // Centered header text
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CITY OF CABUYAO', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text('ENVIRONMENTAL POLICE (EPOL)', pageWidth / 2, 26, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Daily Time Record', pageWidth / 2, 34, { align: 'center' });
    
    // Add red line (matching pdfExport.ts)
    doc.setDrawColor(220, 53, 69);
    doc.setLineWidth(0.5);
    doc.line(15, 10 + maxLogoHeight + 15, pageWidth - 15, 10 + maxLogoHeight + 15);

    // Employee details (matching pdfExport.ts spacing)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Employee: ${employeeName}`, 15, 10 + maxLogoHeight + 30);
    doc.text(`Position: ${employeePosition}`, 15, 10 + maxLogoHeight + 38);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 15, 10 + maxLogoHeight + 46);
    doc.text(`Month of Report: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`, 15, 10 + maxLogoHeight + 54);

    // Summary section
    const statusOrder = ["Present", "Late", "Absent", "Undertime", "On Duty"];
    const statusCounts: { [key: string]: number } = {};
    records.forEach((rec) => {
      const status = getAttendanceStatus(rec);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Summary:', 15, 10 + maxLogoHeight + 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    let summaryY = 10 + maxLogoHeight + 78;
    statusOrder.forEach((status) => {
      if (statusCounts[status]) {
        doc.text(`${status}: ${statusCounts[status]}`, 15, summaryY);
        summaryY += 7;
      }
    });
    Object.keys(statusCounts).forEach((status) => {
      if (!statusOrder.includes(status)) {
        doc.text(`${status}: ${statusCounts[status]}`, 15, summaryY);
        summaryY += 7;
      }
    });

    // Continue with the rest of the PDF (table)
    let tableStartY = summaryY + 10;
    // Prepare table data
    const tableData = records.map((rec) => [
      formatDate(rec.date),
      formatTime(rec.clockIn),
      formatTime(rec.clockOut),
      getHoursRendered(rec),
      getAttendanceStatus(rec),
    ]);
    autoTable(doc, {
      startY: tableStartY,
      head: [['Date', 'Clock In', 'Clock Out', 'Hours Rendered', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto', fontStyle: 'bold' },
      },
    });

    // Add signatories at the bottom
    const pageHeight = doc.internal.pageSize.getHeight();
    const signatoryY = pageHeight - 40;
    const leftX = 25;
    const rightX = doc.internal.pageSize.getWidth() - 90;

    // Employee signatory (left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(employeeName, leftX, signatoryY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(employeePosition, leftX, signatoryY + 7);
    doc.text('Environmental Police', leftX, signatoryY + 13);

    // OIC signatory (right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Mary Hope E. Delgado', rightX, signatoryY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Officer In Charge', rightX, signatoryY + 7);
    doc.text('Environmental Police', rightX, signatoryY + 13);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('EPOL Attendance System', 15, doc.internal.pageSize.height - 10);
    const now = new Date();
    doc.text(
      `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      pageWidth - 15,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
    // Save
    doc.save(`${employeeName.replace(/\s+/g, '_')}_DTR.pdf`);
  } catch (error) {
    // If logo loading fails, fallback to text-only header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CITY OF CABUYAO', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text('ENVIRONMENTAL POLICE (EPOL)', pageWidth / 2, 26, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Daily Time Record', pageWidth / 2, 34, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Employee: ${employeeName}`, 15, 48);
    doc.text(`Position: ${employeePosition}`, 15, 56);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 15, 64);
    doc.setDrawColor(220, 53, 69);
    doc.setLineWidth(0.5);
    doc.line(15, 68, pageWidth - 15, 68);
    let tableStartY = 73;
    // ... rest of the code as above ...
    const tableData = records.map((rec) => [
      formatDate(rec.date),
      formatTime(rec.clockIn),
      formatTime(rec.clockOut),
      getHoursRendered(rec),
      getAttendanceStatus(rec),
    ]);
    autoTable(doc, {
      startY: tableStartY,
      head: [['Date', 'Clock In', 'Clock Out', 'Hours Rendered', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto', fontStyle: 'bold' },
      },
    });
    let summaryY = (doc as any).lastAutoTable?.finalY
      ? (doc as any).lastAutoTable.finalY + 10
      : tableStartY;
    const statusOrder = ["Present", "Late", "Absent", "Undertime", "On Duty"];
    const statusCounts: { [key: string]: number } = {};
    records.forEach((rec) => {
      const status = getAttendanceStatus(rec);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Summary:', 15, summaryY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    summaryY += 8;
    statusOrder.forEach((status) => {
      if (statusCounts[status]) {
        doc.text(`${status}: ${statusCounts[status]}`, 15, summaryY);
        summaryY += 7;
      }
    });
    Object.keys(statusCounts).forEach((status) => {
      if (!statusOrder.includes(status)) {
        doc.text(`${status}: ${statusCounts[status]}`, 15, summaryY);
        summaryY += 7;
      }
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('EPOL Attendance System', 15, doc.internal.pageSize.height - 10);
    const now = new Date();
    doc.text(
      `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      pageWidth - 15,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
    doc.save(`${employeeName.replace(/\s+/g, '_')}_DTR.pdf`);
  }
} 