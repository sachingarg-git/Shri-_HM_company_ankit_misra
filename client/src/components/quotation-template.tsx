import React from "react";
import { jsPDF } from "jspdf";

interface QuotationData {
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
  deliveryTerms?: string;
  paymentTerms?: string;
  destination?: string;
  loadingFrom?: string;
  client: {
    name: string;
    gstNumber?: string;
    address?: string;
    state?: string;
    pinCode?: string;
    mobileNumber?: string;
    email?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    gstRate?: number;
    gstAmount?: number;
    totalAmount: number;
  }>;
  transportCharges?: {
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  };
  salesPersonName?: string;
  description?: string;
  note?: string;
  subtotal: number;
  freight: number;
  total: number;
  companyDetails: {
    name: string;
    address: string;
    gstNumber: string;
    mobile: string;
    email: string;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      branch: string;
      ifscCode: string;
    };
  };
}

export const generateBitumenQuotationPDF = (quotationData: QuotationData) => {
  const doc = new jsPDF();
  
  // Page setup
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  let currentY = margin;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options);
  };

  // Helper function to add white text on dark background
  const addWhiteText = (text: string, x: number, y: number, options?: any) => {
    doc.setTextColor(255, 255, 255);
    doc.text(text, x, y, options);
  };

  // Helper function to add bold text
  const addBoldText = (text: string, x: number, y: number, options?: any) => {
    doc.setFont('helvetica', 'bold');
    doc.text(text, x, y, options);
    doc.setFont('helvetica', 'normal');
  };

  // Set white background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header section with logo and company details
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 35, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(margin, currentY, pageWidth - 2 * margin, 35);

  // Company logo placeholder (orange circle with HM)
  doc.setFillColor(255, 165, 0);
  doc.circle(margin + 15, currentY + 17, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  addText('HM', margin + 11, currentY + 20);

  // Company name in RED and details
  doc.setTextColor(220, 20, 20); // Red color matching the image
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  addText('M/S SRI HM BITUMEN CO', margin + 35, currentY + 12);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  addText('Dag No : 1071, Patta No : 264, Mkirpara, Chakardaigaon', margin + 35, currentY + 18);
  addText('Mouza - Ramcharani, Guwahati, Assam - 781035', margin + 35, currentY + 22);
  addText('GST No : 18CGMPP6536N2ZG', margin + 35, currentY + 26);
  addText('Mobile No : +91 8453059698', margin + 35, currentY + 30);
  addText('Email ID : info.srihmbitumen@gmail.com', margin + 35, currentY + 34);

  currentY += 40;

  // Quotation title in red with dark background
  doc.setFillColor(70, 70, 70); // Dark background
  doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
  doc.setTextColor(220, 20, 20); // Red text
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  addText('Quotation', pageWidth / 2, currentY + 8, { align: 'center' });
  
  currentY += 17;

  // Professional structured layout matching the sample image
  const tableWidth = pageWidth - 2 * margin;
  const boxHeight = 10;
  const thirdWidth = tableWidth / 3;
  
  // Top section with 3 boxes: Quotation No, Date, Delivery Terms
  // Dark headers
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Quotation No.', margin + 2, currentY + 7);
  addWhiteText('Quotation Date', margin + thirdWidth + 2, currentY + 7);
  addWhiteText('Delivery Terms', margin + 2 * thirdWidth + 2, currentY + 7);
  currentY += boxHeight;
  
  // Values
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.quotationNumber, margin + 2, currentY + 7);
  addText(quotationData.quotationDate.toLocaleDateString('en-GB'), margin + thirdWidth + 2, currentY + 7);
  addText(quotationData.deliveryTerms || 'Within 10 to 12 Days', margin + 2 * thirdWidth + 2, currentY + 7);
  currentY += boxHeight + 3;
  
  // Second row: Payment Terms, Destination, Loading From
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Payment Terms', margin + 2, currentY + 7);
  addWhiteText('Destination', margin + thirdWidth + 2, currentY + 7);
  addWhiteText('Loading From', margin + 2 * thirdWidth + 2, currentY + 7);
  currentY += boxHeight;
  
  // Values
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, thirdWidth, boxHeight * 2, 'F');
  doc.rect(margin + thirdWidth, currentY, thirdWidth, boxHeight * 2, 'F');
  doc.rect(margin + 2 * thirdWidth, currentY, thirdWidth, boxHeight * 2, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.paymentTerms || '30 Days Credit', margin + 2, currentY + 7);
  addText(quotationData.destination || '', margin + thirdWidth + 2, currentY + 7);
  addText(quotationData.loadingFrom || 'Kandla', margin + 2 * thirdWidth + 2, currentY + 7);
  currentY += boxHeight * 2 + 3;
  
  // Bill To and Ship To sections
  const halfWidth = tableWidth / 2;
  const sectionHeight = 40;
  
  // Headers
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, halfWidth, boxHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, boxHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Bill To :', margin + 2, currentY + 7);
  addWhiteText('Ship To :', margin + halfWidth + 2, currentY + 7);
  currentY += boxHeight;
  
  // Client details sections
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, halfWidth, sectionHeight, 'F');
  doc.rect(margin + halfWidth, currentY, halfWidth, sectionHeight, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  
  const clientY = currentY + 3;
  addText(`Name: ${quotationData.client.name}`, margin + 2, clientY);
  addText(`Name: ${quotationData.client.name}`, margin + halfWidth + 2, clientY);
  addText(`GST No: ${quotationData.client.gstNumber || ''}`, margin + 2, clientY + 6);
  addText(`GST No: ${quotationData.client.gstNumber || ''}`, margin + halfWidth + 2, clientY + 6);
  addText(`Address: ${quotationData.client.address || ''}`, margin + 2, clientY + 12);
  addText(`Address: ${quotationData.client.address || ''}`, margin + halfWidth + 2, clientY + 12);
  addText(`State: ${quotationData.client.state || ''}`, margin + 2, clientY + 18);
  addText(`State: ${quotationData.client.state || ''}`, margin + halfWidth + 2, clientY + 18);
  addText(`Pin Code: ${quotationData.client.pinCode || ''}`, margin + 2, clientY + 24);
  addText(`Pin Code: ${quotationData.client.pinCode || ''}`, margin + halfWidth + 2, clientY + 24);
  addText(`Mobile No: ${quotationData.client.mobileNumber || ''}`, margin + 2, clientY + 30);
  addText(`Mobile No: ${quotationData.client.mobileNumber || ''}`, margin + halfWidth + 2, clientY + 30);
  addText(`Email ID: ${quotationData.client.email || ''}`, margin + 2, clientY + 36);
  addText(`Email ID: ${quotationData.client.email || ''}`, margin + halfWidth + 2, clientY + 36);
  
  currentY += sectionHeight + 5;
  
  // Items Table with dark header
  doc.setFontSize(8);
  const itemsTableStartY = currentY;
  const colWidths = [25, 15, 15, 30, 25, 25, 35];
  let colX = margin;

  // Table header with dark background
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, tableWidth, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Item #', colX + 1, currentY + 8);
  colX += colWidths[0];
  addWhiteText('Qty', colX + 1, currentY + 8);
  colX += colWidths[1];
  addWhiteText('Unit', colX + 1, currentY + 8);
  colX += colWidths[2];
  addWhiteText('Ex Factory Rate', colX + 1, currentY + 8);
  colX += colWidths[3];
  addWhiteText('Amount', colX + 1, currentY + 8);
  colX += colWidths[4];
  addWhiteText('GST@18%', colX + 1, currentY + 8);
  colX += colWidths[5];
  addWhiteText('Total Amount(₹)', colX + 1, currentY + 8);
  
  currentY += 12;

  // Items table content
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  
  quotationData.items.forEach((item, index) => {
    colX = margin;
    
    // Item description
    addText(item.description, colX + 1, currentY + 4);
    colX += colWidths[0];
    
    // Quantity
    addText(item.quantity.toString(), colX + 1, currentY + 4);
    colX += colWidths[1];
    
    // Unit
    addText(item.unit, colX + 1, currentY + 4);
    colX += colWidths[2];
    
    // Rate
    addText('₹' + item.rate.toFixed(2), colX + 1, currentY + 4);
    colX += colWidths[3];
    
    // Amount
    addText('₹' + item.amount.toFixed(2), colX + 1, currentY + 4);
    colX += colWidths[4];
    
    // GST
    addText('₹' + (item.amount * 0.18).toFixed(2), colX + 1, currentY + 4);
    colX += colWidths[5];
    
    // Total
    addText('₹' + (item.amount * 1.18).toFixed(2), colX + 1, currentY + 4);
    
    // Add border for row
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, currentY, tableWidth, 8);
    
    currentY += 8;
  });

  // Transport charges if applicable
  if (quotationData.transportCharges) {
    colX = margin;
    addText('Transport Charges', colX + 1, currentY + 4);
    colX += colWidths[0];
    addText(quotationData.transportCharges.quantity.toString(), colX + 1, currentY + 4);
    colX += colWidths[1];
    addText(quotationData.transportCharges.unit, colX + 1, currentY + 4);
    colX += colWidths[2];
    addText(quotationData.transportCharges.rate.toString(), colX + 1, currentY + 4);
    colX += colWidths[3];
    addText(quotationData.transportCharges.amount.toString(), colX + 1, currentY + 4);
    
    doc.rect(margin, currentY, tableWidth, 8);
    currentY += 10;
  }

  currentY += 5;

  // Sales Person Name section with dark header
  doc.setFillColor(70, 70, 70);
  doc.rect(margin, currentY, halfWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  addWhiteText('Sales Person Name:', margin + 2, currentY + 7);
  currentY += boxHeight;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, halfWidth, boxHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText(quotationData.salesPersonName || '', margin + 2, currentY + 7);
  currentY += boxHeight + 5;

  // Description section if available
  if (quotationData.description) {
    doc.setFillColor(70, 70, 70);
    doc.rect(margin, currentY, tableWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    addWhiteText('Description :', margin + 2, currentY + 7);
    currentY += boxHeight;
    
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, tableWidth, boxHeight, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    addText(quotationData.description, margin + 2, currentY + 7);
    currentY += boxHeight + 5;
  }

  // Totals section with professional boxes (right aligned)
  const totalsBoxWidth = 60;
  const totalsX = pageWidth - margin - totalsBoxWidth;
  
  // SubTotal
  doc.setFillColor(70, 70, 70);
  doc.rect(totalsX, currentY, totalsBoxWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('SubTotal', totalsX + 2, currentY + 7);
  currentY += boxHeight;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(totalsX, currentY, totalsBoxWidth, boxHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText('₹' + quotationData.subtotal.toFixed(2), totalsX + 2, currentY + 7);
  currentY += boxHeight + 2;

  // GST
  doc.setFillColor(70, 70, 70);
  doc.rect(totalsX, currentY, totalsBoxWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('GST (18%)', totalsX + 2, currentY + 7);
  currentY += boxHeight;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(totalsX, currentY, totalsBoxWidth, boxHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  addText('₹' + (quotationData.subtotal * 0.18).toFixed(2), totalsX + 2, currentY + 7);
  currentY += boxHeight + 2;

  // Total
  doc.setFillColor(70, 70, 70);
  doc.rect(totalsX, currentY, totalsBoxWidth, boxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  addWhiteText('Total', totalsX + 2, currentY + 7);
  currentY += boxHeight;
  
  doc.setFillColor(255, 255, 255);
  doc.rect(totalsX, currentY, totalsBoxWidth, boxHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  addBoldText('₹' + (quotationData.subtotal * 1.18).toFixed(2), totalsX + 2, currentY + 7);
  currentY += boxHeight + 15;

  // Terms and Conditions (Left side)
  const termsX = margin;
  const bankDetailsX = pageWidth - 80;

  addBoldText('Terms and Conditions', termsX, currentY);
  addBoldText('Bank Details', bankDetailsX, currentY);
  currentY += 6;

  const termsAndConditions = [
    "-Payment Should be made on or before 30th day of the Day of Billing.",
    "-Incase Of Late Payment, Credit Limit will be Reduce by 10%.",
    "-If the Payment is not done within the due terms of invoice then an interest of 24% per annum i.e 2% per month",
    " would be charged on due amount.",
    "-All Cheques/Demand Drafts for payment of bills must be crossed \"A/C Payee Only\" and Drawn in Favor of",
    " \"Company's Name\".",
    "-In case of Cheque Returned/Bounced, All the Penalties Will Be Bear by Buyer.",
    "-Disputes are subject to jurisdiction of Guwahati courts and all the legal fees will be borne by the buyer.",
    "-If the Payment is Not Done within the 30 days of the due date then the rest of the pending order will be on hold.",
    "-Telephonic Conversations Can be recorded for training and other official purposes.",
    "-If Payment Received Before 30 Days Then a Special Discount will be given to you 200 / Per Ton.",
    "-Detention of Rs 4000 per day will be charged,if the vehicle is not unloaded within 48 hrs of Reporting."
  ];

  const bankDetails = [
    `Bank Name : ${quotationData.companyDetails.bankDetails.bankName}`,
    `Account No. : ${quotationData.companyDetails.bankDetails.accountNumber}`,
    `Branch : ${quotationData.companyDetails.bankDetails.branch}`,
    `IFSC Code : ${quotationData.companyDetails.bankDetails.ifscCode}`
  ];

  // Add terms (left side)
  termsAndConditions.forEach(term => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    addText(term, termsX, currentY);
    currentY += 4;
  });

  // Add bank details (right side) - reset Y position
  let bankY = currentY - (termsAndConditions.length * 4) + 6;
  bankDetails.forEach(detail => {
    addText(detail, bankDetailsX, bankY);
    bankY += 5;
  });

  // Company signature section
  currentY = Math.max(currentY, bankY) + 20;
  addText(`For ${quotationData.companyDetails.name}`, bankDetailsX, currentY);
  currentY += 20;
  addText('Authorized Signatory', bankDetailsX, currentY);
  currentY += 15;

  // Footer
  addBoldText('SUBJECT TO GUWAHATI JURISDICTION', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  addText('THIS IS COMPUTER GENERATED QUOTATION SIGNATURE NOT REQUIRED', pageWidth / 2, currentY, { align: 'center' });

  return doc;
};

// React component for displaying quotation
interface QuotationTemplateProps {
  quotationData: QuotationData;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const QuotationTemplate: React.FC<QuotationTemplateProps> = ({
  quotationData,
  onDownload,
  onPrint
}) => {
  const handleDownload = () => {
    const doc = generateBitumenQuotationPDF(quotationData);
    doc.save(`quotation-${quotationData.quotationNumber}.pdf`);
    onDownload?.();
  };

  const handlePrint = () => {
    const doc = generateBitumenQuotationPDF(quotationData);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    onPrint?.();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download PDF
      </button>
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Print
      </button>
    </div>
  );
};