
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
import { insertClientSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, Users, Edit, Eye } from "lucide-react";
import { useState } from "react";

export default function ClientManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
        <h1 className="text-3xl font-bold text-gray-900">Sales Rates</h1>
        <p className="text-gray-600 mt-1">Module description</p>
      </div>

                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <Card key={index} className="p-6">
                        <div className="flex items-center">
                          <div className={`p-2 ${stat.color} rounded-lg`}>
                            <Icon size={24} />
                    
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    
                  
                      </Card>
                    );
                  })}
          

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
                    
                          <div>
                            <p className="text-sm text-gray-600">Current Rate</p>
                            <p className="text-2xl font-bold text-gray-900">₹{trends.current.toFixed(2)}</p>
                    
                  
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
                    
                          <div>
    </div>
  );
}
