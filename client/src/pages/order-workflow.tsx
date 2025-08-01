import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, ShoppingCart, AlertTriangle, Clock, CheckCircle, Truck } from "lucide-react";
import { useState } from "react";

export default function OrderWorkflow() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ title: "Success", description: "Order created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create order", 
        variant: "destructive" 
      });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ title: "Success", description: "Order status updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      orderNumber: "",
      clientId: "",
      salesPersonId: "",
      amount: "",
      status: "PENDING_AGREEMENT",
      description: "",
      creditAgreementRequired: true,
      expectedDeliveryDate: ""
    }
  });

  const onSubmit = (data: any) => {
    createOrderMutation.mutate({
      ...data,
      amount: parseFloat(data.amount),
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString() : null
    });
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: newStatus }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_AGREEMENT':
        return 'bg-error/10 text-error';
      case 'APPROVED':
        return 'bg-info/10 text-info';
      case 'IN_PROGRESS':
        return 'bg-warning/10 text-warning';
      case 'LOADING':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-success/10 text-success';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_AGREEMENT':
        return AlertTriangle;
      case 'APPROVED':
      case 'IN_PROGRESS':
        return Clock;
      case 'LOADING':
        return ShoppingCart;
      case 'IN_TRANSIT':
        return Truck;
      case 'DELIVERED':
      case 'COMPLETED':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders?.filter(order => order.status === selectedStatus);

  // Calculate stats
  const pendingAgreement = orders?.filter(o => o.status === 'PENDING_AGREEMENT').length || 0;
  const inProgress = orders?.filter(o => ['APPROVED', 'IN_PROGRESS', 'LOADING', 'IN_TRANSIT'].includes(o.status)).length || 0;
  const completed = orders?.filter(o => o.status === 'COMPLETED').length || 0;
  const cancelled = orders?.filter(o => o.status === 'CANCELLED').length || 0;

  const stats = [
    {
      title: "Pending Agreement",
      value: pendingAgreement,
      icon: AlertTriangle,
      color: "text-error bg-error/10"
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "text-success bg-success/10"
    },
    {
      title: "Total Orders",
      value: orders?.length || 0,
      icon: ShoppingCart,
      color: "text-primary bg-primary/10"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Order Workflow" 
          subtitle="Manage order lifecycle from agreement to delivery"
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

            {/* Workflow Steps */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Order Workflow Steps</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="text-error" size={20} />
                      </div>
                      <span className="text-xs mt-2 text-gray-600">Agreement</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-info" size={20} />
                      </div>
                      <span className="text-xs mt-2 text-gray-600">Approved</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                        <Clock className="text-warning" size={20} />
                      </div>
                      <span className="text-xs mt-2 text-gray-600">In Progress</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="text-blue-600" size={20} />
                      </div>
                      <span className="text-xs mt-2 text-gray-600">Loading</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Truck className="text-purple-600" size={20} />
                      </div>
                      <span className="text-xs mt-2 text-gray-600">In Transit</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-success" size={20} />
                      </div>
                      <span className="text-xs mt-2 text-gray-600">Completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters and Actions */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search orders..." 
                        className="w-64 pl-10"
                      />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Order Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING_AGREEMENT">Pending Agreement</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="LOADING">Loading</SelectItem>
                        <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter size={16} className="mr-2" />
                      Filter
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus size={16} className="mr-2" />
                          Create Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Order</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="orderNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Order Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="ORD-2024-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Order Amount</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                        {clients?.map((client) => (
                                          <SelectItem key={client.id} value={client.id}>
                                            {client.name}
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
                                name="salesPersonId"
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
                                        {users?.filter(u => u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER').map((user) => (
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
                            </div>
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Enter order description" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="expectedDeliveryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expected Delivery Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createOrderMutation.isPending}>
                                {createOrderMutation.isPending ? "Creating..." : "Create Order"}
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

            {/* Orders Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Order</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Sales Person</th>
                        <th className="px-6 py-3">Expected Delivery</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                          </tr>
                        ))
                      ) : !filteredOrders || filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No orders found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order, index) => {
                          const StatusIcon = getStatusIcon(order.status);
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                  <p className="text-sm text-gray-500">
                                    Created: {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-900">Client</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-900">
                                  ₹{parseInt(order.amount).toLocaleString()}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={`${getStatusColor(order.status)} flex items-center w-fit`}>
                                  <StatusIcon size={12} className="mr-1" />
                                  {order.status.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-900">Sales Person</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-900">
                                  {order.expectedDeliveryDate 
                                    ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                                    : 'TBD'
                                  }
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <Select 
                                    value={order.status}
                                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PENDING_AGREEMENT">Pending</SelectItem>
                                      <SelectItem value="APPROVED">Approved</SelectItem>
                                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                      <SelectItem value="LOADING">Loading</SelectItem>
                                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                                      <SelectItem value="COMPLETED">Completed</SelectItem>
                                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
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
