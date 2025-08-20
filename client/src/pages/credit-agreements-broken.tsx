
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
        <h1 className="text-3xl font-bold text-gray-900">Credit Agreements</h1>
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
    </div>
  );
}
