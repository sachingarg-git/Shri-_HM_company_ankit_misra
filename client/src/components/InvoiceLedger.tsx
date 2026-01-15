import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertCircle, Loader2, X } from "lucide-react";

interface InvoiceLedgerProps {
  customerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceLedger({ customerId, isOpen, onClose }: InvoiceLedgerProps) {
  const { data: allInvoices = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/sales-invoices'],
    queryFn: async () => {
      const response = await fetch('/api/sales-operations/sales-invoices');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const ledgerData = customerId ? {
    customerId,
    customerName: allInvoices.find(inv => inv.customerId === customerId)?.customerName || 'Unknown',
    totalInvoices: allInvoices.filter(inv => inv.customerId === customerId).length,
    totalAmount: allInvoices.filter(inv => inv.customerId === customerId).reduce((sum, inv) => sum + parseFloat(inv.totalInvoiceAmount || 0), 0),
    totalPaid: allInvoices.filter(inv => inv.customerId === customerId).reduce((sum, inv) => sum + parseFloat(inv.paidAmount || 0), 0),
    totalPending: allInvoices.filter(inv => inv.customerId === customerId).reduce((sum, inv) => sum + (parseFloat(inv.totalInvoiceAmount || 0) - parseFloat(inv.paidAmount || 0)), 0),
    ledgerEntries: allInvoices.filter(inv => inv.customerId === customerId).sort((a, b) => new Date(b.invoiceDate || 0).getTime() - new Date(a.invoiceDate || 0).getTime()).map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate || '',
      dueDate: inv.dueDate || '',
      totalAmount: parseFloat(inv.totalInvoiceAmount || 0),
      paidAmount: parseFloat(inv.paidAmount || 0),
      pendingAmount: parseFloat(inv.totalInvoiceAmount || 0) - parseFloat(inv.paidAmount || 0),
      status: inv.paymentStatus || inv.status || 'PENDING',
    }))
  } : undefined;

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800";
      case "PARTIAL": return "bg-yellow-100 text-yellow-800";
      case "OVERDUE": return "bg-red-100 text-red-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} style={{ display: isOpen ? 'block' : 'none' }} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ display: isOpen ? 'flex' : 'none' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">📊 Customer Ledger</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg text-gray-600">Loading ledger...</span>
              </div>
            ) : !ledgerData ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p>No ledger data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900">{ledgerData.customerName}</h3>
                  <p className="text-sm text-blue-700">Customer ID: {ledgerData.customerId}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Invoices</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{ledgerData.totalInvoices}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Amount</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-gray-900">{formatCurrency(ledgerData.totalAmount)}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Amount Paid</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(ledgerData.totalPaid)}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Amount Pending</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(ledgerData.totalPending)}</div></CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice No</TableHead>
                            <TableHead>Invoice Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Pending</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ledgerData.ledgerEntries.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-gray-500 py-8">No invoices found</TableCell>
                            </TableRow>
                          ) : (
                            ledgerData.ledgerEntries.map((entry) => (
                              <TableRow key={entry.id} className="hover:bg-gray-50">
                                <TableCell className="font-semibold">{entry.invoiceNumber}</TableCell>
                                <TableCell>{entry.invoiceDate ? format(new Date(entry.invoiceDate), "dd MMM yyyy") : "N/A"}</TableCell>
                                <TableCell>{entry.dueDate ? format(new Date(entry.dueDate), "dd MMM yyyy") : "N/A"}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(entry.totalAmount)}</TableCell>
                                <TableCell className="text-green-600 font-medium">{formatCurrency(entry.paidAmount)}</TableCell>
                                <TableCell className="text-red-600 font-medium">{formatCurrency(entry.pendingAmount)}</TableCell>
                                <TableCell><Badge className={getStatusColor(entry.status)}>{entry.status}</Badge></TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
