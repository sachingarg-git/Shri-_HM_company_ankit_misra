import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, CheckCircle, Package, Truck, FileCheck, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSalesSchema, type Sales, type InsertSales, type User } from "@shared/schema";

const statusColors = {
  RECEIVING: "bg-yellow-100 text-yellow-800",
  OK: "bg-blue-100 text-blue-800", 
  APPROVED: "bg-green-100 text-green-800",
  DELIVERED: "bg-purple-100 text-purple-800"
};

const statusIcons = {
  RECEIVING: Package,
  OK: CheckCircle,
  APPROVED: FileCheck,
  DELIVERED: Truck
};

export default function Sales() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<Sales | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sales data
  const { data: sales = [], isLoading } = useQuery<Sales[]>({
    queryKey: ["/api/sales"],
  });

  // Fetch users for salesperson selection
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<InsertSales>({
    resolver: zodResolver(insertSalesSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      salesOrderNumber: "",
      invoiceNumber: "",
      vehicleNumber: "",
      location: "",
      transporter: "",
      grossWeight: "0",
      tareWeight: "0",
      netWeight: "0",
      entireWeight: "0",
      drumQuantity: 0,
      perDrumWeight: "0",
      partyName: "",
      basicRate: "0",
      gstPercent: "18",
      totalAmount: "0",
      basicRatePurchase: "0",
      product: "",
      salespersonId: "",
      deliveryStatus: "RECEIVING",
    },
  });

  // Create/Update sales
  const salesMutation = useMutation({
    mutationFn: async (data: InsertSales) => {
      if (editingSales) {
        return await apiRequest(`/api/sales/${editingSales.id}`, "PUT", data);
      }
      return await apiRequest("/api/sales", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      setIsDialogOpen(false);
      setEditingSales(null);
      form.reset();
      toast({
        title: "Success",
        description: editingSales ? "Sales record updated successfully" : "Sales record created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sign delivery challan
  const signChallanMutation = useMutation({
    mutationFn: async (salesId: string) => {
      return await apiRequest(`/api/sales/${salesId}/sign-challan`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Success",
        description: "Delivery challan signed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSales) => {
    // Calculate net weight automatically
    const grossWeight = parseFloat(data.grossWeight);
    const tareWeight = parseFloat(data.tareWeight);
    const netWeight = grossWeight - tareWeight;
    
    // Calculate total amount (basic rate + GST)
    const basicRate = parseFloat(data.basicRate);
    const gstPercent = parseFloat(data.gstPercent);
    const gstAmount = (basicRate * gstPercent) / 100;
    const totalAmount = basicRate + gstAmount;

    const finalData = {
      ...data,
      netWeight: netWeight.toString(),
      totalAmount: totalAmount.toString(),
    };

    salesMutation.mutate(finalData);
  };

  const handleEdit = (sales: Sales) => {
    setEditingSales(sales);
    form.reset({
      date: sales.date.toString().split('T')[0],
      salesOrderNumber: sales.salesOrderNumber,
      invoiceNumber: sales.invoiceNumber,
      vehicleNumber: sales.vehicleNumber,
      location: sales.location,
      transporter: sales.transporter,
      grossWeight: sales.grossWeight,
      tareWeight: sales.tareWeight,
      netWeight: sales.netWeight,
      entireWeight: sales.entireWeight,
      drumQuantity: sales.drumQuantity,
      perDrumWeight: sales.perDrumWeight,
      partyName: sales.partyName,
      basicRate: sales.basicRate,
      gstPercent: sales.gstPercent,
      totalAmount: sales.totalAmount,
      basicRatePurchase: sales.basicRatePurchase,
      product: sales.product,
      salespersonId: sales.salespersonId,
      deliveryStatus: sales.deliveryStatus,
    });
    setIsDialogOpen(true);
  };

  const handleNewSales = () => {
    setEditingSales(null);
    form.reset();
    setIsDialogOpen(true);
  };

  // Filter sales based on search and status
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.salesOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || sale.deliveryStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sales data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-1">Manage sales orders, delivery challans, and status tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewSales}>
              <Plus className="h-4 w-4 mr-2" />
              New Sales Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSales ? "Edit Sales Entry" : "Create Sales Entry"}</DialogTitle>
              <DialogDescription>
                {editingSales ? "Update the sales information below" : "Enter the sales details below"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salesOrderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Order Number</FormLabel>
                        <FormControl>
                          <Input placeholder="SO-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input placeholder="INV-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number</FormLabel>
                        <FormControl>
                          <Input placeholder="MH12AB1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Mumbai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transporter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transporter</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Logistics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="grossWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tareWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tare Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="50.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="netWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Net Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="950.00" 
                            {...field}
                            value={
                              form.watch("grossWeight") && form.watch("tareWeight") 
                                ? (parseFloat(form.watch("grossWeight")) - parseFloat(form.watch("tareWeight"))).toString()
                                : field.value
                            }
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entireWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entire Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="drumQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drum Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="perDrumWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Per Drum Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="95.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="partyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Party Name</FormLabel>
                        <FormControl>
                          <Input placeholder="XYZ Industries" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <FormControl>
                          <Input placeholder="Chemical XYZ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="basicRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basic Rate (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="10000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gstPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="18.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="11800.00" 
                            {...field}
                            value={
                              form.watch("basicRate") && form.watch("gstPercent")
                                ? (parseFloat(form.watch("basicRate")) * (1 + parseFloat(form.watch("gstPercent")) / 100)).toString()
                                : field.value
                            }
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="basicRatePurchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basic Rate Purchase (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="9000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salespersonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salesperson</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select salesperson" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="RECEIVING">Receiving</SelectItem>
                            <SelectItem value="OK">OK</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingSales(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={salesMutation.isPending}>
                    {salesMutation.isPending ? "Saving..." : editingSales ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number, invoice, party name, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="RECEIVING">Receiving</SelectItem>
            <SelectItem value="OK">OK</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSales.map((sale) => {
          const StatusIcon = statusIcons[sale.deliveryStatus];
          const salesperson = users.find(u => u.id === sale.salespersonId);

          return (
            <Card key={sale.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{sale.salesOrderNumber}</CardTitle>
                    <CardDescription>Invoice: {sale.invoiceNumber}</CardDescription>
                  </div>
                  <Badge className={statusColors[sale.deliveryStatus]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {sale.deliveryStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Party</p>
                    <p className="font-medium">{sale.partyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Product</p>
                    <p className="font-medium">{sale.product}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Vehicle</p>
                    <p className="font-medium">{sale.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{sale.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net Weight</p>
                    <p className="font-medium">{sale.netWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-medium">₹{parseFloat(sale.totalAmount).toLocaleString()}</p>
                  </div>
                </div>

                {salesperson && (
                  <div className="text-sm">
                    <p className="text-gray-500">Salesperson</p>
                    <p className="font-medium">{salesperson.firstName} {salesperson.lastName}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-gray-500">
                    Challan: {sale.deliveryChallanSigned ? "Signed" : "Pending"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(sale)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {!sale.deliveryChallanSigned && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => signChallanMutation.mutate(sale.id)}
                        disabled={signChallanMutation.isPending}
                      >
                        <FileCheck className="h-3 w-3 mr-1" />
                        Sign Challan
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sales records found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== "ALL" 
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first sales entry"
            }
          </p>
          {(!searchTerm && statusFilter === "ALL") && (
            <Button onClick={handleNewSales}>
              <Plus className="h-4 w-4 mr-2" />
              Create Sales Entry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}