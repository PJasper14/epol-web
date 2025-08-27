import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem } from '@/contexts/InventoryContext';
import { PurchaseOrder } from '@/contexts/PurchaseOrderContext';

// Function to generate and download PDF report of inventory items
export const generateInventoryPDF = (inventoryItems: InventoryItem[]) => {
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
        generatePDFWithLogos(doc, pageWidth, cabuyaoLogo, epolLogo, inventoryItems);
      })
      .catch((error) => {
        console.error('Error loading logos:', error);
        generatePDFWithoutLogos(doc, pageWidth, inventoryItems);
      });
      
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
  inventoryItems: InventoryItem[]
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
    generatePDFContent(doc, pageWidth, inventoryItems, Math.max(cabuyaoLogoHeight, epolLogoHeight));
  } catch (error) {
    console.error('Error adding logos to PDF:', error);
    generatePDFWithoutLogos(doc, pageWidth, inventoryItems);
  }
}

// Generate PDF without logos if loading fails
function generatePDFWithoutLogos(doc: jsPDF, pageWidth: number, inventoryItems: InventoryItem[]) {
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
  generatePDFContent(doc, pageWidth, inventoryItems, 30);
}

// Common PDF content generation
function generatePDFContent(doc: jsPDF, pageWidth: number, inventoryItems: InventoryItem[], logoHeight: number) {
  // Position titles to be aligned with the logos vertically
  // The top margin is 10, so we'll position the text between the logos
  const titleY = 10 + logoHeight / 2;
  
  // Add title and header text - aligned with logos
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('CITY OF CABUYAO', pageWidth / 2, titleY - 5, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Environmental Police (EPOL)', pageWidth / 2, titleY + 5, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Inventory Report Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, titleY + 15, { align: 'center' });
  
  // Add a line to separate header from content
  doc.setDrawColor(220, 53, 69); // Red color
  doc.setLineWidth(0.5);
  doc.line(15, 10 + logoHeight + 15, pageWidth - 15, 10 + logoHeight + 15);
  
  // Add summary information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Summary:', 15, 10 + logoHeight + 30);
  doc.setFont('helvetica', 'normal');
  
  const totalItems = inventoryItems.length;
  const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventoryItems.filter(item => 
    item.quantity > 0 && item.quantity < item.threshold
  ).length;
  const outOfStockItems = inventoryItems.filter(item => item.quantity === 0).length;
  
  doc.text(`Total Items: ${totalItems}`, 15, 10 + logoHeight + 40);
  doc.text(`Total Quantity: ${totalQuantity}`, 15, 10 + logoHeight + 48);
  doc.text(`Low Stock Items: ${lowStockItems}`, 15, 10 + logoHeight + 56);
  doc.text(`Out of Stock Items: ${outOfStockItems}`, 15, 10 + logoHeight + 64);
  
  // Calculate status for each item
  const tableData = inventoryItems.map(item => {
    const status = item.quantity === 0 
      ? "Out of Stock" 
      : item.quantity < item.threshold 
        ? "Low Stock" 
        : "In Stock";
        
    return [
      item.id,
      item.name,
      item.quantity.toString(),
      item.unit,
      status,
      item.lastUpdated
    ];
  });
  
  // Create the inventory table
  autoTable(doc, {
    head: [['ID', 'Item Name', 'Quantity', 'Unit', 'Status', 'Last Updated']],
    body: tableData,
    startY: 10 + logoHeight + 75,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Calculate Y position for signature section above the footer
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerHeight = 30; // Space for footer and generated on
  const signatureBlockHeight = 36; // Height for signature block
  const signatureY = pageHeight - footerHeight - signatureBlockHeight + 10;
  const leftX = 30;
  const rightX = pageWidth - 100;

  // Left (Submitted)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Submitted:', leftX, signatureY);
  doc.text('Approved:', rightX, signatureY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Mary Hope E. Delgado', leftX, signatureY + 18);
  doc.text('Officer In Charge', leftX, signatureY + 24);
  doc.text('Environmental Police (EPOL)', leftX, signatureY + 30);

  doc.text('Hon. Dennis Felipe C. Hain', rightX, signatureY + 18);
  doc.text('City Mayor', rightX, signatureY + 24);
  doc.text('City of Cabuyao', rightX, signatureY + 30);
  
  // Add footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('EPOL Inventory Management System', 15, doc.internal.pageSize.height - 10);
  
  // Current date and time
  const now = new Date();
  doc.text(
    `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 
    pageWidth - 15, 
    doc.internal.pageSize.height - 10, 
    { align: 'right' }
  );
  
  // Save the PDF
  doc.save('EPOL_Inventory_Report.pdf');
}

// Function to generate and download PDF for purchase orders
export const generatePurchaseOrderPDF = (purchaseOrder: PurchaseOrder) => {
  return new Promise((resolve) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const cabuyaoLogoPath = '/images/CABUYAO LOGO.jpg';
      const epolLogoPath = '/images/EPOL LOGO.jpg';
      loadLogos(cabuyaoLogoPath, epolLogoPath)
        .then(([cabuyaoLogo, epolLogo]) => {
          generatePurchaseOrderPDFWithLogos(doc, pageWidth, cabuyaoLogo, epolLogo, purchaseOrder);
          resolve(true);
        })
        .catch((error) => {
          console.error('Error loading logos:', error);
          generatePurchaseOrderPDFWithoutLogos(doc, pageWidth, purchaseOrder);
          resolve(false);
        });
    } catch (error) {
      console.error('Error generating PDF:', error);
      resolve(false);
    }
  });
};

// Generate PDF with both logos for purchase order
function generatePurchaseOrderPDFWithLogos(
  doc: jsPDF, 
  pageWidth: number, 
  cabuyaoLogo: HTMLImageElement, 
  epolLogo: HTMLImageElement, 
  purchaseOrder: PurchaseOrder
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
    generatePurchaseOrderPDFContent(doc, pageWidth, purchaseOrder, Math.max(cabuyaoLogoHeight, epolLogoHeight));
  } catch (error) {
    console.error('Error adding logos to PDF:', error);
    generatePurchaseOrderPDFWithoutLogos(doc, pageWidth, purchaseOrder);
  }
}

// Generate PDF without logos if loading fails for purchase order
function generatePurchaseOrderPDFWithoutLogos(doc: jsPDF, pageWidth: number, purchaseOrder: PurchaseOrder) {
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
  generatePurchaseOrderPDFContent(doc, pageWidth, purchaseOrder, 30);
}

// Common PDF content generation for purchase order
function generatePurchaseOrderPDFContent(doc: jsPDF, pageWidth: number, purchaseOrder: PurchaseOrder, logoHeight: number) {
  // Position titles to be aligned with the logos vertically
  const titleY = 10 + logoHeight / 2;
  
  // Add title and header text - aligned with logos
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('CITY OF CABUYAO', pageWidth / 2, titleY - 5, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Environmental Police (EPOL)', pageWidth / 2, titleY + 5, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Purchase Order Request', pageWidth / 2, titleY + 15, { align: 'center' });

  // Red line below header
  doc.setDrawColor(220, 53, 69); // Red color
  doc.setLineWidth(0.5);
  doc.line(15, 10 + logoHeight + 15, pageWidth - 15, 10 + logoHeight + 15);

  // Recipient and subject block
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${purchaseOrder.orderDate}`, 15, 10 + logoHeight + 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Hon. Dennis Felipe C. Hain', 15, 10 + logoHeight + 38);
  doc.text('City Mayor', 15, 10 + logoHeight + 44);
  doc.text('City of Cabuyao Laguna', 15, 10 + logoHeight + 50);
  doc.text('Sub: Letter/Order Request', 15, 10 + logoHeight + 56);

  doc.setFont('helvetica', 'normal');
  doc.text('Dear Hon. Mayor Dennis,', 15, 10 + logoHeight + 64);

  // Reason for request (notes)
  const maxWidth = pageWidth - 30;
  const splitNotes = doc.splitTextToSize(purchaseOrder.notes || "", maxWidth);
  doc.text(splitNotes, 15, 10 + logoHeight + 72);
  // Calculate additional space needed for notes
  const notesHeight = splitNotes.length * 5;
  // Create the items table (red and white only)
  const tableData = purchaseOrder.items.map(item => [
    item.itemId,
    item.itemName,
    item.quantity.toString(),
    item.unit
  ]);

  // Add total row
  const totalItems = purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  autoTable(doc, {
    head: [['Item ID', 'Item Name', 'Quantity', 'Unit']],
    body: tableData,
    startY: 10 + logoHeight + 76 + notesHeight,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] }, // Red header, white text
    bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },     // White rows, black text
    alternateRowStyles: { fillColor: [255, 255, 255] },                   // No gray/green
    footStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255], fontStyle: 'bold' }, // Red footer, white text
    foot: [['Total', '', totalItems.toString(), '']]
  });
  
  // Calculate Y position for signature section above the footer
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerHeight = 30; // Space for footer and generated on
  const signatureBlockHeight = 36; // Height for signature block
  const signatureY = pageHeight - footerHeight - signatureBlockHeight + 10;
  const leftX = 30;
  const rightX = pageWidth - 100;

  // Left (Submitted)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Submitted:', leftX, signatureY);
  doc.text('Approved:', rightX, signatureY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Mary Hope E. Delgado', leftX, signatureY + 18);
  doc.text('Officer In Charge', leftX, signatureY + 24);
  doc.text('Environmental Police (EPOL)', leftX, signatureY + 30);

  doc.text('Hon. Dennis Felipe C. Hain', rightX, signatureY + 18);
  doc.text('City Mayor', rightX, signatureY + 24);
  doc.text('City of Cabuyao', rightX, signatureY + 30);
  
  // Add footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('EPOL Inventory Management System', 15, doc.internal.pageSize.height - 10);
  
  // Current date and time
  const now = new Date();
  doc.text(
    `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 
    pageWidth - 15, 
    doc.internal.pageSize.height - 10, 
    { align: 'right' }
  );
  
  // Save the PDF
  doc.save(`EPOL_Purchase_Order_${purchaseOrder.orderDate}.pdf`);
}

// Function to generate and download PDF for inventory requests
export const generateInventoryRequestPDF = (inventoryRequest: any) => {
  return new Promise((resolve) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const cabuyaoLogoPath = '/images/CABUYAO LOGO.jpg';
      const epolLogoPath = '/images/EPOL LOGO.jpg';
      
      loadLogos(cabuyaoLogoPath, epolLogoPath)
        .then(([cabuyaoLogo, epolLogo]) => {
          generateInventoryRequestPDFWithLogos(doc, pageWidth, cabuyaoLogo, epolLogo, inventoryRequest);
          resolve(true);
        })
        .catch((error) => {
          console.error('Error loading logos:', error);
          generateInventoryRequestPDFWithoutLogos(doc, pageWidth, inventoryRequest);
          resolve(false);
        });
    } catch (error) {
      console.error('Error generating PDF:', error);
      resolve(false);
    }
  });
};

// Generate PDF with both logos for inventory request
function generateInventoryRequestPDFWithLogos(
  doc: jsPDF, 
  pageWidth: number, 
  cabuyaoLogo: HTMLImageElement, 
  epolLogo: HTMLImageElement, 
  inventoryRequest: any
) {
  try {
    const logoWidth = 30;
    
    const cabuyaoLogoHeight = cabuyaoLogo.height * (logoWidth / cabuyaoLogo.width);
    doc.addImage(cabuyaoLogo, 'JPEG', 15, 10, logoWidth, cabuyaoLogoHeight);
    
    const epolLogoHeight = epolLogo.height * (logoWidth / epolLogo.width);
    doc.addImage(epolLogo, 'JPEG', pageWidth - logoWidth - 15, 10, logoWidth, epolLogoHeight);
    
    generateInventoryRequestPDFContent(doc, pageWidth, inventoryRequest, Math.max(cabuyaoLogoHeight, epolLogoHeight));
  } catch (error) {
    console.error('Error adding logos to PDF:', error);
    generateInventoryRequestPDFWithoutLogos(doc, pageWidth, inventoryRequest);
  }
}

// Generate PDF without logos if loading fails for inventory request
function generateInventoryRequestPDFWithoutLogos(doc: jsPDF, pageWidth: number, inventoryRequest: any) {
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, 10, 30, 30, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('CABUYAO LOGO', 30, 25, { align: 'center' });
  
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(pageWidth - 45, 10, 30, 30, 3, 3, 'F');
  doc.text('EPOL LOGO', pageWidth - 30, 25, { align: 'center' });
  
  generateInventoryRequestPDFContent(doc, pageWidth, inventoryRequest, 30);
}

// Common PDF content generation for inventory request
function generateInventoryRequestPDFContent(doc: jsPDF, pageWidth: number, inventoryRequest: any, logoHeight: number) {
  const titleY = 10 + logoHeight / 2;
  
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('CITY OF CABUYAO', pageWidth / 2, titleY - 5, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Environmental Police (EPOL)', pageWidth / 2, titleY + 5, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Inventory Request Form', pageWidth / 2, titleY + 15, { align: 'center' });

  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(0.5);
  doc.line(15, 10 + logoHeight + 15, pageWidth - 15, 10 + logoHeight + 15);

  let currentY = 10 + logoHeight + 25;

  // Request details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Request Details:', 15, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Request ID: ${inventoryRequest.id}`, 15, currentY);
  currentY += 6;
  doc.text(`Request Date: ${new Date(inventoryRequest.request_date).toLocaleDateString()}`, 15, currentY);
  currentY += 6;
  doc.text(`Team Leader: ${inventoryRequest.user.name}`, 15, currentY);
  currentY += 6;
  doc.text(`Status: ${inventoryRequest.status.charAt(0).toUpperCase() + inventoryRequest.status.slice(1)}`, 15, currentY);
  currentY += 12;

  // Reason
  doc.setFont('helvetica', 'bold');
  doc.text('Reason for Request:', 15, currentY);
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  const maxWidth = pageWidth - 30;
  const splitReason = doc.splitTextToSize(inventoryRequest.reason, maxWidth);
  doc.text(splitReason, 15, currentY);
  currentY += splitReason.length * 5 + 8;

  // Admin notes if exists
  if (inventoryRequest.admin_notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Admin Notes:', 15, currentY);
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(inventoryRequest.admin_notes, maxWidth);
    doc.text(splitNotes, 15, currentY);
    currentY += splitNotes.length * 5 + 8;
  }

  // Requested items table
  const tableData = inventoryRequest.items.map((item: any) => [
    item.inventory_item.id,
    item.inventory_item.name,
    item.quantity.toString(),
    item.inventory_item.unit,
    item.current_stock.toString(),
    item.threshold.toString()
  ]);

  autoTable(doc, {
    head: [['Item ID', 'Item Name', 'Requested Qty', 'Unit', 'Current Stock', 'Threshold']],
    body: tableData,
    startY: currentY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
    bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [255, 255, 255] }
  });

  // Calculate Y position for signature section
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerHeight = 30;
  const signatureBlockHeight = 36;
  const signatureY = pageHeight - footerHeight - signatureBlockHeight + 10;
  const leftX = 30;
  const rightX = pageWidth - 100;

  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Submitted:', leftX, signatureY);
  doc.text('Approved:', rightX, signatureY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(inventoryRequest.user.name, leftX, signatureY + 18);
  doc.text('Team Leader', leftX, signatureY + 24);
  doc.text('Environmental Police (EPOL)', leftX, signatureY + 30);

  doc.text('Hon. Dennis Felipe C. Hain', rightX, signatureY + 18);
  doc.text('City Mayor', rightX, signatureY + 24);
  doc.text('City of Cabuyao', rightX, signatureY + 30);
  
  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('EPOL Inventory Management System', 15, doc.internal.pageSize.height - 10);
  
  const now = new Date();
  doc.text(
    `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 
    pageWidth - 15, 
    doc.internal.pageSize.height - 10, 
    { align: 'right' }
  );
  
  doc.save(`EPOL_Inventory_Request_${inventoryRequest.id}.pdf`);
}