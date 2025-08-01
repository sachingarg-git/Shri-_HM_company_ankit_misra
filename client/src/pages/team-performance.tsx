import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Activity, Users, Award, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function TeamPerformance() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const salesTeam = users?.filter(user => 
    user.role === 'SALES_EXECUTIVE' || user.role === 'SALES_MANAGER'
  ) || [];

  // Calculate team performance metrics (in real app, this would come from dedicated API)
  const calculatePerformanceMetrics = () => {
    const teamMetrics = salesTeam.map((member, index) => {
      // Mock performance data - in real app this would be calculated from actual data
      const mockData = [
        { activityScore: 92, conversionRate: 24, ordersCompleted: 15, revenue: 420000, target: 500000 },
        { activityScore: 88, conversionRate: 31, ordersCompleted: 12, revenue: 380000, target: 400000 },
        { activityScore: 76, conversionRate: 18, ordersCompleted: 8, revenue: 210000, target: 300000 },
        { activityScore: 84, conversionRate: 22, ordersCompleted: 10, revenue: 290000, target: 350000 },
        { activityScore: 91, conversionRate: 28, ordersCompleted: 14, revenue: 450000, target: 500000 }
      ];
      
      return {
        ...member,
        ...mockData[index % mockData.length]
      };
    });

    return teamMetrics;
  };

  const teamMetrics = calculatePerformanceMetrics();

  // Calculate overall team stats
  const totalRevenue = teamMetrics.reduce((sum, member) => sum + member.revenue, 0);
  const totalTarget = teamMetrics.reduce((sum, member) => sum + member.target, 0);
  const avgConversionRate = teamMetrics.length > 0 
    ? Math.round(teamMetrics.reduce((sum, member) => sum + member.conversionRate, 0) / teamMetrics.length)
    : 0;
  const totalOrders = teamMetrics.reduce((sum, member) => sum + member.ordersCompleted, 0);

  const overallStats = [
    {
      title: "Total Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      target: `₹${(totalTarget / 100000).toFixed(1)}L`,
      icon: TrendingUp,
      color: "text-success bg-success/10",
      percentage: Math.round((totalRevenue / totalTarget) * 100)
    },
    {
      title: "Team Conversion",
      value: `${avgConversionRate}%`,
      target: "25%",
      icon: Target,
      color: "text-primary bg-primary/10",
      percentage: Math.round((avgConversionRate / 25) * 100)
    },
    {
      title: "Orders Completed",
      value: totalOrders,
      target: "65",
      icon: Activity,
      color: "text-info bg-info/10",
      percentage: Math.round((totalOrders / 65) * 100)
    },
    {
      title: "Active Members",
      value: salesTeam.length,
      target: salesTeam.length,
      icon: Users,
      color: "text-warning bg-warning/10",
      percentage: 100
    }
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getColorByIndex = (index: number) => {
    const colors = [
      { bg: 'bg-primary', text: 'text-white' },
      { bg: 'bg-secondary', text: 'text-white' },
      { bg: 'bg-warning', text: 'text-white' },
      { bg: 'bg-info', text: 'text-white' },
      { bg: 'bg-success', text: 'text-white' }
    ];
    return colors[index % colors.length];
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Excellent', color: 'text-success' };
    if (percentage >= 80) return { level: 'Good', color: 'text-info' };
    if (percentage >= 70) return { level: 'Average', color: 'text-warning' };
    return { level: 'Needs Improvement', color: 'text-error' };
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Team Performance" 
          subtitle="Sales team activity, output, and conversion metrics"
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Period Selector */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Dashboard</h3>
                  <div className="flex items-center space-x-3">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="lastMonth">Last Month</SelectItem>
                        <SelectItem value="thisQuarter">This Quarter</SelectItem>
                        <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <BarChart3 size={16} className="mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Overall Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {overallStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 ${stat.color} rounded-lg`}>
                        <Icon size={24} />
                      </div>
                      <Badge variant="outline">
                        {stat.percentage}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">Target: {stat.target}</p>
                    </div>
                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Individual Performance Cards */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Individual Performance</h3>
                  <Button variant="outline" size="sm">
                    <Award size={16} className="mr-2" />
                    Performance Rankings
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMetrics.length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No sales team members found</p>
                    </div>
                  ) : (
                    teamMetrics.map((member, index) => {
                      const colors = getColorByIndex(index);
                      const targetPercentage = Math.round((member.revenue / member.target) * 100);
                      const performance = getPerformanceLevel(member.activityScore);
                      
                      return (
                        <Card key={index} className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
                              <span className={`font-medium ${colors.text}`}>
                                {getInitials(member.firstName, member.lastName)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {member.role === 'SALES_MANAGER' ? 'Sales Manager' : 'Sales Executive'}
                              </p>
                            </div>
                            <Badge className={performance.color}>
                              {performance.level}
                            </Badge>
                          </div>
                          
                          <div className="space-y-4">
                            {/* Activity Score */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Activity Score</span>
                                <span className="font-semibold text-gray-900">{member.activityScore}%</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${member.activityScore}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Conversion Rate */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Conversion Rate</span>
                                <span className="font-semibold text-gray-900">{member.conversionRate}%</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-secondary h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${member.conversionRate}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Revenue vs Target */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Revenue Target</span>
                                <span className="font-semibold text-success">
                                  ₹{(member.revenue / 100000).toFixed(1)}L / ₹{(member.target / 100000).toFixed(1)}L
                                </span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-success h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min(targetPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {targetPercentage}% of target achieved
                              </p>
                            </div>

                            {/* Additional Metrics */}
                            <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">{member.ordersCompleted}</p>
                                <p className="text-xs text-gray-500">Orders</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">
                                  {Math.round(member.revenue / member.ordersCompleted / 1000)}K
                                </p>
                                <p className="text-xs text-gray-500">Avg. Deal</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Team Activity Comparison */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Activity Comparison</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMetrics.slice(0, 5).map((member, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {getInitials(member.firstName, member.lastName)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{member.firstName} {member.lastName}</span>
                            <span className="text-sm font-medium text-gray-900">{member.activityScore}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${member.activityScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Rate Leaderboard */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Conversion Leaderboard</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMetrics
                      .sort((a, b) => b.conversionRate - a.conversionRate)
                      .slice(0, 5)
                      .map((member, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            <span className={`text-sm font-bold ${
                              index === 0 ? 'text-yellow-600' :
                              index === 1 ? 'text-gray-500' :
                              index === 2 ? 'text-orange-600' : 'text-gray-400'
                            }`}>
                              #{index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{member.firstName} {member.lastName}</span>
                              <Badge variant="outline">{member.conversionRate}%</Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {member.ordersCompleted} orders completed
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
