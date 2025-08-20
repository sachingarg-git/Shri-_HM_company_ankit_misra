import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, Search, Filter, CalendarDays, FileCheck, Save, X, Package, Truck } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Hooks and Utils
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSalesSchema, type Sales, type InsertSales, type User, type Client, type Product, type Transporter } from "@shared/schema";

const statusColors = {
  RECEIVING: "bg-orange-100 text-orange-800 border-orange-200",
  OK: "bg-blue-100 text-blue-800 border-blue-200", 
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  DELIVERED: "bg-purple-100 text-purple-800 border-purple-200"
};

const statusIcons = {
  RECEIVING: Package,
  OK: FileCheck,
  APPROVED: FileCheck,
  DELIVERED: Truck
};

export default function Sales() {
  // State Management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<Sales | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState({
    fromDate: "",
    toDate: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data Fetching
  const { data: salesData = [], isLoading: salesLoading } = useQuery<Sales[]>({
    queryKey: ["/api/sales"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: transporters = [] } = useQuery<Transporter[]>({
    queryKey: ["/api/transporters"],
  });

  // Form Setup
  const form = useForm<InsertSales>({
    resolver: zodResolver(insertSalesSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      salesOrderNumber: "",
      invoiceNumber: "",
      vehicleNumber: "",
      location: "",
      transporterId: "",
      grossWeight: "0",
      tareWeight: "0", 
      netWeight: "0",
      entireWeight: "0",
      drumQuantity: 0,
      perDrumWeight: "0",
      clientId: "",
      basicRate: "0",
      gstPercent: "18",
      totalAmount: "0",
      basicRatePurchase: "0",
      productId: "",
      salespersonId: "",
      deliveryStatus: "RECEIVING"
    },
  });

  // Auto-calculate net weight when gross or tare weight changes
  const grossWeight = form.watch("grossWeight");
  const tareWeight = form.watch("tareWeight");
  const drumQuantity = form.watch("drumQuantity");
  const basicRate = form.watch("basicRate");
  const gstPercent = form.watch("gstPercent");

  useEffect(() => {
    const gross = parseFloat(grossWeight || "0");
    const tare = parseFloat(tareWeight || "0");
    const net = gross - tare;
    if (net >= 0) {
      form.setValue("netWeight", net.toString());
      form.setValue("entireWeight", gross.toString());
    }
  }, [grossWeight, tareWeight, form]);

  // Auto-calculate per drum weight and total amount
  const netWeight = form.watch("netWeight");
  
  useEffect(() => {
    const net = parseFloat(netWeight || "0");
    const drums = drumQuantity || 1;
    const perDrum = drums > 0 ? net / drums : 0;
    form.setValue("perDrumWeight", perDrum.toFixed(2));
  }, [netWeight, drumQuantity, form]);

  useEffect(() => {
    const rate = parseFloat(basicRate || "0");
    const net = parseFloat(netWeight || "0");
    const gst = parseFloat(gstPercent || "0");
    const subtotal = rate * net;
    const total = subtotal + (subtotal * gst / 100);
    form.setValue("totalAmount", total.toFixed(2));
  }, [basicRate, netWeight, gstPercent, form]);

  // Generate numbers when form opens
  const generateNumbers = async () => {
    try {
      const [soResponse, invResponse] = await Promise.all([
        apiRequest("POST", "/api/number-series/next/SALES_ORDER"),
        apiRequest("POST", "/api/number-series/next/INVOICE")
      ]);
      
      const soData = await soResponse.json();
      const invData = await invResponse.json();
      
      form.setValue("salesOrderNumber", soData.nextNumber);
      form.setValue("invoiceNumber", invData.nextNumber);
    } catch (error) {
      console.error("Failed to generate numbers:", error);
    }
  };

  // CRUD Operations
  const salesMutation = useMutation({
    mutationFn: async (data: InsertSales) => {
      if (editingSales) {
        return await apiRequest("PUT", `/api/sales/${editingSales.id}`, data);
      }
      return await apiRequest("POST", "/api/sales", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      handleCloseForm();
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

  const deleteSalesMutation = useMutation({
    mutationFn: async (salesId: string) => {
      return await apiRequest("DELETE", `/api/sales/${salesId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Success",
        description: "Sales record deleted successfully",
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

  const signChallanMutation = useMutation({
    mutationFn: async (salesId: string) => {
      return await apiRequest("PATCH", `/api/sales/${salesId}/sign-challan`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Success",
        description: "Delivery challan signed successfully",
      });
    },
  });

  // Event Handlers
  const handleOpenForm = (sales?: Sales) => {
    if (sales) {
      setEditingSales(sales);
      // Populate form with existing data
      Object.keys(sales).forEach((key) => {
        const value = sales[key as keyof Sales];
        if (key === 'date' && value instanceof Date) {
          form.setValue(key as any, format(value, 'yyyy-MM-dd'));
        } else if (value !== null && value !== undefined) {
          form.setValue(key as any, value as any);
        }
      });
    } else {
      setEditingSales(null);
      form.reset();
      generateNumbers();
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSales(null);
    form.reset();
  };

  const handleSubmit = (data: InsertSales) => {
    salesMutation.mutate(data);
  };

  const handleDelete = (salesId: string) => {
    if (window.confirm("Are you sure you want to delete this sales record?")) {
      deleteSalesMutation.mutate(salesId);
    }
  };

  // Filtering
  const filteredSales = salesData.filter((sales) => {
    const matchesSearch = 
      sales.salesOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sales.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sales.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sales.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || sales.deliveryStatus === statusFilter;
    
    let matchesDate = true;
    if (dateFilter.fromDate || dateFilter.toDate) {
      const salesDate = new Date(sales.date);
      if (dateFilter.fromDate) {
        matchesDate = matchesDate && salesDate >= new Date(dateFilter.fromDate);
      }
      if (dateFilter.toDate) {
        matchesDate = matchesDate && salesDate <= new Date(dateFilter.toDate);
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Statistics
  const stats = {
    total: salesData.length,
    receiving: salesData.filter(s => s.deliveryStatus === 'RECEIVING').length,
    approved: salesData.filter(s => s.deliveryStatus === 'APPROVED').length,
    delivered: salesData.filter(s => s.deliveryStatus === 'DELIVERED').length,
    totalValue: salesData.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-1">Manage sales orders, delivery challans, and invoices</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Sales Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Sales</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receiving</p>
                <p className="text-2xl font-bold text-orange-600">{stats.receiving}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Package className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <FileCheck className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-purple-600">{stats.delivered}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Records</CardTitle>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order, invoice, vehicle..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="RECEIVING">Receiving</SelectItem>
                  <SelectItem value="OK">OK</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filters */}
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="From Date"
                  className="w-36"
                  value={dateFilter.fromDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, fromDate: e.target.value }))}
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="date"
                  placeholder="To Date"
                  className="w-36"
                  value={dateFilter.toDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, toDate: e.target.value }))}
                />
              </div>
              
              {(dateFilter.fromDate || dateFilter.toDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateFilter({ fromDate: "", toDate: "" })}
                >
                  Clear Dates
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Sales Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Sales Order</th>
                  <th className="px-6 py-3">Invoice</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Net Weight</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No sales records found</p>
                      <p className="text-sm mt-2">
                        {searchTerm || statusFilter !== "ALL" || dateFilter.fromDate || dateFilter.toDate
                          ? "Try adjusting your filters"
                          : "Create your first sales record to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sales) => {
                    const StatusIcon = statusIcons[sales.deliveryStatus];
                    const client = clients.find(c => c.id === sales.clientId);
                    const salesperson = users.find(u => u.id === sales.salespersonId);
                    
                    return (
                      <tr key={sales.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(sales.date), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-blue-600">
                            {sales.salesOrderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {sales.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client?.name || 'Unknown Client'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Sales: {salesperson?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{sales.vehicleNumber}</div>
                          <div className="text-xs text-gray-500">{sales.location}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parseFloat(sales.netWeight).toLocaleString()} kg
                          </div>
                          <div className="text-xs text-gray-500">
                            {sales.drumQuantity} drums
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            ₹{parseFloat(sales.totalAmount).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${statusColors[sales.deliveryStatus]} flex items-center gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {sales.deliveryStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenForm(sales)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {!sales.deliveryChallanSigned && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => signChallanMutation.mutate(sales.id)}
                                disabled={signChallanMutation.isPending}
                              >
                                <FileCheck className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(sales.id)}
                              disabled={deleteSalesMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sales Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingSales ? 'Edit Sales Record' : 'Create New Sales Record'}
            </DialogTitle>
            <DialogDescription>
              {editingSales ? 'Update the sales record details below.' : 'Fill in the details to create a new sales record.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Information</h3>
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
                        name="deliveryStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
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
                      <FormField
                        control={form.control}
                        name="salesOrderNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sales Order Number</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Party & Product Details</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name} - {client.category}
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
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - {product.category}
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
                        name="salespersonId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sales Person</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sales person" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.filter(user => ['SALES_MANAGER', 'SALES_EXECUTIVE'].includes(user.role)).map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name} - {user.role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Transport Details</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="vehicleNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter vehicle number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="transporterId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transporter</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select transporter" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {transporters.map((transporter) => (
                                  <SelectItem key={transporter.id} value={transporter.id}>
                                    {transporter.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Weight Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="grossWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gross Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
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
                              <Input type="number" step="0.01" {...field} />
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
                              <Input {...field} readOnly className="bg-gray-100 font-semibold" />
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
                              <Input {...field} readOnly className="bg-gray-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="drumQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Drum Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
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
                              <Input {...field} readOnly className="bg-gray-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details - Full Width */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Financial Details</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="basicRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basic Rate (per kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
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
                        <FormLabel>Purchase Rate (per kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
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
                        <FormLabel>GST %</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
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
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-gray-100 font-bold text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={salesMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {salesMutation.isPending ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingSales ? 'Update Sales' : 'Create Sales'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}