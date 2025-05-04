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

export async function generateAttendancePDF(records: AttendanceRecord[]) {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Attendance Records", 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
  
  // Prepare data for the table
  const tableData = records.map(record => [
    record.name,
    record.position,
    record.date,
    record.clockIn || "Not recorded",
    record.clockOut || "Not recorded",
    record.status
  ]);
  
  // Add table using the imported autoTable function
  autoTable(doc, {
    startY: 35,
    head: [['Name', 'Position', 'Date', 'Clock In', 'Clock Out', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [220, 53, 69], // Red color for header
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 }
    }
  });
  
  // Save the PDF
  doc.save('attendance-records.pdf');
} 