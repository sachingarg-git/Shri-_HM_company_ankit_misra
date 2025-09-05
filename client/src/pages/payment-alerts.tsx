import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, AlertTriangle, Clock, CheckCircle, Info } from "lucide-react";
import type { Payment } from "@shared/schema";

export default function PaymentAlerts() {
  const [searchValue, setSearchValue] = useState("");
  
  const { data: overduePayments, isLoading: overdueLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments', { overdue: 'true' }],
  });

  const { data: dueSoonPayments, isLoading: dueSoonLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments', { dueSoon: '7' }],
  });

  const allAlerts = [
    ...(overduePayments || []).map(payment => ({
      ...payment,
      type: 'overdue' as const,
      icon: AlertTriangle,
      bgColor: 'bg-error/5',
      borderColor: 'border-error/20',
      iconColor: 'text-error',
      amountColor: 'text-error',
      priority: 'High'
    })),
    ...(dueSoonPayments || []).map(payment => ({
      ...payment,
      type: 'due_soon' as const,
      icon: Clock,
      bgColor: 'bg-warning/5',
      borderColor: 'border-warning/20',
      iconColor: 'text-warning',
      amountColor: 'text-warning',
      priority: 'Medium'
    }))
  ];

  const filteredAlerts = allAlerts.filter(alert =>
    alert.id.toLowerCase().includes(searchValue.toLowerCase()) ||
    alert.priority.toLowerCase().includes(searchValue.toLowerCase())
  );

  const stats = [
    {
      title: "Overdue Payments",
      value: (overduePayments || []).length,
      icon: AlertTriangle,
      color: "text-error bg-error/10"
    },
    {
      title: "Due This Week",
      value: (dueSoonPayments || []).length,
      icon: Clock,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Total Alert Amount",
      value: `₹${allAlerts.reduce((sum, alert) => sum + parseInt(alert.amount), 0).toLocaleString()}`,
      icon: Info,
      color: "text-info bg-info/10"
    }
  ];

  const isLoading = overdueLoading || dueSoonLoading;

  return (
    <div className="space-y-6" data-testid="payment-alerts-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Alerts</h1>
        <p className="text-gray-600 mt-1">Monitor overdue and upcoming payments</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search payment alerts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
            data-testid="input-search-alerts"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2" data-testid="button-filter">
          <Filter size={20} />
          Filter
        </Button>
      </div>

      {/* Payment Alerts List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Active Payment Alerts</h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading payment alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchValue ? 'No alerts match your search' : 'No payment alerts at this time'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 ${alert.bgColor} border ${alert.borderColor} rounded-lg`}
                    data-testid={`alert-${alert.type}-${index}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${alert.bgColor} rounded-full flex items-center justify-center`}>
                        <Icon className={alert.iconColor} size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">Payment Alert</p>
                          <Badge variant={alert.priority === 'High' ? 'destructive' : 'default'}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {alert.type === 'overdue' 
                            ? `Payment is overdue`
                            : `Payment due within 7 days`
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Alert ID: {alert.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${alert.amountColor}`}>
                        ₹{parseInt(alert.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(alert.dueDate).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <Button size="sm" variant="outline" data-testid={`button-view-${index}`}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}