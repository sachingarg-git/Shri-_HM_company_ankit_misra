import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function purchaseordersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/data"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        <p className="text-gray-600 mt-1">Purchase Orders management and overview</p>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Content</h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : (
            <p className="text-gray-600">Module content will be displayed here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
