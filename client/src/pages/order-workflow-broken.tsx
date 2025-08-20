
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
        <h1 className="text-3xl font-bold text-gray-900">Order Workflow</h1>
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
      

            {/* Workflow Steps */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Order Workflow Steps</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="text-error" size={20} />
                
                      <span className="text-xs mt-2 text-gray-600">Agreement</span>
              
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-info" size={20} />
                
                      <span className="text-xs mt-2 text-gray-600">Approved</span>
              
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                        <Clock className="text-warning" size={20} />
                
                      <span className="text-xs mt-2 text-gray-600">In Progress</span>
              
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
    </div>
  );
}
