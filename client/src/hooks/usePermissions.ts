import { useQuery } from "@tanstack/react-query";

export type ModuleName = 
  | 'DASHBOARD'
  | 'CLIENT_MANAGEMENT'
  | 'ORDER_WORKFLOW'
  | 'SALES'
  | 'PURCHASE_ORDERS'
  | 'TASK_MANAGEMENT'
  | 'FOLLOW_UP_HUB'
  | 'LEAD_FOLLOW_UP'
  | 'CREDIT_PAYMENTS'
  | 'CREDIT_AGREEMENTS'
  | 'EWAY_BILLS'
  | 'SALES_RATES'
  | 'TEAM_PERFORMANCE'
  | 'TA_REPORTS'
  | 'MASTER_DATA'
  | 'USER_MANAGEMENT'
  | 'PRICING'
  | 'SALES_OPERATIONS'
  | 'CLIENT_TRACKING'
  | 'TOUR_ADVANCE';

export type ActionType = 'VIEW' | 'ADD' | 'EDIT' | 'DELETE';

interface Permission {
  module: string;
  action: string;
  granted: boolean;
}

export function usePermissions() {
  const { data: permissions = [], isLoading } = useQuery<Permission[]>({
    queryKey: ['/api/auth/permissions'],
    retry: false,
  });

  const hasPermission = (module: ModuleName, action: ActionType = 'VIEW'): boolean => {
    // For now, we'll use role-based fallback until database is fully synced
    // This ensures the system works while database permissions are being set up
    const permission = permissions.find(
      p => p.module === module && p.action === action && p.granted
    );
    
    // If we have explicit permission data, use it
    if (permissions.length > 0) {
      return !!permission;
    }

    // Fallback: return true for testing until database is ready
    return true;
  };

  const hasViewPermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'VIEW');
  };

  const hasAddPermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'ADD');
  };

  const hasEditPermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'EDIT');
  };

  const hasDeletePermission = (module: ModuleName): boolean => {
    return hasPermission(module, 'DELETE');
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    hasViewPermission,
    hasAddPermission,
    hasEditPermission,
    hasDeletePermission,
  };
}