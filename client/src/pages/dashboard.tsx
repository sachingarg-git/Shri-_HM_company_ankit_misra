import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Dashboard" 
          subtitle="Welcome back, John. Here's what's happening today."
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-6">
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
        </main>
      </div>
    </div>
  );
}
