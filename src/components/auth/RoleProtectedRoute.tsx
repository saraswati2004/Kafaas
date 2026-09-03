import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/auth.types';

export interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, role, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect unauthorized user to their respective default home
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'vendor') return <Navigate to="/vendor" replace />;
    if (role === 'farmer') return <Navigate to="/farmer" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
