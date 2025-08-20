import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, ShoppingCart } from "lucide-react";

export default function OrderWorkflow() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_AGREEMENT':
        return 'bg-red-100 text-red-800';
      case 'APPROVED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const stats = [
    {
      title: "Pending Agreement",
      value: orders?.filter((o: any) => o.status === 'PENDING_AGREEMENT').length || 0,
      icon: AlertTriangle,
      color: "text-error bg-error/10"
    },
    {
      title: "In Progress",
      value: orders?.filter((o: any) => ['APPROVED', 'IN_PROGRESS', 'LOADING', 'IN_TRANSIT'].includes(o.status)).length || 0,
      icon: Clock,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Completed",
      value: orders?.filter((o: any) => o.status === 'COMPLETED').length || 0,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Workflow</h1>
        <p className="text-gray-600 mt-1">Manage order lifecycle from agreement to delivery</p>
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Order Status Overview</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                    </tr>
                  ))
                ) : !orders || orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No orders found</p>
                      <p className="text-sm mt-2">Orders will appear here once created</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.clientName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">₹{parseInt(order.amount).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-600 hover:text-indigo-900">View</button>
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