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
import { insertPurchaseOrderSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, FileText, CheckCircle, Clock, Calendar, Eye } from "lucide-react";
import { useState } from "react";

export default function PurchaseOrders() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("all");

  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ['/api/purchase-orders'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  const createPOMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/purchase-orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({ title: "Success", description: "Purchase order created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create purchase order", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertPurchaseOrderSchema),
    defaultValues: {
      poNumber: "",
      orderId: "",
      clientId: "",
      amount: "",
      validUntil: "",
      terms: ""
    }
  });

  const onSubmit = (data: any) => {
    createPOMutation.mutate({
      ...data,
      amount: parseFloat(data.amount),
      validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null
    });
  };

  const getValidityStatus = (validUntil?: string) => {
    if (!validUntil) return { color: 'bg-gray-100 text-gray-800', text: 'No Expiry', icon: Clock };
    
    const expiryDate = new Date(validUntil);
    const now = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { color: 'bg-error/10 text-error', text: 'Expired', icon: Clock };
    if (diffDays <= 7) return { color: 'bg-warning/10 text-warning', text: 'Expiring Soon', icon: Clock };
    return { color: 'bg-success/10 text-success', text: 'Valid', icon: CheckCircle };
  };

  const filteredPOs = selectedClient === "all" 
    ? purchaseOrders 
    : purchaseOrders?.filter(po => po.clientId === selectedClient);

  // Calculate stats
  const totalPOs = purchaseOrders?.length || 0;
  const validPOs = purchaseOrders?.filter(po => !po.validUntil || new Date(po.validUntil) > new Date()).length || 0;
  const expiredPOs = purchaseOrders?.filter(po => po.validUntil && new Date(po.validUntil) < new Date()).length || 0;
  const totalValue = purchaseOrders?.reduce((sum, po) => sum + parseInt(po.amount), 0) || 0;

  const stats = [
    {
      title: "Total POs",
      value: totalPOs,
      icon: FileText,
      color: "text-primary bg-primary/10"
    },
    {
      title: "Valid POs",
      value: validPOs,
      icon: CheckCircle,
      color: "text-success bg-success/10"
    },
    {
      title: "Expired",
      value: expiredPOs,
      icon: Clock,
      color: "text-error bg-error/10"
    },
    {
      title: "Total Value",
      value: `₹${(totalValue / 100000).toFixed(1)}L`,
      icon: FileText,
      color: "text-info bg-info/10"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Purchase Orders" 
          subtitle="Manage purchase orders accessible to sales team"
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

            {/* Sales Team Access Info */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Sales Team Access</h3>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-green-600 mt-1" size={20} />
                    <div>
                      <h4 className="font-medium text-green-900">Full PO Visibility</h4>
                      <p className="text-sm text-green-800 mt-1">
                        All purchase orders are accessible to the sales team members. This ensures complete transparency 
                        and enables better client relationship management and order tracking.
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
                  <h3 className="text-lg font-semibold text-gray-900">Purchase Order Management</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search PO number..." 
                        className="w-64 pl-10"
                      />
                    </div>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
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
                          Create PO
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Purchase Order</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="poNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>PO Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="PO-2024-001" {...field} />
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
                                    <FormLabel>Amount</FormLabel>
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
                                name="orderId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Related Order</FormLabel>
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
                            <FormField
                              control={form.control}
                              name="validUntil"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valid Until (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
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
                                    <Textarea placeholder="Enter terms and conditions" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createPOMutation.isPending}>
                                {createPOMutation.isPending ? "Creating..." : "Create PO"}
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

            {/* Purchase Orders Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">PO Number</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Related Order</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Issued Date</th>
                        <th className="px-6 py-3">Validity</th>
                        <th className="px-6 py-3">Status</th>
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
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                          </tr>
                        ))
                      ) : !filteredPOs || filteredPOs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No purchase orders found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredPOs.map((po, index) => {
                          const validityStatus = getValidityStatus(po.validUntil);
                          const StatusIcon = validityStatus.icon;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">{po.poNumber}</p>
                                  <p className="text-sm text-gray-500">PO #{po.id.substring(0, 8)}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-900">Client</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-900">Order #{po.orderId?.substring(0, 8)}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-900">
                                  ₹{parseInt(po.amount).toLocaleString()}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-gray-900">
                                    {new Date(po.issuedAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(po.issuedAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-gray-900">
                                  {po.validUntil 
                                    ? new Date(po.validUntil).toLocaleDateString()
                                    : 'No expiry'
                                  }
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={`${validityStatus.color} flex items-center w-fit`}>
                                  <StatusIcon size={12} className="mr-1" />
                                  {validityStatus.text}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Eye size={16} className="mr-1" />
                                    View
                                  </Button>
                                  <Button variant="link" size="sm">
                                    Download
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
