import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout } from "./layouts/PublicLayout";
import { FarmerLayout } from './layouts/FarmerLayout';
import { VendorLayout } from './layouts/VendorLayout';
import { AdminLayout } from './layouts/AdminLayout';
// Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    console.error('[ErrorBoundary] Error message:', error?.message);
    console.error('[ErrorBoundary] Error stack:', error?.stack);
    console.error('[ErrorBoundary] Error type:', typeof error);
    console.error('[ErrorBoundary] Error keys:', error ? Object.keys(error) : 'none');
    // Also log to window for debugging
    window.__LAST_ERROR__ = { error: String(error), errorInfo };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
// Auth Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ShopPage } from './pages/public/ShopPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { CartPage } from './pages/public/CartPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { RecommendationsPage } from './pages/public/RecommendationsPage';
import { AboutPage } from './pages/public/AboutPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Farmer Pages
import { FarmerDashboardPage } from './pages/farmer/FarmerDashboardPage';
import { MyOrdersPage } from './pages/farmer/MyOrdersPage';
import { OrderDetailPage } from './pages/farmer/OrderDetailPage';
import { SavedAddressesPage } from './pages/farmer/SavedAddressesPage';
import { FarmerRecommendationsPage } from './pages/farmer/FarmerRecommendationsPage';
import { ScanHistoryPage } from './pages/farmer/ScanHistoryPage';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';

// Vendor Pages
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { VendorInventoryPage } from './pages/vendor/VendorInventoryPage';
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage';
import { VendorSalesPage } from './pages/vendor/VendorSalesPage';
import { VendorProfilePage } from './pages/vendor/VendorProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminRecommendationsPage } from './pages/admin/AdminRecommendationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminVendorRequestsPage } from './pages/admin/AdminVendorRequestsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary fallback={<div className="p-8 text-center text-red-600">Something went wrong. Check console for details.</div>}>
          <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Farmer Portal Protected Routes */}
          <Route
            path="/farmer"
            element={
              <RoleProtectedRoute allowedRoles={['farmer', 'admin']}>
                <FarmerLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<FarmerDashboardPage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="addresses" element={<SavedAddressesPage />} />
            <Route path="recommendations" element={<FarmerRecommendationsPage />} />
            <Route path="scans" element={<ScanHistoryPage />} />
            <Route path="profile" element={<FarmerProfilePage />} />
            <Route path="preferences" element={<FarmerProfilePage />} />
          </Route>

          {/* Vendor Portal Protected Routes */}
          <Route
            path="/vendor"
            element={
              <RoleProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<VendorDashboardPage />} />
            <Route path="inventory" element={<VendorInventoryPage />} />
            <Route path="orders" element={<VendorOrdersPage />} />
            <Route path="sales" element={<VendorSalesPage />} />
            <Route path="profile" element={<VendorProfilePage />} />
            <Route path="preferences" element={<VendorProfilePage />} />
          </Route>

          {/* Admin Portal Protected Routes */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="recommendations" element={<AdminRecommendationsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="vendor-requests" element={<AdminVendorRequestsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
