import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, Search, CalendarDays, FileCheck, Save, X, Package, Truck, BarChart3 } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hooks and Utils
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSalesSchema, type Sales, type InsertSales, type User, type Client, type Product, type Transporter } from "@shared/schema";

const statusColors = {
  RECEIVING: "bg-orange-100 text-orange-800",
  OK: "bg-blue-100 text-blue-800", 
  APPROVED: "bg-green-100 text-green-800",
  DELIVERED: "bg-purple-100 text-purple-800"
};

export default function Sales() {
  const [activeTab, setActiveTab] = useState("sales-orders");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sales Orders Data - the new sales orders generated from quotations
  const { data: salesOrders = [], isLoading: isLoadingSalesOrders } = useQuery({
    queryKey: ["/api/sales-orders"],
  });

  // Legacy Sales Data
  const { data: salesData = [], isLoading } = useQuery<Sales[]>({
    queryKey: ["/api/sales"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-1">Manage sales orders and delivery records</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sales-orders" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Sales Orders
          </TabsTrigger>
          <TabsTrigger value="delivery-records" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Delivery Records
          </TabsTrigger>
        </TabsList>

        {/* Sales Orders Tab */}
        <TabsContent value="sales-orders" className="space-y-6">
          {/* Sales Orders Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Sales Orders</p>
                    <p className="text-2xl font-bold text-green-900">{salesOrders.length}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Draft Orders</p>
                    <p className="text-2xl font-bold text-blue-900">{salesOrders.filter(so => so.status === 'DRAFT').length}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Confirmed Orders</p>
                    <p className="text-2xl font-bold text-purple-900">{salesOrders.filter(so => so.status === 'CONFIRMED').length}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-orange-900">₹{salesOrders.reduce((sum, so) => sum + parseFloat(so.totalAmount || "0"), 0).toLocaleString()}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Sales Orders Generated from Quotations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                      <th className="px-6 py-3">Order Number</th>
                      <th className="px-6 py-3">Order Date</th>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Expected Delivery</th>
                      <th className="px-6 py-3">Total Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Payment Terms</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingSalesOrders ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                        </tr>
                      ))
                    ) : salesOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <FileCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No sales orders found</p>
                          <p className="text-sm mt-2">
                            Sales orders will appear here when generated from quotations
                          </p>
                        </td>
                      </tr>
                    ) : (
                      salesOrders.map((order) => {
                        const client = clients.find(c => c.id === order.clientId);
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{order.orderNumber}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {format(new Date(order.orderDate), 'dd/MM/yyyy')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{client?.name || order.clientId}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {order.expectedDeliveryDate ? format(new Date(order.expectedDeliveryDate), 'dd/MM/yyyy') : '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">₹{parseFloat(order.totalAmount || "0").toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : order.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{order.paymentTerms || '30'} days</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2"
                                  data-testid={`button-edit-${order.id}`}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-green-600 hover:text-green-700"
                                  data-testid={`button-view-${order.id}`}
                                >
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
        </TabsContent>

        {/* Delivery Records Tab */}
        <TabsContent value="delivery-records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Legacy Delivery Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-500">Legacy delivery records</p>
                <p className="text-sm text-gray-400 mt-2">This section can show historical delivery data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}