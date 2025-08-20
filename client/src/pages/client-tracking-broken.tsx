
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
import { insertClientTrackingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, MapPin, Truck, Clock, Navigation } from "lucide-react";
import { useState } from "react";

export default function ClientTracking() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: trackingData, isLoading } = useQuery({
    queryKey: ['/api/client-tracking'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  const createTrackingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/client-tracking', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-tracking'] });
      toast({ title: "Success", description: "Tracking record created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create tracking record", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertClientTrackingSchema),
    defaultValues: {
      clientId: "",
      orderId: "",
      vehicleNumber: "",
      driverName: "",
      driverPhone: "",
      currentLocation: "",
      destinationLocation: "",
      distanceRemaining: 0,
      status: "LOADING"
    }
  });

  const onSubmit = (data: any) => {
    createTrackingMutation.mutate({
      ...data,
      estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival).toISOString() : null
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'bg-success/10 text-success';
      case 'LOADING':
        return 'bg-warning/10 text-warning';
      case 'DELIVERED':
        return 'bg-info/10 text-info';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'LOADING':
        return 'Loading';
      case 'DELIVERED':
        return 'Delivered';
      default:
        return status;
    }
  };

  const stats = [
    {
      title: "In Transit",
      value: trackingData?.filter(t => t.status === 'IN_TRANSIT').length || 0,
      icon: Truck,
      color: "text-success bg-success/10"
    },
    {
      title: "Loading",
      value: trackingData?.filter(t => t.status === 'LOADING').length || 0,
      icon: Clock,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Delivered Today",
      value: trackingData?.filter(t => t.status === 'DELIVERED' && 
        new Date(t.lastUpdated).toDateString() === new Date().toDateString()).length || 0,
      icon: MapPin,
      color: "text-info bg-info/10"
    },
    {
      title: "Total Shipments",
      value: trackingData?.length || 0,
      icon: Navigation,
      color: "text-primary bg-primary/10"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Tracking</h1>
        <p className="text-gray-600 mt-1">Track vehicle locations and delivery timelines</p>
      </div>
      
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

      {/* Filters and Actions */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Live Tracking</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search by vehicle or location..." 
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
                          Add Tracking
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Tracking</DialogTitle>
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
                                name="currentLocation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Current Location</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Current location" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="destinationLocation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Destination location" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="distanceRemaining"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Distance Remaining (km)</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="0" {...field} />
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
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="LOADING">Loading</SelectItem>
                                        <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createTrackingMutation.isPending}>
                                {createTrackingMutation.isPending ? "Creating..." : "Create Tracking"}
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

            {/* Tracking Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Current Location</th>
                        <th className="px-6 py-3">Destination</th>
                        <th className="px-6 py-3">Distance</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Last Updated</th>
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
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                          </tr>
                        ))
                      ) : !trackingData || trackingData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No tracking data available</p>
                          </td>
                        </tr>
                      ) : (
                        trackingData.map((tracking, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {tracking.clientId?.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Client</p>
                                  <p className="text-sm text-gray-500">Order: {tracking.orderId?.substring(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{tracking.vehicleNumber}</p>
                                <p className="text-sm text-gray-500">Driver: {tracking.driverName}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <MapPin className="text-primary" size={16} />
                                <p className="text-gray-900">{tracking.currentLocation}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-900">{tracking.destinationLocation}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{tracking.distanceRemaining}km</p>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getStatusColor(tracking.status)}>
                                {getStatusText(tracking.status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-900">
                                {new Date(tracking.lastUpdated).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(tracking.lastUpdated).toLocaleTimeString()}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <Button variant="link" size="sm" className="text-primary hover:text-primary/80">
                                <MapPin size={16} className="mr-1" />
                                Track
                              </Button>
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
  );
}
