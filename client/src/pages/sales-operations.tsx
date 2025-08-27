import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Search,
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  Clock, 
  Truck, 
  MapPin,
  User,
  Target,
  DollarSign,
  Calendar,
  Package
} from "lucide-react";
import type { 
  Lead,
  Opportunity,
  Quotation,
  SalesOrder,
  DeliveryPlan,
  Dispatch
} from "@shared/schema";

export default function SalesOperationsPage() {
  const [activeTab, setActiveTab] = useState("leads");

  const tabs = [
    { id: "leads", label: "Lead & CRM", icon: User, description: "Lead tracking and opportunity management" },
    { id: "quotations", label: "Quotations", icon: FileText, description: "Multi-level approvals and pricing" },
    { id: "sales-orders", label: "Sales Orders", icon: CheckCircle, description: "Credit checks and inventory allocation" },
    { id: "delivery-planning", label: "Delivery Planning", icon: Calendar, description: "Route optimization and vehicle allocation" },
    { id: "dispatch", label: "Dispatch Management", icon: Truck, description: "Real-time tracking and delivery challans" }
  ];

  return (
    <div className="space-y-6" data-testid="sales-operations-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Sales Operations</h1>
          <p className="text-muted-foreground" data-testid="page-description">
            Complete sales pipeline management from leads to delivery
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5" data-testid="sales-operations-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="leads">
          <LeadCRMSection />
        </TabsContent>

        <TabsContent value="quotations">
          <QuotationSection />
        </TabsContent>

        <TabsContent value="sales-orders">
          <SalesOrderSection />
        </TabsContent>

        <TabsContent value="delivery-planning">
          <DeliveryPlanningSection />
        </TabsContent>

        <TabsContent value="dispatch">
          <DispatchManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Lead & CRM Management Component
function LeadCRMSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'NEW': 'bg-blue-100 text-blue-800',
      'CONTACTED': 'bg-yellow-100 text-yellow-800',
      'QUALIFIED': 'bg-green-100 text-green-800',
      'PROPOSAL': 'bg-purple-100 text-purple-800',
      'NEGOTIATION': 'bg-orange-100 text-orange-800',
      'CLOSED_WON': 'bg-green-100 text-green-800',
      'CLOSED_LOST': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      'PHONE': Phone,
      'EMAIL': Mail,
      'WEBSITE': Target,
      'REFERRAL': User
    };
    return icons[source as keyof typeof icons] || Target;
  };

  const filteredLeads = leads?.filter(lead => 
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading leads...</div>;
  }

  return (
    <Card data-testid="lead-crm-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lead & CRM Management
          </CardTitle>
          <CardDescription>
            Track prospects, manage relationships, and convert leads to opportunities
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
              data-testid="search-leads"
            />
          </div>
          <Button data-testid="button-add-lead">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="leads-list">
            {filteredLeads.map((lead) => {
              const SourceIcon = getSourceIcon(lead.leadSource);
              return (
                <Card key={lead.id} className="hover:shadow-md transition-shadow" data-testid={`card-lead-${lead.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base" data-testid={`text-company-${lead.id}`}>
                          {lead.companyName}
                        </CardTitle>
                        <CardDescription data-testid={`text-contact-${lead.id}`}>
                          {lead.contactPersonName}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(lead.leadStatus)} data-testid={`badge-status-${lead.id}`}>
                        {lead.leadStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <SourceIcon className="h-4 w-4 text-muted-foreground" />
                        <span data-testid={`text-source-${lead.id}`}>
                          {lead.leadSource.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {lead.mobileNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-mobile-${lead.id}`}>{lead.mobileNumber}</span>
                        </div>
                      )}
                      
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-email-${lead.id}`}>{lead.email}</span>
                        </div>
                      )}
                      
                      {lead.estimatedValue && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-value-${lead.id}`}>
                            ₹{Number(lead.estimatedValue).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Handle edit */}}
                          data-testid={`button-edit-lead-${lead.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Handle convert to opportunity */}}
                          data-testid={`button-convert-${lead.id}`}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Convert
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8" data-testid="leads-empty">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Leads Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No leads match your search criteria" : "Start tracking prospects and building your sales pipeline"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quotation System Component
function QuotationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Quotation System
        </CardTitle>
        <CardDescription>Multi-level approvals, competitive pricing, and quote management</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Quotation Management</h3>
          <p className="text-muted-foreground mb-4">
            Create professional quotes with multi-level approval workflow
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Sales Orders Component
function SalesOrderSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Sales Orders
        </CardTitle>
        <CardDescription>Credit checks, inventory allocation, and order processing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sales Order Management</h3>
          <p className="text-muted-foreground mb-4">
            Process orders with automated credit checks and inventory allocation
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Sales Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Delivery Planning Component
function DeliveryPlanningSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Delivery Planning
        </CardTitle>
        <CardDescription>Route optimization, vehicle allocation, and delivery scheduling</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Delivery Planning</h3>
          <p className="text-muted-foreground mb-4">
            Optimize routes and allocate vehicles for efficient deliveries
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Plan Delivery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Dispatch Management Component
function DispatchManagementSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Dispatch Management
        </CardTitle>
        <CardDescription>Real-time tracking, delivery challans, and logistics coordination</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Dispatch Management</h3>
          <p className="text-muted-foreground mb-4">
            Track vehicles in real-time and manage delivery documentation
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Dispatch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}