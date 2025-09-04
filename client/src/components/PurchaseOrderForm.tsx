import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calculator, Package, User, Building2, Calendar, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Supplier, User as UserType, InsertPurchaseOrder, InsertPurchaseOrderItem } from "@shared/schema";

// Comprehensive Purchase Order form schema
const purchaseOrderSchema = z.object({
  // 1. PO Identification
  poNumber: z.string().min(1, "PO Number is required"),
  poDate: z.string().min(1, "PO Date is required"),
  revisionNumber: z.number().min(0).default(0),
  status: z.enum(['OPEN', 'APPROVED', 'PARTIALLY_RECEIVED', 'CLOSED', 'CANCELLED']).default('OPEN'),
  
  // 2. Supplier Information
  supplierId: z.string().min(1, "Supplier is required"),
  supplierName: z.string().min(1, "Supplier name is required"),
  supplierContactPerson: z.string().optional(),
  supplierEmail: z.string().email().optional().or(z.literal("")),
  supplierPhone: z.string().optional(),
  
  // 3. Buyer / Internal Information
  buyerName: z.string().min(1, "Buyer name is required"),
  department: z.string().optional(),
  costCenter: z.string().optional(),
  approverName: z.string().optional(),
  
  // 4. Financial Information
  currency: z.string().default('INR'),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  
  // Additional Fields
  deliveryDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  
  // Line Items
  items: z.array(z.object({
    itemCode: z.string().min(1, "Item code is required"),
    itemDescription: z.string().min(1, "Item description is required"),
    quantityOrdered: z.number().min(0.001, "Quantity must be greater than 0"),
    unitOfMeasure: z.string().min(1, "Unit of measure is required"),
    unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
    specifications: z.string().optional(),
    notes: z.string().optional(),
  })).min(1, "At least one item is required")
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  onSubmit: (data: { purchaseOrder: InsertPurchaseOrder; items: InsertPurchaseOrderItem[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PurchaseOrderForm({ onSubmit, onCancel, isLoading = false }: PurchaseOrderFormProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Fetch suppliers for dropdown
  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Fetch users for buyer selection
  const { data: users } = useQuery<UserType[]>({
    queryKey: ['/api/users'],
  });

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      poNumber: `PO-${Date.now()}`,
      poDate: new Date().toISOString().split('T')[0],
      revisionNumber: 0,
      status: 'OPEN',
      currency: 'INR',
      taxAmount: 0,
      discountAmount: 0,
      items: [{
        itemCode: '',
        itemDescription: '',
        quantityOrdered: 1,
        unitOfMeasure: 'PCS',
        unitPrice: 0,
        specifications: '',
        notes: ''
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedItems = form.watch("items");
  
  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (item.quantityOrdered || 0) * (item.unitPrice || 0);
  }, 0);
  
  const taxAmount = form.watch("taxAmount") || 0;
  const discountAmount = form.watch("discountAmount") || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers?.find(s => s.id === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      form.setValue("supplierId", supplierId);
      form.setValue("supplierName", supplier.supplierName || supplier.name || '');
      form.setValue("supplierContactPerson", supplier.contactPersonName || '');
      form.setValue("supplierEmail", supplier.contactEmail || '');
      form.setValue("supplierPhone", supplier.contactPhone || supplier.contactPersonPhone || '');
    }
  };

  const addItem = () => {
    append({
      itemCode: '',
      itemDescription: '',
      quantityOrdered: 1,
      unitOfMeasure: 'PCS',
      unitPrice: 0,
      specifications: '',
      notes: ''
    });
  };

  const handleSubmit = (data: PurchaseOrderFormData) => {
    // Get current user (you may need to fetch this from auth context)
    const currentUser = users?.[0]; // For now, using first user
    
    const purchaseOrder: InsertPurchaseOrder = {
      poNumber: data.poNumber,
      poDate: new Date(data.poDate),
      revisionNumber: data.revisionNumber,
      status: data.status,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      supplierContactPerson: data.supplierContactPerson,
      supplierEmail: data.supplierEmail,
      supplierPhone: data.supplierPhone,
      buyerName: data.buyerName,
      department: data.department,
      costCenter: data.costCenter,
      approverName: data.approverName,
      createdBy: currentUser?.id || '',
      currency: data.currency,
      totalAmount: totalAmount.toString(),
      taxAmount: data.taxAmount?.toString(),
      discountAmount: data.discountAmount?.toString(),
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes,
      terms: data.terms,
    };

    const items: InsertPurchaseOrderItem[] = data.items.map(item => ({
      purchaseOrderId: '', // Will be filled by backend
      itemCode: item.itemCode,
      itemDescription: item.itemDescription,
      quantityOrdered: item.quantityOrdered.toString(),
      unitOfMeasure: item.unitOfMeasure,
      unitPrice: item.unitPrice.toString(),
      totalLineValue: (item.quantityOrdered * item.unitPrice).toString(),
      specifications: item.specifications,
      notes: item.notes,
    }));

    onSubmit({ purchaseOrder, items });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-6 w-6" />
                <span>Create Purchase Order</span>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* 1. PO Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>PO Identification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-po-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="poDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-po-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="revisionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revision Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-revision-number" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Status *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-po-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 2. Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Supplier Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select value={field.value} onValueChange={handleSupplierChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-supplier">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.supplierName || supplier.name} - {supplier.supplierCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedSupplier && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Contact Person</label>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.contactPersonName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.contactEmail || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.contactPhone || '-'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Buyer / Internal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Buyer / Internal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer/Requester Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-buyer-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department / Cost Center</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-department" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="costCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Center</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-cost-center" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="approverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approver Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-approver-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 4. Order Details / Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Order Details</span>
                </div>
                <Button type="button" onClick={addItem} size="sm" data-testid="button-add-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Code *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid={`input-item-code-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemDescription`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid={`input-item-description-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantityOrdered`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.001"
                              min="0.001"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid={`input-quantity-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitOfMeasure`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid={`select-unit-${index}`}>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PCS">PCS</SelectItem>
                              <SelectItem value="KG">KG</SelectItem>
                              <SelectItem value="LTR">LTR</SelectItem>
                              <SelectItem value="MTR">MTR</SelectItem>
                              <SelectItem value="BOX">BOX</SelectItem>
                              <SelectItem value="SET">SET</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0.01"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid={`input-unit-price-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.specifications`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specifications</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} data-testid={`textarea-specifications-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} data-testid={`textarea-item-notes-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Line Total: ₹{((watchedItems[index]?.quantityOrdered || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Financial Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-tax-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-discount-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col justify-end">
                  <label className="text-sm font-medium mb-2">Total Amount</label>
                  <div className="h-10 border rounded-md px-3 flex items-center font-semibold text-lg bg-muted">
                    ₹{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-delivery-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="textarea-delivery-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="textarea-terms" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="textarea-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              data-testid="button-create-po"
            >
              {isLoading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}