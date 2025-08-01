import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEwayBillSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, Receipt, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function EwayBills() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: ewayBills, isLoading } = useQuery({
    queryKey: ['/api/eway-bills'],
  });

  const { data: expiringBills } = useQuery({
    queryKey: ['/api/eway-bills', { expiring: '7' }],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  const createEwayBillMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/eway-bills', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eway-bills'] });
      toast({ title: "Success", description: "E-way bill created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create e-way bill", variant: "destructive" });
    }
  });

  const updateEwayBillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/eway-bills/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eway-bills'] });
      toast({ title: "Success", description: "E-way bill updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update e-way bill", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertEwayBillSchema),
    defaultValues: {
      ewayNumber: "",
      orderId: "",
      vehicleNumber: "",
      driverName: "",
      driverPhone: "",
      validFrom: "",
      validUntil: "",
      isExtended: false,
      extensionCount: 0
    }
  });

  const onSubmit = (data: any) => {
    createEwayBillMutation.mutate({
      ...data,
      validFrom: new Date(data.validFrom).toISOString(),
      validUntil: new Date(data.validUntil).toISOString(),
    });
  };

  const extendEwayBill = (billId: string, currentExtensionCount: number, currentValidUntil: string) => {
    const newValidUntil = new Date(currentValidUntil);
    newValidUntil.setDate(newValidUntil.getDate() + 7); // Extend by 7 days

    updateEwayBillMutation.mutate({
      id: billId,
      data: {
        validUntil: newValidUntil.toISOString(),
        isExtended: true,
        extensionCount: currentExtensionCount + 1
      }
    });
  };

  const getStatusColor = (validUntil: string, isExtended: boolean) => {
    const expiryDate = new Date(validUntil);
    const now = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-error/10 text-error';
    if (diffDays <= 2) return 'bg-warning/10 text-warning';
    if (isExtended) return 'bg-info/10 text-info';
    return 'bg-success/10 text-success';
  };

  const getStatusText = (validUntil: string, isExtended: boolean) => {
    const expiryDate = new Date(validUntil);
    const now = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays <= 2) return 'Expiring Soon';
    if (isExtended) return 'Extended';
    return 'Valid';
  };

  const getStatusIcon = (validUntil: string, isExtended: boolean) => {
    const expiryDate = new Date(validUntil);
    const now = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return AlertTriangle;
    if (diffDays <= 2) return Clock;
    return CheckCircle;
  };

  // Calculate stats
  const totalBills = ewayBills?.length || 0;
  const validBills = ewayBills?.filter(bill => new Date(bill.validUntil) > new Date()).length || 0;
  const expiredBills = ewayBills?.filter(bill => new Date(bill.validUntil) < new Date()).length || 0;
  const expiringCount = expiringBills?.length || 0;

  const stats = [
    {
      title: "Total E-way Bills",
      value: totalBills,
      icon: Receipt,
      color: "text-primary bg-primary/10"
    },
    {
      title: "Valid Bills",
      value: validBills,
      icon: CheckCircle,
      color: "text-success bg-success/10"
    },
    {
      title: "Expiring Soon",
      value: expiringCount,
      icon: Clock,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Expired",
      value: expiredBills,
      icon: AlertTriangle,
      color: "text-error bg-error/10"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="E-Way Bills" 
          subtitle="Manage electronic way bills and delivery documentation"
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-center">
                      <div className={`p-2 ${stat.color} rounded-lg`}>
                        <Icon size={24} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Extension Feature Info */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">E-Way Bill Extension Feature</h3>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="text-blue-600 mt-1" size={20} />
                    <div>
                      <h4 className="font-medium text-blue-900">Extension Policy</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        E-way bills can be extended if delivery is delayed due to exceptional circumstances. 
                        Use the extension feature to update delivery dates and maintain compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters and Actions */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">E-Way Bill Management</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search by e-way number..." 
                        className="w-64 pl-10"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter size={16} className="mr-2" />
                      Filter
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus size={16} className="mr-2" />
                          Create E-Way Bill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New E-Way Bill</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="ewayNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>E-Way Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="E.g., 123456789012" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="orderId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Order</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select order" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {orders?.map((order) => (
                                          <SelectItem key={order.id} value={order.id}>
                                            {order.orderNumber}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="vehicleNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Vehicle Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="MH-12-AB-1234" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="driverName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Driver Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter driver name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="driverPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Driver Phone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+91 98765 43210" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="validFrom"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Valid From</FormLabel>
                                    <FormControl>
                                      <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="validUntil"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Valid Until</FormLabel>
                                    <FormControl>
                                      <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createEwayBillMutation.isPending}>
                                {createEwayBillMutation.isPending ? "Creating..." : "Create E-Way Bill"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* E-Way Bills Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">E-Way Number</th>
                        <th className="px-6 py-3">Order</th>
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Driver</th>
                        <th className="px-6 py-3">Valid Until</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Extensions</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                          </tr>
                        ))
                      ) : !ewayBills || ewayBills.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                            <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No e-way bills found</p>
                          </td>
                        </tr>
                      ) : (
                        ewayBills.map((bill, index) => {
                          const StatusIcon = getStatusIcon(bill.validUntil, bill.isExtended);
                          const canExtend = new Date(bill.validUntil) > new Date() && bill.extensionCount < 3;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">{bill.ewayNumber}</p>
                                  <p className="text-sm text-gray-500">
                                    Created: {new Date(bill.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-900">Order #{bill.orderId?.substring(0, 8)}</p>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">{bill.vehicleNumber}</p>
                                  <p className="text-sm text-gray-500">{bill.driverName}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-gray-900">{bill.driverName}</p>
                                  <p className="text-sm text-gray-500">{bill.driverPhone}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-gray-900">
                                    {new Date(bill.validUntil).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(bill.validUntil).toLocaleTimeString()}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={`${getStatusColor(bill.validUntil, bill.isExtended)} flex items-center w-fit`}>
                                  <StatusIcon size={12} className="mr-1" />
                                  {getStatusText(bill.validUntil, bill.isExtended)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-gray-900">{bill.extensionCount}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  {canExtend && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => extendEwayBill(bill.id, bill.extensionCount, bill.validUntil)}
                                      disabled={updateEwayBillMutation.isPending}
                                    >
                                      <Calendar size={16} className="mr-1" />
                                      Extend
                                    </Button>
                                  )}
                                  <Button variant="link" size="sm">
                                    View
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
          </div>
        </main>
      </div>
    </div>
  );
}
