import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface CreditAgreement {
  id: string;
  agreementNumber: string;
  customerName: string;
  date: string | Date;
  location: string;
  address: string;
  pinCode: string;
  gstnNumber: string;
  creditLimit: string | number;
  chequeNumbers: string;
  bankName: string;
  branchName: string;
  accountHolder: string;
  accountNumber: string;
  paymentTerms: number;
  interestRate: number | null;
}

// Simple bold style for data fields - no highlight
const dataStyle = {
  fontWeight: 600,
};

// Cyan heading style
const cyanStyle = {
  color: '#06b6d4',
  fontWeight: 700,
  WebkitPrintColorAdjust: 'exact' as const,
  printColorAdjust: 'exact' as const,
};

export default function CreditAgreementView() {
  const params = useParams();
  const agreementId = params?.id as string;
  const [logoBase64, setLogoBase64] = useState<string>('');

  // Load logo as base64 for printing
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('/logo.jpg');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Failed to load logo:', error);
      }
    };
    loadLogo();
  }, []);

  const { data: agreement, isLoading } = useQuery<CreditAgreement>({
    queryKey: ["credit-agreement", agreementId],
    queryFn: async () => {
      const response = await fetch(`/api/credit-agreements/${agreementId}`);
      if (!response.ok) throw new Error("Failed to fetch agreement");
      return response.json();
    },
    enabled: !!agreementId,
  });

  const handlePrint = () => {
    // Get the print area content
    const printArea = document.querySelector('.print-area');
    if (!printArea) {
      window.print();
      return;
    }

    // Open a new window with just the document content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      window.print();
      return;
    }

    // Write the document content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credit Agreement - SRI HM Bitumen Company</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            padding: 15mm;
            background: white;
            position: relative;
          }
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            body {
              padding: 15mm;
            }
          }
          h1, h2 {
            color: #06b6d4 !important;
            -webkit-print-color-adjust: exact !important;
          }
          h1 {
            text-align: center;
            font-size: 14pt;
            margin-bottom: 15px;
          }
          h2 {
            font-size: 11pt;
            margin: 12px 0 8px 0;
          }
          p {
            margin-bottom: 6px;
            text-align: justify;
            font-size: 11pt;
          }
          ul {
            margin-left: 20px;
            margin-bottom: 8px;
          }
          li {
            margin-bottom: 4px;
            font-size: 11pt;
          }
          table {
            margin: 8px 0;
          }
          td {
            padding: 6px 5px;
            font-size: 11pt;
          }
          .bold {
            font-weight: 600;
          }
          img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .signature-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        ${printArea.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for images to load, then print
    const waitForImages = () => {
      const images = printWindow.document.getElementsByTagName('img');
      let loadedCount = 0;
      const totalImages = images.length;
      
      if (totalImages === 0) {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        return;
      }
      
      for (let i = 0; i < totalImages; i++) {
        if (images[i].complete) {
          loadedCount++;
        } else {
          images[i].onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              printWindow.focus();
              printWindow.print();
              printWindow.close();
            }
          };
        }
      }
      
      if (loadedCount === totalImages) {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    };

    // Wait for content to load, then check images
    printWindow.onload = function() {
      waitForImages();
    };

    // Fallback for browsers that don't fire onload
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }, 1500);
  };

  if (isLoading) return <div className="p-8">Loading agreement...</div>;
  if (!agreement) return <div className="p-8">Agreement not found</div>;

  const agreementDate = agreement.date ? new Date(agreement.date) : new Date();
  const formattedDate = format(agreementDate, "dd/MM/yyyy");
  const creditAmount = parseFloat(String(agreement.creditLimit)).toLocaleString();

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Buttons - Hidden in Print */}
        <div className="flex justify-between items-center mb-4 no-print">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" />
            Print Agreement
          </Button>
        </div>

        {/* Agreement Document */}
        <div className="bg-white p-10 shadow-lg print:shadow-none print-area" style={{ 
          fontFamily: 'Times New Roman, serif', 
          fontSize: '12pt', 
          lineHeight: '1.6',
          position: 'relative',
          minHeight: '100%',
          overflow: 'hidden'
        }}>
          
          {/* Watermark */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            opacity: 0.06,
            zIndex: 0,
            pointerEvents: 'none',
            textAlign: 'center',
            width: '100%'
          }}>
            <img src={logoBase64 || '/logo.jpg'} alt="Watermark" style={{ width: '400px', height: 'auto' }} />
          </div>

          {/* Content Container - Above Watermark */}
          <div style={{ position: 'relative', zIndex: 1 }}>
          
            {/* Company Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '3px double #06b6d4', paddingBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
                <img src={logoBase64 || '/logo.jpg'} alt="SRI HM Bitumen Company Logo" style={{ width: '100px', height: 'auto' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#E67E22', fontSize: '16pt', fontWeight: 'bold' }}>M/S SRI HM BITUMEN CO</div>
                  <div style={{ fontSize: '9pt', color: '#333' }}>Dag No: 1071, Patta No: 264, Mikirpara, Chakardaigaon, Mouza - Ramcharani, Guwahati, Assam - 781035</div>
                  <div style={{ fontSize: '9pt', color: '#333' }}>GSTIN/UIN: 18CGMPP6536N2ZG</div>
                  <div style={{ fontSize: '9pt', color: '#E67E22' }}>Mobile: +91 8453059698 | Email: info.srihmbitumen@gmail.com</div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div style={{ borderBottom: '2px solid #06b6d4', paddingBottom: '12px', marginBottom: '20px' }}>
              <h1 className="text-center font-bold text-lg mb-0" style={{ ...cyanStyle, letterSpacing: '1px' }}>
                AGREEMENT FOR SUPPLY OF GOODS ON CREDIT AND SECURITY CHEQUE
              </h1>
            </div>

          {/* Execution Line */}
          <p className="mb-5 text-sm leading-relaxed" style={{ textAlign: 'justify' }}>
            This Agreement is executed on <span style={dataStyle}>{formattedDate}</span> At <span style={dataStyle}>{agreement.location}</span> by and between:
          </p>

          {/* Parties */}
          <ul className="mb-4 text-sm leading-relaxed list-disc pl-6">
            <li className="mb-2">
              <strong>M/s. SRI HM Bitumen Co</strong> having its registered office at Dag No. 1071, Patta No. 264, Mikirpara, Chakardaigaon, Mouza - Ramcharani, Guwahati, Assam - 781035
            </li>
          </ul>

          <p className="mb-6 text-sm leading-relaxed pl-6">
            <span style={dataStyle}>{agreement.customerName}</span> GSTN Number <span style={dataStyle}>{agreement.gstnNumber}</span> residing at <span style={dataStyle}>{agreement.address}, {agreement.pinCode}</span>
          </p>

          {/* Section 1 */}
          <h2 className="text-sm mb-3" style={cyanStyle}>1. Supply of Goods on Credit</h2>
          <div className="text-sm leading-relaxed mb-5 pl-4" style={{ textAlign: 'justify' }}>
            <p className="mb-2">1.1 The Company agrees to supply goods to the Customer strictly on credit basis, within the sanctioned credit limit determined solely at the Company's discretion.</p>
            <p className="mb-2">1.2 The detailed credit policy, acknowledged and signed by the Customer, forms an integral part of this Agreement.</p>
            <p className="mb-2">1.3 The Company reserves the unconditional right to suspend, revoke, or amend the credit limit at any time without prior notice.</p>
          </div>

          {/* Section 2 */}
          <h2 className="text-sm mb-3" style={cyanStyle}>2. Credit Limit and Security</h2>
          <div className="text-sm leading-relaxed mb-5 pl-4" style={{ textAlign: 'justify' }}>
            <p className="mb-2">2.1 The Customer is granted a credit limit of Rs. <span style={dataStyle}>{creditAmount}</span> for the procurement of goods.</p>
            <p className="mb-3">2.2 As continuing, unconditional, and irrevocable security for the repayment of all present and future dues, including principal, interest, costs, penalties, damages, and legal expenses, the Customer hereby issues the following security cheque(s) in favour of the Company:</p>
            
            {/* Cheque Details */}
            <ul className="list-disc pl-6 mb-3">
              <li className="font-semibold">Cheque Details</li>
            </ul>
            <p className="mb-2">The particulars of the security cheques issued by the Drawer are as follows:</p>
            
            <div className="mb-3 pl-4">
              <table className="text-sm">
                <tbody>
                  <tr>
                    <td className="pr-2 py-1">Cheque Numbers</td>
                    <td className="pr-2 py-1">:</td>
                    <td className="py-1"><span style={dataStyle}>{agreement.chequeNumbers}</span></td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1">Bank Name</td>
                    <td className="pr-2 py-1">:</td>
                    <td className="py-1"><span style={dataStyle}>{agreement.bankName}</span></td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1">Branch Name</td>
                    <td className="pr-2 py-1"></td>
                    <td className="py-1"><span style={dataStyle}>{agreement.branchName}</span></td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1">Account Holder</td>
                    <td className="pr-2 py-1">:</td>
                    <td className="py-1"><span style={dataStyle}>{agreement.accountHolder}</span></td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2">Account No : <span style={dataStyle}>{agreement.accountNumber}</span></p>
            </div>

            <ul className="list-disc pl-6 mb-3">
              <li>The Customer expressly agrees that these cheque(s) shall serve as security as well as payment instruments, and shall remain enforceable regardless of the nature of the underlying transactions.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <h2 className="text-sm mb-3" style={cyanStyle}>3. Affirmations and Undertakings by the Customer</h2>
          <div className="text-sm leading-relaxed mb-5 pl-4" style={{ textAlign: 'justify' }}>
            <p className="mb-2">3.1 The cheque(s) issued are genuine, valid, funded, and free from defects, coercion, or forgery.</p>
            <p className="mb-2">3.2 Positive Pay has been activated for the cheque(s), and proof thereof is furnished to the Company at the time of execution of this Agreement.</p>
            <p className="mb-2">3.3 The Customer shall not revoke Positive Pay instructions, close the account, or issue stop-payment instructions until all liabilities are discharged in full, except with 15 days' prior written notice to the Company and clearance of all dues before such notice expires.</p>
            <p className="mb-2">3.4 The Customer agrees that failure to honour this undertaking constitutes repudiation and breach of this Agreement, entitling the Company to immediate legal action without further notice.</p>
            <p className="mb-2">3.5 The Customer waives any defence relating to post-dated nature of cheque(s), security-only character, or conditional issuance, acknowledging that the instruments are issued towards a legally enforceable debt.</p>
          </div>

          {/* Section 4 */}
          <h2 className="text-sm mb-3" style={cyanStyle}>4. Payment Terms & Interest</h2>
          <div className="text-sm leading-relaxed mb-5 pl-4" style={{ textAlign: 'justify' }}>
            <p className="mb-2">4.1 The Company may present cheque(s) for encashment if the Customer exceeds the credit limit, defaults on payment, or has overdue dues beyond 15 days.</p>
            <p className="mb-2">4.2 Interest shall accrue on overdue payments at 18% per annum, compounded monthly from the date of default until full settlement.</p>
            <p className="mb-2">4.3 Partial payments without full clearance of the outstanding shall not prevent the Company from presenting cheque(s) for the full balance owed.</p>
          </div>

          {/* Section 5 */}
          <h2 className="text-sm mb-3" style={cyanStyle}>5. Dishonour of Cheque(s) & Liability</h2>
          <div className="text-sm leading-relaxed mb-5 pl-4" style={{ textAlign: 'justify' }}>
            <p className="mb-2">5.1 The Customer acknowledges that dishonour of cheque(s) attracts liability under Sections 138, 139, and 142 of the Negotiable Instruments Act, 1881, and that such dishonour constitutes a criminal offence.</p>
            <p className="mb-2">5.2 The Customer expressly agrees and understands that:</p>
            <ul className="list-disc pl-6 mb-3">
              <li className="mb-1">Any claim that the cheque was issued "as security" shall not limit its enforceability as an instrument toward an existing debt.</li>
              <li className="mb-1">Upon dishonour, the Company may initiate criminal proceedings without first exhausting civil remedies.</li>
              <li className="mb-1">The debt represented by the cheque(s) shall be deemed admitted and undisputed for legal purposes.</li>
            </ul>

            <ul className="list-disc pl-6 mb-3">
              <li className="font-semibold">Indemnity</li>
            </ul>
            <p className="mb-2 pl-4">6.1 The Customer shall indemnify and hold harmless the Company against all legal expenses, recovery costs, notice charges, bank fees, and other enforcement costs, including criminal prosecution expenses.</p>
            <p className="mb-2 pl-4">6.2 This indemnity survives termination or discharge of this Agreement until full enforcement and recovery.</p>
          </div>

          {/* Section 6 */}
          <h2 className="text-sm mb-3 underline" style={cyanStyle}>6. Binding Effect & Governing Law</h2>
          <div className="text-sm leading-relaxed mb-8 pl-4" style={{ textAlign: 'justify' }}>
            <p className="mb-2">7.1 This Agreement is irrevocable until full discharge of liabilities.</p>
            <p className="mb-2">7.2 Governing law shall be Indian Law, and exclusive jurisdiction lies with the courts of <span style={dataStyle}>{agreement.location}</span>, irrespective of the place of supply, billing, or delivery.</p>
            <p className="mb-2">7.3 The terms herein constitute a binding contract enforceable in both civil and criminal jurisdictions.</p>
          </div>

          {/* Signature Section */}
          <div className="signature-section" style={{ borderTop: '2px solid #06b6d4', paddingTop: '20px', marginTop: '30px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-sm mb-6" style={cyanStyle}>SIGNED AND ACCEPTED</h2>
            
            <div className="grid grid-cols-2 gap-12 text-sm">
              {/* For Customer */}
              <div>
                <p className="font-bold mb-4">For Customer:</p>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-3 w-28">Signature</td>
                      <td className="py-3">: ________________________</td>
                    </tr>
                    <tr>
                      <td className="py-3">Customer Name</td>
                      <td className="py-3">: ________________________</td>
                    </tr>
                    <tr>
                      <td className="py-3">PAN/Aadhaar</td>
                      <td className="py-3">: ________________________</td>
                    </tr>
                    <tr>
                      <td className="py-3">Date</td>
                      <td className="py-3">: ________________________</td>
                    </tr>
                    <tr>
                      <td className="py-3">Place</td>
                      <td className="py-3">: ________________________</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* For Company */}
              <div>
                <p className="font-bold mb-4">For Company:</p>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-3 w-36">Authorized Signature</td>
                      <td className="py-3">: _______________</td>
                    </tr>
                    <tr>
                      <td className="py-3">Name</td>
                      <td className="py-3">: _______________</td>
                    </tr>
                    <tr>
                      <td className="py-3">Designation</td>
                      <td className="py-3">: _______________</td>
                    </tr>
                    <tr>
                      <td className="py-3">Date</td>
                      <td className="py-3">: _______________</td>
                    </tr>
                    <tr>
                      <td className="py-3">Place</td>
                      <td className="py-3">: _______________</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          </div> {/* End Content Container */}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything first */
          body * {
            visibility: hidden;
          }
          
          /* Show only the print area */
          .print-area, .print-area * {
            visibility: visible !important;
          }
          
          /* Position the print area at top left */
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20mm !important;
            margin: 0 !important;
            box-sizing: border-box;
          }
          
          /* Hide sidebar, header, navigation */
          nav, aside, header, footer, 
          [class*="sidebar"], [class*="Sidebar"],
          [class*="nav"], [class*="Nav"],
          [class*="header"], [class*="Header"],
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Reset body and html */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Force colors to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* A4 page settings - NO margins to remove browser header/footer */
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
