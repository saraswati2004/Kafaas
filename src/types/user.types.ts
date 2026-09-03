import { User, UserRole } from './auth.types';

export interface VendorProfileChangeRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  currentData: {
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    gstin: string;
    licenseNumber: string;
    warehouseAddress: string;
    state: string;
    district: string;
    bankAccountName: string;
    bankAccountNumber: string;
    ifscCode: string;
  };
  proposedData: {
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    gstin: string;
    licenseNumber: string;
    warehouseAddress: string;
    state: string;
    district: string;
    bankAccountName: string;
    bankAccountNumber: string;
    ifscCode: string;
  };
  reasonForChange: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetEntity: 'product' | 'order' | 'inventory' | 'recommendation' | 'vendor_request' | 'user';
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface FarmerProfileStats {
  totalOrders: number;
  activeOrders: number;
  savedAddressesCount: number;
  completedScans: number;
  preferredCrops: string[];
}

export interface VendorDashboardMetrics {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockItemsCount: number;
  fulfillmentRatePercentage: number;
  monthlyRevenue: { month: string; amount: number }[];
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalFarmers: number;
  totalVendors: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrdersCount: number;
  lowStockProductsCount: number;
  pendingVendorRequestsCount: number;
  activeRecommendationsCount: number;
  recentSalesTrend: { date: string; revenue: number; orders: number }[];
}
