import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building2,
  CreditCard,
  Building,
  User,
  Printer,
} from "lucide-react";
import type { CreditAgreement } from "@shared/schema";

export default function creditagreementsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<CreditAgreement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["/api/credit-agreements"],
    queryFn: async () => {
      const response = await fetch("/api/credit-agreements", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch agreements");
      return response.json();
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  const form = useForm({
    // Remove resolver to bypass client-side validation - backend will validate
    defaultValues: {
      clientId: "",
      agreementNumber: "",
      creditLimit: "0",
      paymentTerms: 30,
      interestRate: "0",
      customerName: "",
      date: new Date(),
      location: "",
      address: "",
      pinCode: "",
      gstnNumber: "",
      chequeNumbers: "",
      bankName: "",
      branchName: "",
      accountHolder: "",
      accountNumber: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingAgreement
        ? `/api/credit-agreements/${editingAgreement.id}`
        : "/api/credit-agreements";
      const method = editingAgreement ? "PUT" : "POST";

      console.log("Mutation - Sending request:", { url, method, data });
      
      // Convert Date objects to ISO strings for JSON serialization
      const jsonData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(jsonData),
      });

      console.log("Mutation - Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        let error: any = {};
        try {
          error = await response.json();
        } catch (e) {
          error = { message: response.statusText };
        }
        console.error("Mutation - Error response:", error);
        throw new Error(error.message || error.error || "Failed to save agreement");
      }
      const result = await response.json();
      console.log("Mutation - Success response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-agreements"] });
      toast({
        title: "Success",
        description: editingAgreement
          ? "Agreement updated successfully"
          : "Agreement created successfully",
      });
      setIsFormOpen(false);
      setEditingAgreement(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/credit-agreements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-agreements"] });
      toast({
        title: "Success",
        description: "Agreement deleted successfully",
      });
    },
  });

  const handleEdit = (agreement: CreditAgreement) => {
    setEditingAgreement(agreement);
    form.reset({
      clientId: agreement.clientId,
      agreementNumber: agreement.agreementNumber,
      creditLimit: agreement.creditLimit.toString(),
      paymentTerms: agreement.paymentTerms,
      interestRate: agreement.interestRate?.toString() || "0",
      customerName: agreement.customerName || "",
      date: agreement.date ? new Date(agreement.date) : new Date(),
      location: agreement.location || "",
      address: agreement.address || "",
      pinCode: agreement.pinCode || "",
      gstnNumber: agreement.gstnNumber || "",
      chequeNumbers: agreement.chequeNumbers || "",
      bankName: agreement.bankName || "",
      branchName: agreement.branchName || "",
      accountHolder: agreement.accountHolder || "",
      accountNumber: agreement.accountNumber || "",
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingAgreement(null);
    form.reset();
    setIsFormOpen(true);
  };

  const filteredAgreements = agreements.filter((agreement: CreditAgreement) =>
    agreement.agreementNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agreement.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: any) => {
    // Format and validate the data before sending
    const formattedData = {
      clientId: String(data.clientId).trim(),
      agreementNumber: String(data.agreementNumber).trim(),
      creditLimit: data.creditLimit ? parseFloat(String(data.creditLimit)) : 0,
      paymentTerms: data.paymentTerms ? parseInt(String(data.paymentTerms)) : 30,
      interestRate: data.interestRate ? parseFloat(String(data.interestRate)) : 0,
      customerName: data.customerName ? String(data.customerName).trim() : null,
      date: data.date ? new Date(data.date) : null,  // Keep as Date object
      location: data.location ? String(data.location).trim() : null,
      address: data.address ? String(data.address).trim() : null,
      pinCode: data.pinCode ? String(data.pinCode).trim() : null,
      gstnNumber: data.gstnNumber ? String(data.gstnNumber).trim() : null,
      chequeNumbers: data.chequeNumbers ? String(data.chequeNumbers).trim() : null,
      bankName: data.bankName ? String(data.bankName).trim() : null,
      branchName: data.branchName ? String(data.branchName).trim() : null,
      accountHolder: data.accountHolder ? String(data.accountHolder).trim() : null,
      accountNumber: data.accountNumber ? String(data.accountNumber).trim() : null,
    };
    console.log("Submitting data:", formattedData);
    createMutation.mutate(formattedData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credit Agreements</h1>
        <p className="text-gray-600 mt-1">
          Manage client credit agreements and payment terms
        </p>
      </div>

      {/* Stats Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Agreements</p>
                <p className="text-2xl font-bold text-gray-900">{agreements.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Agreements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agreements.filter((a: CreditAgreement) => a.isActive).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credit Limit</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {agreements
                    .reduce((sum: number, a: CreditAgreement) => {
                      return sum + parseFloat(a.creditLimit.toString());
                    }, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Form Section */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingAgreement ? "Edit Credit Agreement" : "Create New Credit Agreement"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* All Fields in Single Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  
                  {/* Client Selection */}
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Client ID / Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter client ID or name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Agreement Number */}
                  <FormField
                    control={form.control}
                    name="agreementNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Agreement Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CA-2024-0001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Customer Name */}
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value
                                ? new Date(field.value).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* PIN Code */}
                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">PIN Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter PIN code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* GSTN Number */}
                  <FormField
                    control={form.control}
                    name="gstnNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">GSTN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter GSTN number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Credit Limit */}
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Credit Limit of Rs. *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cheque Numbers */}
                  <FormField
                    control={form.control}
                    name="chequeNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Cheque Numbers</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter cheque numbers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Name */}
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Branch Name */}
                  <FormField
                    control={form.control}
                    name="branchName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Branch Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter branch name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account Holder */}
                  <FormField
                    control={form.control}
                    name="accountHolder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Account Holder</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account holder name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account Number */}
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Account No.</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Terms */}
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Payment Terms (Days) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Interest Rate */}
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingAgreement(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createMutation.isPending
                    ? "Saving..."
                    : editingAgreement
                    ? "Update Agreement"
                    : "Create Agreement"}
                </Button>
              </div>
            </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Agreements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Credit Agreements</CardTitle>
            {!isFormOpen && (
              <Button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Plus className="h-4 w-4" />
                New Agreement
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search agreements..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Agreement Number
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Credit Limit
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Payment Terms
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredAgreements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No agreements found
                    </td>
                  </tr>
                ) : (
                  filteredAgreements.map((agreement: CreditAgreement) => (
                    <tr key={agreement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {agreement.agreementNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {agreement.customerName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {agreement.location || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{parseFloat(agreement.creditLimit.toString()).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {agreement.paymentTerms} days
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            agreement.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {agreement.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/credit-agreements/${agreement.id}`)}
                          className="text-green-600 hover:text-green-700"
                          title="View Agreement"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/credit-agreements/${agreement.id}`)}
                          className="text-purple-600 hover:text-purple-700"
                          title="Print Agreement"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(agreement)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this agreement?"
                              )
                            ) {
                              deleteMutation.mutate(agreement.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

