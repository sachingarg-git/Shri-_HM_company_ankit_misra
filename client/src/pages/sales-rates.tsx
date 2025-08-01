import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSalesRateSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, BarChart3, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useState } from "react";

export default function SalesRates() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [dateRange, setDateRange] = useState("today");

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: salesRates, isLoading } = useQuery({
    queryKey: ['/api/sales-rates', { clientId: selectedClient }],
    enabled: !!selectedClient,
  });

  const createSalesRateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/sales-rates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-rates'] });
      toast({ title: "Success", description: "Sales rate recorded successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record sales rate", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertSalesRateSchema),
    defaultValues: {
      clientId: "",
      salesPersonId: "",
      date: new Date().toISOString().split('T')[0],
      rate: "",
      volume: "",
      notes: ""
    }
  });

  const onSubmit = (data: any) => {
    createSalesRateMutation.mutate({
      ...data,
      date: new Date(data.date).toISOString(),
      rate: parseFloat(data.rate),
      volume: data.volume ? parseFloat(data.volume) : null
    });
  };

  // Calculate rate trends (mock calculation for demo)
  const calculateTrends = () => {
    if (!salesRates || salesRates.length < 2) return null;
    
    const latest = salesRates[0];
    const previous = salesRates[1];
    
    if (!latest || !previous) return null;
    
    const currentRate = parseFloat(latest.rate);
    const previousRate = parseFloat(previous.rate);
    const change = ((currentRate - previousRate) / previousRate) * 100;
    
    return {
      current: currentRate,
      previous: previousRate,
      change: change,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const trends = calculateTrends();

  // Get today's rates for selected client
  const todayRates = salesRates?.filter(rate => 
    new Date(rate.date).toDateString() === new Date().toDateString()
  ) || [];

  // Calculate stats
  const avgRate = salesRates?.length > 0 
    ? salesRates.reduce((sum, rate) => sum + parseFloat(rate.rate), 0) / salesRates.length
    : 0;

  const totalVolume = salesRates?.reduce((sum, rate) => 
    sum + (rate.volume ? parseFloat(rate.volume) : 0), 0) || 0;

  const stats = [
    {
      title: "Today's Rates",
      value: todayRates.length,
      icon: Calendar,
      color: "text-primary bg-primary/10"
    },
    {
      title: "Average Rate",
      value: avgRate > 0 ? `₹${avgRate.toFixed(2)}` : "N/A",
      icon: BarChart3,
      color: "text-info bg-info/10"
    },
    {
      title: "Total Volume",
      value: totalVolume > 0 ? `${totalVolume.toFixed(1)} units` : "N/A",
      icon: TrendingUp,
      color: "text-success bg-success/10"
    },
    {
      title: "Rate Entries",
      value: salesRates?.length || 0,
      icon: BarChart3,
      color: "text-warning bg-warning/10"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Sales Rates" 
          subtitle="Track daily sales rates for clients"
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Client Selection */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Select Client for Rate Tracking</h3>
                  <div className="flex items-center space-x-3">
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select a client to view rates" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {selectedClient ? (
              <>
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

                {/* Rate Trends */}
                {trends && (
                  <Card className="mb-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Rate Trend Analysis</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <BarChart3 className="text-primary" size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Current Rate</p>
                            <p className="text-2xl font-bold text-gray-900">₹{trends.current.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            trends.trend === 'up' ? 'bg-success/10' : 
                            trends.trend === 'down' ? 'bg-error/10' : 'bg-gray-100'
                          }`}>
                            {trends.trend === 'up' ? (
                              <TrendingUp className="text-success" size={24} />
                            ) : trends.trend === 'down' ? (
                              <TrendingDown className="text-error" size={24} />
                            ) : (
                              <BarChart3 className="text-gray-500" size={24} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Change</p>
                            <p className={`text-2xl font-bold ${
                              trends.trend === 'up' ? 'text-success' : 
                              trends.trend === 'down' ? 'text-error' : 'text-gray-900'
                            }`}>
                              {trends.change > 0 ? '+' : ''}{trends.change.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 text-sm text-gray-600">
                          <p>
                            Previous rate: ₹{trends.previous.toFixed(2)}
                          </p>
                          <p>
                            {trends.trend === 'up' ? 'Rate increased' : 
                             trends.trend === 'down' ? 'Rate decreased' : 'Rate unchanged'} from last entry
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Filters and Actions */}
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Sales Rate History</h3>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <Input 
                            type="text" 
                            placeholder="Search rates..." 
                            className="w-64 pl-10"
                          />
                        </div>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
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
                              Add Rate
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Record Sales Rate</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="clientId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={selectedClient}>
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
                                    name="rate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Rate (₹)</FormLabel>
                                        <FormControl>
                                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={form.control}
                                  name="volume"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Volume (Optional)</FormLabel>
                                      <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                                      <FormLabel>Notes (Optional)</FormLabel>
                                      <FormControl>
                                        <Textarea placeholder="Additional notes..." {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={createSalesRateMutation.isPending}>
                                    {createSalesRateMutation.isPending ? "Recording..." : "Record Rate"}
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

                {/* Sales Rates Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Rate</th>
                            <th className="px-6 py-3">Volume</th>
                            <th className="px-6 py-3">Sales Person</th>
                            <th className="px-6 py-3">Notes</th>
                            <th className="px-6 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {isLoading ? (
                            [...Array(5)].map((_, i) => (
                              <tr key={i}>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                              </tr>
                            ))
                          ) : !salesRates || salesRates.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p>No sales rates recorded for this client</p>
                              </td>
                            </tr>
                          ) : (
                            salesRates.map((rate, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {new Date(rate.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(rate.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-semibold text-gray-900">
                                    ₹{parseFloat(rate.rate).toFixed(2)}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-gray-900">
                                    {rate.volume ? parseFloat(rate.volume).toFixed(1) : 'N/A'}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-gray-900">Sales Person</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-gray-900 truncate max-w-xs">
                                    {rate.notes || 'No notes'}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      Edit
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
              </>
            ) : (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Client</h3>
                    <p>Choose a client from the dropdown above to view and manage their sales rates.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
