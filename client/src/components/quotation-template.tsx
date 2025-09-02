import jsPDF from 'jspdf';

interface QuotationData {
  id: string;
  quotationNumber: string;
  quotationDate: Date;
  client: {
    id: string;
    name: string;
    gstNumber?: string;
    address?: string;
    state?: string;
    pinCode?: string;
    mobileNumber?: string;
    email?: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    gstAmount?: number;
    totalAmount: number;
  }>;
  subtotal: number;
  gstAmount: number;
  total: number;
  validityPeriod: number;
  termsAndConditions?: string;
  salesPersonName?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  destination?: string;
  loadingFrom?: string;
  freight?: number;
  transportCharges?: {
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  };
}

export function generateBitumenQuotationPDF(quotationData: QuotationData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  // Colors
  const redAccent = [220, 50, 47]; // Red accent color
  const lightGray = [240, 240, 240];
  const black = [0, 0, 0];
  
  // Helper functions
  const addText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    if (options?.align === 'center') {
      doc.text(text, x, y, { align: 'center' });
    } else if (options?.align === 'right') {
      doc.text(text, x, y, { align: 'right' });
    } else {
      doc.text(text, x, y);
    }
  };

  const addRedText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    doc.setTextColor(redAccent[0], redAccent[1], redAccent[2]);
    addText(text, x, y, options);
    doc.setTextColor(black[0], black[1], black[2]); // Reset to black
  };
  
  let currentY = margin;
  
  // Header Section - Company logo on left, details on right
  const headerHeight = 35;
  
  // Company Logo (left side) - Simple HM logo
  doc.setFillColor(redAccent[0], redAccent[1], redAccent[2]);
  doc.circle(margin + 15, currentY + 17, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  addText('HM', margin + 11, currentY + 20);
  
  // Company details (right side)
  const detailsX = margin + contentWidth - 100;
  doc.setTextColor(redAccent[0], redAccent[1], redAccent[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  addText('M/S SRI HM BITUMEN CO', detailsX, currentY + 8);
  
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  addText('Dag No: 1071, Patta No: 264, Mkirpara', detailsX, currentY + 14);
  addText('Chakardaigaon, Guwahati, Assam - 781035', detailsX, currentY + 18);
  addText('GST: 18CGMPP6536N2ZG', detailsX, currentY + 22);
  addText('Mobile: +91 8453059698', detailsX, currentY + 26);
  addText('Email: info.srihmbitumen@gmail.com', detailsX, currentY + 30);
  
  currentY += headerHeight + 10;
  
  // Main title - centered
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  addRedText('Sales Order', pageWidth/2, currentY, { align: 'center' });
  currentY += 15;
  
  // Top info boxes - 6 boxes in one row
  const boxHeight = 20;
  const boxWidth = contentWidth / 6;
  const boxes = [
    { label: 'Sales Order No', value: quotationData.quotationNumber },
    { label: 'Sales Order Date', value: quotationData.quotationDate.toLocaleDateString('en-GB') },
    { label: 'Delivery Terms', value: quotationData.deliveryTerms || 'Standard terms' },
    { label: 'Destination', value: quotationData.destination || 'As per requirement' },
    { label: 'Loading From', value: quotationData.loadingFrom || 'Kandla' },
    { label: 'Payment Terms', value: quotationData.paymentTerms || '30 Days Credit' }
  ];
  
  // Draw headers with red background
  doc.setFillColor(redAccent[0], redAccent[1], redAccent[2]);
  for (let i = 0; i < boxes.length; i++) {
    const x = margin + i * boxWidth;
    doc.rect(x, currentY, boxWidth, boxHeight/2, 'F');
    doc.setDrawColor(black[0], black[1], black[2]);
    doc.rect(x, currentY, boxWidth, boxHeight/2);
  }
  
  // Add header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  for (let i = 0; i < boxes.length; i++) {
    const x = margin + i * boxWidth;
    addText(boxes[i].label, x + boxWidth/2, currentY + 7, { align: 'center' });
  }
  
  currentY += boxHeight/2;
  
  // Draw value boxes
  doc.setFillColor(255, 255, 255);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  for (let i = 0; i < boxes.length; i++) {
    const x = margin + i * boxWidth;
    doc.rect(x, currentY, boxWidth, boxHeight/2, 'F');
    doc.rect(x, currentY, boxWidth, boxHeight/2);
    
    // Wrap long text
    const text = boxes[i].value;
    if (text.length > 12) {
      const words = text.split(' ');
      if (words.length > 1) {
        addText(words[0], x + boxWidth/2, currentY + 4, { align: 'center' });
        addText(words.slice(1).join(' '), x + boxWidth/2, currentY + 8, { align: 'center' });
      } else {
        addText(text.substring(0, 12), x + boxWidth/2, currentY + 6, { align: 'center' });
      }
    } else {
      addText(text, x + boxWidth/2, currentY + 6, { align: 'center' });
    }
  }
  
  currentY += boxHeight/2 + 10;
  
  // Bill To / Ship To section
  const halfWidth = contentWidth / 2;
  const clientSectionHeight = 45;
  
  // Headers
  doc.setFillColor(redAccent[0], redAccent[1], redAccent[2]);
  doc.rect(margin, currentY, halfWidth - 1, 12, 'F');
  doc.rect(margin + halfWidth + 1, currentY, halfWidth - 1, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  addText('Bill To', margin + 5, currentY + 8);
  addText('Ship To', margin + halfWidth + 6, currentY + 8);
  
  currentY += 12;
  
  // Content boxes
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, currentY, halfWidth - 1, clientSectionHeight, 'F');
  doc.rect(margin + halfWidth + 1, currentY, halfWidth - 1, clientSectionHeight, 'F');
  doc.setDrawColor(black[0], black[1], black[2]);
  doc.rect(margin, currentY, halfWidth - 1, clientSectionHeight);
  doc.rect(margin + halfWidth + 1, currentY, halfWidth - 1, clientSectionHeight);
  
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  let clientY = currentY + 6;
  const leftX = margin + 3;
  const rightX = margin + halfWidth + 4;
  
  // Client details - both sides get same data
  const clientFields = [
    { label: 'Name', value: quotationData.client.name },
    { label: 'Tax/GST No', value: quotationData.client.gstNumber || 'N/A' },
    { label: 'Address', value: quotationData.client.address || 'N/A' },
    { label: 'State', value: quotationData.client.state || 'N/A' },
    { label: 'Pin Code', value: quotationData.client.pinCode || 'N/A' },
    { label: 'Mobile', value: quotationData.client.mobileNumber || 'N/A' },
    { label: 'Email', value: quotationData.client.email || 'N/A' }
  ];
  
  for (const field of clientFields) {
    addText(`${field.label}: ${field.value}`, leftX, clientY);
    addText(`${field.label}: ${field.value}`, rightX, clientY);
    clientY += 6;
  }
  
  currentY += clientSectionHeight + 10;
  
  // Items Table
  const tableHeaders = ['Item #', 'Item Name/Description', 'Qty', 'Unit', 'Ex-Factory Rate', 'Amount (₹)', 'Tax %', 'Total Amount (₹)'];
  const colWidths = [15, 50, 15, 15, 25, 25, 15, 30]; // Adjusted widths
  let colPositions = [margin];
  for (let i = 0; i < colWidths.length - 1; i++) {
    colPositions.push(colPositions[i] + colWidths[i]);
  }
  
  const tableHeaderHeight = 12;
  
  // Table headers
  doc.setFillColor(redAccent[0], redAccent[1], redAccent[2]);
  doc.rect(margin, currentY, contentWidth, tableHeaderHeight, 'F');
  doc.setDrawColor(black[0], black[1], black[2]);
  doc.rect(margin, currentY, contentWidth, tableHeaderHeight);
  
  // Column separators
  for (let i = 1; i < colPositions.length; i++) {
    doc.line(colPositions[i], currentY, colPositions[i], currentY + tableHeaderHeight);
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  for (let i = 0; i < tableHeaders.length; i++) {
    const x = colPositions[i] + 2;
    addText(tableHeaders[i], x, currentY + 8);
  }
  
  currentY += tableHeaderHeight;
  
  // Table rows
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const rowHeight = 12;
  
  quotationData.items.forEach((item, index) => {
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
    }
    
    doc.setDrawColor(black[0], black[1], black[2]);
    doc.rect(margin, currentY, contentWidth, rowHeight);
    
    // Column separators
    for (let i = 1; i < colPositions.length; i++) {
      doc.line(colPositions[i], currentY, colPositions[i], currentY + rowHeight);
    }
    
    // Data
    addText((index + 1).toString(), colPositions[0] + 2, currentY + 7);
    addText(item.description, colPositions[1] + 2, currentY + 7);
    addText(item.quantity.toString(), colPositions[2] + 2, currentY + 7);
    addText(item.unit, colPositions[3] + 2, currentY + 7);
    addText(item.rate.toFixed(0), colPositions[4] + 2, currentY + 7);
    addText(item.amount.toFixed(0), colPositions[5] + 2, currentY + 7);
    addText('18%', colPositions[6] + 2, currentY + 7);
    addText(item.totalAmount.toFixed(0), colPositions[7] + 2, currentY + 7);
    
    currentY += rowHeight;
  });
  
  // Transport charges row if present
  if (quotationData.transportCharges) {
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
    doc.rect(margin, currentY, contentWidth, rowHeight);
    
    for (let i = 1; i < colPositions.length; i++) {
      doc.line(colPositions[i], currentY, colPositions[i], currentY + rowHeight);
    }
    
    addText((quotationData.items.length + 1).toString(), colPositions[0] + 2, currentY + 7);
    addText('Transport Charges', colPositions[1] + 2, currentY + 7);
    addText(quotationData.transportCharges.quantity.toString(), colPositions[2] + 2, currentY + 7);
    addText(quotationData.transportCharges.unit, colPositions[3] + 2, currentY + 7);
    addText(quotationData.transportCharges.rate.toFixed(0), colPositions[4] + 2, currentY + 7);
    addText(quotationData.transportCharges.amount.toFixed(0), colPositions[5] + 2, currentY + 7);
    addText('-', colPositions[6] + 2, currentY + 7);
    addText(quotationData.transportCharges.amount.toFixed(0), colPositions[7] + 2, currentY + 7);
    
    currentY += rowHeight;
  }
  
  currentY += 10;
  
  // Summary block - right aligned
  const summaryWidth = 60;
  const summaryX = margin + contentWidth - summaryWidth;
  const summaryRowHeight = 10;
  
  const summaryItems = [
    { label: 'Sub-Total', value: quotationData.subtotal },
    { label: 'Freight/Transport', value: quotationData.freight || 0 },
    { label: 'Tax Total', value: quotationData.gstAmount },
    { label: 'Grand Total', value: quotationData.total, isBold: true }
  ];
  
  summaryItems.forEach((item, index) => {
    if (item.isBold) {
      doc.setFillColor(redAccent[0], redAccent[1], redAccent[2]);
      doc.rect(summaryX, currentY, summaryWidth, summaryRowHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(summaryX, currentY, summaryWidth, summaryRowHeight, 'F');
      doc.setTextColor(black[0], black[1], black[2]);
      doc.setFont('helvetica', 'normal');
    }
    
    doc.rect(summaryX, currentY, summaryWidth, summaryRowHeight);
    doc.setFontSize(9);
    addText(item.label, summaryX + 2, currentY + 7);
    addText(`₹${item.value.toFixed(0)}`, summaryX + summaryWidth - 2, currentY + 7, { align: 'right' });
    
    currentY += summaryRowHeight;
  });
  
  currentY += 10;
  
  // Sales person & notes
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  addText('Sales Person Name:', margin, currentY);
  addText(quotationData.salesPersonName || 'System Administrator', margin + 35, currentY);
  currentY += 8;
  
  doc.setFont('helvetica', 'normal');
  addText('Description/Notes:', margin, currentY);
  currentY += 5;
  doc.setFontSize(7);
  addText('Payment terms shown here do not include transport unless stated.', margin, currentY);
  currentY += 10;
  
  // Terms & Conditions
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  addRedText('Terms & Conditions', margin, currentY);
  currentY += 8;
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const terms = [
    '• Payment should be made within one day of billing',
    '• In case of late payment, credit limit will be reduced by 10%',
    '• Interest of 24% per annum (2% per month) charged on overdue amounts',
    '• All payments must be made by A/C Payee cheque only',
    '• Subject to Guwahati jurisdiction only'
  ];
  
  terms.forEach(term => {
    addText(term, margin, currentY);
    currentY += 5;
  });
  
  currentY += 5;
  
  // Bank Details - boxed
  const bankWidth = 80;
  const bankHeight = 25;
  
  doc.setFillColor(redAccent[0], redAccent[1], redAccent[2]);
  doc.rect(margin, currentY, bankWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  addText('Bank Details', margin + 2, currentY + 6);
  
  currentY += 8;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, currentY, bankWidth, bankHeight - 8, 'F');
  doc.rect(margin, currentY, bankWidth, bankHeight - 8);
  
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  addText('Bank Name: State Bank of India', margin + 2, currentY + 5);
  addText('Account No: 40464693538', margin + 2, currentY + 9);
  addText('Branch: Paltan Bazar', margin + 2, currentY + 13);
  addText('IFSC Code: SBIN0040464', margin + 2, currentY + 17);
  
  currentY += bankHeight + 10;
  
  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  addText('Email: info.srihmbitumen@gmail.com | Phone: +91 8453059698', margin, currentY);
  
  const signatureY = currentY + 15;
  addText('Authorized Signatory: ________________', margin + contentWidth - 60, signatureY, { align: 'right' });
  
  // Save PDF
  const fileName = `Sales_Order_${quotationData.quotationNumber.replace(/[\/\\]/g, '_')}.pdf`;
  doc.save(fileName);
}