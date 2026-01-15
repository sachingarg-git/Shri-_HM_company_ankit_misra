import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Eye, Download, DollarSign, Calendar, AlertCircle } from "lucide-react";

interface LedgerEntry {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  paymentDetails: Array<{
    date: string;
    amount: number;
    paymentMethod: string;
  }>;
}

interface CompanyLedger {
  companyId: string;
  companyName: string;
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  ledgerEntries: LedgerEntry[];
}

interface SalesOrderLedgerProps {
  salesOrderId: string;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SalesOrderLedger({
  salesOrderId,
  companyId,
  isOpen,
  onClose,
}: SalesOrderLedgerProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<LedgerEntry | null>(null);

  const { data: ledgerData, isLoading } = useQuery<CompanyLedger | undefined>({
    queryKey: [`/api/sales-orders/${salesOrderId}/company-ledger`],
    queryFn: async () => {
      const response = await fetch(`/api/sales-orders/${salesOrderId}/company-ledger`);
      if (!response.ok) throw new Error("Failed to fetch ledger");
      return response.json();
    },
    enabled: isOpen && !!salesOrderId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company-wise Ledger</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading ledger data...</p>
            </div>
          </div>
        ) : ledgerData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Invoices</p>
                      <p className="text-2xl font-bold">
                        {ledgerData.totalInvoices}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(ledgerData.totalAmount)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Paid Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(ledgerData.totalPaid)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Amount</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(ledgerData.totalPending)}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ledger Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Details</CardTitle>
                <CardDescription>
                  Date-wise invoice and payment tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerData.ledgerEntries.map((entry: LedgerEntry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            {format(new Date(entry.invoiceDate), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(entry.dueDate), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(entry.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-semibold">
                            {formatCurrency(entry.paidAmount)}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-semibold">
                            {formatCurrency(entry.pendingAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInvoice(entry)}
                              title="View Payment Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details Dialog */}
            {selectedInvoice && (
              <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Payment Details - {selectedInvoice.invoiceNumber}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Invoice Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Invoice Date</p>
                        <p className="font-semibold">
                          {format(new Date(selectedInvoice.invoiceDate), "dd MMM yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-semibold">
                          {format(new Date(selectedInvoice.dueDate), "dd MMM yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold text-lg">
                          {formatCurrency(selectedInvoice.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Paid Amount</p>
                        <p className="font-semibold text-lg text-green-600">
                          {formatCurrency(selectedInvoice.paidAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Payment History */}
                    <div>
                      <h3 className="font-semibold mb-4">Payment History</h3>
                      <div className="space-y-2">
                        {selectedInvoice.paymentDetails && selectedInvoice.paymentDetails.length > 0 ? (
                          selectedInvoice.paymentDetails.map((payment, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {payment.paymentMethod}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {format(new Date(payment.date), "dd MMM yyyy, HH:mm")}
                                </p>
                              </div>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(payment.amount)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">No payments recorded</p>
                        )}
                      </div>
                    </div>

                    {/* Outstanding Amount */}
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-gray-600">Outstanding Amount</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(selectedInvoice.pendingAmount)}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No ledger data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
