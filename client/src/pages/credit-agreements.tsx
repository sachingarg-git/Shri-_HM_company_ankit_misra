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
import { insertCreditAgreementSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, File, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";

export default function CreditAgreements() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("all");

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: allAgreements, isLoading } = useQuery({
    queryKey: ['/api/credit-agreements'],
    enabled: !!selectedClient && selectedClient !== "all",
  });

  const createAgreementMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/credit-agreements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-agreements'] });
      toast({ title: "Success", description: "Credit agreement created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create credit agreement", variant: "destructive" });
    }
  });

  const updateAgreementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/credit-agreements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-agreements'] });
      toast({ title: "Success", description: "Agreement status updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update agreement", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertCreditAgreementSchema),
    defaultValues: {
      clientId: "",
      agreementNumber: "",
      creditLimit: "",
      paymentTerms: 30,
      interestRate: "",
      isActive: true,
      signedAt: "",
      expiresAt: ""
    }
  });

  const onSubmit = (data: any) => {
    createAgreementMutation.mutate({
      ...data,
      creditLimit: parseFloat(data.creditLimit),
      interestRate: data.interestRate ? parseFloat(data.interestRate) : null,
      signedAt: data.signedAt ? new Date(data.signedAt).toISOString() : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null
    });
  };

  const toggleAgreementStatus = (agreementId: string, isActive: boolean) => {
    updateAgreementMutation.mutate({
      id: agreementId,
      data: { isActive: !isActive }
    });
  };

  const getStatusColor = (isActive: boolean, expiresAt?: string) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (expiresAt && new Date(expiresAt) < new Date()) return 'bg-error/10 text-error';
    return 'bg-success/10 text-success';
  };

  const getStatusText = (isActive: boolean, expiresAt?: string) => {
    if (!isActive) return 'Inactive';
    if (expiresAt && new Date(expiresAt) < new Date()) return 'Expired';
    return 'Active';
  };

  // Mock stats for display
  const activeAgreements = 15;
  const expiredAgreements = 3;
  const totalCreditLimit = 2500000;
  const pendingAgreements = 5;

  const stats = [
    {
      title: "Active Agreements",
      value: activeAgreements,
      icon: CheckCircle,
      color: "text-success bg-success/10"
    },
    {
      title: "Pending Approval",
      value: pendingAgreements,
      icon: AlertTriangle,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Expired",
      value: expiredAgreements,
      icon: Calendar,
      color: "text-error bg-error/10"
    },
    {
      title: "Total Credit Limit",
      value: `₹${(totalCreditLimit / 100000).toFixed(1)}L`,
      icon: File,
      color: "text-primary bg-primary/10"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Credit Agreements" 
          subtitle="Manage client credit terms and agreements"
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

            {/* Agreement Process */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Credit Agreement Process</h3>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="text-blue-600 mt-1" size={20} />
                    <div>
                      <h4 className="font-medium text-blue-900">Important Policy</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Until a credit agreement is received and active, no material should be loaded or bills generated for the client. 
                        This ensures proper credit management and risk mitigation.
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
                  <h3 className="text-lg font-semibold text-gray-900">Agreement Management</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search agreements..." 
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
                          Create Agreement
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Credit Agreement</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                name="agreementNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Agreement Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="AGR-2024-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="creditLimit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Credit Limit</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="paymentTerms"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Payment Terms (Days)</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="30" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="interestRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Interest Rate (%)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="signedAt"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Signed Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="expiresAt"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Expiry Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
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
                              <Button type="submit" disabled={createAgreementMutation.isPending}>
                                {createAgreementMutation.isPending ? "Creating..." : "Create Agreement"}
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

            {/* Agreements Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Agreement</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Credit Limit</th>
                        <th className="px-6 py-3">Payment Terms</th>
                        <th className="px-6 py-3">Interest Rate</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Expiry Date</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedClient === "all" ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                            <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>Please select a client to view their credit agreements</p>
                          </td>
                        </tr>
                      ) : isLoading ? (
                        [...Array(3)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                          </tr>
                        ))
                      ) : !allAgreements || allAgreements.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                            <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No credit agreements found for this client</p>
                          </td>
                        </tr>
                      ) : (
                        allAgreements.map((agreement, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{agreement.agreementNumber}</p>
                                <p className="text-sm text-gray-500">
                                  Signed: {agreement.signedAt 
                                    ? new Date(agreement.signedAt).toLocaleDateString()
                                    : 'Not signed'
                                  }
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-900">Client Name</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900">
                                ₹{parseInt(agreement.creditLimit).toLocaleString()}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-900">{agreement.paymentTerms} days</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-900">
                                {agreement.interestRate ? `${agreement.interestRate}%` : 'N/A'}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getStatusColor(agreement.isActive, agreement.expiresAt)}>
                                {getStatusText(agreement.isActive, agreement.expiresAt)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-900">
                                {agreement.expiresAt 
                                  ? new Date(agreement.expiresAt).toLocaleDateString()
                                  : 'No expiry'
                                }
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toggleAgreementStatus(agreement.id, agreement.isActive)}
                                >
                                  {agreement.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button variant="link" size="sm">
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
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
