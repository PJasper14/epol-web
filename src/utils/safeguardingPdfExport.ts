import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Incident } from '@/app/dashboard/safeguarding/IncidentContext';

// Function to generate and download PDF report of safeguarding incidents
export const generateSafeguardingPDF = async (incidents: Incident[]): Promise<boolean> => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Logo paths
    const cabuyaoLogoPath = '/images/CABUYAO LOGO.jpg';
    const epolLogoPath = '/images/EPOL LOGO.jpg';
    
    try {
      // Load both logos and generate PDF when ready
      const [cabuyaoLogo, epolLogo] = await loadLogos(cabuyaoLogoPath, epolLogoPath);
      generatePDFWithLogos(doc, pageWidth, cabuyaoLogo, epolLogo, incidents);
    } catch (error) {
      console.error('Error loading logos:', error);
      generatePDFWithoutLogos(doc, pageWidth, incidents);
    }
      
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Helper function to load both logos
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
    
    // Set the source to start loading
    cabuyaoLogo.src = cabuyaoLogoPath;
    epolLogo.src = epolLogoPath;
  });
}

// Generate PDF with both logos
function generatePDFWithLogos(
  doc: jsPDF, 
  pageWidth: number, 
  cabuyaoLogo: HTMLImageElement, 
  epolLogo: HTMLImageElement, 
  incidents: Incident[]
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
    generatePDFContent(doc, pageWidth, incidents, Math.max(cabuyaoLogoHeight, epolLogoHeight));
  } catch (error) {
    console.error('Error adding logos to PDF:', error);
    generatePDFWithoutLogos(doc, pageWidth, incidents);
  }
}

// Generate PDF without logos if loading fails
function generatePDFWithoutLogos(doc: jsPDF, pageWidth: number, incidents: Incident[]) {
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
  
  // Continue with the rest of the PDF content, using 30 as the default logo height
  generatePDFContent(doc, pageWidth, incidents, 30);
}

// Common PDF content generation
function generatePDFContent(doc: jsPDF, pageWidth: number, incidents: Incident[], logoHeight: number) {
  // Position titles to be aligned with the logos vertically
  const titleY = 10 + logoHeight / 2;
  
  // Add title and header text - aligned with logos
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('CITY OF CABUYAO', pageWidth / 2, titleY - 5, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Environmental Safeguarding Incident Report', pageWidth / 2, titleY + 5, { align: 'center' });
  
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
  doc.text('Incident Summary:', 15, 10 + logoHeight + 30);
  doc.setFont('helvetica', 'normal');
  
  const totalIncidents = incidents.length;
  const pendingIncidents = incidents.filter(incident => incident.status === 'Pending').length;
  const ongoingIncidents = incidents.filter(incident => incident.status === 'Ongoing').length;
  const resolvedIncidents = incidents.filter(incident => incident.status === 'Resolved').length;
  
  const lowPriority = incidents.filter(incident => (incident.priority || 'Low') === 'Low').length;
  const mediumPriority = incidents.filter(incident => incident.priority === 'Medium').length;
  const highPriority = incidents.filter(incident => incident.priority === 'High').length;
  
  doc.text(`Total Incidents: ${totalIncidents}`, 15, 10 + logoHeight + 40);
  doc.text(`Pending: ${pendingIncidents}`, 15, 10 + logoHeight + 48);
  doc.text(`Ongoing: ${ongoingIncidents}`, 15, 10 + logoHeight + 56);
  doc.text(`Resolved: ${resolvedIncidents}`, 15, 10 + logoHeight + 64);
  
  doc.text(`Low Priority: ${lowPriority}`, 15, 10 + logoHeight + 72);
  doc.text(`Medium Priority: ${mediumPriority}`, 15, 10 + logoHeight + 80);
  doc.text(`High Priority: ${highPriority}`, 15, 10 + logoHeight + 88);
  
  // Create the incident table data
  const tableData = incidents.map(incident => {
    // Format the status with an appropriate color (this will be used in the table)
    let status = incident.status;
    let priority = incident.priority || 'Low';
    
    return [
      incident.id,
      incident.title,
      incident.location,
      `${incident.date} ${incident.time}`,
      incident.reportedBy,
      priority,
      status,
      incident.lastUpdated ? new Date(incident.lastUpdated).toLocaleDateString() : 'N/A'
    ];
  });
  
  // Create the incident table
  autoTable(doc, {
    head: [['ID', 'Incident', 'Location', 'Date & Time', 'Reported By', 'Priority', 'Status', 'Last Updated']],
    body: tableData,
    startY: 10 + logoHeight + 95,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 'auto' }, // ID
      1: { cellWidth: 'auto' }, // Title
      2: { cellWidth: 'auto' }, // Location
      3: { cellWidth: 'auto' }, // Date & Time
      4: { cellWidth: 'auto' }, // Reporter
      5: { cellWidth: 'auto', fontStyle: 'bold' }, // Priority
      6: { cellWidth: 'auto', fontStyle: 'bold' }, // Status
      7: { cellWidth: 'auto' }  // Last Updated
    },
    didDrawCell: (data) => {
      // Color the priority and status cells based on value
      if (data.cell.section === 'body') {
        const cellValue = data.cell.raw as string;
        
        // Save current text color
        const currentColor = doc.getTextColor();
        
        // Apply color based on priority (column 5)
        if (data.column.index === 5) {
          if (cellValue === 'Low') {
            doc.setTextColor(16, 185, 129); // Green
          } else if (cellValue === 'Medium') {
            doc.setTextColor(247, 144, 9); // Orange/yellow
          } else if (cellValue === 'High') {
            doc.setTextColor(220, 53, 69); // Red
          }
        }
        // Apply color based on status (column 6)
        else if (data.column.index === 6) {
          if (cellValue === 'Pending') {
            doc.setTextColor(247, 144, 9); // Orange/yellow
          } else if (cellValue === 'Ongoing') {
            doc.setTextColor(59, 130, 246); // Blue
          } else if (cellValue === 'Resolved') {
            doc.setTextColor(16, 185, 129); // Green
          }
        }
        
        // We've already modified the cell's appearance, restore color for next cells
        doc.setTextColor(currentColor);
      }
    }
  });
  
  // Add footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('EPOL Safeguarding System', 15, doc.internal.pageSize.height - 10);
  
  // Current date and time
  const now = new Date();
  doc.text(
    `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 
    pageWidth - 15, 
    doc.internal.pageSize.height - 10, 
    { align: 'right' }
  );
  
  // Save the PDF
  doc.save('EPOL_Safeguarding_Report.pdf');
} 