import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PurchaseOrderForm } from "@/components/PurchaseOrderForm";
import { Plus, Package, Eye, Edit, Trash2, Calendar, DollarSign } from "lucide-react";
import type { PurchaseOrder, InsertPurchaseOrder, InsertPurchaseOrderItem } from "@shared/schema";

export default function PurchaseOrdersPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch purchase orders
  const { data: purchaseOrders, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['/api/purchase-orders'],
  });

  // Create purchase order mutation
  const createMutation = useMutation({
    mutationFn: async (data: { purchaseOrder: InsertPurchaseOrder; items: InsertPurchaseOrderItem[] }) => {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create purchase order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      setShowForm(false);
      toast({ title: "Success", description: "Purchase order created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create purchase order", variant: "destructive" });
    }
  });

  // Delete purchase order mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete purchase order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({ title: "Success", description: "Purchase order deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete purchase order", variant: "destructive" });
    }
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN': return 'secondary';
      case 'APPROVED': return 'default';
      case 'PARTIALLY_RECEIVED': return 'outline';
      case 'CLOSED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: string | number, currency: string = 'INR') => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return currency === 'INR' ? `₹${num.toFixed(2)}` : `${currency} ${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-6" data-testid="purchase-orders-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and supplier procurement
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="button-add-purchase-order">
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      {/* Purchase Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Purchase Orders</span>
          </CardTitle>
          <CardDescription>Track and manage all purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading purchase orders...</p>
            </div>
          ) : !purchaseOrders || purchaseOrders.length === 0 ? (
            <div className="text-center py-8" data-testid="purchase-orders-empty">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Purchase Orders Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first purchase order to get started
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors" data-testid={`card-purchase-order-${po.id}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <button
                          onClick={() => {
                            setSelectedPO(po);
                            setShowDetails(true);
                          }}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                          data-testid={`link-po-number-${po.id}`}
                        >
                          {po.poNumber}
                        </button>
                        <Badge variant={getStatusBadgeVariant(po.status)}>
                          {po.status.replace('_', ' ')}
                        </Badge>
                        {po.revisionNumber && po.revisionNumber > 0 && (
                          <Badge variant="outline">Rev. {po.revisionNumber}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Supplier</p>
                          <p>{po.supplierName}</p>
                        </div>
                        <div>
                          <p className="font-medium">PO Date</p>
                          <p>{formatDate(po.poDate)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Buyer</p>
                          <p>{po.buyerName}</p>
                        </div>
                        <div>
                          <p className="font-medium">Total Amount</p>
                          <p className="font-semibold text-lg">
                            {formatCurrency(po.totalAmount, po.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPO(po);
                          setShowDetails(true);
                        }}
                        data-testid={`button-view-po-${po.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(po.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-po-${po.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Purchase Order Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
            <DialogDescription>
              Fill in the details to create a comprehensive purchase order
            </DialogDescription>
          </DialogHeader>
          <PurchaseOrderForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Purchase Order Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Purchase Order Details - {selectedPO?.poNumber}</span>
            </DialogTitle>
            <DialogDescription>
              Complete purchase order information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPO && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Purchase Order Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">PO Number</label>
                    <p className="text-sm">{selectedPO.poNumber}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">PO Date</label>
                    <p className="text-sm">{formatDate(selectedPO.poDate)}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Status</label>
                    <p className="text-sm">
                      <Badge variant={getStatusBadgeVariant(selectedPO.status)}>
                        {selectedPO.status.replace('_', ' ')}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Revision Number</label>
                    <p className="text-sm">{selectedPO.revisionNumber || 0}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Currency</label>
                    <p className="text-sm">{selectedPO.currency}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Total Amount</label>
                    <p className="text-lg font-semibold">
                      {formatCurrency(selectedPO.totalAmount, selectedPO.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supplier Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Supplier Name</label>
                    <p className="text-sm">{selectedPO.supplierName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Contact Person</label>
                    <p className="text-sm">{selectedPO.supplierContactPerson || '-'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Email</label>
                    <p className="text-sm">{selectedPO.supplierEmail || '-'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Phone</label>
                    <p className="text-sm">{selectedPO.supplierPhone || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Buyer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Buyer Name</label>
                    <p className="text-sm">{selectedPO.buyerName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Department</label>
                    <p className="text-sm">{selectedPO.department || '-'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Cost Center</label>
                    <p className="text-sm">{selectedPO.costCenter || '-'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Approver</label>
                    <p className="text-sm">{selectedPO.approverName || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              {(selectedPO.deliveryDate || selectedPO.deliveryAddress || selectedPO.notes || selectedPO.terms) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPO.deliveryDate && (
                      <div>
                        <label className="font-medium text-sm text-muted-foreground">Expected Delivery Date</label>
                        <p className="text-sm">{formatDate(selectedPO.deliveryDate)}</p>
                      </div>
                    )}
                    {selectedPO.deliveryAddress && (
                      <div>
                        <label className="font-medium text-sm text-muted-foreground">Delivery Address</label>
                        <p className="text-sm">{selectedPO.deliveryAddress}</p>
                      </div>
                    )}
                    {selectedPO.terms && (
                      <div>
                        <label className="font-medium text-sm text-muted-foreground">Terms & Conditions</label>
                        <p className="text-sm">{selectedPO.terms}</p>
                      </div>
                    )}
                    {selectedPO.notes && (
                      <div>
                        <label className="font-medium text-sm text-muted-foreground">Internal Notes</label>
                        <p className="text-sm">{selectedPO.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}