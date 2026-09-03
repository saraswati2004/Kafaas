import { apiClient, API_BASE_URL, mockDelay } from './client';
import { User } from '../types/auth.types';
import { VendorProfileChangeRequest, AuditLog, AdminDashboardMetrics, VendorDashboardMetrics } from '../types/user.types';
import { MOCK_USERS, MOCK_VENDOR_CHANGE_REQUESTS, MOCK_AUDIT_LOGS, MOCK_PRODUCTS, MOCK_ORDERS } from './mockData';

let localUsers = [...MOCK_USERS];
let localChangeRequests = [...MOCK_VENDOR_CHANGE_REQUESTS];
let localAuditLogs = [...MOCK_AUDIT_LOGS];

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<User[]>('/admin/users');
      return res.data;
    }
    await mockDelay(200);
    return localUsers;
  },

  getFarmers: async (): Promise<User[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<User[]>('/admin/farmers');
      return res.data;
    }
    await mockDelay(200);
    return localUsers.filter((u) => u.role === 'farmer');
  },

  getVendors: async (): Promise<User[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<User[]>('/admin/vendors');
      return res.data;
    }
    await mockDelay(200);
    return localUsers.filter((u) => u.role === 'vendor');
  },

  getVendorChangeRequests: async (): Promise<VendorProfileChangeRequest[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<VendorProfileChangeRequest[]>('/vendors/change-requests');
      return res.data;
    }
    await mockDelay(200);
    return localChangeRequests;
  },

  submitVendorChangeRequest: async (
    req: Omit<VendorProfileChangeRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<VendorProfileChangeRequest> => {
    if (API_BASE_URL) {
      const res = await apiClient.post<VendorProfileChangeRequest>('/vendors/change-requests', req);
      return res.data;
    }
    await mockDelay(400);
    const newRequest: VendorProfileChangeRequest = {
      ...req,
      id: `vcr-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    localChangeRequests = [newRequest, ...localChangeRequests];
    return newRequest;
  },

  reviewVendorChangeRequest: async (
    id: string,
    action: 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<VendorProfileChangeRequest> => {
    if (API_BASE_URL) {
      const res = await apiClient.put<VendorProfileChangeRequest>(`/admin/vendor-requests/${id}`, {
        action,
        rejectionReason,
      });
      return res.data;
    }
    await mockDelay(350);
    const index = localChangeRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Change request not found');

    const request = localChangeRequests[index];
    const updated: VendorProfileChangeRequest = {
      ...request,
      status: action,
      rejectionReason: action === 'rejected' ? rejectionReason : undefined,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Rajesh Sharma (Admin)',
    };

    localChangeRequests[index] = updated;

    // If approved, update vendor profile
    if (action === 'approved') {
      const vendorIndex = localUsers.findIndex((u) => u.id === request.vendorId);
      if (vendorIndex !== -1) {
        localUsers[vendorIndex] = {
          ...localUsers[vendorIndex],
          fullName: request.proposedData.contactPerson,
          email: request.proposedData.email,
          phone: request.proposedData.phone,
          vendorBusinessName: request.proposedData.businessName,
          vendorGstin: request.proposedData.gstin,
          vendorLicenseNo: request.proposedData.licenseNumber,
        };
      }
    }

    return updated;
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<AuditLog[]>('/admin/audit-logs');
      return res.data;
    }
    await mockDelay(200);
    return localAuditLogs;
  },

  getAdminMetrics: async (): Promise<AdminDashboardMetrics> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<AdminDashboardMetrics>('/admin/metrics');
      return res.data;
    }
    await mockDelay(200);

    const totalRevenue = MOCK_ORDERS.reduce((acc, o) => acc + o.pricing.totalAmount, 0);
    const pendingOrdersCount = MOCK_ORDERS.filter((o) => o.status === 'pending').length;
    const lowStockProductsCount = MOCK_PRODUCTS.filter((p) => p.stockQuantity < 30).length;
    const pendingVendorRequestsCount = localChangeRequests.filter((r) => r.status === 'pending').length;

    return {
      totalUsers: localUsers.length + 1420, // + simulated customer base
      totalFarmers: 1380,
      totalVendors: 42,
      totalOrders: MOCK_ORDERS.length + 512,
      totalRevenue: totalRevenue + 1845000,
      pendingOrdersCount: pendingOrdersCount + 3,
      lowStockProductsCount,
      pendingVendorRequestsCount,
      activeRecommendationsCount: 4,
      recentSalesTrend: [
        { date: '19 Aug', revenue: 42000, orders: 14 },
        { date: '20 Aug', revenue: 58000, orders: 19 },
        { date: '21 Aug', revenue: 49000, orders: 16 },
        { date: '22 Aug', revenue: 73000, orders: 25 },
        { date: '23 Aug', revenue: 64000, orders: 21 },
        { date: '24 Aug', revenue: 89000, orders: 31 },
        { date: '25 Aug', revenue: 95000, orders: 34 },
      ],
    };
  },

  getVendorMetrics: async (_vendorId?: string): Promise<VendorDashboardMetrics> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<VendorDashboardMetrics>('/vendors/metrics');
      return res.data;
    }
    await mockDelay(200);
    return {
      totalSales: 485000,
      totalOrders: 148,
      pendingOrders: 4,
      lowStockItemsCount: 1,
      fulfillmentRatePercentage: 98.4,
      monthlyRevenue: [
        { month: 'Apr', amount: 52000 },
        { month: 'May', amount: 68000 },
        { month: 'Jun', amount: 94000 },
        { month: 'Jul', amount: 112000 },
        { month: 'Aug', amount: 159000 },
      ],
    };
  }
};
