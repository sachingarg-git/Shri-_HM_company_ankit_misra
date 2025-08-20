import StatsCards from "@/components/dashboard/stats-cards";
import PaymentAlerts from "@/components/dashboard/payment-alerts";
import ClientCategories from "@/components/dashboard/client-categories";
import RecentOrders from "@/components/dashboard/recent-orders";
import TaskClassification from "@/components/dashboard/task-classification";
import ClientTrackingTable from "@/components/dashboard/client-tracking-table";
import SalesPerformance from "@/components/dashboard/sales-performance";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, John. Here's what's happening today.</p>
      </div>
      
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <PaymentAlerts />
        <ClientCategories />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <RecentOrders />
        <TaskClassification />
      </div>

      <ClientTrackingTable />

      <SalesPerformance />

      <QuickActions />
    </div>
  );
}
